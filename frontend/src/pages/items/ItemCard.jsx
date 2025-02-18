import { Heart, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { H3 } from '@/components/shared/Heading';

const ItemCard = ({ item }) => {
  const typeStyles = {
    sell: 'bg-blue-100 text-blue-800 border-blue-200',
    rent: 'bg-green-100 text-green-800 border-emerald-200',
    exchange: 'bg-purple-100 text-purple-800 border-violet-200'
  };

  return (
    <Link to={`/items/${item.id}`} className="block">
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1.5">
        {/* Top-right badges and favorite button */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border ${typeStyles[item.type]}`}>
            {item.type === 'sell' && '🏷️ For Sale'}
            {item.type === 'rent' && '🔄 For Rent'}
            {item.type === 'exchange' && '↔️ Exchange'}
          </span>
          <button 
            className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
            aria-label="Add to favorites"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-5 h-5 text-gray-300 group-hover:text-primary-main transition-colors" />
          </button>
        </div>

        {/* Image container with hover effect */}
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <div className="w-full h-full transform transition-transform duration-300 hover:scale-110">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Sustainability score badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-primary-main/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
              🌿 {item.sustainabilityScore}/10
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Title, location, and time */}
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1.5">
              <H3 className="line-clamp-1 hover:text-primary-main transition-colors">
                {item.title}
              </H3>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-300" />
                  {item.location}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-300" />
                  {item.timeAgo}
                </span>
              </div>
            </div>
            {/* Price section */}
            <div className="text-right">
              <div className="font-bold text-primary-main">
                ${item.price?.toLocaleString()}
              </div>

            </div>
          </div>

          {/* Tags and condition */}
          <div className="flex gap-2 flex-wrap">
            {item.condition && (
              <span className="inline-block px-3 py-1 text-sm border border-gray-200 text-gray-700 rounded-full bg-gray-50">
                {item.condition}
              </span>
            )}
            {item.tags?.map((tag, index) => (
              <span 
                key={index}
                className="inline-block px-3 py-1 text-sm border border-gray-200 text-gray-700 rounded-full bg-gray-50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;