import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DB_PATH } from '../config.js';

sqlite3.verbose();

let dbInstance;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await dbInstance.exec('PRAGMA foreign_keys = ON');
  return dbInstance;
}

export async function migrate(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      timezone TEXT DEFAULT 'UTC',
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      propertyId TEXT NOT NULL,
      number TEXT NOT NULL,
      type TEXT,
      floor INTEGER,
      smoking INTEGER DEFAULT 0,
      status TEXT DEFAULT 'clean',
      features TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT,
      FOREIGN KEY(propertyId) REFERENCES properties(id)
    );

    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      phone TEXT,
      loyaltyId TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      propertyId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      guestId TEXT NOT NULL,
      status TEXT,
      checkIn TEXT,
      checkOut TEXT,
      ratePlan TEXT,
      totalAmount REAL,
      balance REAL,
      channel TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT,
      FOREIGN KEY(propertyId) REFERENCES properties(id),
      FOREIGN KEY(roomId) REFERENCES rooms(id),
      FOREIGN KEY(guestId) REFERENCES guests(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      reservationId TEXT,
      amount REAL,
      method TEXT,
      status TEXT,
      processorReference TEXT,
      meta TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT,
      FOREIGN KEY(reservationId) REFERENCES reservations(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      reservationId TEXT,
      type TEXT,
      path TEXT,
      signatureHash TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT,
      FOREIGN KEY(reservationId) REFERENCES reservations(id)
    );

    CREATE TABLE IF NOT EXISTS taxes (
      id TEXT PRIMARY KEY,
      propertyId TEXT,
      name TEXT,
      rate REAL,
      type TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      retentionUntil TEXT,
      FOREIGN KEY(propertyId) REFERENCES properties(id)
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      permissions TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      passwordHash TEXT,
      roleId TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isDeleted INTEGER DEFAULT 0,
      FOREIGN KEY(roleId) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      entity TEXT,
      entityId TEXT,
      action TEXT,
      reason TEXT,
      redactedPayload TEXT,
      createdAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT,
      content TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity TEXT,
      payload TEXT,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
}
