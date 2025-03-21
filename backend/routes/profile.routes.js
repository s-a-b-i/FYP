import { Router } from 'express';
import { uploadSingleProfile } from '../middlewares/multer.middleware.js'; // Updated import
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

// Log incoming requests for debugging
router.use((req, res, next) => {
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  console.log('Request Cookies:', req.cookies);
  next();
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// Profile routes
router.post('/create', uploadSingleProfile, createProfile);
router.get('/me', getProfile);
router.patch('/update', uploadSingleProfile, updateProfile);
router.patch('/photo', uploadSingleProfile, uploadProfilePhoto);
router.patch('/social-connections', updateSocialConnections);
router.delete('/delete-account', deleteAccount);

export default router;