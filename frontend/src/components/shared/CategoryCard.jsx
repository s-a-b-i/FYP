import { Leaf, Globe } from 'lucide-react';
import { H3 } from './Heading'; // Adjust the import path based on your file structure

const CategoryCard = ({ category, onSelect }) => {
  // Helper function to determine if icon is a URL
  const isUrl = (icon) => {
    if (typeof icon === 'string') {
      return icon.startsWith('http');
    } else if (icon && typeof icon === 'object' && icon.url) {
      return icon.url.startsWith('http');
    }
    return false;
  };

  // Get the icon source (URL or fallback content)
  const getIconSource = (icon) => {
    if (typeof icon === 'string') return icon;
    if (icon && typeof icon === 'object' && icon.url) return icon.url;
    return category.name?.charAt(0) || '?'; // Fallback to first letter of name or '?'
  };

  return (
    <div
      className="flex flex-col items-center gap-3 group cursor-pointer"
      onClick={() => onSelect(category.name)}
    >
      <div
        className={`w-24 h-24 rounded-full ${category.backgroundColor || 'bg-gray-100'} ${
          category.borderColor || 'border-gray-300'
        } border-2 flex items-center justify-center transition-transform duration-300
          hover:scale-110 hover:shadow-lg overflow-hidden`}
      >
        {isUrl(category.icon) ? (
          <img
            src={getIconSource(category.icon)}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">{getIconSource(category.icon)}</span>
        )}
      </div>

      <div className="flex flex-col items-center">
        <H3 className="font-medium text-gray-800">{category.name}</H3>
      </div>
    </div>
  );
};

export default CategoryCard;