import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export async function recordAudit(db, { userId, entity, entityId, action, reason, payload }) {
  const redactedPayload = payload ? JSON.stringify(payload, (key, value) => {
    if (['cardNumber', 'cvv', 'pan', 'idScan'].includes(key)) {
      return '[redacted]';
    }
    return value;
  }) : null;

  await db.run(
    `INSERT INTO audit_logs (id, userId, entity, entityId, action, reason, redactedPayload, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuid(), userId, entity, entityId, action, reason || null, redactedPayload, dayjs().toISOString()]
  );
}
