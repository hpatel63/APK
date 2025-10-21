import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export function authenticate(optional = false) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (optional) {
        return next();
      }
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      if (optional) {
        return next();
      }
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

export function authorize(permission) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.permissions.includes(permission) || user.role === 'manager') {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  };
}
