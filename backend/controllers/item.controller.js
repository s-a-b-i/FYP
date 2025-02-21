import { Item } from '../models/item.model.js';
import { asyncHandler } from '../utils/asyncHandler.js'; // Import asyncHandler
import { ApiError } from '../utils/ApiError.js'; // Import ApiError
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Create Item
export const createItem = asyncHandler(async (req, res) => {
  const item = await Item.create({
    ...req.body,
    user: req.user._id,
    visibility: {
      ...req.body.visibility,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    }
  });

  res.status(201).json({
    status: 'success',
    data: item
  });
});

// Get Items
export const getItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: 'active' };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Item.countDocuments(filter);

  res.json({
    status: 'success',
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get User Items
export const getUserItems = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt');

  res.json({
    status: 'success',
    data: items
  });
});

// Search Items
export const searchItems = asyncHandler(async (req, res) => {
  const { query, category, type, minPrice, maxPrice, condition, location } = req.query;

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
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (location) {
    const coordinates = location.split(',').map(Number);
    filter['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: 50000 // 50km radius
      }
    };
  }

  const items = await Item.find(filter)
    .populate('category')
    .sort('-createdAt');

  res.json({
    status: 'success',
    data: items
  });
});

// Update Item
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  Object.assign(item, req.body);
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Upload Item Images
export const uploadItemImages = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  const uploadedImages = await Promise.all(
    req.files.map(async (file, index) => {
      const result = await uploadToCloudinary(file.buffer);
      return {
        url: result.secure_url,
        isMain: index === 0,
        order: index
      };
    })
  );

  item.images.push(...uploadedImages);
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Increment Item Stats
export const incrementItemStats = asyncHandler(async (req, res) => {
  const { type } = req.params; // 'views', 'phones', or 'chats'

  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { $inc: { [`stats.${type}`]: 1 } },
    { new: true }
  );

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  res.json({
    status: 'success',
    data: item
  });
});

// Moderate Item
export const moderateItem = asyncHandler(async (req, res) => {
  const { status, moderationNotes, rejectionReason } = req.body;

  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  item.status = status;
  item.moderationInfo = {
    moderatedBy: req.user._id,
    moderatedAt: new Date(),
    moderationNotes,
    rejectionReason
  };

  await item.save();

  // Notify user about moderation result
  await sendModerationNotification(item.user, status, rejectionReason);

  res.json({
    status: 'success',
    data: item
  });
});

// Delete Item
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  // Delete images from Cloudinary
  await Promise.all(
    item.images.map(image => deleteFromCloudinary(image.url))
  );

  await item.remove();

  res.json({
    status: 'success',
    data: null
  });
});

// Get Item By ID
export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('category')
    .populate('user', 'name email');

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  // Increment view count
  item.stats.views += 1;
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Toggle Item Status
export const toggleItemStatus = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  item.status = item.status === 'active' ? 'inactive' : 'active';
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Mark Item As Sold
export const markItemAsSold = asyncHandler(async (req, res) => {
  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  item.status = 'sold';
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Get Featured Items
export const getFeaturedItems = asyncHandler(async (req, res) => {
  const items = await Item.find({
    status: 'active',
    'visibility.featured': true
  })
    .populate('category')
    .sort('-createdAt')
    .limit(10);

  res.json({
    status: 'success',
    data: items
  });
});

// Get Related Items
export const getRelatedItems = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  const relatedItems = await Item.find({
    category: item.category,
    _id: { $ne: item._id },
    status: 'active'
  })
    .populate('category')
    .limit(6);

  res.json({
    status: 'success',
    data: relatedItems
  });
});

// Get Item Stats
export const getItemStats = asyncHandler(async (req, res) => {
  const stats = await Item.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$stats.views' },
        totalPhones: { $sum: '$stats.phones' },
        totalChats: { $sum: '$stats.chats' }
      }
    }
  ]);

  res.json({
    status: 'success',
    data: stats
  });
});

// Extend Item Visibility
export const extendItemVisibility = asyncHandler(async (req, res) => {
  const { days } = req.body;

  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  const newEndDate = new Date(item.visibility.endDate);
  newEndDate.setDate(newEndDate.getDate() + days);

  item.visibility.endDate = newEndDate;
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Update Item Images
export const updateItemImages = asyncHandler(async (req, res) => {
  const { images } = req.body; // Array of { id, isMain, order }

  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  // Update image properties
  images.forEach(updateImage => {
    const image = item.images.id(updateImage.id);
    if (image) {
      image.isMain = updateImage.isMain;
      image.order = updateImage.order;
    }
  });

  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});

// Delete Item Image
export const deleteItemImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;

  const item = await Item.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  const image = item.images.id(imageId);
  if (!image) {
    throw new ApiError('Image not found', 404);
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(image.url);

  // Remove from item
  item.images.pull(imageId);
  await item.save();

  res.json({
    status: 'success',
    data: item
  });
});