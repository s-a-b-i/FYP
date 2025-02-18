// controllers/profileController.js
import { Profile } from '../models/profile.model.js';
import { User } from '../models/user.model.js';
import { uploadToCloudinary , deleteFromCloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createProfile = asyncHandler(async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    about,
    phone,
    email,
    socialConnections,
    preferences
  } = req.body;

  // Check if profile already exists
  const existingProfile = await Profile.findOne({ user: req.user._id });
  if (existingProfile) {
    throw new ApiError(400, "Profile already exists for this user");
  }

  // Parse date of birth from ISO string
  const date = new Date(dateOfBirth);
  const formattedDateOfBirth = {
    day: date.getDate(),
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
            'August', 'September', 'October', 'November', 'December'][date.getMonth()],
    year: date.getFullYear()
  };

  // Create new profile
  const profileData = {
    user: req.user._id,
    name,
    dateOfBirth: formattedDateOfBirth,
    gender,
    about,
    phone,
    email,
    socialConnections: socialConnections || { facebook: false, google: false },
    preferences: preferences || { showPhoneNumber: false, emailNotifications: true }
  };

  // Handle profile photo upload if present
  if (req.file) {
    const uploadedImage = await uploadToCloudinary(req.file.path);
    profileData.profilePhoto = uploadedImage.url;
  }

  const profile = await Profile.create(profileData);

  // Convert dateOfBirth back to ISO string for response
  const responseProfile = profile.toObject();
  const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                     'August', 'September', 'October', 'November', 'December']
                     .indexOf(profile.dateOfBirth.month);
  responseProfile.dateOfBirth = new Date(
    profile.dateOfBirth.year,
    monthIndex,
    profile.dateOfBirth.day
  ).toISOString();

  return res.status(201).json(
    new ApiResponse(201, responseProfile, "Profile created successfully")
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  // Convert dateOfBirth object to ISO string for frontend
  const responseProfile = profile.toObject();
  if (profile.dateOfBirth && profile.dateOfBirth.month) {
    const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                       'August', 'September', 'October', 'November', 'December']
                       .indexOf(profile.dateOfBirth.month);
    responseProfile.dateOfBirth = new Date(
      profile.dateOfBirth.year,
      monthIndex,
      profile.dateOfBirth.day
    ).toISOString();
  }

  return res.status(200).json(
    new ApiResponse(200, responseProfile, "Profile retrieved successfully")
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    about,
    phone,
    email,
    socialConnections,
    preferences
  } = req.body;

  const profile = await Profile.findOne({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  // Handle profile photo update if present
  if (req.file) {
    const uploadedImage = await uploadToCloudinary(req.file.path);
    profile.profilePhoto = uploadedImage.url;
  }

  // Update basic fields if provided
  if (name) profile.name = name;
  if (gender) profile.gender = gender;
  if (about) profile.about = about;
  if (phone) profile.phone = phone;
  if (email) profile.email = email;

  // Handle date of birth update
  if (dateOfBirth) {
    const date = new Date(dateOfBirth);
    profile.dateOfBirth = {
      day: date.getDate(),
      month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
              'August', 'September', 'October', 'November', 'December'][date.getMonth()],
      year: date.getFullYear()
    };
  }

  // Update social connections if provided
  if (socialConnections) {
    profile.socialConnections = {
      ...profile.socialConnections,
      ...socialConnections
    };
  }

  // Update preferences if provided
  if (preferences) {
    profile.preferences = {
      ...profile.preferences,
      ...preferences
    };
  }

  await profile.save();

  // Prepare response with ISO date string
  const responseProfile = profile.toObject();
  const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                     'August', 'September', 'October', 'November', 'December']
                     .indexOf(profile.dateOfBirth.month);
  responseProfile.dateOfBirth = new Date(
    profile.dateOfBirth.year,
    monthIndex,
    profile.dateOfBirth.day
  ).toISOString();

  return res.status(200).json(
    new ApiResponse(200, responseProfile, "Profile updated successfully")
  );
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const profile = await Profile.findOne({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  const uploadedImage = await uploadToCloudinary(req.file.path);
  profile.profilePhoto = uploadedImage.url;
  await profile.save();

  return res.status(200).json(
    new ApiResponse(200, { profilePhoto: profile.profilePhoto }, "Profile photo updated successfully")
  );
});

const updateSocialConnections = asyncHandler(async (req, res) => {
  const { platform, connected } = req.body;

  const profile = await Profile.findOne({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  profile.socialConnections[platform.toLowerCase()] = connected;
  await profile.save();

  return res.status(200).json(
    new ApiResponse(200, profile.socialConnections, "Social connections updated successfully")
  );
});

const deleteAccount = asyncHandler(async (req, res) => {
  try {
    // Find the user profile first to handle profile photo deletion
    const profile = await Profile.findOne({ user: req.user._id });
    
    // Delete profile photo from cloudinary if it exists
    if (profile && profile.profilePhoto) {
      const publicId = profile.profilePhoto.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }
    
    // Delete the user profile
    await Profile.findOneAndDelete({ user: req.user._id });
    
    // Delete the user and their authentication data
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    
    if (!deletedUser) {
      throw new ApiError(404, "User not found");
    }
    
    // Clear authentication cookie
    res.clearCookie("token");
    
    return res.status(200).json(
      new ApiResponse(200, {}, "Account deleted successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error deleting account: " + error.message);
  }
});

export {
  getProfile,
  createProfile,
  updateProfile,
  uploadProfilePhoto,
  updateSocialConnections,
  deleteAccount
};