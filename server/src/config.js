import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-demo';
export const TOKEN_EXPIRY = '8h';
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../aurora-pos.db');
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
export const DEMO_MODE = process.env.DEMO_MODE !== 'false';
export const SYNC_BATCH_LIMIT = parseInt(process.env.SYNC_BATCH_LIMIT || '100', 10);
export const CASH_APP_BASE_URL = 'https://api.cash.app';
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 100;
export const OFFLINE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

