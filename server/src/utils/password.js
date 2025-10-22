import { pbkdf2 as pbkdf2Callback, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(pbkdf2Callback);
const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const SALT_LENGTH = 16;

export async function hashPassword(password) {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const hash = Buffer.from(hashHex, 'hex');
  const derived = await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  if (derived.length !== hash.length) {
    return false;
  }
  return timingSafeEqual(derived, hash);
}
