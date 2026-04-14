import express from 'express';
import watermarkRemove from './watermarkRemove.js';
// import bgRemove from './bgRemove.js';
// import upscaler from './upscaler.js';

const router = express.Router();

router.use('/watermark-remove', watermarkRemove);
// router.use('/bg-remove', bgRemove);
// router.use('/upscaler', upscaler);

export default router;
