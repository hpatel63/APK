import express from 'express';
import fs from 'fs';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import { authenticate, authorize } from '../middleware/auth.js';
import { queueChange } from '../services/syncService.js';
import { recordAudit } from '../utils/audit.js';
import { generatePdf } from '../services/documentService.js';
import { scanId } from '../services/ocrService.js';
import { tokenizeCard, capturePayment, createCashAppRequest } from '../services/paymentService.js';

export default function reservationsRoutes(db, upload) {
  const router = express.Router();

  router.get('/', authenticate(), async (req, res) => {
    const { propertyId, status } = req.query;
    const reservations = await db.all(`
      SELECT reservations.*, guests.firstName, guests.lastName, rooms.number as roomNumber
      FROM reservations
      LEFT JOIN guests ON guests.id = reservations.guestId
      LEFT JOIN rooms ON rooms.id = reservations.roomId
      WHERE reservations.isDeleted = 0
        AND (? IS NULL OR reservations.propertyId = ?)
        AND (? IS NULL OR reservations.status = ?)
      ORDER BY reservations.checkIn DESC
    `, [propertyId || null, propertyId || null, status || null, status || null]);

    res.json({ reservations });
  });

  router.post('/', authenticate(), authorize('reservations:create'), upload.single('idScan'), async (req, res) => {
    const {
      propertyId,
      roomId,
      guest,
      status,
      checkIn,
      checkOut,
      ratePlan,
      totalAmount,
      balance,
      channel,
      payment,
      templateName,
    } = req.body;

    const now = dayjs().toISOString();
    const guestId = guest.id || uuid();

    if (!guest.id) {
      await db.run(`INSERT INTO guests (id, firstName, lastName, email, phone, loyaltyId, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
        guestId,
        guest.firstName,
        guest.lastName,
        guest.email,
        guest.phone,
        guest.loyaltyId || null,
        now,
        now,
      ]);
    }

    const conflicts = await db.get(`
      SELECT 1 FROM reservations
      WHERE roomId = ? AND isDeleted = 0 AND status IN ('confirmed', 'checked_in')
        AND ( (? BETWEEN checkIn AND checkOut) OR (? BETWEEN checkIn AND checkOut) OR (checkIn BETWEEN ? AND ?))
    `, [roomId, checkIn, checkOut, checkIn, checkOut]);

    if (conflicts) {
      return res.status(409).json({ message: 'Room already booked for selected dates' });
    }

    const reservationId = uuid();

    await db.run(`INSERT INTO reservations (id, propertyId, roomId, guestId, status, checkIn, checkOut, ratePlan, totalAmount, balance, channel, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
      reservationId,
      propertyId,
      roomId,
      guestId,
      status || 'confirmed',
      checkIn,
      checkOut,
      ratePlan,
      totalAmount,
      balance,
      channel,
      now,
      now,
    ]);

    if (payment?.method === 'card' && payment?.card) {
      const tokenized = await tokenizeCard(payment.card);
      const capture = await capturePayment({ token: tokenized.token, amount: totalAmount - balance });
      await db.run(`INSERT INTO payments (id, reservationId, amount, method, status, processorReference, meta, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
        uuid(),
        reservationId,
        totalAmount - balance,
        'card',
        capture.status,
        capture.id,
        JSON.stringify({ last4: tokenized.last4, brand: tokenized.brand }),
        now,
        now,
      ]);
    }

    if (payment?.method === 'cash_app') {
      const cashApp = await createCashAppRequest({ amount: totalAmount, currency: 'USD', cashTag: payment.cashTag });
      await db.run(`INSERT INTO payments (id, reservationId, amount, method, status, processorReference, meta, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
        uuid(),
        reservationId,
        totalAmount,
        'cash_app',
        cashApp.status,
        cashApp.id,
        JSON.stringify({ qrCode: cashApp.qrCode }),
        now,
        now,
      ]);
    }

    if (req.file) {
      const fileBuffer = await fs.promises.readFile(req.file.path);
      const ocr = await scanId(fileBuffer);
      await db.run(`INSERT INTO documents (id, reservationId, type, path, signatureHash, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, [
        uuid(),
        reservationId,
        'id_scan',
        req.file.filename,
        ocr.documentNumber,
        now,
        now,
      ]);
    }

    if (templateName) {
      const template = await db.get(`SELECT * FROM templates WHERE name = ?`, [templateName]);
      if (template) {
        const pdfPath = await generatePdf({
          template: template.content,
          context: {
            guestName: `${guest.firstName} ${guest.lastName}`,
            propertyName: (await db.get(`SELECT name FROM properties WHERE id = ?`, [propertyId]))?.name,
            roomNumber: (await db.get(`SELECT number FROM rooms WHERE id = ?`, [roomId]))?.number,
            reservationCode: reservationId,
          },
          filename: `${reservationId}-receipt.pdf`,
        });
        await db.run(`INSERT INTO documents (id, reservationId, type, path, signatureHash, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, [
          uuid(),
          reservationId,
          'receipt',
          pdfPath,
          null,
          now,
          now,
        ]);
      }
    }

    await queueChange(db, { entity: 'reservations', payload: { id: reservationId, propertyId, roomId, guestId, status, checkIn, checkOut, ratePlan, totalAmount, balance, channel, updatedAt: now } });
    await recordAudit(db, { userId: req.user.id, entity: 'reservation', entityId: reservationId, action: 'create', payload: { reservationId, propertyId, roomId, guestId } });

    res.status(201).json({ id: reservationId });
  });

  router.put('/:id', authenticate(), authorize('reservations:update'), async (req, res) => {
    const { id } = req.params;
    const { status, balance, ratePlan } = req.body;
    const reservation = await db.get(`SELECT * FROM reservations WHERE id = ? AND isDeleted = 0`, [id]);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await db.run(`UPDATE reservations SET status = ?, balance = ?, ratePlan = ?, updatedAt = ? WHERE id = ?`, [
      status || reservation.status,
      balance ?? reservation.balance,
      ratePlan || reservation.ratePlan,
      dayjs().toISOString(),
      id,
    ]);

    await queueChange(db, { entity: 'reservations', payload: { ...reservation, status, balance, ratePlan, updatedAt: dayjs().toISOString() } });
    await recordAudit(db, { userId: req.user.id, entity: 'reservation', entityId: id, action: 'update', payload: { status, balance } });

    res.json({ message: 'Updated' });
  });

  router.delete('/:id', authenticate(), authorize('reservations:delete'), async (req, res) => {
    const { id } = req.params;
    const reservation = await db.get(`SELECT * FROM reservations WHERE id = ? AND isDeleted = 0`, [id]);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await db.run(`UPDATE reservations SET isDeleted = 1, updatedAt = ? WHERE id = ?`, [dayjs().toISOString(), id]);
    await queueChange(db, { entity: 'reservations', payload: { ...reservation, isDeleted: 1, updatedAt: dayjs().toISOString() } });
    await recordAudit(db, { userId: req.user.id, entity: 'reservation', entityId: id, action: 'delete', reason: req.body.reason });

    res.json({ message: 'Deleted' });
  });

  return router;
}
