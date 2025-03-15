import { Item } from '../models/item.model.js';
import { Profile } from '../models/profile.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { createModerationNotification } from '../utils/notifications.js';
import mongoose from 'mongoose';

// Create Item
export const createItem = asyncHandler(async (req, res) => {
  const item = await Item.create({
    ...req.body,
    user: req.user._id,
    visibility: {
      ...req.body.visibility,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    },
  });

  res.status(201).json({
    status: 'success',
    data: item,
  });
});

// Get Items (Public)
export const getItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: 'active' };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.type) filter.type = req.query.type;

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Item.countDocuments(filter);

  res.json({
    status: 'success',
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Get User Items
export const getUserItems = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt');

  res.json({
    status: 'success',
    data: items,
  });
});

// Search Items (Public)
export const searchItems = asyncHandler(async (req, res) => {
  const { query, category, type, minPrice, maxPrice, condition, location } = req.query;
  const filter = { status: 'active' };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (location) {
    const coordinates = location.split(',').map(Number);
    filter['location.coordinates'] = {
      $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: 50000 },
    };
  }

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt');

  res.json({
    status: 'success',
    data: items,
  });
});

// Update Item
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  Object.assign(item, req.body);
  if (item.status === 'moderated') item.status = 'pending';
  await item.save();

  res.json({
    status: 'success',
    data: item,
  });
});

// Upload Item Images
// Upload Item Images
export const uploadItemImages = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images provided for upload');
  }

  // Clean up existing empty image entries
  item.images = item.images.filter(img => img.url && img.public_id);

  // Determine if this is the first upload for this item
  const isFirstUpload = item.images.length === 0;

  const uploadedImages = await Promise.all(
    req.files.map(async (file, index) => {
      try {
        const result = await uploadToCloudinary(file.path);
        
        if (!result.public_id || !result.secure_url) {
          console.error('Invalid Cloudinary response:', result);
          throw new ApiError(500, 'Cloudinary upload failed: missing required fields');
        }
        
        return {
          url: result.secure_url,
          public_id: result.public_id,
          isMain: index === 0 && isFirstUpload, // Make first image the main image only for first uploads
          order: item.images.length + index,
        };
      } catch (error) {
        console.error(`Error uploading file: ${file.path}`, error);
        throw new ApiError(500, `Failed to upload image: ${error.message}`);
      }
    })
  );

  // Add the new images
  item.images.push(...uploadedImages);
  
  // Ensure at least one image is marked as main
  if (item.images.length > 0 && !item.images.some(img => img.isMain)) {
    item.images[0].isMain = true;
  }

  await item.save();

  res.json({
    status: 'success',
    data: item,
  });
});

// Increment Item Stats (Replaces recordInteraction)
export const incrementItemStats = asyncHandler(async (req, res) => {
  const { itemId, type } = req.params;
  if (!['view', 'phone', 'chat'].includes(type)) throw new ApiError('Invalid stat type', 400);

  const item = await Item.findById(itemId);
  if (!item) throw new ApiError('Item not found', 404);

  // Increment the appropriate stat
  if (type === 'view') item.stats.views += 1;
  else if (type === 'phone') item.stats.phones += 1;
  else if (type === 'chat') item.stats.chats += 1;

  await item.save();

  res.json({
    status: 'success',
    message: `${type} stat incremented`,
    data: item.stats,
  });
});

// Get Items Pending Moderation (Admin)
export const getItemsPendingModeration = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: 'pending' };
  if (req.query.category) filter.category = req.query.category;

  const items = await Item.find(filter)
    .populate('category')
    .populate('user', 'email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const userIds = items.map((item) => item.user?._id).filter(Boolean);
  const profiles = await Profile.find({ user: { $in: userIds } }).select('user name profilePhoto');
  const profileMap = profiles.reduce((map, profile) => {
    map[profile.user.toString()] = profile;
    return map;
  }, {});

  const processedItems = items.map((item) => {
    const itemObj = item.toObject();
    if (itemObj.user && itemObj.user._id) {
      const userProfile = profileMap[itemObj.user._id.toString()];
      itemObj.user.name = userProfile ? userProfile.name : 'Unknown';
      itemObj.user.profilePicture = userProfile ? userProfile.profilePhoto : null;
    }
    return itemObj;
  });

  const total = await Item.countDocuments(filter);

  res.json({
    status: 'success',
    data: processedItems,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Get Item Details for Moderation (Admin)
export const getItemForModeration = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('category')
    .populate('user', 'email lastLogin memberSince') // Add memberSince here
    .populate('moderationInfo.moderatedBy', 'email');
  if (!item) throw new ApiError('Item not found', 404);

  // Fetch seller profile
  const sellerProfile = await Profile.findOne({ user: item.user._id }).select(
    'name phone profilePhoto gender about'
  );

  // Fetch moderator profile
  const moderatorProfile = item.moderationInfo?.moderatedBy
    ? await Profile.findOne({ user: item.moderationInfo.moderatedBy._id }).select('name')
    : null;

  const userHistory = await Item.find({ user: item.user._id, _id: { $ne: item._id } })
    .select('title status moderationInfo createdAt')
    .sort('-createdAt')
    .limit(5);

  const similarItems = await Item.find({
    _id: { $ne: item._id },
    $or: [
      { title: { $regex: item.title.split(' ').filter((w) => w.length > 3).join('|'), $options: 'i' } },
      { category: item.category },
    ],
    status: 'active',
  })
    .select('title images.url price')
    .limit(5);

  const seller = {
    _id: item.user._id,
    email: item.user.email,
    name: sellerProfile ? sellerProfile.name : 'Unknown',
    phone: sellerProfile ? sellerProfile.phone : null,
    profilePhoto: sellerProfile ? sellerProfile.profilePhoto : null,
    gender: sellerProfile ? sellerProfile.gender : null,
    about: sellerProfile ? sellerProfile.about : null,
    createdAt: item.user.createdAt,
    memberSince: item.user.memberSince, // Include memberSince
    memberSinceFormatted: item.user.memberSinceFormatted // Include formatted version
  };

  // Enhance item with moderatorProfile
  const enhancedItem = item.toObject();
  if (moderatorProfile) {
    enhancedItem.moderatorProfile = { name: moderatorProfile.name };
  }

  res.json({
    status: 'success',
    data: { item: enhancedItem, seller, userHistory, similarItems },
  });
});

// Moderate Item (Admin)
export const moderateItem = asyncHandler(async (req, res) => {
  const { status, moderationNotes, rejectionReason, featuredItem, urgentItem } = req.body;
  if (!['active', 'moderated'].includes(status)) throw new ApiError('Invalid moderation status', 400);

  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError('Item not found', 404);

  item.status = status;
  item.moderationInfo = {
    moderatedBy: req.user._id,
    moderatedAt: new Date(),
    moderationNotes,
    rejectionReason: status === 'moderated' ? rejectionReason : undefined,
  };

  if (featuredItem !== undefined) item.visibility.featured = featuredItem;
  if (urgentItem !== undefined) item.visibility.urgent = urgentItem;

  await item.save();

  try {
    await createModerationNotification(item.user, status, rejectionReason, item._id);
  } catch (error) {
    console.error('Failed to send moderation notification:', error);
  }

  res.json({
    status: 'success',
    data: item,
  });
});

// Get User Item Stats (New Controller)
export const getUserItemStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Item.aggregate([
    { $match: { user: mongoose.Types.ObjectId(req.user._id), createdAt: { $gte: startDate } } },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalViews: { $sum: '$stats.views' },
              totalPhones: { $sum: '$stats.phones' },
              totalChats: { $sum: '$stats.chats' },
            },
          },
        ],
        topItems: [
          {
            $project: {
              title: 1,
              status: 1,
              views: '$stats.views',
              phones: '$stats.phones',
              chats: '$stats.chats',
              interactions: { $sum: ['$stats.views', '$stats.phones', '$stats.chats'] },
            },
          },
          { $sort: { interactions: -1 } },
          { $limit: 5 },
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              totalViews: { $sum: '$stats.views' },
              totalPhones: { $sum: '$stats.phones' },
              totalChats: { $sum: '$stats.chats' },
            },
          },
        ],
      },
    },
  ]);

  res.json({
    status: 'success',
    data: {
      byStatus: stats[0].byStatus,
      topItems: stats[0].topItems,
      totals: stats[0].totals[0] || { totalItems: 0, totalViews: 0, totalPhones: 0, totalChats: 0 },
    },
  });
});

// Get Admin Dashboard Stats (New Controller)
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Item.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $facet: {
        trend: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              views: { $sum: '$stats.views' },
              phones: { $sum: '$stats.phones' },
              chats: { $sum: '$stats.chats' },
            },
          },
          { $sort: { '_id': 1 } },
        ],
        byCategory: [
          {
            $group: {
              _id: '$category',
              views: { $sum: '$stats.views' },
              interactions: { $sum: { $add: ['$stats.views', '$stats.phones', '$stats.chats'] } },
            },
          },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
          { $unwind: '$category' },
          { $project: { name: '$category.name', views: 1, interactions: 1 } },
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              totalViews: { $sum: '$stats.views' },
              totalInteractions: { $sum: { $add: ['$stats.views', '$stats.phones', '$stats.chats'] } },
            },
          },
        ],
        topItems: [
          {
            $project: {
              title: 1,
              status: 1,
              views: '$stats.views',
              phones: '$stats.phones',
              chats: '$stats.chats',
              interactions: { $sum: ['$stats.views', '$stats.phones', '$stats.chats'] },
            },
          },
          { $sort: { interactions: -1 } },
          { $limit: 10 },
        ],
        moderationStats: [
          { $match: { 'moderationInfo.moderatedAt': { $gte: startDate } } },
          {
            $group: {
              _id: '$moderationInfo.moderatedBy',
              approved: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              rejected: { $sum: { $cond: [{ $eq: ['$status', 'moderated'] }, 1, 0] } },
            },
          },
          // Change $lookup to profiles instead of users
          { $lookup: { from: 'profiles', localField: '_id', foreignField: 'user', as: 'moderatorProfile' } },
          { $unwind: '$moderatorProfile' },
          { $project: { 
            moderator: '$moderatorProfile.name', 
            approved: 1, 
            rejected: 1 
          } },
        ],
        activeItems: [
          { $match: { status: 'active' } },
          {
            $project: {
              title: 1,
              views: '$stats.views',
              phones: '$stats.phones',
              chats: '$stats.chats',
            },
          },
          { $sort: { views: -1 } },
          { $limit: 50 },
        ],
        soldItems: [
          { $match: { status: 'sold' } },
          {
            $project: {
              title: 1,
              views: '$stats.views',
              phones: '$stats.phones',
              chats: '$stats.chats',
              soldAt: '$updatedAt',
            },
          },
          { $sort: { soldAt: -1 } },
          { $limit: 50 },
        ],
      },
    },
  ]);

  const pendingItems = await Item.countDocuments({ status: 'pending' });
  const activeItemsCount = await Item.countDocuments({ status: 'active' });
  const soldItemsCount = await Item.countDocuments({ status: 'sold' });

  res.json({
    status: 'success',
    data: {
      trend: stats[0].trend,
      byCategory: stats[0].byCategory,
      totals: stats[0].totals[0] || { totalItems: 0, totalViews: 0, totalInteractions: 0 },
      topItems: stats[0].topItems,
      moderationStats: stats[0].moderationStats,
      pendingItems,
      activeItems: { count: activeItemsCount, details: stats[0].activeItems },
      soldItems: { count: soldItemsCount, details: stats[0].soldItems },
    },
  });
});

// Existing Controllers (Updated as Needed)
// Delete Item
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  // Delete associated images from Cloudinary, skipping those without public_id
  await Promise.all(
    item.images
      .filter(image => image.public_id) // Only process images with a public_id
      .map(image => deleteFromCloudinary(image.public_id))
  );

  // Delete the item from the database
  await Item.deleteOne({ _id: item._id });

  res.json({ status: 'success', data: null });
});

// Get Item By ID
export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('category', 'name') // Only fetch category name for efficiency työntekij

  if (!item) throw new ApiError('Item not found', 404);

  // Populate user with basic fields
  await item.populate('user', 'name email profilePicture createdAt');

  // Fetch additional seller profile details
  const sellerProfile = await Profile.findOne({ user: item.user._id }).select(
    'name phone profilePhoto gender about'
  );

  // Increment views if not the owner
  if (!req.user || req.user._id.toString() !== item.user._id.toString()) {
    item.stats.views += 1;
    await item.save();
  }

  // Format seller data
  const seller = {
    name: sellerProfile?.name || item.user.name || 'Private User',
    avatar: sellerProfile?.profilePhoto || item.user.profilePicture || '/default-avatar.png',
    email: item.user.email,
    memberSince: item.user.createdAt 
      ? new Date(item.user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' }) 
      : 'Unknown',
    phone: sellerProfile?.phone || null,
    gender: sellerProfile?.gender || null,
    about: sellerProfile?.about || null,
  };

  // Prepare response
  const responseItem = item.toObject();
  responseItem.seller = seller;

  res.json({
    status: 'success',
    data: responseItem,
  });
});
// Toggle Item Status
export const toggleItemStatus = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  if (!['active', 'inactive'].includes(item.status))
    throw new ApiError('Item cannot be toggled from current status', 400);

  item.status = item.status === 'active' ? 'inactive' : 'active';
  await item.save();

  res.json({
    status: 'success',
    data: item,
  });
});

// Mark Item As Sold
export const markItemAsSold = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  item.status = 'sold';
  await item.save();

  res.json({ status: 'success', data: item });
});

// Get Featured Items
export const getFeaturedItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ status: 'active', 'visibility.featured': true })
    .populate('category')
    .sort('-createdAt')
    .limit(10);

  res.json({
    status: 'success',
    data: items,
  });
});

// Get Related Items
export const getRelatedItems = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError('Item not found', 404);

  const relatedItems = await Item.find({
    category: item.category,
    _id: { $ne: item._id },
    status: 'active',
  })
    .populate('category')
    .limit(6);

  res.json({
    status: 'success',
    data: relatedItems,
  });
});

// Extend Item Visibility
export const extendItemVisibility = asyncHandler(async (req, res) => {
  const { days } = req.body;
  if (!days || days <= 0 || days > 90) throw new ApiError('Invalid extension period', 400);

  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  const newEndDate = new Date(item.visibility.endDate);
  newEndDate.setDate(newEndDate.getDate() + days);

  item.visibility.endDate = newEndDate;
  await item.save();

  res.json({
    status: 'success',
    data: item,
  });
});

// Update Item Images
export const updateItemImages = asyncHandler(async (req, res) => {
  const { images } = req.body;
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  const hasMainImage = images.some((img) => img.isMain);
  if (!hasMainImage) throw new ApiError('At least one image must be set as main', 400);

  images.forEach((updateImage) => {
    const image = item.images.id(updateImage.id);
    if (image) {
      image.isMain = updateImage.isMain;
      image.order = updateImage.order;
    }
  });

  await item.save();

  res.json({
    status: 'success',
    data: item,
  });
});

// Delete Item Image
export const deleteItemImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError('Item not found', 404);

  if (item.images.length <= 1) throw new ApiError('Cannot delete the only image', 400);

  const image = item.images.id(imageId);
  if (!image) throw new ApiError('Image not found', 404);

  if (image.isMain && item.images.length > 1) {
    const nextImage = item.images.find((img) => img._id.toString() !== imageId);
    if (nextImage) nextImage.isMain = true;
  }

  if (image.public_id) { // Only attempt deletion if public_id exists
    try {
      await deleteFromCloudinary(image.public_id);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  } else {
    console.warn(`Image ${imageId} has no public_id, skipping Cloudinary deletion`);
  }

  item.images.pull(imageId);
  await item.save();

  res.json({
    status: 'success',
    data: item,
  });
});

// Bulk Moderate Items (Admin)
export const bulkModerateItems = asyncHandler(async (req, res) => {
  const { itemIds, status, moderationNotes } = req.body;
  if (!Array.isArray(itemIds) || itemIds.length === 0)
    throw new ApiError('Item IDs must be provided as an array', 400);
  if (!['active', 'moderated'].includes(status))
    throw new ApiError('Invalid moderation status', 400);

  const result = await Item.updateMany(
    { _id: { $in: itemIds }, status: 'pending' },
    {
      status,
      moderationInfo: { moderatedBy: req.user._id, moderatedAt: new Date(), moderationNotes },
    }
  );

  if (result.nModified > 0) {
    Item.find({ _id: { $in: itemIds } })
      .select('user')
      .then((items) => {
        items.forEach((item) => {
          createModerationNotification(item.user, status).catch((err) =>
            console.error('Notification error:', err)
          );
        });
      });
  }

  res.json({
    status: 'success',
    data: { modifiedCount: result.nModified, totalCount: itemIds.length },
  });
});

// Get All Moderated Items (Admin)
export const getModeratedItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, moderator, startDate, endDate } = req.query;

  const filter = {};
  if (status) filter.status = status;
  else filter.status = { $in: ['active', 'moderated'] };
  if (moderator) filter['moderationInfo.moderatedBy'] = moderator;
  if (startDate || endDate) {
    filter['moderationInfo.moderatedAt'] = {};
    if (startDate) filter['moderationInfo.moderatedAt'].$gte = new Date(startDate);
    if (endDate) filter['moderationInfo.moderatedAt'].$lte = new Date(endDate);
  }

  const items = await Item.find(filter)
    .populate('category')
    .populate('user')
    .populate('moderationInfo.moderatedBy')
    .sort('-moderationInfo.moderatedAt')
    .skip(skip)
    .limit(limit);

  const total = await Item.countDocuments(filter);

  const userIds = items.map((item) => item.user?._id).filter(Boolean);
  const moderatorIds = items.map((item) => item.moderationInfo?.moderatedBy?._id).filter(Boolean);
  const allProfileIds = [...new Set([...userIds, ...moderatorIds])];
  const profiles = await Profile.find({ user: { $in: allProfileIds } });

  const profileMap = profiles.reduce((map, profile) => {
    map[profile.user.toString()] = profile;
    return map;
  }, {});

  const enhancedItems = items.map((item) => {
    const itemObj = item.toObject({ virtuals: true });
    if (item.user && profileMap[item.user._id.toString()])
      itemObj.sellerProfile = profileMap[item.user._id.toString()];
    if (
      item.moderationInfo?.moderatedBy &&
      profileMap[item.moderationInfo.moderatedBy._id.toString()]
    )
      itemObj.moderatorProfile = profileMap[item.moderationInfo.moderatedBy._id.toString()];
    return itemObj;
  });

  res.json({
    status: 'success',
    data: enhancedItems,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Revise Moderation (Admin)
export const reviseModeration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, moderationNotes } = req.body;

  const item = await Item.findById(id);
  if (!item) throw new ApiError('Item not found', 404);

  item.status = status;
  item.moderationInfo = {
    ...item.moderationInfo,
    moderatedBy: item.moderationInfo.moderatedBy || req.user._id,
    moderatedAt: item.moderationInfo.moderatedAt || new Date(),
    moderationNotes: moderationNotes || item.moderationInfo.moderationNotes,
    rejectionReason:
      status === 'moderated' ? req.body.rejectionReason || item.moderationInfo.rejectionReason : undefined,
    revisedBy: req.user._id,
    revisedAt: new Date(),
    revisionNotes: moderationNotes,
    previousStatus: item.status,
  };

  await item.save();

  try {
    await createModerationNotification(item.user, status, moderationNotes, item._id);
  } catch (error) {
    console.error('Failed to send moderation notification:', error);
  }

  res.json({
    status: 'success',
    data: item,
  });
});

// Check Item Status
export const checkItemStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Item.findById(id).select('status moderationInfo').lean();
  if (!item) throw new ApiError('Item not found', 404);

  let message = '';
  switch (item.status) {
    case 'pending':
      message = 'Your item is pending review by our moderation team.';
      break;
    case 'active':
      message = 'Your item is active and visible to buyers.';
      break;
    case 'inactive':
      message = 'Your item is currently inactive and not visible to buyers.';
      break;
    case 'moderated':
      message = `Your item was not approved: ${
        item.moderationInfo?.rejectionReason || 'Please check and update your listing.'
      }`;
      break;
    case 'sold':
      message = 'This item has been marked as sold.';
      break;
    case 'expired':
      message = 'This listing has expired.';
      break;
    default:
      message = 'Item status unknown.';
  }

  res.json({
    status: 'success',
    data: { status: item.status, message },
  });
});








