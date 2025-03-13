import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, ShoppingBag, Home, Repeat } from "lucide-react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { categoryAPI } from "@/api/category";
import { H1, H2, H3 } from "@/components/shared/Heading";
import { useAuthStore } from "@/store/authStore";
import SkeletonLoader from "@/components/shared/SkeletonLoader";

const PostCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const parentId = searchParams.get("parent");
  const itemType = searchParams.get("type");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryAPI.getCategories();

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && typeof data === "object") {
          const categoriesArray = data.categories || data.data || Object.values(data);
          if (Array.isArray(categoriesArray)) {
            setCategories(categoriesArray);
          } else {
            console.error("Unexpected API response format:", data);
            setError("Received unexpected data format from the API");
          }
        } else {
          console.error("Unexpected API response:", data);
          setError("Received unexpected response from the API");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (parentId && categories.length > 0) {
      const parent = categories.find(cat => 
        (cat._id.$oid || cat._id) === parentId && !cat.parent
      );
      if (parent) {
        setSelectedParent(parent);
      }
    }
  }, [parentId, categories]);

  const organizeCategories = () => {
    if (!Array.isArray(categories)) {
      console.error("Categories is not an array:", categories);
      return [];
    }

    const parentCategories = categories.filter((cat) => cat && !cat.parent);
    
    return parentCategories.map((parent) => {
      const parentId = parent._id.$oid || parent._id;
      
      const children = categories.filter((child) => {
        if (!child || !child.parent) return false;
        
        const childParentId = 
          (child.parent.$oid) ? child.parent.$oid : 
          (typeof child.parent === 'string') ? child.parent :
          (child.parent._id) ? child.parent._id : null;
          
        const compareId = 
          (parent._id.$oid) ? parent._id.$oid : 
          (typeof parent._id === 'string') ? parent._id : null;
        
        return childParentId === compareId;
      });
      
      return { ...parent, children };
    });
  };

  const getSubcategoryChildren = (subcategoryId) => {
    if (!subcategoryId) return [];
    
    return categories.filter((child) => {
      if (!child || !child.parent) return false;
      
      const childParentId = 
        (child.parent.$oid) ? child.parent.$oid : 
        (typeof child.parent === 'string') ? child.parent :
        (child.parent._id) ? child.parent._id : null;
        
      return childParentId === subcategoryId;
    });
  };

  const hierarchicalCategories = Array.isArray(categories) ? organizeCategories() : [];

  const handleParentClick = (parent) => {
    setSelectedParent(parent);
    setSelectedSub(null);
    
    const parentId = getNormalizedId(parent._id);
    
    const parentObj = hierarchicalCategories.find(
      (cat) => getNormalizedId(cat._id) === parentId
    );
    
    if (parentObj && (!parentObj.children || parentObj.children.length === 0)) {
      handleCategorySelect(parentId);
      return;
    }
    
    const updatedParams = { parent: parentId };
    if (itemType) {
      updatedParams.type = itemType;
    }
    setSearchParams(updatedParams);
  };

  const handleBackToParents = () => {
    setSelectedParent(null);
    setSelectedSub(null);
    
    if (itemType) {
      setSearchParams({ type: itemType });
    } else {
      setSearchParams({});
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSub(subcategory);
    
    const subcategoryId = getNormalizedId(subcategory._id);
    const subChildren = getSubcategoryChildren(subcategoryId);
    
    if (subChildren.length === 0) {
      handleCategorySelect(subcategoryId);
    }
  };

  const handleCategorySelect = (categoryId) => {
    const params = new URLSearchParams();
    params.append("categoryId", categoryId);
    if (itemType) {
      params.append("type", itemType);
    }

    navigate(`/post/attributes/${categoryId}?${params.toString()}`);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "sell": return "bg-itemTypes-sell-bg text-itemTypes-sell-text";
      case "rent": return "bg-itemTypes-rent-bg text-itemTypes-rent-text";
      case "exchange": return "bg-itemTypes-exchange-bg text-itemTypes-exchange-text";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "sell": return <ShoppingBag className="w-5 h-5" />;
      case "rent": return <Home className="w-5 h-5" />;
      case "exchange": return <Repeat className="w-5 h-5" />;
      default: return null;
    }
  };

  const getNormalizedId = (idObject) => {
    if (!idObject) return null;
    return idObject.$oid || (typeof idObject === 'string' ? idObject : null);
  };

  if (error)
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="max-w-lg mx-auto bg-status-error-bg p-5 rounded-lg shadow-md">
          <H2 className="text-status-error-text mb-2 text-base sm:text-lg">Error Loading Categories</H2>
          <p className="text-status-error-text text-sm">{error}</p>
        </div>
      </div>
    );

  const selectedParentCategory = parentId
    ? hierarchicalCategories.find(
        (parent) => getNormalizedId(parent._id) === parentId
      )
    : selectedParent;

  const subcategoryChildren = selectedSub 
    ? getSubcategoryChildren(getNormalizedId(selectedSub._id))
    : [];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 md:py-10 max-w-6xl">
      <div className="mb-8 text-center">
        <H1 className="">Post Your Ad</H1>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm sm:text-base ${getTypeColor(
              itemType || "sell"
            )}`}
          >
            {getTypeIcon(itemType || "sell")}
            <span>
              Choose Category to{" "}
              {itemType
                ? itemType.charAt(0).toUpperCase() + itemType.slice(1)
                : "Sell"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <H2 className="">Choose a category</H2>
        {parentId && (
          <button
            onClick={handleBackToParents}
            className="mt-2 flex items-center text-primary-main hover:text-primary-hover transition-colors duration-200 py-1.5 px-3 rounded-lg border border-primary-light hover:border-primary-main text-xs sm:text-sm"
          >
            <ChevronDown className="w-4 h-4 transform rotate-90 mr-1" />
            Back to all categories
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          {parentId ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-300 rounded-lg overflow-hidden shadow-md">
              <div className="border-r border-gray-300 max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 py-2.5 px-3 border-b border-gray-300 text-sm font-medium">
                  Main Categories
                </div>
                <SkeletonLoader count={5} className="h-16 w-full mb-1 p-3" />
              </div>
              <div className="border-r border-gray-300 max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 py-2.5 px-3 border-b border-gray-300 text-sm font-medium">
                  Subcategories
                </div>
                <SkeletonLoader count={4} className="h-16 w-full mb-1 p-3" />
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 py-2.5 px-3 border-b border-gray-300 text-sm font-medium">
                  Subcategories
                </div>
                <SkeletonLoader count={3} className="h-16 w-full mb-1 p-3" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader count={6} type="card" className="border border-gray-200" />
            </div>
          )}
        </div>
      ) : (
        <>
          {parentId ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-300 rounded-lg overflow-hidden shadow-md">
              <div className="border-r border-gray-300 max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 py-2.5 px-3 border-b border-gray-300 text-sm font-medium">
                  Main Categories
                </div>
                {hierarchicalCategories.map((parent) => {
                  const thisParentId = getNormalizedId(parent._id);
                  const isActive = selectedParentCategory && getNormalizedId(selectedParentCategory._id) === thisParentId;
                  
                  return (
                    <div 
                      key={thisParentId}
                      onClick={() => handleParentClick(parent)}
                      className={`flex items-center p-3 cursor-pointer border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                        isActive ? 'bg-primary-light' : ''
                      }`}
                    >
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        {parent.icon && parent.icon.url ? (
                          <img 
                            src={parent.icon.url} 
                            alt={parent.name} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-700 rounded-md text-sm">
                            {parent.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <span className="flex-1 text-sm sm:text-base">{parent.name}</span>
                      {parent.children && parent.children.length > 0 && (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-r border-gray-300 max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 py-2.5 px-3 border-b border-gray-300 text-sm font-medium">
                  Subcategories
                </div>
                {selectedParentCategory ? (
                  selectedParentCategory.children && selectedParentCategory.children.length > 0 ? (
                    selectedParentCategory.children.map((sub) => {
                      const subId = getNormalizedId(sub._id);
                      const isActive = selectedSub && getNormalizedId(selectedSub._id) === subId;
                      
                      return (
                        <div 
                          key={subId}
                          onClick={() => handleSubcategoryClick(sub)}
                          className={`flex items-center p-3 cursor-pointer border-b border-gray-300 hover:bg-gray-50 transition-colors ${
                            isActive ? 'bg-primary-light' : ''
                          }`}
                        >
                          <div className="w-8 h-8 mr-3 flex-shrink-0">
                            {sub.icon && sub.icon.url ? (
                              <img 
                                src={sub.icon.url} 
                                alt={sub.name} 
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-700 rounded-md text-sm">
                                {sub.name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <span className="flex-1 text-sm sm:text-base">{sub.name}</span>
                          {getSubcategoryChildren(subId).length > 0 && (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                      No subcategories found for this category
                    </div>
                  )
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                    Select a category first
                  </div>
                )}
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-100 py-2.5 px-3 border-b border-gray-300 text-sm font-medium">
                  Subcategories
                </div>
                {selectedSub ? (
                  subcategoryChildren.length > 0 ? (
                    subcategoryChildren.map((subChild) => {
                      const subChildId = getNormalizedId(subChild._id);
                      
                      return (
                        <div 
                          key={subChildId}
                          onClick={() => handleCategorySelect(subChildId)}
                          className="flex items-center p-3 cursor-pointer border-b border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 mr-3 flex-shrink-0">
                            {subChild.icon && subChild.icon.url ? (
                              <img 
                                src={subChild.icon.url} 
                                alt={subChild.name} 
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-700 rounded-md text-sm">
                                {subChild.name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <span className="flex-1 text-sm sm:text-base">{subChild.name}</span>
                          {getSubcategoryChildren(subChildId).length > 0 && (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm sm:text-base mb-3">No further subcategories available</p>
                      <button
                        onClick={() => handleCategorySelect(getNormalizedId(selectedSub._id))}
                        className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
                      >
                        Continue with {selectedSub.name}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
                    Select a subcategory first
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hierarchicalCategories.map((parent) => {
                const subcategoriesCount = parent.children ? parent.children.length : 0;
                const parentId = getNormalizedId(parent._id);
                
                return (
                  <div 
                    key={parentId} 
                    className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:bg-primary-light transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                    onClick={() => handleParentClick(parent)}
                  >
                    <div className="p-4 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white border border-gray-300">
                        {parent.icon && parent.icon.url ? (
                          <img 
                            src={parent.icon.url} 
                            alt={parent.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-lg">
                            {parent.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <H3 className="text-base sm:text-lg mb-1">{parent.name}</H3>
                        {subcategoriesCount > 0 ? (
                          <p className="text-sm text-gray-600">{subcategoriesCount} subcategories</p>
                        ) : (
                          <p className="text-primary-main text-sm font-medium">Select directly</p>
                        )}
                      </div>
                      {subcategoriesCount > 0 && (
                        <div className="text-gray-700">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostCategories;