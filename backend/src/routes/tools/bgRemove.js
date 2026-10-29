import express from 'express';
import multer from 'multer';
import { runWavespeed } from '../../lib/wavespeed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CREATE_URL = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/image-background-remover';

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

  try {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const { genId, imageUrl } = await runWavespeed({
      createUrl: CREATE_URL,
      body: { image: dataUri, enable_base64_output: false, enable_sync_mode: false },
      userUid,
      toolType:  'bg-remove',
      r2Folder:  'bg-remove',
    });

    res.json({ success: true, imageUrl, generationId: genId });
  } catch (err) {
    console.error('[bg-remove]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
