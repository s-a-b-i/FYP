import { Heart, MapPin, Clock, Tag, Star, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { H3 } from '@/components/shared/Heading';
import { useState } from 'react';

const ItemCard = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const typeStyles = {
    sell: 'bg-blue-50 text-blue-700 border-blue-300',
    rent: 'bg-green-50 text-green-700 border-green-300',
    exchange: 'bg-purple-50 text-purple-700 border-purple-300'
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
      className="block w-full transition-transform transform hover:scale-[1.01] duration-300"
    >
      <div className="relative bg-white border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 h-full overflow-hidden w-[300px] flex flex-col">
        
        {/* Badge & Favorite Button */}
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border ${typeStyles[item.type] || typeStyles.sell} shadow-sm`}
          >
            {item.type === 'sell' ? 'Sale' : item.type === 'rent' ? 'Rent' : 'Exchange'}
          </span>
          <button
            className={`p-1 shadow-sm border transition-all ${
              isFavorite ? 'bg-red-100 border-red-400 text-red-600' : 'bg-white border-gray-300 text-gray-500'
            } hover:bg-gray-100`}
            aria-label="Add to favorites"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'hover:text-red-600'}`} />
          </button>
        </div>

        {/* Image Container - 60% of card height */}
        <div className="relative h-[180px] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Content Section - 40% of card height */}
        <div className="p-3 flex-1 flex flex-col h-[120px]">
          
          {/* Title */}
          <H3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
            {item.title}
          </H3>

          {/* Location & Time */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <div className="flex items-center truncate max-w-[60%]">
              <MapPin className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
              <span>{item.timeAgo}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="pt-1 mt-auto border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-gray-500">
              <Tag className="w-3 h-3 mr-1 text-primary-main" />
              <span className="text-xs font-medium">Price</span>
            </div>
            <div className="font-bold text-primary-main text-base">
              {formatPrice(item.price, item.currency || 'PKR')}
            </div>
          </div>
          
          {/* Featured & Urgent Badges */}
          {(item.visibility?.featured || item.visibility?.urgent) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.visibility?.featured && (
                <div className="flex items-center px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-300 text-xs">
                  <Star className="w-3 h-3 mr-0.5 fill-yellow-500 text-yellow-500" />
                  <span>Featured</span>
                </div>
              )}
              {item.visibility?.urgent && (
                <div className="flex items-center px-2 py-0.5 bg-red-50 text-red-700 border border-red-300 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-0.5 text-red-500" />
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