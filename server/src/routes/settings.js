import express from 'express';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import { authenticate, authorize } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';

export default function settingsRoutes(db, upload) {
  const router = express.Router();

  router.get('/branding', authenticate(), async (req, res) => {
    const properties = await db.all(`SELECT id, name, address, phone, timezone FROM properties WHERE isDeleted = 0`);
    res.json({ properties });
  });

  router.post('/branding', authenticate(), authorize('settings:manage'), upload.single('logo'), async (req, res) => {
    const { propertyId, name, address, phone, timezone } = req.body;
    await db.run(`UPDATE properties SET name = ?, address = ?, phone = ?, timezone = ?, updatedAt = ? WHERE id = ?`, [
      name,
      address,
      phone,
      timezone,
      dayjs().toISOString(),
      propertyId,
    ]);

    if (req.file) {
      await db.run(`INSERT INTO documents (id, reservationId, type, path, createdAt, updatedAt, isDeleted) VALUES (?, NULL, ?, ?, ?, ?, 0)`, [
        uuid(),
        'branding_logo',
        req.file.filename,
        dayjs().toISOString(),
        dayjs().toISOString(),
      ]);
    }

    res.json({ message: 'Branding updated' });
  });

  router.get('/users', authenticate(), authorize('users:manage'), async (req, res) => {
    const users = await db.all(`SELECT u.id, u.username, r.name as role FROM users u LEFT JOIN roles r ON r.id = u.roleId WHERE u.isDeleted = 0`);
    res.json({ users });
  });

  router.post('/users', authenticate(), authorize('users:manage'), async (req, res) => {
    const { username, password, role } = req.body;
    const roleRow = await db.get(`SELECT id FROM roles WHERE name = ?`, [role]);
    if (!roleRow) {
      return res.status(400).json({ message: 'Role not found' });
    }

    const id = uuid();
    await db.run(`INSERT INTO users (id, username, passwordHash, roleId, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, 0)`, [
      id,
      username,
      await hashPassword(password),
      roleRow.id,
      dayjs().toISOString(),
      dayjs().toISOString(),
    ]);

    res.status(201).json({ id });
  });

  router.get('/taxes', authenticate(), async (req, res) => {
    const taxes = await db.all(`SELECT * FROM taxes WHERE isDeleted = 0`);
    res.json({ taxes });
  });

  router.put('/taxes/:id', authenticate(), authorize('settings:manage'), async (req, res) => {
    const { id } = req.params;
    const { rate, name } = req.body;
    await db.run(`UPDATE taxes SET name = ?, rate = ?, updatedAt = ? WHERE id = ?`, [name, rate, dayjs().toISOString(), id]);
    res.json({ message: 'Tax updated' });
  });

  router.get('/templates', authenticate(), async (req, res) => {
    const templates = await db.all(`SELECT * FROM templates`);
    res.json({ templates });
  });

  router.put('/templates/:id', authenticate(), authorize('settings:manage'), async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    await db.run(`UPDATE templates SET content = ?, updatedAt = ? WHERE id = ?`, [content, dayjs().toISOString(), id]);
    res.json({ message: 'Template updated' });
  });

  return router;
}
