import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { H3 } from '@/components/shared/Heading';

const RelatedProductCard = ({ product }) => {
  const typeStyles = {
    sell: 'bg-blue-100 text-blue-800 border-blue-200',
    rent: 'bg-green-100 text-green-800 border-emerald-200',
    exchange: 'bg-purple-100 text-purple-800 border-violet-200'
  };

  return (
    <Link to={`/items/${product.id}`} className="block">
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1.5">
        {/* Top-right badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border ${typeStyles[product.type]}`}>
            {product.type === 'sell' && '🏷️ For Sale'}
            {product.type === 'rent' && '🔄 For Rent'}
            {product.type === 'exchange' && '↔️ Exchange'}
          </span>
        </div>

        {/* Image container with hover effect */}
        <div className="relative h-40 overflow-hidden rounded-t-xl">
          <div className="w-full h-full transform transition-transform duration-300 hover:scale-110">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Similarity score badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
              ✨ {product.similarityScore}% Match
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Title and price */}
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1.5">
              <H3 className="line-clamp-1 hover:text-green-600 transition-colors">
                {product.title}
              </H3>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-300" />
                  {product.location}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-300" />
                  {product.timeAgo}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary-main">
                ${product.price?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {product.condition && (
              <span className="inline-block px-3 py-1 text-sm border border-gray-200 text-gray-700 rounded-full bg-gray-50">
                {product.condition}
              </span>
            )}
            {product.tags?.slice(0, 2).map((tag, index) => (
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

export default RelatedProductCard;