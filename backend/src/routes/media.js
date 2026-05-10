import express from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { checkAdmin } from '../middleware/authMiddleware.js';
import { uploadBuffer, uploadFromUrl, deleteFromR2 } from '../lib/r2.js';
import { resolveUserLabel } from '../lib/userLabel.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/media?page=1  — список всех медиафайлов (50 на страницу)
router.get('/', checkAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM media');
    const [rows] = await db.query(
      'SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json({ items: rows, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/media/upload  — загрузка файла из формы
router.post('/upload', checkAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const uid = req.headers['x-user-uid'] || 'admin';
  const userLabel = await resolveUserLabel(uid);
  try {
    const url = await uploadBuffer(req.file.buffer, req.file.mimetype, userLabel, 'media');
    const r2Key = new URL(url).pathname.slice(1);

    const [result] = await db.query(
      'INSERT INTO media (filename, r2_key, url, content_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.file.originalname, r2Key, url, req.file.mimetype, req.file.size, uid]
    );
    res.status(201).json({ id: result.insertId, url, filename: req.file.originalname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/media/from-url  — загрузка по внешнему URL → R2
router.post('/from-url', checkAdmin, async (req, res) => {
  const { url: sourceUrl } = req.body;
  if (!sourceUrl) return res.status(400).json({ error: 'url is required' });

  const uid = req.headers['x-user-uid'] || 'admin';
  const userLabel = await resolveUserLabel(uid);
  try {
    const url = await uploadFromUrl(sourceUrl, userLabel, 'media');
    const r2Key = new URL(url).pathname.slice(1);
    const filename = sourceUrl.split('/').pop().split('?')[0] || 'image';

    const [result] = await db.query(
      'INSERT INTO media (filename, r2_key, url, content_type, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [filename, r2Key, url, 'image/jpeg', uid]
    );
    res.status(201).json({ id: result.insertId, url, filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch or upload URL' });
  }
});

// DELETE /api/media/:id  — удалить из R2 и БД
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const [[row]] = await db.query('SELECT * FROM media WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });

    await deleteFromR2(row.r2_key);
    await db.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
