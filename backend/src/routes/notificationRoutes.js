import express from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

export default router;
