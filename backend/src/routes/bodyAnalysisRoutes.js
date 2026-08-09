import express from 'express';
import { saveAnalysis, getAnalysis, scanImage } from '../controllers/bodyAnalysisController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getAnalysis);
router.post('/', saveAnalysis);
router.post('/scan', scanImage);

export default router;
