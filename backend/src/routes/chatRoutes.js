import express from 'express';
import { getMessages, sendMessage } from '../controllers/chatController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/messages', getMessages);
router.post('/send', sendMessage);

export default router;
