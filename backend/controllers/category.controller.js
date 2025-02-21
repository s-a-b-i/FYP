import { Category } from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js'; // Import asyncHandler
import { ApiError } from '../utils/ApiError.js'; // Import ApiError
import { Item } from '../models/item.model.js'; // Import Item model for deleteCategory

// Create Category
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: category
  });
});

// Get Categories
export const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (!req.user?.isAdmin) {
    filter.isActive = true;
  }

  const categories = await Category.find(filter)
    .sort('order')
    .populate('parent');

  res.json({
    status: 'success',
    data: categories
  });
});

// Get Category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent');

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.json({
    status: 'success',
    data: category
  });
});

// Update Category
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.json({
    status: 'success',
    data: category
  });
});

// Delete Category
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if category has items
  const itemCount = await Item.countDocuments({ category: req.params.id });
  if (itemCount > 0) {
    throw new ApiError(400, 'Cannot delete category with existing items');
  }

  await category.remove();

  res.json({
    status: 'success',
    data: null
  });
});

// Toggle Category Status
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
  
    category.isActive = !category.isActive;
    await category.save();
  
    res.json({
      status: 'success',
      data: category
    });
  });
  

  // Reorder Categories
  export const reorderCategories = asyncHandler(async (req, res) => {
    const { orders } = req.body; // { categoryId: newOrder }
    
    await Promise.all(
      Object.entries(orders).map(([categoryId, order]) =>
        Category.findByIdAndUpdate(categoryId, { order })
      )
    );
  
    const categories = await Category.find().sort('order');
    
    res.json({
      status: 'success',
      data: categories
    });
  });
  
  export const getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await Category.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'category',
          as: 'items'
        }
      },
      {
        $project: {
          name: 1,
          totalItems: { $size: '$items' },
          activeItems: {
            $size: {
              $filter: {
                input: '$items',
                as: 'item',
                cond: { $eq: ['$$item.status', 'active'] }
              }
            }
          }
        }
      }
    ]);
  
    res.json({
      status: 'success',
      data: stats
    });
  });
  