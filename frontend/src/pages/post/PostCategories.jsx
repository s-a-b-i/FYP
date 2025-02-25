import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Home,
  Repeat,
} from "lucide-react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { categoryAPI } from "@/api/category";
import { H1, H2, H3 } from "@/components/shared/Heading";
import { useAuthStore } from "@/store/authStore";

const PostCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use searchParams to handle query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const parentId = searchParams.get("parent");
  const itemType = searchParams.get("type"); // Get the item type from URL params

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated, redirect to login if not
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
          const categoriesArray =
            data.categories || data.data || Object.values(data);
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

        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate, location]);

  // Function to organize categories into parent-child hierarchy
  const organizeCategories = () => {
    if (!Array.isArray(categories)) {
      console.error("Categories is not an array:", categories);
      return [];
    }

    const parentCategories = categories.filter((cat) => cat && !cat.parent);

    return parentCategories.map((parent) => {
      const children = categories.filter(
        (child) =>
          child &&
          child.parent &&
          (child.parent.$oid === parent._id.$oid ||
            child.parent === parent._id ||
            child.parent === parent._id.$oid)
      );
      return { ...parent, children };
    });
  };

  const hierarchicalCategories = Array.isArray(categories)
    ? organizeCategories()
    : [];

  const handleParentClick = (parentId) => {
    // Preserve the type parameter when setting parent
    const updatedParams = { parent: parentId };
    if (itemType) {
      updatedParams.type = itemType;
    }
    setSearchParams(updatedParams);
  };

  const handleBackToParents = () => {
    // Preserve the type parameter when clearing parent
    if (itemType) {
      setSearchParams({ type: itemType });
    } else {
      setSearchParams({});
    }
  };

  const handleCategorySelect = (categoryId) => {
    // Navigate to attributes page with category and type parameters
    const params = new URLSearchParams();
    params.append("categoryId", categoryId);
    if (itemType) {
      params.append("type", itemType);
    }

    navigate(`/post/attributes/${categoryId}?${params.toString()}`);
  };

  // Function to get transaction type badge color
  const getTypeColor = (type) => {
    switch (type) {
      case "sell":
        return "bg-itemTypes-sell-bg text-itemTypes-sell-text";
      case "rent":
        return "bg-itemTypes-rent-bg text-itemTypes-rent-text";
      case "exchange":
        return "bg-itemTypes-exchange-bg text-itemTypes-exchange-text";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Function to get transaction type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "sell":
        return <ShoppingBag className="w-5 h-5" />;
      case "rent":
        return <Home className="w-5 h-5" />;
      case "exchange":
        return <Repeat className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (error)
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto bg-status-error-bg p-6 rounded-lg">
          <H2 className="text-status-error-text mb-2">
            Error Loading Categories
          </H2>
          <p className="text-status-error-text">{error}</p>
        </div>
      </div>
    );

  // Find the selected parent category if we're viewing subcategories
  const selectedParentCategory = parentId
    ? hierarchicalCategories.find(
        (parent) =>
          parent._id?.$oid === parentId ||
          parent._id === parentId ||
          parent.id === parentId
      )
    : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <H1 className="mb-4">Post Your Ad</H1>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium ${getTypeColor(
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

      {hierarchicalCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 max-w-2xl mx-auto">
          <div className="text-gray-500">
            No categories found or data format issue. Check console for details.
          </div>
        </div>
      ) : (
        <>
          {parentId && selectedParentCategory ? (
            // Subcategories view
            <div className="space-y-6">
              <button
                onClick={handleBackToParents}
                className="flex items-center text-primary-main hover:text-primary-hover transition-colors duration-200 mb-6 py-2 px-4 rounded-lg border border-transparent hover:border-primary-light"
              >
                <ChevronDown className="w-5 h-5 transform rotate-90 mr-2" />
                Back to all categories
              </button>

              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row items-center md:space-x-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50 mb-4 md:mb-0">
                    {selectedParentCategory.icon &&
                    selectedParentCategory.icon.url ? (
                      <img
                        src={selectedParentCategory.icon.url}
                        alt={selectedParentCategory.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary-dark font-bold text-2xl">
                        {selectedParentCategory.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <H2>{selectedParentCategory.name}</H2>
                    <p className="text-gray-600 mt-1">Parent Category</p>
                  </div>
                  <div className="mt-3 md:mt-0 px-4 py-2 bg-primary-light text-primary-dark rounded-full text-sm font-medium">
                    {selectedParentCategory.children?.length || 0} subcategories
                  </div>
                </div>
              </div>

              <H2 className="mb-6">Select a Subcategory</H2>

              {selectedParentCategory.children &&
              selectedParentCategory.children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedParentCategory.children.map((child) => (
                    <div
                      key={child._id?.$oid || child._id || child.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-main transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                      onClick={() =>
                        handleCategorySelect(
                          child._id?.$oid || child._id || child.id
                        )
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                          {child.icon && child.icon.url ? (
                            <img
                              src={child.icon.url}
                              alt={child.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary-dark font-bold text-xl">
                              {child.name?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <H3>{child.name}</H3>
                          <p className="text-primary-main mt-1 flex items-center">
                            Select
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">
                    No subcategories found for this parent category.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Parent categories view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hierarchicalCategories.map((parent) => (
                <div 
  key={parent._id?.$oid || parent._id || parent.id} 
  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:bg-primary-light transition-all duration-200 cursor-pointer"
  onClick={() => handleParentClick(parent._id?.$oid || parent._id || parent.id)}
>
  <div className="p-4 flex items-center space-x-4"> {/* Reduced padding from p-6 to p-4 */}
    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-white"> {/* Reduced size from w-20 h-20 to w-16 h-16 */}
      {parent.icon && parent.icon.url ? (
        <img 
          src={parent.icon.url} 
          alt={parent.name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-2xl">
          {parent.name?.charAt(0) || '?'}
        </div>
      )}
    </div>
    <div className="flex-1">
      <H3>{parent.name}</H3>
    </div>
    <div className="text-gray-800">
      <ChevronRight className="w-6 h-6" /> {/* Reduced size from w-8 h-8 to w-6 h-6 */}
    </div>
  </div>
</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostCategories;
