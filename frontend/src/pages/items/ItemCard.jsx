import { Heart, MapPin, Clock, Tag, Star, AlertTriangle, Repeat, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { H3 } from '@/components/shared/Heading';
import { useState } from 'react';

const ItemCard = ({ item }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const typeStyles = {
    sell: 'bg-blue-100 text-blue-800 border-blue-200',
    rent: 'bg-green-100 text-green-800 border-green-200',
    exchange: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const formatPrice = (price, currency = 'PKR') => {
    if (!price?.amount && price !== 0) return 'Contact for Price';
    const amount = price.amount || price;
    return currency === 'PKR' ? `Rs ${amount.toLocaleString()}` : `$${amount.toLocaleString()}`;
  };

  const formatRent = (rentDetails, currency = 'PKR') => {
    if (!rentDetails?.pricePerUnit || !rentDetails?.duration) return 'Contact for Details';
    const priceStr = `${currency === 'PKR' ? 'Rs' : '$'} ${rentDetails.pricePerUnit.toLocaleString()}`;
    const durationStr = `/${rentDetails.duration}`;
    return `${priceStr}${durationStr}`.trim();
  };

  const formatExchange = (exchangeDetails) => {
    if (exchangeDetails?.exchangeFor) return `Looking for: ${exchangeDetails.exchangeFor}`;
    if (exchangeDetails?.exchangePreferences) return `Prefers: ${exchangeDetails.exchangePreferences}`;
    return 'Open to Offers';
  };

  const locationText = item.location?.city && item.location?.neighborhood 
    ? `${item.location.neighborhood}, ${item.location.city}`
    : item.location?.address || 'Location not specified';

  return (
    <Link
      to={`/items/${item._id || item.id}`}
      className="block w-full transition-transform transform hover:scale-[1.02] duration-300"
    >
      <div className="relative bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-lg transition-all duration-300 flex flex-col h-full">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeStyles[item.type] || typeStyles.sell} shadow-sm`}
          >
            {item.type === 'sell' ? 'Sale' : item.type === 'rent' ? 'Rent' : 'Exchange'}
          </span>
          <button
            className={`p-1.5 rounded-full border transition-all ${
              isFavorite ? 'bg-red-100 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
            aria-label="Toggle favorite"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'hover:text-red-500'}`} />
          </button>
        </div>

        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={item.images?.[0]?.url || item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        <div className="p-4 flex-1 flex flex-col space-y-3">
          <H3 className="text-base font-semibold text-gray-900 truncate">
            {item.title}
          </H3>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center truncate max-w-[60%]">
              <MapPin className="w-4 h-4 mr-1 text-gray-500 flex-shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500 flex-shrink-0" />
              <span>{item.timeAgo || 'Recently'}</span>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 pt-2 flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              {item.type === 'sell' && (
                <>
                  <Tag className="w-4 h-4 mr-1 text-blue-600" />
                  <span className="font-medium">Price</span>
                </>
              )}
              {item.type === 'rent' && (
                <>
                  <Calendar className="w-4 h-4 mr-1 text-green-600" />
                  <span className="font-medium">Rent</span>
                </>
              )}
              {item.type === 'exchange' && (
                <>
                  <Repeat className="w-4 h-4 mr-1 text-purple-600" />
                  <span className="font-medium">Exchange</span>
                </>
              )}
            </div>
            <div className="font-semibold text-gray-900 text-base truncate max-w-[60%]">
              {item.type === 'sell' && formatPrice(item.price, item.currency || 'PKR')}
              {item.type === 'rent' && formatRent(item.rentDetails, item.currency || 'PKR')}
              {item.type === 'exchange' && formatExchange(item.exchangeDetails)}
            </div>
          </div>

          {(item.visibility?.featured || item.visibility?.urgent) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.visibility?.featured && (
                <div className="flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded text-xs font-medium">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                  <span>Featured</span>
                </div>
              )}
              {item.visibility?.urgent && (
                <div className="flex items-center px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded text-xs font-medium">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
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