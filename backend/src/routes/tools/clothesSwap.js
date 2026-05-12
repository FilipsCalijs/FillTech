import express from 'express';
import multer from 'multer';
import { runWavespeed } from '../../lib/wavespeed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CREATE_URL = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/ai-clothes-changer';

router.post('/', (req, res, next) => {
  upload.fields([
    { name: 'model',  maxCount: 1 },
    { name: 'outfit', maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'File too large. Max 50MB.' });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const modelFile  = req.files?.model?.[0];
  const outfitFile = req.files?.outfit?.[0];
  const outfitUrl  = req.body.outfit_url;

  if (!modelFile)                    return res.status(400).json({ error: 'Model image is required' });
  if (!outfitFile && !outfitUrl)     return res.status(400).json({ error: 'Outfit image is required' });

  const userUid = req.headers['x-user-uid'] || 'anonymous';

  try {
    const modelUri  = `data:${modelFile.mimetype};base64,${modelFile.buffer.toString('base64')}`;
    const clothesImage = outfitFile
      ? `data:${outfitFile.mimetype};base64,${outfitFile.buffer.toString('base64')}`
      : outfitUrl;

    const { genId, imageUrl } = await runWavespeed({
      createUrl: CREATE_URL,
      body: { image: modelUri, clothes_images: [clothesImage] },
      userUid,
      toolType:  'clothes-swap',
      r2Folder:  'clothes-swap',
    });

    res.json({ success: true, imageUrl, generationId: genId });
  } catch (err) {
    console.error('[clothes-swap]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
