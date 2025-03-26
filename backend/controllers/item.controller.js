import { Item } from '../models/item.model.js';
import { Profile } from '../models/profile.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { createModerationNotification } from '../utils/notifications.js';
import mongoose from 'mongoose';

// Create Item
export const createItem = asyncHandler(async (req, res) => {
  const { 
    category, type, title, description, condition, sex, size, material, brand, color, 
    price, rentDetails, exchangeDetails, location, contactInfo, visibility 
  } = req.body;

  // Parse JSON strings from FormData
  const parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
  const parsedPrice = typeof price === "string" ? JSON.parse(price) : price;
  const parsedRentDetails = typeof rentDetails === "string" ? JSON.parse(rentDetails) : rentDetails;
  const parsedExchangeDetails = typeof exchangeDetails === "string" ? JSON.parse(exchangeDetails) : exchangeDetails;
  const parsedContactInfo = typeof contactInfo === "string" ? JSON.parse(contactInfo) : contactInfo;

  // Basic validation
  if (!category || !type || !title || !description || !condition || !sex) {
    throw new ApiError(400, 'Missing required fields');
  }
  if (!parsedLocation || !parsedLocation.city || !parsedLocation.neighborhood) {
    throw new ApiError(400, 'City and neighborhood are required');
  }

  // Clothing-specific validation
  const clothingCategoryId = 'clothing_category_id'; // Replace with actual ID
  if (category === clothingCategoryId && !size) {
    throw new ApiError(400, 'Size is required for clothing items');
  }

  // Type-specific validation
  if (type === 'sell' && (!parsedPrice || !parsedPrice.amount)) {
    throw new ApiError(400, 'Price amount is required for sell items');
  }
  if (type === 'rent') {
    if (!parsedRentDetails || !parsedRentDetails.duration || !parsedRentDetails.pricePerUnit || !parsedRentDetails.availabilityDate) {
      throw new ApiError(400, 'Rent items require duration, pricePerUnit, and availabilityDate');
    }
    if (!/^\d+ (day|week|month)s?$/.test(parsedRentDetails.duration)) {
      throw new ApiError(400, 'Duration must be in format "X days/weeks/months"');
    }
  }
  if (type === 'exchange') {
    if (!parsedExchangeDetails || !parsedExchangeDetails.exchangeFor) {
      throw new ApiError(400, 'Exchange items require exchangeFor');
    }
  }

  // Handle image uploads
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = await Promise.all(
      req.files.map(async (file, index) => {
        const result = await uploadToCloudinary(file.path);
        if (!result.public_id || !result.secure_url) throw new ApiError(500, 'Cloudinary upload failed');
        return {
          url: result.secure_url,
          public_id: result.public_id,
          isMain: index === 0,
          order: index
        };
      })
    );
  }

  if (uploadedImages.length === 0) {
    throw new ApiError(400, 'At least one image is required');
  }

  const itemData = {
    user: req.user._id,
    category,
    title,
    description,
    type,
    condition,
    sex,
    size: category === clothingCategoryId ? size : undefined,
    material,
    brand,
    color,
    price: type === 'sell' ? { amount: parsedPrice.amount, currency: 'PKR', negotiable: parsedPrice.negotiable || false } : undefined,
    images: uploadedImages,
    location: { 
      city: parsedLocation.city, 
      neighborhood: parsedLocation.neighborhood, 
      coordinates: parsedLocation.coordinates || [] 
    },
    status: 'pending',
    rentDetails: type === 'rent' ? {
      duration: parsedRentDetails.duration,
      durationUnit: parsedRentDetails.durationUnit || 'days',
      pricePerUnit: parsedRentDetails.pricePerUnit,
      securityDeposit: parsedRentDetails.securityDeposit || 0,
      availabilityDate: new Date(parsedRentDetails.availabilityDate),
      sizeAvailability: parsedRentDetails.sizeAvailability || [],
      cleaningFee: parsedRentDetails.cleaningFee || 0,
      lateFee: parsedRentDetails.lateFee || 0,
      careInstructions: parsedRentDetails.careInstructions
    } : undefined,
    exchangeDetails: type === 'exchange' ? {
      exchangeFor: parsedExchangeDetails.exchangeFor,
      preferredSizes: parsedExchangeDetails.preferredSizes || [],
      preferredCondition: parsedExchangeDetails.preferredCondition || 'any',
      preferredBrands: parsedExchangeDetails.preferredBrands || [],
      exchangePreferences: parsedExchangeDetails.exchangePreferences,
      shippingPreference: parsedExchangeDetails.shippingPreference || 'local-only'
    } : undefined,
    stats: { views: 0, phones: 0, chats: 0 },
    contactInfo: parsedContactInfo || {},
    visibility: {
      startDate: new Date(),
      endDate: visibility?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      featured: visibility?.featured || false,
      urgent: visibility?.urgent || false
    }
  };

  const item = await Item.create(itemData);
  console.log("Created item location:", item.location); // Debug log
  res.status(201).json({ status: 'success', data: item });
});

// Get Items (Public)
export const getItems = asyncHandler(async (req, res) => {
  const { category, type, city, minPrice, maxPrice, sort } = req.query;
  
  const filter = { 
    status: 'active'
  };
  
  if (category) {
    filter.category = new mongoose.Types.ObjectId(category);
  } else {
    throw new ApiError(400, "Category is required");
  }

  if (type) filter.type = type;
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };
  if (minPrice || maxPrice) {
    filter['price.amount'] = {};
    if (minPrice) filter['price.amount'].$gte = Number(minPrice);
    if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
  }

  const sortOptions = {
    'most-relevant': { 'stats.views': -1 },
    'lowest-price': { 'price.amount': 1 },
    'highest-price': { 'price.amount': -1 },
    'newest': { createdAt: -1 }
  };
  const sortOrder = sortOptions[sort] || sortOptions.newest;

  console.log("Filter:", filter); // Debug log
  const items = await Item.find(filter)
    .populate('category')
    .sort(sortOrder)
    .lean();

  res.json({
    status: 'success',
    data: items,
    count: items.length
  });
});

// Get User Items
export const getUserItems = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt');

  res.json({ status: 'success', data: items });
});

// Search Items (Public)
export const searchItems = asyncHandler(async (req, res) => {
  const { query, category, type, minPrice, maxPrice, condition, city, neighborhood, size, brand, color } = req.query;
  const filter = { status: 'active' };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter['price.amount'] = {};
    if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
  }
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };
  if (neighborhood) filter['location.neighborhood'] = { $regex: neighborhood, $options: 'i' };
  if (size) filter.size = size;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (color) filter.color = { $regex: color, $options: 'i' };

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt');

  res.json({ status: 'success', data: items });
});

// Update Item
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  const { size, material, brand, color, rentDetails, exchangeDetails, location, contactInfo } = req.body;

  const parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
  const parsedRentDetails = typeof rentDetails === "string" ? JSON.parse(rentDetails) : rentDetails;
  const parsedExchangeDetails = typeof exchangeDetails === "string" ? JSON.parse(exchangeDetails) : exchangeDetails;
  const parsedContactInfo = typeof contactInfo === "string" ? JSON.parse(contactInfo) : contactInfo;

  const clothingCategoryId = 'clothing_category_id';
  if (item.category.toString() === clothingCategoryId && size && !['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'].includes(size)) {
    throw new ApiError(400, 'Invalid size for clothing item');
  }

  if (item.type === 'rent' && parsedRentDetails) {
    if (parsedRentDetails.duration && !/^\d+ (day|week|month)s?$/.test(parsedRentDetails.duration)) {
      throw new ApiError(400, 'Duration must be in format "X days/weeks/months"');
    }
  }
  if (item.type === 'exchange' && parsedExchangeDetails && parsedExchangeDetails.preferredSizes) {
    if (!parsedExchangeDetails.preferredSizes.every(s => ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'].includes(s))) {
      throw new ApiError(400, 'Invalid preferred sizes');
    }
  }

  if (parsedLocation) {
    item.location = {
      city: parsedLocation.city || item.location.city,
      neighborhood: parsedLocation.neighborhood || item.location.neighborhood,
      coordinates: parsedLocation.coordinates || item.location.coordinates || []
    };
  }

  if (parsedContactInfo) {
    item.contactInfo = {
      name: parsedContactInfo.name || item.contactInfo.name,
      phoneNumber: parsedContactInfo.phoneNumber || item.contactInfo.phoneNumber,
      showPhoneNumber: parsedContactInfo.showPhoneNumber !== undefined ? parsedContactInfo.showPhoneNumber : item.contactInfo.showPhoneNumber
    };
  }

  Object.assign(item, {
    size,
    material,
    brand,
    color,
    rentDetails: parsedRentDetails ? { ...item.rentDetails, ...parsedRentDetails } : item.rentDetails,
    exchangeDetails: parsedExchangeDetails ? { ...item.exchangeDetails, ...parsedExchangeDetails } : item.exchangeDetails
  });

  if (item.status === 'moderated') item.status = 'pending';
  await item.save();

  res.json({ status: 'success', data: item });
});

// Upload Item Images
export const uploadItemImages = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  if (!req.files || req.files.length === 0) throw new ApiError(400, 'No images provided');

  item.images = item.images.filter(img => img.url && img.public_id);

  const currentImageCount = item.images.length;
  const newImageCount = req.files.length;
  if (currentImageCount + newImageCount > 12) {
    throw new ApiError(400, `Cannot upload ${newImageCount} more images. Maximum 12 images allowed per item (current: ${currentImageCount}).`);
  }

  const isFirstUpload = item.images.length === 0;

  const uploadedImages = await Promise.all(
    req.files.map(async (file, index) => {
      const result = await uploadToCloudinary(file.path);
      if (!result.public_id || !result.secure_url) throw new ApiError(500, 'Cloudinary upload failed');
      return {
        url: result.secure_url,
        public_id: result.public_id,
        isMain: index === 0 && isFirstUpload,
        order: item.images.length + index
      };
    })
  );

  item.images.push(...uploadedImages);

  if (item.images.length > 0 && !item.images.some(img => img.isMain)) {
    item.images[0].isMain = true;
  }

  await item.save();

  res.json({ status: 'success', data: item });
});

// Increment Item Stats
export const incrementItemStats = asyncHandler(async (req, res) => {
  const { itemId, type } = req.params;
  if (!['view', 'phone', 'chat'].includes(type)) throw new ApiError(400, 'Invalid stat type');

  const item = await Item.findById(itemId);
  if (!item) throw new ApiError(404, 'Item not found');

  if (type === 'view') item.stats.views += 1;
  else if (type === 'phone') item.stats.phones += 1;
  else if (type === 'chat') item.stats.chats += 1;

  await item.save();
  res.json({ status: 'success', message: `${type} stat incremented`, data: item.stats });
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

  const userIds = items.map(item => item.user?._id).filter(Boolean);
  const profiles = await Profile.find({ user: { $in: userIds } }).select('user name profilePhoto');
  const profileMap = profiles.reduce((map, profile) => {
    map[profile.user.toString()] = profile;
    return map;
  }, {});

  const processedItems = items.map(item => {
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
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// Get Item Details for Moderation (Admin)
export const getItemForModeration = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('category')
    .populate('user', 'email lastLogin memberSince')
    .populate('moderationInfo.moderatedBy', 'email');
  if (!item) throw new ApiError(404, 'Item not found');

  const sellerProfile = await Profile.findOne({ user: item.user._id }).select('name phone profilePhoto gender about');
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
      { title: { $regex: item.title.split(' ').filter(w => w.length > 3).join('|'), $options: 'i' } },
      { category: item.category }
    ],
    status: 'active'
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
    memberSince: item.user.memberSince
  };

  const enhancedItem = item.toObject();
  if (moderatorProfile) enhancedItem.moderatorProfile = { name: moderatorProfile.name };

  res.json({
    status: 'success',
    data: { item: enhancedItem, seller, userHistory, similarItems }
  });
});

// Moderate Item (Admin)
export const moderateItem = asyncHandler(async (req, res) => {
  const { status, moderationNotes, rejectionReason, featuredItem, urgentItem } = req.body;
  if (!['active', 'moderated'].includes(status)) throw new ApiError(400, 'Invalid moderation status');

  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Item not found');

  item.status = status;
  item.moderationInfo = {
    moderatedBy: req.user._id,
    moderatedAt: new Date(),
    moderationNotes,
    rejectionReason: status === 'moderated' ? rejectionReason : undefined
  };
  if (featuredItem !== undefined) item.visibility.featured = featuredItem;
  if (urgentItem !== undefined) item.visibility.urgent = urgentItem;

  await item.save();
  await createModerationNotification(item.user, status, rejectionReason, item._id).catch(err =>
    console.error('Notification error:', err)
  );

  res.json({ status: 'success', data: item });
});

// Get User Item Stats
export const getUserItemStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Item.aggregate([
    { $match: { user: mongoose.Types.ObjectId(req.user._id), createdAt: { $gte: startDate } } },
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 }, totalViews: { $sum: '$stats.views' }, totalPhones: { $sum: '$stats.phones' }, totalChats: { $sum: '$stats.chats' } } }
        ],
        topItems: [
          { $project: { title: 1, status: 1, views: '$stats.views', phones: '$stats.phones', chats: '$stats.chats', interactions: { $sum: ['$stats.views', '$stats.phones', '$stats.chats'] } } },
          { $sort: { interactions: -1 } },
          { $limit: 5 }
        ],
        totals: [
          { $group: { _id: null, totalItems: { $sum: 1 }, totalViews: { $sum: '$stats.views' }, totalPhones: { $sum: '$stats.phones' }, totalChats: { $sum: '$stats.chats' } } }
        ]
      }
    }
  ]);

  res.json({
    status: 'success',
    data: {
      byStatus: stats[0].byStatus,
      topItems: stats[0].topItems,
      totals: stats[0].totals[0] || { totalItems: 0, totalViews: 0, totalPhones: 0, totalChats: 0 }
    }
  });
});

// Get Admin Dashboard Stats
// Get Admin Dashboard Stats
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Item.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $facet: {
        trend: [
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, views: { $sum: '$stats.views' }, phones: { $sum: '$stats.phones' }, chats: { $sum: '$stats.chats' } } },
          { $sort: { '_id': 1 } }
        ],
        byCategory: [
          { $group: { _id: '$category', views: { $sum: '$stats.views' }, interactions: { $sum: { $add: ['$stats.views', '$stats.phones', '$stats.chats'] } } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
          { $unwind: '$category' },
          { $project: { name: '$category.name', views: 1, interactions: 1 } }
        ],
        totals: [
          { $group: { _id: null, totalItems: { $sum: 1 }, totalViews: { $sum: '$stats.views' }, totalInteractions: { $sum: { $add: ['$stats.views', '$stats.phones', '$stats.chats'] } } } }
        ],
        topItems: [
          { $project: { title: 1, status: 1, views: '$stats.views', phones: '$stats.phones', chats: '$stats.chats', interactions: { $sum: ['$stats.views', '$stats.phones', '$stats.chats'] } } },
          { $sort: { interactions: -1 } },
          { $limit: 10 }
        ],
        moderationStats: [
          { $match: { 'moderationInfo.moderatedAt': { $gte: startDate } } },
          { $group: { _id: '$moderationInfo.moderatedBy', approved: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }, rejected: { $sum: { $cond: [{ $eq: ['$status', 'moderated'] }, 1, 0] } } } },
          { $lookup: { from: 'profiles', localField: '_id', foreignField: 'user', as: 'moderatorProfile' } },
          { $unwind: '$moderatorProfile' },
          { $project: { moderator: '$moderatorProfile.name', approved: 1, rejected: 1 } }
        ],
        activeItems: [
          { $match: { status: 'active' } },
          {
            $project: {
              title: 1,
              category: 1, // Include category ID
              price: 1, // Include price object
              type: 1, // Include type for price rendering
              rentDetails: 1, // Include rent details if applicable
              exchangeDetails: 1, // Include exchange details if applicable
              views: '$stats.views',
              phones: '$stats.phones',
              chats: '$stats.chats'
            }
          },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } }, // Populate category
          { $unwind: '$category' }, // Unwind the category array
          { $project: { 
            title: 1, 
            'category.name': 1, // Only keep the category name
            price: 1, 
            type: 1, 
            rentDetails: 1, 
            exchangeDetails: 1, 
            views: 1, 
            phones: 1, 
            chats: 1 
          } },
          { $sort: { views: -1 } },
          { $limit: 50 }
        ],
        soldItems: [
          { $match: { status: 'sold' } },
          {
            $project: {
              title: 1,
              category: 1, // Include category ID
              price: 1, // Include price object
              type: 1, // Include type for price rendering
              rentDetails: 1, // Include rent details if applicable
              exchangeDetails: 1, // Include exchange details if applicable
              views: '$stats.views',
              phones: '$stats.phones',
              chats: '$stats.chats',
              soldAt: '$updatedAt'
            }
          },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } }, // Populate category
          { $unwind: '$category' }, // Unwind the category array
          { $project: { 
            title: 1, 
            'category.name': 1, // Only keep the category name
            price: 1, 
            type: 1, 
            rentDetails: 1, 
            exchangeDetails: 1, 
            views: 1, 
            phones: 1, 
            chats: 1, 
            soldAt: 1 
          } },
          { $sort: { soldAt: -1 } },
          { $limit: 50 }
        ]
      }
    }
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
      soldItems: { count: soldItemsCount, details: stats[0].soldItems }
    }
  });
});

// Delete Item
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  await Promise.all(
    item.images.filter(image => image.public_id).map(image => deleteFromCloudinary(image.public_id))
  );
  await Item.deleteOne({ _id: item._id });

  res.json({ status: 'success', data: null });
});

// Get Item By ID
export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('category', 'name');
  if (!item) throw new ApiError(404, 'Item not found');

  await item.populate('user', 'name email profilePicture createdAt');
  const sellerProfile = await Profile.findOne({ user: item.user._id }).select('name phone profilePhoto gender about');

  if (!req.user || req.user._id.toString() !== item.user._id.toString()) {
    item.stats.views += 1;
    await item.save();
  }

  const seller = {
    name: sellerProfile?.name || item.user.name || 'Private User',
    avatar: sellerProfile?.profilePhoto || item.user.profilePicture || '/default-avatar.png',
    email: item.user.email,
    memberSince: item.user.createdAt
      ? new Date(item.user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
      : 'Unknown',
    phone: sellerProfile?.phone || null,
    gender: sellerProfile?.gender || null,
    about: sellerProfile?.about || null
  };

  const responseItem = item.toObject();
  responseItem.seller = seller;

  res.json({ status: 'success', data: responseItem });
});

// Toggle Item Status
export const toggleItemStatus = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  if (!['active', 'inactive'].includes(item.status)) throw new ApiError(400, 'Item cannot be toggled');
  item.status = item.status === 'active' ? 'inactive' : 'active';
  await item.save();

  res.json({ status: 'success', data: item });
});

// Mark Item As Sold
export const markItemAsSold = asyncHandler(async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

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

  res.json({ status: 'success', data: items });
});

// Get Related Items
export const getRelatedItems = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Item not found');

  const relatedItems = await Item.find({
    category: item.category,
    _id: { $ne: item._id },
    status: 'active',
    size: item.size,
    'location.city': item.location.city
  })
    .populate('category')
    .limit(6);

  res.json({ status: 'success', data: relatedItems });
});

// Extend Item Visibility
export const extendItemVisibility = asyncHandler(async (req, res) => {
  const { days } = req.body;
  if (!days || days <= 0 || days > 90) throw new ApiError(400, 'Invalid extension period');

  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  const newEndDate = new Date(item.visibility.endDate);
  newEndDate.setDate(newEndDate.getDate() + days);
  item.visibility.endDate = newEndDate;
  await item.save();

  res.json({ status: 'success', data: item });
});

// Update Item Images
export const updateItemImages = asyncHandler(async (req, res) => {
  const { images } = req.body;
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  const hasMainImage = images.some(img => img.isMain);
  if (!hasMainImage) throw new ApiError(400, 'At least one image must be main');

  images.forEach(updateImage => {
    const image = item.images.id(updateImage.id);
    if (image) {
      image.isMain = updateImage.isMain;
      image.order = updateImage.order;
    }
  });
  await item.save();

  res.json({ status: 'success', data: item });
});

// Delete Item Image
export const deleteItemImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const item = await Item.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Item not found');

  if (item.images.length <= 1) throw new ApiError(400, 'Cannot delete the only image');

  const image = item.images.id(imageId);
  if (!image) throw new ApiError(404, 'Image not found');

  if (image.isMain && item.images.length > 1) {
    const nextImage = item.images.find(img => img._id.toString() !== imageId);
    if (nextImage) nextImage.isMain = true;
  }

  if (image.public_id) await deleteFromCloudinary(image.public_id).catch(err => console.error('Cloudinary error:', err));
  item.images.pull(imageId);
  await item.save();

  res.json({ status: 'success', data: item });
});

// Bulk Moderate Items (Admin)
export const bulkModerateItems = asyncHandler(async (req, res) => {
  const { itemIds, status, moderationNotes } = req.body;
  if (!Array.isArray(itemIds) || itemIds.length === 0) throw new ApiError(400, 'Item IDs must be an array');
  if (!['active', 'moderated'].includes(status)) throw new ApiError(400, 'Invalid moderation status');

  const result = await Item.updateMany(
    { _id: { $in: itemIds }, status: 'pending' },
    { status, moderationInfo: { moderatedBy: req.user._id, moderatedAt: new Date(), moderationNotes } }
  );

  if (result.nModified > 0) {
    Item.find({ _id: { $in: itemIds } })
      .select('user')
      .then(items => {
        items.forEach(item => {
          createModerationNotification(item.user, status).catch(err => console.error('Notification error:', err));
        });
      });
  }

  res.json({ status: 'success', data: { modifiedCount: result.nModified, totalCount: itemIds.length } });
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

  const userIds = items.map(item => item.user?._id).filter(Boolean);
  const moderatorIds = items.map(item => item.moderationInfo?.moderatedBy?._id).filter(Boolean);
  const allProfileIds = [...new Set([...userIds, ...moderatorIds])];
  const profiles = await Profile.find({ user: { $in: allProfileIds } });

  const profileMap = profiles.reduce((map, profile) => {
    map[profile.user.toString()] = profile;
    return map;
  }, {});

  const enhancedItems = items.map(item => {
    const itemObj = item.toObject({ virtuals: true });
    if (item.user && profileMap[item.user._id.toString()]) itemObj.sellerProfile = profileMap[item.user._id.toString()];
    if (item.moderationInfo?.moderatedBy && profileMap[item.moderationInfo.moderatedBy._id.toString()])
      itemObj.moderatorProfile = profileMap[item.moderationInfo.moderatedBy._id.toString()];
    return itemObj;
  });

  res.json({
    status: 'success',
    data: enhancedItems,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// Revise Moderation (Admin)
export const reviseModeration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, moderationNotes } = req.body;

  const item = await Item.findById(id);
  if (!item) throw new ApiError(404, 'Item not found');

  item.status = status;
  item.moderationInfo = {
    ...item.moderationInfo,
    moderatedBy: item.moderationInfo.moderatedBy || req.user._id,
    moderatedAt: item.moderationInfo.moderatedAt || new Date(),
    moderationNotes: moderationNotes || item.moderationInfo.moderationNotes,
    rejectionReason: status === 'moderated' ? req.body.rejectionReason || item.moderationInfo.rejectionReason : undefined,
    revisedBy: req.user._id,
    revisedAt: new Date(),
    revisionNotes: moderationNotes,
    previousStatus: item.status
  };

  await item.save();
  await createModerationNotification(item.user, status, moderationNotes, item._id).catch(err =>
    console.error('Notification error:', err)
  );

  res.json({ status: 'success', data: item });
});

// Check Item Status
export const checkItemStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Item.findById(id).select('status moderationInfo').lean();
  if (!item) throw new ApiError(404, 'Item not found');

  let message = '';
  switch (item.status) {
    case 'pending': message = 'Your item is pending review.'; break;
    case 'active': message = 'Your item is active and visible.'; break;
    case 'inactive': message = 'Your item is inactive.'; break;
    case 'moderated': message = `Your item was not approved: ${item.moderationInfo?.rejectionReason || 'Check listing.'}`; break;
    case 'sold': message = 'This item has been sold.'; break;
    case 'expired': message = 'This listing has expired.'; break;
    default: message = 'Item status unknown.';
  }

  res.json({ status: 'success', data: { status: item.status, message } });
});