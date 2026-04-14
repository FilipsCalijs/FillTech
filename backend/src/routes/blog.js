import express from 'express';
import { db } from '../db.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const toSlug = (title) => {
  const slug = title.toLowerCase().trim()
    .replace(/[^\w\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `post-${Date.now()}`;
};

const parseTags = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
};

// ─── Публичные ────────────────────────────────────────────────────────────

// GET /api/blog/posts
router.get('/posts', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, slug, excerpt, cover_url, tags, seo_title, seo_description, published_at
      FROM posts WHERE status = 'published'
      ORDER BY published_at DESC
    `);
    res.json(rows.map(r => ({ ...r, tags: parseTags(r.tags) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blog/posts/:slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM posts WHERE slug = ? AND status = 'published'`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];
    res.json({ ...post, tags: parseTags(post.tags) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────

// GET /api/blog/admin/posts
router.get('/admin/posts', checkAdmin, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, slug, excerpt, tags, status, published_at, created_at, updated_at
      FROM posts ORDER BY created_at DESC
    `);
    res.json(rows.map(r => ({ ...r, tags: parseTags(r.tags) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/blog/admin/posts — создать + сразу опубликовать если publish=true
router.post('/admin/posts', checkAdmin, async (req, res) => {
  const { title, content, excerpt, cover_url, seo_title, seo_description, tags, publish } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

  const author_uid = req.headers['x-user-uid'] || null;
  let slug = toSlug(title);
  const status = publish ? 'published' : 'draft';
  const published_at = publish ? new Date() : null;

  try {
    const [existing] = await db.query('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existing.length) slug = `${slug}-${Date.now()}`;

    const [result] = await db.query(`
      INSERT INTO posts (title, slug, content, excerpt, cover_url, author_uid, seo_title, seo_description, tags, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, slug, content,
      excerpt || null, cover_url || null, author_uid,
      seo_title || null, seo_description || null,
      tags ? JSON.stringify(tags) : null,
      status, published_at,
    ]);

    res.status(201).json({ id: result.insertId, slug, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/blog/admin/posts/:id — обновить + опубликовать если publish=true
router.put('/admin/posts/:id', checkAdmin, async (req, res) => {
  const { title, content, excerpt, cover_url, seo_title, seo_description, tags, publish } = req.body;
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });

    const cur = rows[0];
    let slug = cur.slug;
    const newTitle = title ?? cur.title;
    if (title && title !== cur.title) {
      slug = toSlug(title);
      const [ex] = await db.query('SELECT id FROM posts WHERE slug = ? AND id != ?', [slug, id]);
      if (ex.length) slug = `${slug}-${Date.now()}`;
    }

    const status = publish ? 'published' : cur.status;
    const published_at = publish && cur.status !== 'published' ? new Date() : cur.published_at;

    await db.query(`
      UPDATE posts SET
        title = ?, slug = ?, content = ?, excerpt = ?, cover_url = ?,
        seo_title = ?, seo_description = ?, tags = ?,
        status = ?, published_at = ?
      WHERE id = ?
    `, [
      newTitle, slug,
      content ?? cur.content,
      excerpt ?? cur.excerpt,
      cover_url ?? cur.cover_url,
      seo_title ?? cur.seo_title,
      seo_description ?? cur.seo_description,
      tags ? JSON.stringify(tags) : cur.tags,
      status, published_at, id,
    ]);

    res.json({ success: true, slug, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/blog/admin/posts/:id/publish — переключить статус
router.patch('/admin/posts/:id/publish', checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT status FROM posts WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });

    const newStatus = rows[0].status === 'published' ? 'draft' : 'published';
    const published_at = newStatus === 'published' ? new Date() : null;

    await db.query('UPDATE posts SET status = ?, published_at = ? WHERE id = ?', [newStatus, published_at, id]);
    res.json({ status: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/blog/admin/posts/:id
router.delete('/admin/posts/:id', checkAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM posts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
