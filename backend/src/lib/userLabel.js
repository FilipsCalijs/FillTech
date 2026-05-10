import { db } from '../db.js';

/**
 * По Firebase UID возвращает человекочитаемый идентификатор:
 * display_name → email prefix → uid (fallback)
 */
export async function resolveUserLabel(uid) {
  try {
    const [[user]] = await db.query('SELECT display_name, email FROM users WHERE uid = ?', [uid]);
    if (user?.display_name && user.display_name !== 'User') return user.display_name;
    if (user?.email) return user.email.split('@')[0];
  } catch { /* ignore */ }
  return uid;
}
