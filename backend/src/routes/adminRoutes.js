import express from 'express';
import { getAllUsers, updateUserStatus, updateUserRole, getAILogs } from '../controllers/adminController.js';
import { verifyJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Guard all admin routes: Requires valid JWT + role === 'admin'
router.use(verifyJWT, checkRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/ai-logs', getAILogs);

export default router;
