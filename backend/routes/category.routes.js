// routes/categoryRoutes.js
import express from 'express';
import { isAuth, isAdmin } from '../middlewares/verifyToken.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  uploadCategoryIcon,
  toggleCategoryStatus
} from '../controllers/category.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();
router.post('/upload', isAuth, isAdmin, upload.single('icon'), uploadCategoryIcon);
router.get('/', isAuth , getCategories);
router.get('/:id', getCategoryById);
router.post('/', isAuth, isAdmin, createCategory);
router.put('/:id', isAuth, isAdmin, updateCategory);
router.delete('/:id', isAuth, isAdmin, deleteCategory);
router.patch('/:id/toggle-status', isAuth, isAdmin, toggleCategoryStatus);

export default router;