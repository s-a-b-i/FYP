// import mongoose from 'mongoose';

// const itemSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true
//   },
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     maxlength: 70
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     maxlength: 4096
//   },
//   type: {
//     type: String,
//     enum: ['sell', 'rent', 'exchange'],
//     required: true
//   },
//   price: {
//     amount: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     currency: {
//       type: String,
//       default: 'Rs'
//     },
//     negotiable: {
//       type: Boolean,
//       default: false
//     }
//   },
//   images: [{
//     url: String,
//     isMain: Boolean,
//     order: Number
//   }],
//   condition: {
//     type: String,
//     enum: ['new', 'used'],
//     required: true
//   },
//   sex: {
//     type: String,
//     enum: ['men', 'women', 'unisex'],
//     required: true
//   },
//   location: {
//     address: String,
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       index: '2dsphere'
//     }
//   },
//   status: {
//     type: String,
//     enum: ['draft', 'pending', 'active', 'inactive', 'moderated', 'sold', 'expired'],
//     default: 'pending'
//   },
//   rentDetails: {
//     duration: String,
//     securityDeposit: Number,
//     availabilityDate: Date
//   },
//   exchangeDetails: {
//     exchangeFor: String,
//     exchangePreferences: String
//   },
//   stats: {
//     views: {
//       type: Number,
//       default: 0
//     },
//     phones: {
//       type: Number,
//       default: 0
//     },
//     chats: {
//       type: Number,
//       default: 0
//     }
//   },
//   contactInfo: {
//     name: String,
//     phoneNumber: String,
//     showPhoneNumber: {
//       type: Boolean,
//       default: false
//     }
//   },
//   visibility: {
//     startDate: {
//       type: Date,
//       default: Date.now
//     },
//     endDate: {
//       type: Date,
//       required: true
//     },
//     featured: {
//       type: Boolean,
//       default: false
//     },
//     urgent: {
//       type: Boolean,
//       default: false
//     }
//   },
//   moderationInfo: {
//     moderatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     moderatedAt: Date,
//     moderationNotes: String,
//     rejectionReason: String
//   }
// }, { timestamps: true });

// // Indexes for better query performance
// itemSchema.index({ category: 1, status: 1 });
// itemSchema.index({ user: 1, status: 1 });
// itemSchema.index({ 'location.coordinates': '2dsphere' });
// itemSchema.index({ createdAt: -1 });
// itemSchema.index({ 'visibility.endDate': 1 });

// // Virtual for remaining time
// itemSchema.virtual('remainingTime').get(function() {
//   return this.visibility.endDate - new Date();
// });

// export const Item = mongoose.model('Item', itemSchema);

import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 70
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 4096
  },
  type: {
    type: String,
    enum: ['sell', 'rent', 'exchange'],
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'Rs'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  images: [{
    url: String,
    public_id: String, // Add this to store the Cloudinary public_id
    isMain: Boolean,
    order: Number
  }],
  condition: {
    type: String,
    enum: ['new', 'used'],
    required: true
  },
  sex: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    required: true
  },
  location: {
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'inactive', 'moderated', 'sold', 'expired'],
    default: 'pending'
  },
  rentDetails: {
    duration: String,
    securityDeposit: Number,
    availabilityDate: Date
  },
  exchangeDetails: {
    exchangeFor: String,
    exchangePreferences: String
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    phones: {
      type: Number,
      default: 0
    },
    chats: {
      type: Number,
      default: 0
    }
  },
  contactInfo: {
    name: String,
    phoneNumber: String,
    showPhoneNumber: {
      type: Boolean,
      default: false
    }
  },
  visibility: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    urgent: {
      type: Boolean,
      default: false
    }
  },
  moderationInfo: {
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationNotes: String,
    rejectionReason: String
  }
}, { timestamps: true });

// Indexes for better query performance
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ user: 1, status: 1 });
itemSchema.index({ 'location.coordinates': '2dsphere' });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ 'visibility.endDate': 1 });
itemSchema.index({ 'visibility.featured': 1 });
itemSchema.index({ 'visibility.urgent': 1 });
itemSchema.index({ title: 'text', description: 'text' });

// Virtual for remaining time
itemSchema.virtual('remainingTime').get(function() {
  return this.visibility.endDate - new Date();
});

// Ensure at least one image is provided
itemSchema.path('images').validate(function(images) {
  return images && images.length > 0;
}, 'At least one image is required');

// Ensure virtuals are included when converting to JSON
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

export const Item = mongoose.model('Item', itemSchema);