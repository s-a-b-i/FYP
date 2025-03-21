import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, MessageCircle, Share2, ChevronLeft, ChevronRight, Heart, Repeat, Calendar } from 'lucide-react';
import { itemAPI } from '@/api/item';
import RelatedItems from './RelatedItems';

const ItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setShowPhone(false);
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
    setShowPhone((prev) => !prev);
    if (!showPhone) {
      itemAPI.incrementItemStats(id, 'phone').catch(err => console.error('Failed to increment phone stat:', err));
    }
  };

  const handlePrevImage = () => {
    if (!item?.images?.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!item?.images?.length) return;
    setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-lg text-gray-600">Loading item details...</div></div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-red-500 text-center"><div className="text-lg font-medium mb-2">{error}</div><button className="text-blue-600 hover:underline" onClick={() => window.location.reload()}>Try again</button></div></div>;
  if (!item) return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-gray-600 text-center"><div className="text-lg font-medium mb-2">Item not found</div><button className="text-blue-600 hover:underline" onClick={() => window.history.back()}>Go back</button></div></div>;

  const phoneNumber = item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available';
  const images = item.images || [];
  const currentImage = images.length ? images[currentImageIndex]?.url : null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not specified';
    return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRent = (rentDetails, currency = 'Rs') => {
    if (!rentDetails?.pricePerUnit || !rentDetails?.duration) return 'Contact for Details';
    const priceStr = `${currency === 'Rs' ? 'Rs' : '$'} ${rentDetails.pricePerUnit.toLocaleString()}`;
    const durationStr = `/${rentDetails.duration}`;
    return `${priceStr}${durationStr}`.trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Section */}
          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-10 bg-white">
                {currentImage ? (
                  <img src={currentImage} alt={item.title} className="w-full h-[400px] object-contain" />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center text-gray-400">No image available</div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 shadow-md" aria-label="Previous image"><ChevronLeft size={20} /></button>
                  <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 shadow-md" aria-label="Next image"><ChevronRight size={20} /></button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, index) => (
                      <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 ${index === currentImageIndex ? 'bg-blue-600' : 'bg-white/60'}`} aria-label={`Go to image ${index + 1}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="p-2 flex overflow-x-auto gap-2 border-t border-gray-200">
                {images.map((image, index) => (
                  <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'}`}>
                    <img src={image.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details Card */}
          <div className="space-y-5 overflow-y-auto">
            <div className="border border-gray-200 p-4 bg-white">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs font-medium ${item.type === 'sell' ? 'bg-blue-100 text-blue-800' : ''} ${item.type === 'rent' ? 'bg-green-100 text-green-800' : ''} ${item.type === 'exchange' ? 'bg-purple-100 text-purple-800' : ''}`}>
                      {item.type === 'sell' && 'For Sale'}
                      {item.type === 'rent' && 'For Rent'}
                      {item.type === 'exchange' && 'Exchange'}
                    </span>
                    {item.visibility?.featured && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">Featured</span>}
                    {item.visibility?.urgent && <span className="bg-red-100 text-red-800 px-3 py-1 text-xs font-medium">Urgent</span>}
                  </div>
                  {item.type === 'exchange' ? (
                    <div className="space-y-2">
                      <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-6 h-6 text-purple-600" />
                          <span className="text-2xl font-bold text-black">Exchange Offer</span>
                        </div>
                        {item.exchangeDetails?.exchangeFor && <p className="text-gray-700">Looking for: {item.exchangeDetails.exchangeFor}</p>}
                        {item.exchangeDetails?.preferredSizes?.length > 0 && <p className="text-gray-700">Preferred Sizes: {item.exchangeDetails.preferredSizes.join(', ')}</p>}
                        {item.exchangeDetails?.preferredCondition && <p className="text-gray-700">Preferred Condition: {item.exchangeDetails.preferredCondition}</p>}
                        {item.exchangeDetails?.preferredBrands?.length > 0 && <p className="text-gray-700">Preferred Brands: {item.exchangeDetails.preferredBrands.join(', ')}</p>}
                        {item.exchangeDetails?.exchangePreferences && <p className="text-gray-700">Preferences: {item.exchangeDetails.exchangePreferences}</p>}
                        {item.exchangeDetails?.shippingPreference && <p className="text-gray-700">Shipping: {item.exchangeDetails.shippingPreference}</p>}
                      </div>
                    </div>
                  ) : item.type === 'rent' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-green-600" />
                        <h2 className="text-3xl font-bold text-black">
                          {formatRent(item.rentDetails, item.price?.currency || 'Rs')}
                        </h2>
                        {item.price?.negotiable && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1">Negotiable</span>}
                      </div>
                      <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-3xl font-bold text-black">
                          {item.price?.currency === 'Rs' ? `Rs ${item.price.amount?.toLocaleString() || 'Contact for Price'}` : `$${item.price.amount?.toLocaleString() || 'Contact for Price'}`}
                        </h2>
                        {item.price?.negotiable && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1">Negotiable</span>}
                      </div>
                      <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={toggleFavorite} className="p-2 hover:bg-gray-100">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                  </button>
                  <button className="p-2 hover:bg-gray-100"><Share2 className="w-5 h-5 text-gray-600" /></button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{item.location?.address || 'Unknown'}</span></div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{formatTimeAgo(item.createdAt)}</span></div>
              </div>
            </div>

            <div className="border border-gray-200 p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex"><div className="w-1/3 text-gray-500">Condition</div><div className="w-2/3 font-medium">{item.condition || 'Not specified'}</div></div>
                {item.category?.name && <div className="flex"><div className="w-1/3 text-gray-500">Category</div><div className="w-2/3 font-medium">{item.category.name}</div></div>}
                {item.sex && <div className="flex"><div className="w-1/3 text-gray-500">Gender</div><div className="w-2/3 font-medium">{item.sex}</div></div>}
                {item.size && <div className="flex"><div className="w-1/3 text-gray-500">Size</div><div className="w-2/3 font-medium">{item.size}</div></div>}
                {item.material && <div className="flex"><div className="w-1/3 text-gray-500">Material</div><div className="w-2/3 font-medium">{item.material}</div></div>}
                {item.brand && <div className="flex"><div className="w-1/3 text-gray-500">Brand</div><div className="w-2/3 font-medium">{item.brand}</div></div>}
                {item.color && <div className="flex"><div className="w-1/3 text-gray-500">Color</div><div className="w-2/3 font-medium">{item.color}</div></div>}
                {item.type === 'rent' && (
                  <>
                    {item.rentDetails?.duration && <div className="flex"><div className="w-1/3 text-gray-500">Rental Duration</div><div className="w-2/3 font-medium">{item.rentDetails.duration}</div></div>}
                    {item.rentDetails?.securityDeposit && <div className="flex"><div className="w-1/3 text-gray-500">Security Deposit</div><div className="w-2/3 font-medium">Rs {item.rentDetails.securityDeposit.toLocaleString()}</div></div>}
                    {item.rentDetails?.availabilityDate && <div className="flex"><div className="w-1/3 text-gray-500">Available From</div><div className="w-2/3 font-medium">{formatDate(item.rentDetails.availabilityDate)}</div></div>}
                    {item.rentDetails?.cleaningFee && <div className="flex"><div className="w-1/3 text-gray-500">Cleaning Fee</div><div className="w-2/3 font-medium">Rs {item.rentDetails.cleaningFee.toLocaleString()}</div></div>}
                    {item.rentDetails?.lateFee && <div className="flex"><div className="w-1/3 text-gray-500">Late Fee</div><div className="w-2/3 font-medium">Rs {item.rentDetails.lateFee.toLocaleString()}</div></div>}
                    {item.rentDetails?.careInstructions && <div className="flex"><div className="w-1/3 text-gray-500">Care Instructions</div><div className="w-2/3 font-medium">{item.rentDetails.careInstructions}</div></div>}
                    {item.rentDetails?.sizeAvailability?.length > 0 && (
                      <div className="flex"><div className="w-1/3 text-gray-500">Sizes Available</div><div className="w-2/3 font-medium">{item.rentDetails.sizeAvailability.map(s => `${s.size} (${s.quantity})`).join(', ')}</div></div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="border border-gray-200 p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 overflow-y-auto">
          <div className="bg-white border border-gray-200 shadow-sm p-5 space-y-5 sticky">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img src={item.seller?.avatar || '/default-avatar.png'} alt="Seller" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
              <div>
                <h3 className="font-semibold text-gray-900">{item.contactInfo?.name || item.seller?.name || 'Private User'}</h3>
                <p className="text-xs text-gray-500">Member since {item.seller?.memberSince || 'Unknown'}</p>
                <a href="#" className="text-xs text-blue-600 hover:underline">View profile</a>
              </div>
            </div>
            <div className="space-y-3">
              {(item.contactInfo?.showPhoneNumber === true || showPhone) ? (
                <div className="w-full bg-green-50 text-green-700 py-2.5 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span className="font-medium">{phoneNumber}</span></div>
                  <a href={`tel:${phoneNumber}`} className="text-xs text-green-700 hover:underline">Call</a>
                </div>
              ) : (
                <button onClick={handleShowPhone} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                  <Phone className="w-4 h-4" />
                  {showPhone ? 'Hide phone number' : 'Show phone number'}
                </button>
              )}
              <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                <MessageCircle className="w-4 h-4" /> Message seller
              </button>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Location</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>{item.location?.address || 'Unknown'}</span></div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Safety Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1"><li>• Meet in a public place</li><li>• Check the item before paying</li><li>• Pay only after inspecting the item</li></ul>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">AD ID: {item._id?.substring(0, 8) || 'Unknown'}</span>
              <button className="text-blue-600 hover:underline">Report this ad</button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8"><RelatedItems currentItem={item} /></div>
    </div>
  );
};

function formatTimeAgo(date) {
  if (!date) return 'Recently';
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  if (diffInHours < 1) return `${Math.floor(diffInMs / (1000 * 60))}m ago`;
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  const diffInDays = diffInHours / 24;
  if (diffInDays < 30) return `${Math.floor(diffInDays)}d ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
}

export default ItemDetail;