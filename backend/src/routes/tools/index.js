import express from 'express';
import watermarkRemove from './watermarkRemove.js';
import portrait from './portrait.js';
import ps2Filter from './ps2Filter.js';
import voiceClone from './voiceClone.js';
import bgRemove from './bgRemove.js';
import photoColorize from './photoColorize.js';
import clothesSwap from './clothesSwap.js';
import videoWatermarkRemove from './videoWatermarkRemove.js';
import videoBgReplace from './videoBgReplace.js';
import vocalIsolator from './vocalIsolator.js';

const router = express.Router();

router.use('/watermark-remove', watermarkRemove);
router.use('/portrait', portrait);
router.use('/ps2-filter', ps2Filter);
router.use('/voice-clone', voiceClone);
router.use('/bg-remove', bgRemove);
router.use('/photo-colorize', photoColorize);
router.use('/clothes-swap', clothesSwap);
router.use('/video-watermark-remove', videoWatermarkRemove);
router.use('/video-bg-replace', videoBgReplace);
router.use('/vocal-isolator', vocalIsolator);

export default router;
