import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { items } from '@/utils/data/mockData';
import RelatedItems from './RelatedItems';

const ItemDetail = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    
    useEffect(() => {
      const foundItem = items.find(item => item.id === parseInt(id));
      setItem(foundItem);
      window.scrollTo(0, 0);
    }, [id]);

  if (!item) return <div>Item not found</div>;

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
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-[500px] object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
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

                {/* Price Section with enhanced styling */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-bold text-green-600">${item.price}</span>
                  </div>
                </div>

                {/* Location and Time Section */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{item.timeAgo}</span>
                  </div>
                </div>

                {/* Item Details Grid */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Item Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Category</p>
                      <p className="font-medium text-gray-900">{item.category}</p>
                    </div>

                    {/* Condition */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Condition</p>
                      <p className="font-medium text-gray-900">{item.condition}</p>
                    </div>

                    {/* Gender */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Gender</p>
                      <p className="font-medium text-gray-900">Unisex</p>
                    </div>

                    {/* Fabric */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Fabric</p>
                      <p className="font-medium text-gray-900">100% Cotton</p>
                    </div>

                    {/* Sustainability Score */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Sustainability Score</p>
                      <p className="font-medium text-gray-900">
                        🌿 {item.sustainabilityScore}/10
                      </p>
                    </div>

                    {/* Delivery */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm mb-1">Delivery Available</p>
                      <p className="font-medium text-gray-900">Yes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of the code remains the same */}
        {/* User Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 sticky top-8">
            <div className="flex items-center gap-4">
              <img 
                src={item.seller?.avatar || '/default-avatar.png'} 
                alt="Seller" 
                className="w-16 h-16 rounded-full border border-gray-200"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.seller?.name || 'Private User'}</h3>
                <p className="text-sm text-gray-500">Member since {item.seller?.memberSince || 'Dec 2014'}</p>
                <a href="#" className="text-blue-600 text-sm hover:underline">See profile</a>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Phone className="w-5 h-5" />
                Show phone number
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Location</h4>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{item.location}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">AD ID {item.id}</span>
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

export default ItemDetail;