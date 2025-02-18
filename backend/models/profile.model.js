// models/Profile.js
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  dateOfBirth: {
    day: {
      type: Number,
      min: 1,
      max: 31
    },
    month: {
      type: String,
      enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
             'August', 'September', 'October', 'November', 'December']
    },
    year: {
      type: Number,
      min: 1900
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  about: {
    type: String,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true
  },
  socialConnections: {
    facebook: {
      type: Boolean,
      default: false
    },
    google: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    showPhoneNumber: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

// Virtual for age calculation
profileSchema.virtual('age').get(function() {
  if (!this.dateOfBirth.year) return null;
  const today = new Date();
  const birthDate = new Date(
    this.dateOfBirth.year,
    this.dateOfBirth.month ? new Date(Date.parse(`${this.dateOfBirth.month} 1, 2000`)).getMonth() : 0,
    this.dateOfBirth.day || 1
  );
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtuals are included when converting to JSON
profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

export const Profile = mongoose.model('Profile', profileSchema);