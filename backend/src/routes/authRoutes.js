import express from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected route — requires valid JWT
router.get('/me', verifyJWT, getMe);

export default router;
