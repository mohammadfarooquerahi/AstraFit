import express from 'express';
import { addProgressLog, getProgressHistory } from '../controllers/progressController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getProgressHistory);
router.post('/', addProgressLog);

export default router;
