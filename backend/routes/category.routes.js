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
  toggleCategoryStatus,
  getPopularCategories,
  getPopularCategoriesWithItems
} from '../controllers/category.controller.js';
import { upload } from '../middlewares/multer.middleware.js';



const router = express.Router();

// Add this to categoryRoutes.js
router.get('/popular', getPopularCategories); // Public route that doesn't require auth
router.get('/popular-with-items', getPopularCategoriesWithItems);

router.post('/upload', isAuth, isAdmin, upload.single('icon'), uploadCategoryIcon);
router.get('/' , getCategories);
router.get('/:id', getCategoryById);
router.post('/', isAuth, isAdmin, createCategory);
router.put('/:id', isAuth, isAdmin, updateCategory);
router.delete('/:id', isAuth, isAdmin, deleteCategory);
router.patch('/:id/toggle-status', isAuth, isAdmin, toggleCategoryStatus);

export default router;