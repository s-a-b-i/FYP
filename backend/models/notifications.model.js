// // Create a notification model (notifications.model.js)
// import mongoose from 'mongoose';

// const notificationSchema = new mongoose.Schema(
//   {
//     recipient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     type: {
//       type: String,
//       enum: ['moderation', 'message', 'system'],
//       required: true
//     },
//     title: {
//       type: String,
//       required: true
//     },
//     message: {
//       type: String,
//       required: true
//     },
//     itemId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Item'
//     },
//     read: {
//       type: Boolean,
//       default: false
//     }
//   },
//   { timestamps: true }
// );

// export const Notification = mongoose.model('Notification', notificationSchema);


// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['moderation', 'message', 'system'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Add indexes for better query performance
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);