import express from 'express';
import { isAuth , isAdmin } from '../middlewares/verifyToken.js';
import {
  createItem,
  updateItem,
  deleteItem,
  getItems,
  getItemById,
  getUserItems,
  moderateItem,
  toggleItemStatus,
  incrementItemStats,
  uploadItemImages,
  searchItems
} from '../controllers/item.controller.js';

const router = express.Router();

router.get('/', getItems);
router.get('/search', searchItems);
router.get('/my-items', isAuth, getUserItems);
router.get('/:id', getItemById);
router.post('/', isAuth, createItem);
router.put('/:id', isAuth, updateItem);
router.delete('/:id', isAuth, deleteItem);
router.patch('/:id/moderate', isAuth, isAdmin, moderateItem);
router.patch('/:id/toggle-status', isAuth, toggleItemStatus);
router.patch('/:id/stats/:type', incrementItemStats);
router.post('/:id/images', isAuth, uploadItemImages);

export default router;