import express from 'express';
import dayjs from 'dayjs';
import { authenticate } from '../middleware/auth.js';
import { queueChange } from '../services/syncService.js';

export default function housekeepingRoutes(db) {
  const router = express.Router();

  router.get('/rooms', authenticate(), async (req, res) => {
    const rooms = await db.all(`SELECT id, number, status FROM rooms WHERE isDeleted = 0`);
    res.json({ rooms });
  });

  router.post('/rooms/:id/status', authenticate(), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await db.run(`UPDATE rooms SET status = ?, updatedAt = ? WHERE id = ?`, [status, dayjs().toISOString(), id]);
    await queueChange(db, { entity: 'rooms', payload: { id, status, updatedAt: dayjs().toISOString() } });
    res.json({ message: 'Status updated' });
  });

  return router;
}
