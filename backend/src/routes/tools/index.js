import express from 'express';
import watermarkRemove from './watermarkRemove.js';
import portrait from './portrait.js';
import ps2Filter from './ps2Filter.js';
import voiceClone from './voiceClone.js';
import bgRemove from './bgRemove.js';
import photoColorize from './photoColorize.js';
import clothesSwap from './clothesSwap.js';
import videoWatermarkRemove from './videoWatermarkRemove.js';

const router = express.Router();

router.use('/watermark-remove', watermarkRemove);
router.use('/portrait', portrait);
router.use('/ps2-filter', ps2Filter);
router.use('/voice-clone', voiceClone);
router.use('/bg-remove', bgRemove);
router.use('/photo-colorize', photoColorize);
router.use('/clothes-swap', clothesSwap);
router.use('/video-watermark-remove', videoWatermarkRemove);

export default router;
