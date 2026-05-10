import express from 'express';
import { pool } from '../db.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Проверяем является ли пользователь администратором
async function isAdmin(uid) {
  const [rows] = await pool.execute('SELECT role FROM users WHERE uid = ?', [uid]);
  return rows[0]?.role === 'admin';
}

// GET /api/comments?postId=X — все комментарии поста (публичный)
router.get('/', async (req, res) => {
  const { postId } = req.query;
  if (!postId) return res.status(400).json({ error: 'postId is required' });

  const [rows] = await pool.execute(
    `SELECT id, post_id, user_uid, display_name, photo_url, content, created_at, updated_at
     FROM comments WHERE post_id = ? ORDER BY created_at ASC`,
    [postId]
  );
  res.json(rows);
});

// POST /api/comments — создать комментарий (только авторизованные)
router.post('/', checkAuth, async (req, res) => {
  const { postId, content } = req.body;
  const displayName = req.headers['x-user-name'] || 'User';
  const photoUrl    = req.headers['x-user-avatar'] || null;

  if (!postId || !content?.trim()) {
    return res.status(400).json({ error: 'postId and content are required' });
  }

  const [result] = await pool.execute(
    `INSERT INTO comments (post_id, user_uid, display_name, photo_url, content)
     VALUES (?, ?, ?, ?, ?)`,
    [postId, req.userUid, displayName, photoUrl, content.trim()]
  );

  const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/comments/:id — редактировать (свой или любой если админ)
router.put('/:id', checkAuth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

  const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Comment not found' });

  const comment = rows[0];
  const admin = await isAdmin(req.userUid);

  if (comment.user_uid !== req.userUid && !admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await pool.execute('UPDATE comments SET content = ? WHERE id = ?', [content.trim(), req.params.id]);
  const [updated] = await pool.execute('SELECT * FROM comments WHERE id = ?', [req.params.id]);
  res.json(updated[0]);
});

// DELETE /api/comments/:id — удалить (свой или любой если админ)
router.delete('/:id', checkAuth, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Comment not found' });

  const comment = rows[0];
  const admin = await isAdmin(req.userUid);

  if (comment.user_uid !== req.userUid && !admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
