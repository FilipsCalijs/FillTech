import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { uploadBuffer } from '../lib/r2.js';
import { db } from '../db.js';
import { resolveUserLabel } from '../lib/userLabel.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/tools/watermark-remove
router.post('/watermark-remove', upload.single('image'), async (req, res) => {
  const userUid = req.headers['x-user-uid'];
  if (!userUid) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  try {
    // Upload original to R2 (placeholder — same image returned as result)
    const userLabel = await resolveUserLabel(userUid);
    const resultUrl = await uploadBuffer(
      req.file.buffer,
      req.file.mimetype,
      userLabel,
      'watermark-remove'
    );

    // Save to generations table
    const id = uuidv4();
    await db.query(
      `INSERT INTO generations (id, user_uid, output_url, model, status) VALUES (?, ?, ?, ?, 'completed')`,
      [id, userUid, resultUrl, 'watermark-remove']
    );

    res.json({ success: true, resultUrl, generationId: id });
  } catch (err) {
    console.error('Watermark remove error:', err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

export default router;
