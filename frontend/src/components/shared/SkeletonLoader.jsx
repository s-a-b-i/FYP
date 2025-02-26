// components/shared/SkeletonLoader.jsx
import React from "react";

const SkeletonLoader = ({ className, count = 1, type = "rectangle" }) => {
  const getSkeletonItem = (index) => {
    if (type === "circle") {
      return (
        <div 
          key={index}
          className={`rounded-full bg-gray-200 animate-pulse ${className}`}
        />
      );
    }
    
    if (type === "card") {
      return (
        <div key={index} className={`rounded-lg overflow-hidden animate-pulse ${className}`}>
          <div className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );
    }

    if (type === "text") {
      return (
        <div 
          key={index}
          className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}
        />
      );
    }

    // Default rectangle
    return (
      <div 
        key={index}
        className={`rounded bg-gray-200 animate-pulse ${className}`}
      />
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => getSkeletonItem(index))}
    </>
  );
};

export default SkeletonLoader;