import express from 'express';
import { runWavespeed } from '../../lib/wavespeed.js';

const router = express.Router();
const CREATE_URL = 'https://api.wavespeed.ai/api/v3/minimax/voice-design';

const randChars = (n) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

router.post('/', async (req, res) => {
  const { text, prompt } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: 'TEXT_REQUIRED' });
  if (text.length > 500) return res.status(400).json({ error: 'TEXT_TOO_LONG' });

  const userUid = req.headers['x-user-uid'] || 'anonymous';
  // Must start with letter, min 8 chars, letters+numbers only
  const custom_voice_id = `tts${Date.now()}${randChars(4)}`;

  try {
    const body = { text: text.trim(), custom_voice_id };
    if (prompt?.trim()) body.prompt = prompt.trim();

    const { genId, imageUrl: audioUrl } = await runWavespeed({
      createUrl: CREATE_URL,
      body,
      userUid,
      toolType: 'text-to-speech',
      r2Folder: 'text-to-speech',
    });

    res.json({ success: true, audioUrl, generationId: genId });
  } catch (err) {
    console.error('[text-to-speech]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
