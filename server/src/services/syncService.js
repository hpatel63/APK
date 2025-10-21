import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import { SYNC_BATCH_LIMIT } from '../config.js';

export async function queueChange(db, { entity, payload }) {
  await db.run(
    `INSERT INTO sync_queue (id, entity, payload, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuid(), entity, JSON.stringify(payload), 'pending', dayjs().toISOString(), dayjs().toISOString()]
  );
}

export async function getPendingQueue(db, { limit = SYNC_BATCH_LIMIT }) {
  return db.all(`SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY createdAt ASC LIMIT ?`, limit);
}

export async function markSynced(db, id) {
  await db.run(`UPDATE sync_queue SET status = 'synced', updatedAt = ? WHERE id = ?`, [dayjs().toISOString(), id]);
}

export async function applyIncoming(db, changes = []) {
  const results = [];
  for (const change of changes) {
    const { entity, payload, timestamp } = change;
    const serverTs = dayjs().toISOString();
    switch (entity) {
      case 'reservations': {
        const existing = await db.get(`SELECT * FROM reservations WHERE id = ?`, [payload.id]);
        if (!existing || dayjs(timestamp).isAfter(existing.updatedAt)) {
          await db.run(
            `INSERT INTO reservations (id, propertyId, roomId, guestId, status, checkIn, checkOut, ratePlan, totalAmount, balance, channel, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               propertyId=excluded.propertyId,
               roomId=excluded.roomId,
               guestId=excluded.guestId,
               status=excluded.status,
               checkIn=excluded.checkIn,
               checkOut=excluded.checkOut,
               ratePlan=excluded.ratePlan,
               totalAmount=excluded.totalAmount,
               balance=excluded.balance,
               channel=excluded.channel,
               updatedAt=excluded.updatedAt,
               isDeleted=excluded.isDeleted`,
            [
              payload.id,
              payload.propertyId,
              payload.roomId,
              payload.guestId,
              payload.status,
              payload.checkIn,
              payload.checkOut,
              payload.ratePlan,
              payload.totalAmount,
              payload.balance,
              payload.channel,
              payload.createdAt || serverTs,
              serverTs,
              payload.isDeleted || 0,
            ]
          );
          results.push({ id: payload.id, entity, status: 'applied', serverTs });
        } else {
          results.push({ id: payload.id, entity, status: 'skipped', reason: 'server-newer' });
        }
        break;
      }
      default: {
        results.push({ entity, status: 'ignored' });
      }
    }
  }
  return results;
}
