import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, MessageCircle, Plus } from 'lucide-react';
import { itemAPI } from '@/api/item'; // Adjust the import path based on your project structure
import RelatedItems from './RelatedItems';

const ItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false); // State to toggle phone number visibility

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await itemAPI.getItemById(id);
        setItem(response.data);
        window.scrollTo(0, 0);
      } catch (err) {
        setError('Failed to load item details');
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleShowPhone = () => {
    setShowPhone(true);
    // Increment phone stat when revealing the number
    itemAPI.incrementItemStats(id, 'phone').catch(err => console.error('Failed to increment phone stat:', err));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!item) return <div>Item not found</div>;

  // Get the phone number based on contactInfo
  const phoneNumber = item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 space-y-8">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="aspect-w-1 aspect-h-1">
                  <img 
                    src={item.images?.find(img => img.isMain)?.url || item.images[0]?.url} 
                    alt={item.title} 
                    className="w-full h-[500px] object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                  <div className="flex gap-2">
                    {/* Featured/Urgent Badges - Moved here */}
                    {item.visibility?.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Featured
                      </span>
                    )}
                    {item.visibility?.urgent && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        🔥 Urgent
                      </span>
                    )}
                    {/* Item Type Badge */}
                    <span className={`
                      px-4 py-2 rounded-full font-medium shadow-sm
                      ${item.type === 'sell' ? 'bg-blue-100 text-blue-800' : ''}
                      ${item.type === 'rent' ? 'bg-green-100 text-green-800' : ''}
                      ${item.type === 'exchange' ? 'bg-purple-100 text-purple-800' : ''}
                    `}>
                      {item.type === 'sell' && '🏷️ For Sale'}
                      {item.type === 'rent' && '🔄 For Rent'}
                      {item.type === 'exchange' && '↔️ Exchange'}
                    </span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {item.type === 'exchange' ? (
                    <div className="space-y-2">
                      <span className="text-xl font-bold text-purple-600">Exchange Offer</span>
                      {item.exchangeDetails?.exchangeFor && (
                        <p className="text-gray-700">Looking for: {item.exchangeDetails.exchangeFor}</p>
                      )}
                      {item.exchangeDetails?.exchangePreferences && (
                        <p className="text-gray-700">Preferences: {item.exchangeDetails.exchangePreferences}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-4">
                      <span className="text-3xl font-bold text-green-600">
                        {item.price?.currency === 'Rs' 
                          ? `Rs. ${item.price.amount?.toLocaleString() || 'Contact for Price'}` 
                          : `$${item.price.amount?.toLocaleString() || 'Contact for Price'}`}
                      </span>
                      {item.price?.negotiable && (
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Negotiable</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Location and Time Section */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{item.location?.address || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {/* Item Details Grid */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Item Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Category</p>
                      <p className="font-medium text-gray-900">{item.category?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Condition</p>
                      <p className="font-medium text-gray-900">{item.condition || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Gender</p>
                      <p className="font-medium text-gray-900">{item.sex || 'Unisex'}</p>
                    </div>
                    {item.type === 'rent' && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm mb-1">Rental Period</p>
                        <p className="font-medium text-gray-900">{item.rentalPeriod || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold border-b pb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 sticky top-8">
            <div className="flex items-center gap-4">
              <img 
                src={item.seller?.avatar || '/default-avatar.png'} 
                alt="Seller" 
                className="w-16 h-16 rounded-full border border-gray-200"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.contactInfo?.name || item.seller?.name || 'Private User'}</h3>
                <p className="text-sm text-gray-500">Member since {item.seller?.memberSince || 'Unknown'}</p>
                <a href="#" className="text-blue-600 text-sm hover:underline">See profile</a>
              </div>
            </div>

            <div className="space-y-4">
              {/* Show Phone Number Button */}
              {(item.contactInfo?.showPhoneNumber !== false || showPhone) ? (
                <div className="w-full bg-green-100 text-green-800 py-3 rounded-lg flex items-center justify-center gap-2 font-bold">
                  <Phone className="w-5 h-5" />
                  <span>{phoneNumber}</span>
                </div>
              ) : (
                <button 
                  onClick={handleShowPhone}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Show phone number
                </button>
              )}
              
              <button className="w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Location</h4>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{item.location?.address || 'Unknown'}</span>
              </div>
            </div>

            {/* Stats Section */}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">AD ID {item._id}</span>
                <button className="text-blue-600 text-sm hover:underline">Report this ad</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RelatedItems currentItem={item} />
    </div>
  );
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    const diffInDays = diffInHours / 24;
    return `${Math.floor(diffInDays)}d ago`;
  }
}

export default ItemDetail;