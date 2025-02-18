// controllers/profileController.js
import { Profile } from '../models/profile.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


// controllers/profileController.js
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

  // Create new profile
  const profileData = {
    user: req.user._id,
    name,
    dateOfBirth,
    gender,
    about,
    phone,
    email,
    socialConnections: socialConnections || { facebook: false, google: false },
    preferences
  };

  if (req.file) {
    const uploadedImage = await uploadToCloudinary(req.file.path);
    profileData.profilePhoto = uploadedImage.url;
  }

  const profile = await Profile.create(profileData);

  return res.status(201).json(
    new ApiResponse(201, profile, "Profile created successfully")
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return res.status(200).json(
    new ApiResponse(200, profile, "Profile retrieved successfully")
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    dateOfBirth,
    gender,
    about,
    phone,
    socialConnections,
    preferences
  } = req.body;

  const profile = await Profile.findOne({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  if (req.file) {
    const uploadedImage = await uploadToCloudinary(req.file.path);
    profile.profilePhoto = uploadedImage.url;
  }

  // Update fields if provided
  if (name) profile.name = name;
  if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
  if (gender) profile.gender = gender;
  if (about) profile.about = about;
  if (phone) profile.phone = phone;
  if (socialConnections) profile.socialConnections = socialConnections;
  if (preferences) profile.preferences = preferences;

  await profile.save();

  return res.status(200).json(
    new ApiResponse(200, profile, "Profile updated successfully")
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

const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndDelete({ user: req.user._id });
  
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  // Note: You might want to also delete the user account and related data
  
  return res.status(200).json(
    new ApiResponse(200, {}, "Profile deleted successfully")
  );
});

export {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  updateSocialConnections,
  deleteProfile,
  createProfile
};