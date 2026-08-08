import express from 'express';
import { saveAnalysis, getAnalysis } from '../controllers/bodyAnalysisController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getAnalysis);
router.post('/', saveAnalysis);

export default router;
