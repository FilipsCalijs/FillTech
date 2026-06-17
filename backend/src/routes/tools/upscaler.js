import express from 'express';
import multer from 'multer';
import { runWavespeed } from '../../lib/wavespeed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CREATE_URL = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/image-upscaler';

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'File too large. Max 50MB.' });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image is required' });
  const userUid = req.headers['x-user-uid'] || 'anonymous';
  const scale = parseInt(req.body.scale) || 4;

  try {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const { genId, imageUrl } = await runWavespeed({
      createUrl: CREATE_URL,
      body: { image: dataUri, scale },
      userUid,
      toolType: 'upscaler',
      r2Folder: 'upscaler',
    });

    res.json({ success: true, imageUrl, generationId: genId });
  } catch (err) {
    console.error('[upscaler]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
