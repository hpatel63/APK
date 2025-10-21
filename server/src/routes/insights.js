import express from 'express';
import dayjs from 'dayjs';
import { authenticate } from '../middleware/auth.js';

export default function insightsRoutes(db) {
  const router = express.Router();

  router.get('/', authenticate(), async (req, res) => {
    const { propertyId } = req.query;
    const occupancy = await db.get(`SELECT COUNT(*) as occupied FROM reservations WHERE propertyId = ? AND status = 'checked_in' AND checkIn <= ? AND checkOut >= ?`, [propertyId, dayjs().toISOString(), dayjs().toISOString()]);
    const advice = occupancy.occupied > 10
      ? 'Consider enabling dynamic pricing to optimize revenue tonight.'
      : 'Occupancy is light — push out a last-minute promotion.';
    res.json({ message: advice, occupancy: occupancy.occupied });
  });

  return router;
}
