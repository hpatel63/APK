import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createServer } from '../src/server.js';
import { JWT_SECRET } from '../src/config.js';
import { getDb } from '../src/db/index.js';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

let app;
let token;
let db;

beforeAll(async () => {
  const instance = await createServer();
  app = instance.app;
  db = instance.db;
  const manager = await db.get(`SELECT u.*, r.name as role, r.permissions as permissions FROM users u LEFT JOIN roles r ON u.roleId = r.id WHERE r.name = 'manager' LIMIT 1`);
  token = jwt.sign({ id: manager.id, role: manager.role, permissions: JSON.parse(manager.permissions || '[]') }, JWT_SECRET);
});

describe('Reservations API', () => {
  test('prevents double booking', async () => {
    const reservation = await db.get(`SELECT * FROM reservations LIMIT 1`);
    const guest = await db.get(`SELECT * FROM guests LIMIT 1`);
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        propertyId: reservation.propertyId,
        roomId: reservation.roomId,
        guest,
        status: 'confirmed',
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        ratePlan: 'Test',
        totalAmount: 100,
        balance: 0,
        channel: 'direct'
      });
    expect(res.status).toBe(409);
  });

  test('creates reservation and queues sync', async () => {
    const room = await db.get(`SELECT rooms.*, properties.id as propertyId FROM rooms LEFT JOIN properties ON properties.id = rooms.propertyId LIMIT 1`);
    const guestId = uuid();
    await db.run(`INSERT INTO guests (id, firstName, lastName, email, phone, createdAt, updatedAt, isDeleted) VALUES (?, 'Sync', 'Guest', 'sync@example.com', '555', ?, ?, 0)`, [guestId, dayjs().toISOString(), dayjs().toISOString()]);
    const start = dayjs().add(10, 'day').startOf('day');
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        propertyId: room.propertyId,
        roomId: room.id,
        guest: { id: guestId, firstName: 'Sync', lastName: 'Guest', email: 'sync@example.com', phone: '555' },
        status: 'confirmed',
        checkIn: start.toISOString(),
        checkOut: start.add(2, 'day').toISOString(),
        ratePlan: 'Test',
        totalAmount: 200,
        balance: 0,
        channel: 'direct'
      });
    expect(res.status).toBe(201);
    const queue = await db.all(`SELECT * FROM sync_queue WHERE entity = 'reservations' AND payload LIKE '%' || ? || '%'`, [res.body.id]);
    expect(queue.length).toBeGreaterThan(0);
  });
});
