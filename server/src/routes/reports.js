import express from 'express';
import dayjs from 'dayjs';
import stringify from 'csv-stringify';
import PDFDocument from 'pdfkit';
import { authenticate, authorize } from '../middleware/auth.js';

const reportDefinitions = {
  revenue: {
    title: 'Revenue Report',
    query: `SELECT properties.name as propertyName, reservations.id as reservationId, reservations.totalAmount, reservations.checkIn, reservations.checkOut
            FROM reservations
            LEFT JOIN properties ON properties.id = reservations.propertyId
            WHERE reservations.isDeleted = 0 AND reservations.createdAt BETWEEN ? AND ?`
  },
  occupancy: {
    title: 'Occupancy & Production',
    query: `SELECT properties.name as propertyName, COUNT(reservations.id) as reservationsCount
            FROM reservations
            LEFT JOIN properties ON properties.id = reservations.propertyId
            WHERE reservations.isDeleted = 0 AND reservations.checkIn BETWEEN ? AND ?
            GROUP BY properties.id`
  },
  payment_mix: {
    title: 'Payment Mix',
    query: `SELECT payments.method, SUM(payments.amount) as total
            FROM payments
            WHERE payments.createdAt BETWEEN ? AND ?
            GROUP BY payments.method`
  },
};

export default function reportsRoutes(db) {
  const router = express.Router();

  router.get('/:type', authenticate(), authorize('reports:view'), async (req, res) => {
    const { type } = req.params;
    const { start, end, format } = req.query;
    const definition = reportDefinitions[type];
    if (!definition) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const startDate = dayjs(start).toISOString();
    const endDate = dayjs(end).toISOString();
    const rows = await db.all(definition.query, [startDate, endDate]);

    if (format === 'csv') {
      stringify(rows, { header: true }, (err, data) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to generate CSV' });
        }
        res.header('Content-Type', 'text/csv');
        res.attachment(`${type}-${dayjs().format('YYYYMMDD')}.csv`);
        return res.send(data);
      });
    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40 });
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${type}-${dayjs().format('YYYYMMDD')}.pdf`);
      doc.pipe(res);
      doc.fontSize(18).text(definition.title, { align: 'center' });
      doc.moveDown();
      rows.forEach((row) => doc.fontSize(12).text(JSON.stringify(row)));
      doc.end();
    } else {
      res.json({ rows });
    }
  });

  router.get('/:type/export', authenticate(), authorize('reports:export'), async (req, res) => {
    req.query.format = req.query.format || 'pdf';
    return router.handle(req, res);
  });

  router.get('/daily/close', authenticate(), authorize('reports:view'), async (req, res) => {
    const start = dayjs().startOf('day').toISOString();
    const end = dayjs().endOf('day').toISOString();
    const payments = await db.all(`SELECT method, SUM(amount) as total FROM payments WHERE createdAt BETWEEN ? AND ? GROUP BY method`, [start, end]);
    const occupancy = await db.get(`SELECT COUNT(*) as occupied FROM reservations WHERE status = 'checked_in' AND checkIn <= ? AND checkOut >= ?`, [end, start]);
    res.json({ payments, occupancy });
  });

  return router;
}
