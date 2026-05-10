import express from 'express';
import { pool } from '../db.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/effects — публичный, только опубликованные
router.get('/', async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, name, slug, short_desc, icon, cover_url, status, sort_order
     FROM effects WHERE status = 'published' ORDER BY sort_order ASC, id ASC`
  );
  res.json(rows);
});

// GET /api/effects/:slug — одиночный эффект (публичный)
router.get('/:slug', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT * FROM effects WHERE slug = ?`,
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: 'Effect not found' });
  res.json(rows[0]);
});

// ── Admin routes ──────────────────────────────────────────────────

// GET /api/effects/admin/all — все эффекты для админа
router.get('/admin/all', checkAdmin, async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT * FROM effects ORDER BY sort_order ASC, id ASC`
  );
  res.json(rows);
});

// POST /api/effects/admin — создать эффект
router.post('/admin', checkAdmin, async (req, res) => {
  const { name, slug, short_desc, description, icon, cover_url, status, sort_order } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

  const [result] = await pool.execute(
    `INSERT INTO effects (name, slug, short_desc, description, icon, cover_url, status, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, slug, short_desc || null, description || null, icon || '✨', cover_url || null, status || 'draft', sort_order || 0]
  );
  const [rows] = await pool.execute('SELECT * FROM effects WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// PUT /api/effects/admin/:id — обновить эффект
router.put('/admin/:id', checkAdmin, async (req, res) => {
  const { name, slug, short_desc, description, icon, cover_url, status, sort_order } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

  await pool.execute(
    `UPDATE effects SET name=?, slug=?, short_desc=?, description=?, icon=?, cover_url=?, status=?, sort_order=?
     WHERE id = ?`,
    [name, slug, short_desc || null, description || null, icon || '✨', cover_url || null, status || 'draft', sort_order || 0, req.params.id]
  );
  const [rows] = await pool.execute('SELECT * FROM effects WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

// PATCH /api/effects/admin/:id/publish — переключить статус
router.patch('/admin/:id/publish', checkAdmin, async (req, res) => {
  const [rows] = await pool.execute('SELECT status FROM effects WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });

  const newStatus = rows[0].status === 'published' ? 'draft' : 'published';
  await pool.execute('UPDATE effects SET status = ? WHERE id = ?', [newStatus, req.params.id]);
  res.json({ status: newStatus });
});

// DELETE /api/effects/admin/:id — удалить эффект
router.delete('/admin/:id', checkAdmin, async (req, res) => {
  await pool.execute('DELETE FROM effects WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
