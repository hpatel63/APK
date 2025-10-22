import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import fs from 'fs';
import { UPLOAD_DIR } from '../config.js';
import { hashPassword } from '../utils/password.js';

export async function seedDatabase(db) {
  await db.exec('DELETE FROM sync_queue');
  await db.exec('DELETE FROM audit_logs');
  await db.exec('DELETE FROM documents');
  await db.exec('DELETE FROM payments');
  await db.exec('DELETE FROM reservations');
  await db.exec('DELETE FROM guests');
  await db.exec('DELETE FROM rooms');
  await db.exec('DELETE FROM properties');
  await db.exec('DELETE FROM taxes');
  await db.exec('DELETE FROM users');
  await db.exec('DELETE FROM roles');
  await db.exec('DELETE FROM templates');

  const now = dayjs().toISOString();
  const properties = [
    {
      id: uuid(),
      name: 'Aurora Downtown Inn',
      address: '123 Neon Way, Las Vegas, NV',
      phone: '+1 702-555-1010',
      timezone: 'America/Los_Angeles',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: 'Aurora Seaside Lodge',
      address: '88 Coastal Breeze, Miami, FL',
      phone: '+1 305-555-2020',
      timezone: 'America/New_York',
      createdAt: now,
      updatedAt: now,
    }
  ];

  for (const prop of properties) {
    await db.run(
      `INSERT INTO properties (id, name, address, phone, timezone, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [prop.id, prop.name, prop.address, prop.phone, prop.timezone, prop.createdAt, prop.updatedAt]
    );
  }

  const roomTypes = ['King', 'Queen', 'Double', 'Suite'];
  const statuses = ['clean', 'dirty', 'occupied', 'oos'];

  for (const prop of properties) {
    for (let i = 1; i <= 20; i++) {
      const roomId = uuid();
      await db.run(
        `INSERT INTO rooms (id, propertyId, number, type, floor, smoking, status, features, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          roomId,
          prop.id,
          `${i}`.padStart(3, '0'),
          roomTypes[i % roomTypes.length],
          Math.ceil(i / 5),
          i % 10 === 0 ? 1 : 0,
          statuses[i % statuses.length],
          JSON.stringify({ beds: i % 3 === 0 ? 2 : 1, view: i % 4 === 0 ? 'Ocean' : 'City' }),
          now,
          now,
        ]
      );
    }
  }

  const taxes = [
    { id: uuid(), propertyId: properties[0].id, name: 'State Tax', rate: 0.07, type: 'state' },
    { id: uuid(), propertyId: properties[1].id, name: 'Resort Fee', rate: 0.15, type: 'fee' }
  ];

  for (const tax of taxes) {
    await db.run(
      `INSERT INTO taxes (id, propertyId, name, rate, type, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [tax.id, tax.propertyId, tax.name, tax.rate, tax.type, now, now]
    );
  }

  const roleManager = {
    id: uuid(),
    name: 'manager',
    permissions: JSON.stringify([
      'reservations:create',
      'reservations:update',
      'reservations:delete',
      'payments:refund',
      'reports:export',
      'settings:manage',
      'users:manage'
    ]),
    createdAt: now,
    updatedAt: now,
  };

  const roleAssociate = {
    id: uuid(),
    name: 'associate',
    permissions: JSON.stringify([
      'reservations:create',
      'reservations:update',
      'reports:view'
    ]),
    createdAt: now,
    updatedAt: now,
  };

  await db.run(`INSERT INTO roles (id, name, permissions, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`, [
    roleManager.id,
    roleManager.name,
    roleManager.permissions,
    roleManager.createdAt,
    roleManager.updatedAt,
  ]);

  await db.run(`INSERT INTO roles (id, name, permissions, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`, [
    roleAssociate.id,
    roleAssociate.name,
    roleAssociate.permissions,
    roleAssociate.createdAt,
    roleAssociate.updatedAt,
  ]);

  const managerUser = {
    id: uuid(),
    username: 'manager',
    passwordHash: await hashPassword('Manager@123'),
    roleId: roleManager.id,
    createdAt: now,
    updatedAt: now,
  };

  const associateUser = {
    id: uuid(),
    username: 'associate',
    passwordHash: await hashPassword('Associate@123'),
    roleId: roleAssociate.id,
    createdAt: now,
    updatedAt: now,
  };

  await db.run(`INSERT INTO users (id, username, passwordHash, roleId, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 0)`, [
    managerUser.id,
    managerUser.username,
    managerUser.passwordHash,
    managerUser.roleId,
    managerUser.createdAt,
    managerUser.updatedAt,
  ]);

  await db.run(`INSERT INTO users (id, username, passwordHash, roleId, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 0)`, [
    associateUser.id,
    associateUser.username,
    associateUser.passwordHash,
    associateUser.roleId,
    associateUser.createdAt,
    associateUser.updatedAt,
  ]);

  const guests = [
    {
      id: uuid(),
      firstName: 'Jules',
      lastName: 'Rivera',
      email: 'jules.rivera@example.com',
      phone: '+1 555-888-9911',
      loyaltyId: 'AUR12345',
    },
    {
      id: uuid(),
      firstName: 'Morgan',
      lastName: 'Lee',
      email: 'morgan.lee@example.com',
      phone: '+1 555-222-9900',
      loyaltyId: 'AUR67890',
    }
  ];

  for (const guest of guests) {
    await db.run(`INSERT INTO guests (id, firstName, lastName, email, phone, loyaltyId, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
      guest.id,
      guest.firstName,
      guest.lastName,
      guest.email,
      guest.phone,
      guest.loyaltyId,
      now,
      now,
    ]);
  }

  const reservations = [];
  for (let i = 0; i < 10; i++) {
    const property = properties[i % properties.length];
    const room = await db.get(`SELECT * FROM rooms WHERE propertyId = ? LIMIT 1 OFFSET ?`, [property.id, i]);
    const guest = guests[i % guests.length];
    const checkIn = dayjs().add(i, 'day');
    const res = {
      id: uuid(),
      propertyId: property.id,
      roomId: room.id,
      guestId: guest.id,
      status: i % 2 === 0 ? 'confirmed' : 'checked_in',
      checkIn: checkIn.toISOString(),
      checkOut: checkIn.add(2, 'day').toISOString(),
      ratePlan: 'Best Flexible',
      totalAmount: 450 + i * 20,
      balance: i % 3 === 0 ? 0 : 100,
      channel: i % 2 === 0 ? 'direct' : 'ota',
      createdAt: now,
      updatedAt: now,
    };
    reservations.push(res);
    await db.run(
      `INSERT INTO reservations (id, propertyId, roomId, guestId, status, checkIn, checkOut, ratePlan, totalAmount, balance, channel, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [res.id, res.propertyId, res.roomId, res.guestId, res.status, res.checkIn, res.checkOut, res.ratePlan, res.totalAmount, res.balance, res.channel, res.createdAt, res.updatedAt]
    );
  }

  for (const reservation of reservations) {
    await db.run(`INSERT INTO payments (id, reservationId, amount, method, status, processorReference, meta, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, [
      uuid(),
      reservation.id,
      reservation.totalAmount - reservation.balance,
      reservation.balance === 0 ? 'card' : 'cash',
      reservation.balance === 0 ? 'captured' : 'pending',
      reservation.balance === 0 ? `txn_${reservation.id.slice(0, 8)}` : null,
      JSON.stringify({ last4: '4242' }),
      now,
      now,
    ]);
  }

  const templates = [
    {
      id: uuid(),
      name: 'check_in_receipt',
      content: 'Thank you {{guestName}} for staying at {{propertyName}} in room {{roomNumber}}.',
    },
    {
      id: uuid(),
      name: 'terms_and_conditions',
      content: 'By signing you agree to the terms for {{propertyName}}.',
    }
  ];

  for (const template of templates) {
    await db.run(`INSERT INTO templates (id, name, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`, [
      template.id,
      template.name,
      template.content,
      now,
      now,
    ]);
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}
