// controllers/notification.controller.js
import { Notification } from '../models/notifications.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get user notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('itemId', 'title images');

  const total = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id,
    read: false
  });

  res.json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  res.json({
    status: 'success',
    data: notification
  });
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({
    status: 'success',
    data: null
  });
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  res.json({
    status: 'success',
    data: null
  });
});

// Get unread count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ 
    recipient: req.user._id,
    read: false 
  });

  res.json({
    status: 'success',
    data: { count }
  });
});