import express from 'express';
import { getTodayHabit, updateHabit } from '../controllers/habitController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getTodayHabit);
router.put('/', updateHabit);

export default router;
