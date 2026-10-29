import express from 'express';
import multer from 'multer';
import { runWavespeed } from '../../lib/wavespeed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CREATE_URL = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/omnivoice/voice-clone';

router.post('/', (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'File too large. Max 50MB.' });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const { text, speed } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Text is required' });
  if (!req.file)     return res.status(400).json({ error: 'Audio file is required' });

  const userUid = req.headers['x-user-uid'] || 'anonymous';

  try {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const { genId, imageUrl: audioUrl } = await runWavespeed({
      createUrl: CREATE_URL,
      body: { text: text.trim(), audio: dataUri, speed: parseFloat(speed) || 1.0 },
      userUid,
      toolType:  'voice-clone',
      r2Folder:  'voice-clone',
    });

    res.json({ success: true, audioUrl, generationId: genId });
  } catch (err) {
    console.error('[voice-clone]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
