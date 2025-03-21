import express from 'express';
import { isAuth, isAdmin } from '../middlewares/verifyToken.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  uploadCategoryIcon,
  toggleCategoryStatus,
  getPopularCategories,
  getPopularCategoriesWithItems
} from '../controllers/category.controller.js';
import { uploadSingleCategory } from '../middlewares/multer.middleware.js'; // Updated import

const router = express.Router();

// Public routes
router.get('/popular', getPopularCategories);
router.get('/popular-with-items', getPopularCategoriesWithItems);
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/upload', isAuth, isAdmin, uploadSingleCategory, uploadCategoryIcon); // Updated middleware
router.post('/', isAuth, isAdmin, createCategory);
router.put('/:id', isAuth, isAdmin, updateCategory);
router.delete('/:id', isAuth, isAdmin, deleteCategory);
router.patch('/:id/toggle-status', isAuth, isAdmin, toggleCategoryStatus);

export default router;