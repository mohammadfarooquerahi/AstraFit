import express from 'express';
import {
  getAllUsers, updateUserStatus, updateUserRole,
  getAnalytics,
  getAIPlans, getAILogs,
  getAllPhotos, moderatePhoto,
  editDietPlan, editWorkoutPlan,
  getAllChats, flagChatMessage,
  getAdminActionLogs,
} from '../controllers/adminController.js';
import { verifyJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT, checkRole('admin'));

// 5.1 User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

// 5.2 Analytics Dashboard
router.get('/analytics', getAnalytics);

// 5.3 AI Output Monitoring
router.get('/ai-plans', getAIPlans);
router.get('/ai-logs', getAILogs);

// 5.4 Image Moderation
router.get('/photos', getAllPhotos);
router.put('/photos/:id/moderate', moderatePhoto);

// 5.5 Plan Management Override
router.put('/plans/diet/:id', editDietPlan);
router.put('/plans/workout/:id', editWorkoutPlan);

// 5.6 Chat Moderation
router.get('/chats', getAllChats);
router.put('/chats/:id/flag', flagChatMessage);

// 5.7 Reports & Action Logs
router.get('/action-logs', getAdminActionLogs);

export default router;
