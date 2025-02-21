// routes/profile.routes.js
import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  updateSocialConnections,
  deleteAccount,
  createProfile
} from '../controllers/profile.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Profile routes
// routes/profile.routes.js
router.post('/create', upload.single('profilePhoto'), createProfile);
router.get('/me', getProfile);
router.patch('/update', upload.single('profilePhoto'), updateProfile);
router.patch('/photo', upload.single('profilePhoto'), uploadProfilePhoto);
router.patch('/social-connections', updateSocialConnections);
router.delete('/delete-account', verifyToken , deleteAccount);

export default router;