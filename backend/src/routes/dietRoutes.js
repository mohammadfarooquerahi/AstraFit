import express from 'express';
import { generateDietPlan, getDietPlan } from '../controllers/dietController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getDietPlan);
router.post('/generate', generateDietPlan);

export default router;
