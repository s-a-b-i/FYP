// routes/notification.routes.js
import express from 'express';
import { isAuth } from '../middlewares/verifyToken.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', isAuth, getUserNotifications);
router.get('/unread-count', isAuth, getUnreadCount);
router.patch('/:id/read', isAuth, markNotificationAsRead);
router.patch('/read-all', isAuth, markAllNotificationsAsRead);
router.delete('/:id', isAuth, deleteNotification);

export default router;