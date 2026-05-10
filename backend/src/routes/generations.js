import express from 'express';
import { pool } from '../db.js';
import { deleteFromR2 } from '../lib/r2.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const requireUid = (req, res, next) => {
  const uid = req.headers['x-user-uid'];
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  req.userUid = uid;
  next();
};

// GET /api/generations — история текущего пользователя
router.get('/', requireUid, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, tool_type, output_url, status, created_at, expires_at
     FROM generations
     WHERE user_uid = ? AND output_url IS NOT NULL
     ORDER BY created_at DESC`,
    [req.userUid]
  );
  res.json(rows);
});

// GET /api/generations/admin — все генерации (только для админов)
router.get('/admin', checkAdmin, async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT g.id, g.user_uid, g.tool_type, g.output_url, g.status, g.created_at, g.expires_at,
            u.email AS user_email
     FROM generations g
     LEFT JOIN users u ON u.uid = g.user_uid
     WHERE g.output_url IS NOT NULL
     ORDER BY g.created_at DESC`
  );
  res.json(rows);
});

// DELETE /api/generations/:id — владелец удаляет свою
router.delete('/:id', requireUid, async (req, res) => {
  const [[gen]] = await pool.execute(
    'SELECT output_url FROM generations WHERE id = ? AND user_uid = ?',
    [req.params.id, req.userUid]
  );
  if (!gen) return res.status(404).json({ error: 'Not found' });

  await deleteR2AndRow(gen.output_url, req.params.id);
  res.json({ success: true });
});

// DELETE /api/generations/admin/:id — админ удаляет любую
router.delete('/admin/:id', checkAdmin, async (req, res) => {
  const [[gen]] = await pool.execute(
    'SELECT output_url FROM generations WHERE id = ?',
    [req.params.id]
  );
  if (!gen) return res.status(404).json({ error: 'Not found' });

  await deleteR2AndRow(gen.output_url, req.params.id);
  res.json({ success: true });
});

async function deleteR2AndRow(outputUrl, id) {
  const publicBase = process.env.R2_PUBLIC_URL;
  if (publicBase && outputUrl?.startsWith(publicBase)) {
    const key = outputUrl.slice(publicBase.length + 1);
    await deleteFromR2(key).catch(() => {});
  }
  await pool.execute('DELETE FROM generations WHERE id = ?', [id]);
}

export default router;
