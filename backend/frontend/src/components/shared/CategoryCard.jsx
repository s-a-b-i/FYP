import { Leaf, Globe } from 'lucide-react';
import { H3 } from './Heading'; // Adjust the import path based on your file structure

const CategoryCard = ({ category, onSelect }) => {
  return (
    <div
      className="flex flex-col items-center gap-3 group cursor-pointer"
      onClick={() => onSelect(category.name)}
    >
      <div 
        className={`w-24 h-24 rounded-full ${category.backgroundColor} ${category.borderColor} border-2
          flex items-center justify-center transition-transform duration-300
          hover:scale-110 hover:shadow-lg overflow-hidden`} // Added overflow-hidden
      >
        {/* Use an <img> tag if the icon is a URL */}
        {category.icon.startsWith('http') ? (
          <img 
            src={category.icon} 
            alt={category.name} 
            className="w-full h-full object-cover" // Ensure the image fits and covers the container
          />
        ) : (
          // Fallback to emoji or text if it's not a URL
          <span className="text-4xl">{category.icon}</span>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        <H3 className="font-medium text-gray-800">{category.name}</H3>
        {/* <div className="flex flex-col items-center text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Leaf className="w-4 h-4 text-green-500" />
            Saves {category.savedWater}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-blue-500" />
            {category.savedCO2} CO₂
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default CategoryCard;