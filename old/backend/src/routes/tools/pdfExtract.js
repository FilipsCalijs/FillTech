import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { pool } from '../../db.js';
import { uploadBuffer } from '../../lib/r2.js';
import { v4 as uuidv4 } from 'uuid';
import { getPrice } from '../../config/toolPrices.js';

const router = express.Router();
const MAX_SIZE = 20 * 1024 * 1024;
const TTL_DAYS = 7;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('INVALID_FILE_TYPE'));
    cb(null, true);
  },
});

router.post('/', (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'FILE_TOO_LARGE' });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

  const userUid   = req.headers['x-user-uid'] || 'anonymous';
  const genId     = uuidv4();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
  const cost      = getPrice('pdf-extract');

  await pool.execute(
    `INSERT INTO generations (id, user_uid, tool_type, status, expires_at, cost, created_at)
     VALUES (?, ?, 'pdf-extract', 'pending', ?, ?, NOW())`,
    [genId, userUid, expiresAt, cost]
  );

  try {
    await pool.execute(`UPDATE generations SET status = 'processing', started_at = NOW() WHERE id = ?`, [genId]);

    const parser = new PDFParse({ data: req.file.buffer });
    let result;
    try {
      result = await parser.getText();
    } finally {
      await parser.destroy();
    }

    const text = (result.text || '').trim();
    if (!text) throw new Error('NO_TEXT');

    const r2Url = await uploadBuffer(Buffer.from(result.text, 'utf-8'), 'text/plain', userUid, 'pdf-extract', 'txt');

    await pool.execute(
      `UPDATE generations SET status = 'completed', output_url = ?, completed_at = NOW() WHERE id = ?`,
      [r2Url, genId]
    );

    res.json({
      success:      true,
      textUrl:      r2Url,
      text:         result.text,
      generationId: genId,
      pageCount:    result.total ?? 0,
      charCount:    result.text.length,
    });
  } catch (err) {
    await pool.execute(
      `UPDATE generations SET status = 'failed', error_message = ? WHERE id = ?`,
      [err.message.slice(0, 500), genId]
    );
    console.error('[pdf-extract]', err);
    const status = err.message === 'NO_TEXT' ? 422 : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
