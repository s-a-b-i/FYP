// components/sections/Categories.jsx
import CategoryCard from "../shared/CategoryCard";
import ItemCard from "../../pages/items/ItemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icons
import { useRef, useState } from "react";
import { H1, H3 } from "@/components/shared/Heading"; // Adjust the import path based on your file structure

const Categories = ({ categories, items, selectedCategory, setSelectedCategory }) => {
  // Create refs for each category's scroll container
  const scrollContainers = useRef({});
  
  // State to track scroll position for each category
  const [scrollStates, setScrollStates] = useState({});

  // Function to scroll horizontally
  const scroll = (categoryName, direction) => {
    const container = scrollContainers.current[categoryName];
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Function to update scroll state for a category
  const updateScrollState = (categoryName) => {
    const container = scrollContainers.current[categoryName];
    if (container) {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      
      setScrollStates(prev => ({
        ...prev,
        [categoryName]: { canScrollLeft, canScrollRight }
      }));
    }
  };

  return (
    <section className="container py-8 sm:py-12 lg:py-16">
      {/* Use H1 for the main heading */}
      <H1 className="text-center mb-8 sm:mb-12" withBorder={false}>
        Browse Sustainable Fashion
      </H1>
      
      {/* Categories cards wrapper */}
      <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-6 flex-wrap max-w-[280px] xs:max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16">
        {categories.map((category) => (
          <CategoryCard 
            key={category.name}
            category={category}
            onSelect={setSelectedCategory}
          />
        ))}
      </div>

      {/* Category sections */}
      {categories.map((category) => {
        const categoryItems = items.filter(item => item.category === category.name);
        const scrollState = scrollStates[category.name] || { canScrollLeft: false, canScrollRight: true };
        
        return (
          <section key={category.name} className="mb-8 sm:mb-12 lg:mb-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
              {/* Use H3 for the category heading */}
              <H3 className="flex items-center flex-wrap gap-2" withBorder={false}>
                <span className="flex items-center gap-1">
                  {/* Render the icon as an image if it's a URL */}
                  {category.icon.startsWith('http') ? (
                    <img 
                      src={category.icon} 
                      alt={category.name} 
                      className="w-6 h-6 object-cover rounded-full" // Adjust size and styling as needed
                    />
                  ) : (
                    // Fallback to emoji or text if it's not a URL
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  {category.name}
                </span>
                <Badge variant="secondary" className="ml-0 sm:ml-2">
                  {categoryItems.length} items
                </Badge>
              </H3>
              <Button 
                variant="outline" 
                className="text-sm w-full sm:w-auto"
              >
                View All {category.name}
              </Button>
            </div>

            {/* Horizontal scrollable items container with scroll buttons */}
            <div className="relative group">
              {/* Left scroll button */}
              <button
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border transition-opacity duration-300 ${
                  scrollState.canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => scroll(category.name, 'left')}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Right scroll button */}
              <button
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border transition-opacity duration-300 ${
                  scrollState.canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => scroll(category.name, 'right')}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Scrollable container */}
              <div 
                ref={el => scrollContainers.current[category.name] = el}
                className="overflow-x-auto hide-scrollbar scroll-smooth"
                onScroll={() => updateScrollState(category.name)}
              >
                <div className="flex gap-4 sm:gap-5 lg:gap-6 px-2 py-4">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="w-[280px] flex-shrink-0">
                      <ItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </section>
  );
};

export default Categories;