import { Heart, MapPin, Clock, Tag, Star, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { H3 } from '@/components/shared/Heading';
import { useState } from 'react';

const ItemCard = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const typeStyles = {
    sell: 'bg-blue-50 text-blue-700 border-blue-200',
    rent: 'bg-green-50 text-green-700 border-green-200',
    exchange: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  // Format price with currency
  const formatPrice = (price, currency = 'PKR') => {
    if (!price) return 'Contact for Price';
    return currency === 'PKR'
      ? `Rs. ${price.toLocaleString()}`
      : `$${price.toLocaleString()}`;
  };

  return (
    <Link
      to={`/items/${item.id}`}
      className="block w-full transition-transform transform hover:scale-[1.02] duration-300"
    >
      <div className="relative bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full overflow-hidden">
        {/* Badge and favorite button */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${typeStyles[item.type] || typeStyles.sell} shadow-sm`}
          >
            {item.type === 'sell' ? '🏷️ For Sale' : item.type === 'rent' ? '🔄 For Rent' : '↔️ Exchange'}
          </span>
          <button
            className={`p-1.5 rounded-full shadow-md border transition-all ${
              isFavorite ? 'bg-red-100 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-400'
            }`}
            aria-label="Add to favorites"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'hover:text-primary-main'}`} />
          </button>
        </div>

        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        {/* Content section */}
        <div className="p-3">
          {/* Title */}
          <H3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {item.title}
          </H3>

          {/* Location and time */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center truncate">
              <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
              <span>{item.timeAgo}</span>
            </div>
          </div>

          {/* Price section */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-gray-500">
              <Tag className="w-4 h-4 mr-1 text-primary-main" />
              <span className="text-sm">Price</span>
            </div>
            <div className="font-bold text-primary-main text-lg">
              {formatPrice(item.price, item.currency || 'PKR')}
            </div>
          </div>
          
          {/* Featured and Urgent badges */}
          {(item.visibility?.featured || item.visibility?.urgent) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.visibility?.featured && (
                <div className="flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                  <span>Featured</span>
                </div>
              )}
              {item.visibility?.urgent && (
                <div className="flex items-center px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                  <span>Urgent</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;