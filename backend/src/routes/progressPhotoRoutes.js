import express from 'express';
import { uploadPhoto, getPhotos, adminModeratePhoto } from '../controllers/progressPhotoController.js';
import { verifyJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyJWT);

router.get('/', getPhotos);
router.post('/', uploadPhoto);
router.put('/:id/moderate', checkRole('admin'), adminModeratePhoto);

export default router;
