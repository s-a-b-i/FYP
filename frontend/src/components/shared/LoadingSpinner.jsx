import React from "react";
import clsx from "clsx";

const sizeClasses = {
  sm: {
    spinner: "w-4 h-4",
    text: "text-xs"
  },
  md: {
    spinner: "w-6 h-6",
    text: "text-sm"
  },
  lg: {
    spinner: "w-8 h-8",
    text: "text-base"
  },
  xl: {
    spinner: "w-12 h-12",
    text: "text-lg"
  }
};

const LoadingSpinner = ({ size = "md", className, showText = true }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="flex flex-col items-center gap-2">
        <div
          className={clsx(
            "animate-spin rounded-full border-2",
            "border-white/30 border-t-transparent", // White spinner
            sizeClasses[size].spinner,
            className
          )}
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        {showText && (
          <p className={clsx(
            "text-white/70", // White text
            sizeClasses[size].text
          )}>
            Loading...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;