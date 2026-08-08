import express from 'express';
import { generateWorkoutPlan, getWorkoutPlan } from '../controllers/workoutController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getWorkoutPlan);
router.post('/generate', generateWorkoutPlan);

export default router;
