import express from 'express';
import { createProfile, getProfile } from '../controllers/profileController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.use(verifyJWT);

router.get('/', getProfile);
router.post('/', createProfile);
router.put('/', createProfile); // same upsert logic

export default router;
