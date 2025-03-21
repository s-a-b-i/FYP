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
      min: 0,
      required: [
        function() { return this.type === 'sell'; },
        'Price amount is required for sell items'
      ]
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
    public_id: String,
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
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
    required: [
      function() { return this.category.toString() === 'clothing_category_id'; },
      'Size is required for clothing items'
    ]
  },
  material: {
    type: String,
    trim: true,
    maxlength: 100,
    description: 'e.g., "100% Cotton" or "Polyester blend"'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    trim: true,
    maxlength: 30,
    description: 'e.g., "Red" or "Navy Blue"'
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
    duration: {
      type: String,
      required: [
        function() { return this.type === 'rent'; },
        'Rental duration is required for rent items'
      ],
      match: [/^\d+ (day|week|month)s?$/, 'Duration must be in format "X days/weeks/months"']
    },
    durationUnit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days'
    },
    pricePerUnit: {
      type: Number,
      min: 0,
      required: [
        function() { return this.type === 'rent'; },
        'Price per unit is required for rent items'
      ]
    },
    securityDeposit: {
      type: Number,
      min: 0,
      default: 0
    },
    availabilityDate: {
      type: Date,
      required: [
        function() { return this.type === 'rent'; },
        'Availability date is required for rent items'
      ]
    },
    sizeAvailability: [{
      size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
        required: true
      },
      quantity: {
        type: Number,
        min: 0,
        default: 1
      }
    }],
    cleaningFee: {
      type: Number,
      min: 0,
      default: 0
    },
    lateFee: {
      type: Number,
      min: 0,
      default: 0,
      description: 'Fee per day/week/month for late return'
    },
    careInstructions: {
      type: String,
      maxlength: 500,
      trim: true,
      description: 'e.g., "Dry clean only" or "Hand wash"'
    }
  },
  exchangeDetails: {
    exchangeFor: {
      type: String,
      required: [
        function() { return this.type === 'exchange'; },
        'Exchange target is required for exchange items'
      ],
      trim: true,
      maxlength: 100,
      description: 'e.g., "winter jacket" or "formal dress"'
    },
    preferredSizes: [{
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
      required: true
    }],
    preferredCondition: {
      type: String,
      enum: ['new', 'like-new', 'gently-used', 'any'],
      default: 'any'
    },
    preferredBrands: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    exchangePreferences: {
      type: String,
      maxlength: 500,
      trim: true,
      description: 'e.g., "Looking for bright colors" or "No polyester"'
    },
    shippingPreference: {
      type: String,
      enum: ['local-only', 'willing-to-ship', 'buyer-pays-shipping'],
      default: 'local-only'
    }
  },
  stats: {
    views: { type: Number, default: 0 },
    phones: { type: Number, default: 0 },
    chats: { type: Number, default: 0 }
  },
  contactInfo: {
    name: String,
    phoneNumber: String,
    showPhoneNumber: { type: Boolean, default: false }
  },
  visibility: {
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    featured: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false }
  },
  moderationInfo: {
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    moderationNotes: String,
    rejectionReason: String
  }
}, { timestamps: true });

// Indexes
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