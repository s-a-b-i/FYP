// src/pages/post/PostCategories.jsx
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ChevronRight } from 'lucide-react';
import { clothingCategories } from '@/utils/data/mockData'; // Import the clothingCategories array
import { H1, H2 } from '@/components/shared/Heading'; // Import the Heading components

const PostCategories = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  // Use the clothingCategories array directly
  const categories = useMemo(() => {
    return clothingCategories.map((category) => ({
      id: category.name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'),
      name: category.name,
      image: category.icon, // Use the icon URL as the image
      savedWater: category.savedWater,
      savedCO2: category.savedCO2,
      backgroundColor: category.backgroundColor,
      borderColor: category.borderColor,
    }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!type) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate, type]);

  const handleCategorySelect = (categoryId) => {
    navigate(`/post/attributes/${categoryId}?type=${type}`);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'sell':
        return 'bg-itemTypes-sell-bg text-itemTypes-sell-text';
      case 'rent':
        return 'bg-itemTypes-rent-bg text-itemTypes-rent-text';
      case 'exchange':
        return 'bg-purple-100 text-purple-800';
      default:
        return '';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'sell':
        return 'Sale';
      case 'rent':
        return 'Rental';
      case 'exchange':
        return 'Exchange';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <H1 className="mb-4 text-center text-foreground">POST YOUR AD</H1>
      <div className={`inline-block px-4 py-2 rounded-md mb-6 ${getTypeStyles()}`}>
        {getTypeLabel()} Listing
      </div>
      <H2 className="mb-8 text-gray-700">
        Choose a category for your {getTypeLabel().toLowerCase()} listing
      </H2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="group"
          >
            <div className={`${category.backgroundColor} rounded-lg border ${category.borderColor} hover:shadow-md transition-all duration-300 overflow-hidden`}>
              <div className="p-4 space-y-4">
                {/* Circular Image Container */}
                <div className="relative w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full border-2 border-primary group-hover:border-primary-hover transition-colors duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Category Name and Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-card-foreground flex-1 text-left">
                    {category.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
                </div>

             
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostCategories;