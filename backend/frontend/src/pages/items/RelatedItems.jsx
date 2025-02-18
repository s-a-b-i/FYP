// src/pages/items/RelatedItems.jsx
import { useState, useEffect, useRef } from 'react';
import RelatedProductCard from './RelatedProductCard';
import { items } from '@/utils/data/mockData';
import { H2 } from '@/components/shared/Heading';
import { ChevronLeft, ChevronRight } from "lucide-react";

const RelatedItems = ({ currentItem }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const scrollContainer = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true
  });

  useEffect(() => {
    const filtered = items
      .filter(item => 
        item.category === currentItem.category && 
        item.id !== currentItem.id
      );

    const withSimilarity = filtered.map(item => ({
      ...item,
      similarityScore: calculateSimilarityScore(currentItem, item)
    }));

    setRelatedProducts(withSimilarity);
  }, [currentItem]);

  const calculateSimilarityScore = (current, related) => {
    let score = 0;
    if (current.category === related.category) score += 40;
    const priceRange = Math.abs(current.price - related.price) / current.price;
    if (priceRange <= 0.2) score += 30;
    if (current.condition === related.condition) score += 20;
    if (current.type === related.type) score += 10;
    return Math.min(score, 100);
  };

  // Scroll functions
  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const updateScrollState = () => {
    if (scrollContainer.current) {
      const canScrollLeft = scrollContainer.current.scrollLeft > 0;
      const canScrollRight = scrollContainer.current.scrollLeft < 
        (scrollContainer.current.scrollWidth - scrollContainer.current.clientWidth);
      
      setScrollState({ canScrollLeft, canScrollRight });
    }
  };

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <H2 className="mb-6">Related Items</H2>
      
      {/* Scrollable container with buttons */}
      <div className="relative group">
        {/* Left scroll button */}
        <button
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border transition-opacity duration-300 ${
            scrollState.canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right scroll button */}
        <button
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border transition-opacity duration-300 ${
            scrollState.canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Scrollable container */}
        <div 
          ref={scrollContainer}
          className="overflow-x-auto hide-scrollbar scroll-smooth"
          onScroll={updateScrollState}
        >
          <div className="flex gap-4 sm:gap-5 lg:gap-6 px-2 py-4">
            {relatedProducts.map(product => (
              <div key={product.id} className="w-[280px] flex-shrink-0">
                <RelatedProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatedItems;