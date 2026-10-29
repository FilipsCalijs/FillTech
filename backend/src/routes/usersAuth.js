import express from 'express';
import { db } from '../db.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const toMysqlDate = (isoStr) => {
    if (!isoStr) return null;
    try {
        return new Date(isoStr).toISOString().slice(0, 19).replace('T', ' ');
    } catch (e) {
        return null;
    }
};

router.post('/sync-user', async (req, res) => {
    const { 
        uid, email, isAnonymous, displayName, 
        photoURL, creationTime, lastSignInTime 
    } = req.body;

    if (!uid) return res.status(400).json({ error: 'UID is required' });

    try {
        const sql = `
            INSERT INTO users (uid, email, is_anonymous, display_name, photo_url, created_at, last_login_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                email = VALUES(email),
                display_name = VALUES(display_name),
                photo_url = VALUES(photo_url),
                last_login_at = VALUES(last_login_at)
        `;

        const values = [
            uid, email || null, isAnonymous ? 1 : 0,
            displayName || 'User', photoURL || null,
            toMysqlDate(creationTime), toMysqlDate(lastSignInTime)
        ];

        await db.query(sql, values);

        
        const [rows] = await db.query('SELECT role FROM users WHERE uid = ?', [uid]);
        const role = rows[0]?.role || 'user';

        res.status(200).json({ success: true, role });
    } catch (err) {
        console.error('Ошибка в БД:', err);
        res.status(500).json({ error: 'Database error' });
    }
});
router.get('/admin/users', checkAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [rows] = await db.query(
      `SELECT uid, email, display_name, photo_url, role, balance, created_at, last_login_at
       FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    );
    res.json({ rows, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/users/:uid — update role and/or balance
router.patch('/admin/users/:uid', checkAdmin, async (req, res) => {
  const { uid } = req.params;
  const { role, balance } = req.body;

  const allowed = ['user', 'admin'];
  if (role !== undefined && !allowed.includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  if (balance !== undefined && isNaN(parseFloat(balance)))
    return res.status(400).json({ error: 'Invalid balance' });

  try {
    const sets = [];
    const vals = [];
    if (role    !== undefined) { sets.push('role = ?');    vals.push(role); }
    if (balance !== undefined) { sets.push('balance = ?'); vals.push(parseFloat(balance)); }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });

    vals.push(uid);
    await db.query(`UPDATE users SET ${sets.join(', ')} WHERE uid = ?`, vals);
    const [[user]] = await db.query('SELECT uid, email, display_name, role, balance FROM users WHERE uid = ?', [uid]);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:uid
router.delete('/admin/users/:uid', checkAdmin, async (req, res) => {
  const { uid } = req.params;
  if (uid === req.headers['x-user-uid'])
    return res.status(400).json({ error: 'Cannot delete yourself' });
  try {
    await db.query('DELETE FROM users WHERE uid = ?', [uid]);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;