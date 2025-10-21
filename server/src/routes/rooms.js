import express from 'express';
import dayjs from 'dayjs';
import { authenticate } from '../middleware/auth.js';

export default function roomsRoutes(db) {
  const router = express.Router();

  router.get('/', authenticate(), async (req, res) => {
    const { propertyId } = req.query;
    const rooms = await db.all(`
      SELECT rooms.*, properties.name as propertyName
      FROM rooms
      LEFT JOIN properties ON properties.id = rooms.propertyId
      WHERE rooms.isDeleted = 0
        AND (? IS NULL OR rooms.propertyId = ?)
      ORDER BY propertyName, CAST(rooms.number AS INTEGER)
    `, [propertyId || null, propertyId || null]);

    res.json({ rooms });
  });

  router.get('/availability', authenticate(), async (req, res) => {
    const { start, end, propertyId } = req.query;
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    const rows = await db.all(`
      SELECT rooms.id, rooms.number, rooms.type, rooms.status, reservations.checkIn, reservations.checkOut
      FROM rooms
      LEFT JOIN reservations ON reservations.roomId = rooms.id
        AND reservations.isDeleted = 0
        AND reservations.status IN ('confirmed', 'checked_in')
      WHERE rooms.isDeleted = 0 AND rooms.propertyId = ?
    `, [propertyId]);

    const availability = rows.map((row) => {
      const blocked = row.checkIn && row.checkOut && startDate.isBefore(row.checkOut) && endDate.isAfter(row.checkIn);
      return {
        roomId: row.id,
        number: row.number,
        type: row.type,
        status: row.status,
        isAvailable: !blocked,
      };
    });

    res.json({ availability });
  });

  return router;
}
