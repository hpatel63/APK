import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { JWT_SECRET, TOKEN_EXPIRY } from '../config.js';

export default function authRoutes(db) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await db.get(`SELECT u.*, r.name as role, r.permissions as permissions FROM users u LEFT JOIN roles r ON u.roleId = r.id WHERE u.username = ?`, [username]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const permissions = JSON.parse(user.permissions || '[]');
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
      permissions,
      issuedAt: dayjs().toISOString(),
    }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.json({ token, role: user.role, permissions });
  });

  return router;
}
