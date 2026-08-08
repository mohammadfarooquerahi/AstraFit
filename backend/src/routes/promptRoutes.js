import express from 'express';
import { getAllPrompts, createPrompt, updatePrompt, deletePrompt } from '../controllers/promptController.js';
import { verifyJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT, checkRole('admin'));

router.get('/', getAllPrompts);
router.post('/', createPrompt);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);

export default router;
