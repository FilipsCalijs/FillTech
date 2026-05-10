import express from 'express';
import multer from 'multer';
import { uploadBuffer } from '../../lib/r2.js';
import { createPendingGeneration } from '../../lib/saveGeneration.js';
import { enqueueWatermarkRemove } from '../../lib/aiQueue.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const userUid = req.headers['x-user-uid'];
  if (!userUid) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  try {
    const inputUrl = await uploadBuffer(req.file.buffer, req.file.mimetype, userUid, 'watermark-remove');
    const generationId = await createPendingGeneration(userUid, inputUrl, 'watermark-remove');
    await enqueueWatermarkRemove({ generationId, inputUrl, userUid });

    res.json({ success: true, generationId });
  } catch (err) {
    console.error('[watermark-remove]', err);
    res.status(500).json({ error: 'Processing failed', detail: err.message });
  }
});

export default router;
