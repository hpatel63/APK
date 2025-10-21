import express from 'express';
import { authenticate } from '../middleware/auth.js';

export default function searchRoutes(db) {
  const router = express.Router();

  router.get('/', authenticate(), async (req, res) => {
    const { q } = req.query;
    const query = `%${(q || '').toLowerCase()}%`;
    const guests = await db.all(`SELECT id, firstName, lastName, email, phone FROM guests WHERE LOWER(firstName || ' ' || lastName || email || phone) LIKE ?`, [query]);
    const reservations = await db.all(`SELECT id, status, checkIn, checkOut FROM reservations WHERE LOWER(id || status) LIKE ?`, [query]);
    const payments = await db.all(`SELECT id, method, status, amount FROM payments WHERE LOWER(id || method || status) LIKE ?`, [query]);
    res.json({ guests, reservations, payments });
  });

  return router;
}
