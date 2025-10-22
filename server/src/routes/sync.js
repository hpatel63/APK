import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPendingQueue, markSynced, applyIncoming } from '../services/syncService.js';

export default function syncRoutes(db) {
  const router = express.Router();

  router.get('/queue', authenticate(), async (req, res) => {
    const queue = await getPendingQueue(db, {});
    res.json({ queue });
  });

  router.post('/ack', authenticate(), async (req, res) => {
    const { ids } = req.body;
    for (const id of ids || []) {
      await markSynced(db, id);
    }
    res.json({ message: 'Acknowledged' });
  });

  router.post('/apply', authenticate(), async (req, res) => {
    const { changes } = req.body;
    const results = await applyIncoming(db, changes);
    res.json({ results });
  });

  return router;
}
