// utils/notifications.js
import { Notification } from '../models/notifications.model.js';

// Replace sendModerationNotification with createModerationNotification
export const createModerationNotification = async (userId, status, rejectionReason = '', itemId) => {
  let title, message;
  
  if (status === 'active') {
    title = 'Item Approved';
    message = 'Your item has been approved and is now visible to buyers.';
  } else if (status === 'moderated') {
    title = 'Item Not Approved';
    message = `Your item was not approved. ${rejectionReason || 'Please review and update your listing.'}`;
  } else {
    title = 'Item Status Updated';
    message = `Your item status has been updated to: ${status}`;
  }
  
  // Create notification in database
  const notification = await Notification.create({
    recipient: userId,
    type: 'moderation',
    title,
    message,
    itemId: itemId // Make sure to pass itemId to this function
  });
  
  return notification;
}

// Add other notification types as needed
export const createSystemNotification = async (userId, title, message) => {
  const notification = await Notification.create({
    recipient: userId,
    type: 'system',
    title,
    message
  });
  
  return notification;
}