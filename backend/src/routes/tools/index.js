import express from 'express';
import watermarkRemove from './watermarkRemove.js';
import portrait from './portrait.js';
import ps2Filter from './ps2Filter.js';
// import bgRemove from './bgRemove.js';
// import upscaler from './upscaler.js';

const router = express.Router();

router.use('/watermark-remove', watermarkRemove);
router.use('/portrait', portrait);
router.use('/ps2-filter', ps2Filter);
// router.use('/bg-remove', bgRemove);
// router.use('/upscaler', upscaler);

export default router;
