import express from 'express';
import {
  createItem,
  getItems,
  getUserItems,
  searchItems,
  updateItem,
  uploadItemImages,
  incrementItemStats,
  getItemsPendingModeration,
  getItemForModeration,
  moderateItem,
  getUserItemStats,
  getAdminDashboardStats,
  deleteItem,
  getItemById,
  toggleItemStatus,
  markItemAsSold,
  getFeaturedItems,
  getRelatedItems,
  extendItemVisibility,
  updateItemImages,
  deleteItemImage,
  bulkModerateItems,
  getModeratedItems,
  reviseModeration,
  checkItemStatus,
} from '../controllers/item.controller.js';
import { isAuth, isAdmin } from '../middlewares/verifyToken.js'; // Updated import
import { upload } from '../middlewares/multer.middleware.js'; // Assuming multer middleware for file uploads

const router = express.Router();

// Public Routes
router.get('/', getItems);
router.get('/search', searchItems);
router.get('/featured', getFeaturedItems);
router.get('/:id', getItemById);
router.get('/:id/related', getRelatedItems);

// Authenticated User Routes
router.post('/', isAuth, createItem);
router.get('/user/items', isAuth, getUserItems);
router.put('/:id', isAuth, updateItem);
router.post('/:id/images', isAuth, upload.array('images', 10), uploadItemImages);
router.put('/:id/images', isAuth, updateItemImages);
router.delete('/:id/images/:imageId', isAuth, deleteItemImage);
router.delete('/:id', isAuth, deleteItem);
router.put('/:id/toggle-status', isAuth, toggleItemStatus);
router.put('/:id/sold', isAuth, markItemAsSold);
router.put('/:id/extend-visibility', isAuth, extendItemVisibility);
router.get('/user/stats', isAuth, getUserItemStats);
router.get('/:id/status', isAuth, checkItemStatus);

// Stat Increment Routes (Can be public or restricted based on your needs)
router.post('/:itemId/stats/:type', incrementItemStats); // e.g., /:itemId/stats/view

// Admin Routes
router.get('/admin/pending', isAuth, isAdmin, getItemsPendingModeration);
router.get('/admin/moderation/:id', isAuth, isAdmin, getItemForModeration);
router.put('/admin/moderate/:id', isAuth, isAdmin, moderateItem);
router.put('/admin/bulk-moderate', isAuth, isAdmin, bulkModerateItems);
router.get('/admin/moderated', isAuth, isAdmin, getModeratedItems);
router.patch('/admin/revise/:id', isAuth, isAdmin, reviseModeration);
router.get('/admin/dashboard-stats', isAuth, isAdmin, getAdminDashboardStats);


export default router;