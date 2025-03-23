import { Category } from '../models/category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js'; // Import asyncHandler
import { ApiError } from '../utils/ApiError.js'; // Import ApiError
import { Item } from '../models/item.model.js'; // Import Item model for deleteCategory
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';



export const uploadCategoryIcon = asyncHandler(async (req, res) => {
  const iconLocalPath = req.file?.path;
  
  if (!iconLocalPath) {
    throw new ApiError(400, "Icon file is required");
  }

  try {
    const cloudinaryResponse = await uploadToCloudinary(iconLocalPath);

    res.status(200).json({
      status: 'success',
      data: {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id
      }
    });
  } catch (error) {
    throw new ApiError(500, "Error uploading icon: " + error.message);
  }
});


// Create Category with icon
export const createCategory = asyncHandler(async (req, res) => {
  const { name, parent, isActive, metadata, icon } = req.body;

  if (icon && (!icon.url || !icon.public_id)) {
    throw new ApiError(400, "Icon must include both url and public_id");
  }


  const category = await Category.create({
    name,
    parent,
    isActive,
    metadata,
    icon,
    createdBy: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: category
  });
});

// Get Categories
export const getCategories = asyncHandler(async (req, res) => {

  // console.log('User:', req.user); // Log the user object

  const filter = {};
  if (!req.user?.isAdmin) {
    filter.isActive = true;
  }

  // console.log('Filter:', filter); // Log the filter

  const categories = await Category.find(filter)
  .select('name parent isActive metadata icon')
    .sort('order')
    .populate('parent' , 'name');

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
// Update Category
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, parent, isActive, metadata, icon } = req.body;

  const category = await Category.findById(id);
  
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // If there's a new icon and an old icon exists, delete the old one
  if (icon && icon.public_id && category.icon?.public_id && icon.public_id !== category.icon.public_id) {
    await deleteFromCloudinary(category.icon.public_id);
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    {
      name,
      parent,
      isActive,
      metadata,
      icon
    },
    { new: true, runValidators: true }
  );

  res.json({
    status: 'success',
    data: updatedCategory
  });
});




// Delete Category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { forceDelete } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Check for subcategories and items
    const subcategories = await Category.find({ parent: id });
    const itemCount = await Item.countDocuments({ category: id });

    if (!forceDelete && (subcategories.length > 0 || itemCount > 0)) {
      return res.status(400).json({
        status: 'error',
        message: "Cannot delete category with subcategories or items",
        details: {
          hasSubcategories: subcategories.length > 0,
          subcategoriesCount: subcategories.length,
          hasItems: itemCount > 0,
          itemsCount: itemCount
        }
      });
    }

    // Delete process
    if (forceDelete) {
      // Delete subcategories recursively
      for (const sub of subcategories) {
        if (sub.icon?.public_id) {
          await deleteFromCloudinary(sub.icon.public_id);
        }
        await Category.deleteOne({ _id: sub._id });
        await Item.deleteMany({ category: sub._id });
      }
    }

    // Delete category icon if exists
    if (category.icon?.public_id) {
      await deleteFromCloudinary(category.icon.public_id);
    }

    // Delete category and its items
    await Item.deleteMany({ category: id });
    await Category.deleteOne({ _id: id });

    res.status(200).json({
      status: 'success',
      message: "Category deleted successfully"
    });
  } catch (error) {
    throw new ApiError(500, `Error deleting category: ${error.message}`);
  }
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
  

  // Add this to your category.controller.js file

export const getPopularCategories = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query; // Default to 6 categories

  const popularCategories = await Item.aggregate([
    { $match: { status: 'active' } }, // Only count active items
    { 
      $group: {
        _id: '$category',
        itemCount: { $sum: 1 },
        totalViews: { $sum: '$stats.views' },
        totalInteractions: { 
          $sum: { 
            $add: ['$stats.views', '$stats.phones', '$stats.chats'] 
          } 
        }
      } 
    },
    { 
      $lookup: { 
        from: 'categories', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'categoryData' 
      } 
    },
    { $unwind: '$categoryData' },
    { 
      $project: { 
        _id: '$categoryData._id',
        name: '$categoryData.name',
        slug: '$categoryData.slug',
        icon: '$categoryData.icon',
        itemCount: 1,
        totalViews: 1,
        totalInteractions: 1,
        metadata: '$categoryData.metadata'
      } 
    },
    { $sort: { totalInteractions: -1 } }, // Sort by most interactions
    { $limit: parseInt(limit) }
  ]);

  res.json({
    status: 'success',
    data: popularCategories
  });
});

// Add this to your category.controller.js file

export const getPopularCategoriesWithItems = asyncHandler(async (req, res) => {
  const { categoryLimit = 4, itemLimit = 5 } = req.query;

  const popularCategories = await Item.aggregate([
    { $match: { status: 'active' } },
    { 
      $group: {
        _id: '$category',
        itemCount: { $sum: 1 },
        totalInteractions: { 
          $sum: { $add: ['$stats.views', '$stats.phones', '$stats.chats'] } 
        }
      } 
    },
    { 
      $lookup: { 
        from: 'categories', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'categoryData' 
      } 
    },
    { $unwind: '$categoryData' },
    { 
      $project: { 
        _id: '$categoryData._id',
        name: '$categoryData.name',
        slug: '$categoryData.slug',
        icon: '$categoryData.icon',
        itemCount: 1,
        totalInteractions: 1
      } 
    },
    { $sort: { totalInteractions: -1 } },
    { $limit: parseInt(categoryLimit) }
  ]);

  const categoriesWithItems = await Promise.all(
    popularCategories.map(async (category) => {
      const items = await Item.find({ 
        category: category._id, 
        status: 'active' 
      })
      .sort('-stats.views')
      .limit(parseInt(itemLimit))
      .lean();
      
      const formattedItems = items.map(item => ({
        id: item._id,
        title: item.title,
        type: item.type,
        price: item.price, // Pass full price object
        currency: item.price?.currency,
        images: item.images || [], // Pass full images array
        location: item.location || {}, // Pass full location object
        timeAgo: formatTimeAgo(item.createdAt),
        condition: item.condition,
        sustainabilityScore: 
          item.metadata?.sustainabilityScore || 
          Math.floor(Math.random() * 5) + 5,
        tags: [item.sex].filter(Boolean),
        visibility: {
          featured: item.visibility?.featured || false,
          urgent: item.visibility?.urgent || false
        },
        rentDetails: item.rentDetails, // Include rent details if applicable
        exchangeDetails: item.exchangeDetails // Include exchange details if applicable
      }));
      
      return {
        ...category,
        items: formattedItems
      };
    })
  );
  
  res.json({
    status: 'success',
    data: categoriesWithItems
  });
});


// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    const diffInDays = diffInHours / 24;
    return `${Math.floor(diffInDays)}d ago`;
  }
}