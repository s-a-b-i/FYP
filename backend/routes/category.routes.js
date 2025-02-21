// routes/categoryRoutes.js
import express from 'express';
import { isAuth, isAdmin } from '../middlewares/verifyToken.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  toggleCategoryStatus
} from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', isAuth, isAdmin, createCategory);
router.put('/:id', isAuth, isAdmin, updateCategory);
router.delete('/:id', isAuth, isAdmin, deleteCategory);
router.patch('/:id/toggle-status', isAuth, isAdmin, toggleCategoryStatus);

export default router;