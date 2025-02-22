import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  icon: {
    url: {
      type: String,
      required: [true, 'Icon URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Icon public ID is required']
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    savedWater: Number,
    savedCO2: Number,
    backgroundColor: String,
    borderColor: String
  }
}, { timestamps: true });

// Pre-save hook to generate slug
categorySchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
  next();
});

export const Category = mongoose.model('Category', categorySchema);