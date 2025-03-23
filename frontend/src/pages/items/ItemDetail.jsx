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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-start px-4 sm:px-6 lg:px-8"><div className="animate-pulse text-lg text-gray-600">Loading item details...</div></div>;
  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-start px-4 sm:px-6 lg:px-8">
      <div className="text-red-500">
        <div className="text-lg font-medium mb-2">{error}</div>
        <button className="text-blue-600 hover:underline" onClick={() => window.location.reload()}>Try again</button>
      </div>
    </div>
  );
  if (!item) return (
    <div className="min-h-[60vh] flex items-center justify-start px-4 sm:px-6 lg:px-8">
      <div className="text-gray-600">
        <div className="text-lg font-medium mb-2">Item not found</div>
        <button className="text-blue-600 hover:underline" onClick={() => window.history.back()}>Go back</button>
      </div>
    </div>
  );

  const phoneNumber = item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available';
  const images = item.images || [];
  const currentImage = images.length ? images[currentImageIndex]?.url : null;
  const locationText = item.location?.city && item.location?.neighborhood 
    ? `${item.location.neighborhood}, ${item.location.city}` 
    : 'Location not specified';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images and Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery Section */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 bg-white">
                {currentImage ? (
                  <img src={currentImage} alt={item.title} className="w-full h-[450px] object-contain" />
                ) : (
                  <div className="w-full h-[450px] flex items-center justify-center text-gray-400">No image available</div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md transition-colors" aria-label="Previous image">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md transition-colors" aria-label="Next image">
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, index) => (
                      <button 
                        key={index} 
                        onClick={() => setCurrentImageIndex(index)} 
                        className={`w-2.5 h-2.5 rounded-full ${index === currentImageIndex ? 'bg-blue-600' : 'bg-white/70 hover:bg-white/90'}`} 
                        aria-label={`Go to image ${index + 1}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="p-3 flex overflow-x-auto gap-3 border-t border-gray-200">
                {images.map((image, index) => (
                  <button 
                    key={index} 
                    onClick={() => setCurrentImageIndex(index)} 
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={image.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details Card */}
          <div className="space-y-6">
            <div className="border border-gray-200 p-6 bg-white rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${item.type === 'sell' ? 'bg-blue-100 text-blue-800' : ''} ${item.type === 'rent' ? 'bg-green-100 text-green-800' : ''} ${item.type === 'exchange' ? 'bg-purple-100 text-purple-800' : ''}`}>
                      {item.type === 'sell' && 'For Sale'}
                      {item.type === 'rent' && 'For Rent'}
                      {item.type === 'exchange' && 'Exchange'}
                    </span>
                    {item.visibility?.featured && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-medium rounded-full">Featured</span>}
                    {item.visibility?.urgent && <span className="bg-red-100 text-red-800 px-3 py-1 text-sm font-medium rounded-full">Urgent</span>}
                  </div>
                  {item.type === 'exchange' ? (
                    <div className="space-y-3">
                      <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-6 h-6 text-purple-600" />
                          <span className="text-xl font-semibold text-gray-900">Exchange Offer</span>
                        </div>
                        {item.exchangeDetails?.exchangeFor && <p className="text-gray-700"><span className="font-medium">Looking for:</span> {item.exchangeDetails.exchangeFor}</p>}
                        {item.exchangeDetails?.preferredSizes?.length > 0 && <p className="text-gray-700"><span className="font-medium">Preferred Sizes:</span> {item.exchangeDetails.preferredSizes.join(', ')}</p>}
                        {item.exchangeDetails?.preferredCondition && <p className="text-gray-700"><span className="font-medium">Preferred Condition:</span> {item.exchangeDetails.preferredCondition}</p>}
                        {item.exchangeDetails?.preferredBrands?.length > 0 && <p className="text-gray-700"><span className="font-medium">Preferred Brands:</span> {item.exchangeDetails.preferredBrands.join(', ')}</p>}
                        {item.exchangeDetails?.exchangePreferences && <p className="text-gray-700"><span className="font-medium">Preferences:</span> {item.exchangeDetails.exchangePreferences}</p>}
                        {item.exchangeDetails?.shippingPreference && <p className="text-gray-700"><span className="font-medium">Shipping:</span> {item.exchangeDetails.shippingPreference}</p>}
                      </div>
                    </div>
                  ) : item.type === 'rent' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-green-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                          {formatRent(item.rentDetails, item.price?.currency || 'Rs')}
                        </h2>
                        {item.price?.negotiable && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Negotiable</span>}
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {item.price?.currency === 'Rs' ? `Rs ${item.price.amount?.toLocaleString() || 'Contact for Price'}` : `$${item.price.amount?.toLocaleString() || 'Contact for Price'}`}
                        </h2>
                        {item.price?.negotiable && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Negotiable</span>}
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{locationText}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{formatTimeAgo(item.createdAt)}</span></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={toggleFavorite} className="p-2 hover:bg-gray-100 rounded-full" aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <Heart className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Share item">
                    <Share2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="border border-gray-200 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex"><span className="w-1/3 text-gray-500">Condition:</span><span className="w-2/3 font-medium">{item.condition || 'Not specified'}</span></div>
                {item.category?.name && <div className="flex"><span className="w-1/3 text-gray-500">Category:</span><span className="w-2/3 font-medium">{item.category.name}</span></div>}
                {item.sex && <div className="flex"><span className="w-1/3 text-gray-500">Gender:</span><span className="w-2/3 font-medium">{item.sex}</span></div>}
                {item.size && <div className="flex"><span className="w-1/3 text-gray-500">Size:</span><span className="w-2/3 font-medium">{item.size}</span></div>}
                {item.material && <div className="flex"><span className="w-1/3 text-gray-500">Material:</span><span className="w-2/3 font-medium">{item.material}</span></div>}
                {item.brand && <div className="flex"><span className="w-1/3 text-gray-500">Brand:</span><span className="w-2/3 font-medium">{item.brand}</span></div>}
                {item.color && <div className="flex"><span className="w-1/3 text-gray-500">Color:</span><span className="w-2/3 font-medium">{item.color}</span></div>}
                {item.type === 'rent' && (
                  <>
                    {item.rentDetails?.duration && <div className="flex"><span className="w-1/3 text-gray-500">Rental Duration:</span><span className="w-2/3 font-medium">{item.rentDetails.duration}</span></div>}
                    {item.rentDetails?.securityDeposit && <div className="flex"><span className="w-1/3 text-gray-500">Security Deposit:</span><span className="w-2/3 font-medium">Rs {item.rentDetails.securityDeposit.toLocaleString()}</span></div>}
                    {item.rentDetails?.availabilityDate && <div className="flex"><span className="w-1/3 text-gray-500">Available From:</span><span className="w-2/3 font-medium">{formatDate(item.rentDetails.availabilityDate)}</span></div>}
                    {item.rentDetails?.cleaningFee && <div className="flex"><span className="w-1/3 text-gray-500">Cleaning Fee:</span><span className="w-2/3 font-medium">Rs {item.rentDetails.cleaningFee.toLocaleString()}</span></div>}
                    {item.rentDetails?.lateFee && <div className="flex"><span className="w-1/3 text-gray-500">Late Fee:</span><span className="w-2/3 font-medium">Rs {item.rentDetails.lateFee.toLocaleString()}</span></div>}
                    {item.rentDetails?.careInstructions && <div className="flex"><span className="w-1/3 text-gray-500">Care Instructions:</span><span className="w-2/3 font-medium">{item.rentDetails.careInstructions}</span></div>}
                    {item.rentDetails?.sizeAvailability?.length > 0 && (
                      <div className="flex"><span className="w-1/3 text-gray-500">Sizes Available:</span><span className="w-2/3 font-medium">{item.rentDetails.sizeAvailability.map(s => `${s.size} (${s.quantity})`).join(', ')}</span></div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="border border-gray-200 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{item.description || 'No description provided'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Seller Info */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg space-y-6 sticky top-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <img 
                src={item.seller?.avatar || '/default-avatar.png'} 
                alt="Seller" 
                className="w-14 h-14 rounded-full object-cover border border-gray-200" 
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{item.contactInfo?.name || item.seller?.name || 'Private User'}</h3>
                <p className="text-sm text-gray-500">Member since {item.seller?.memberSince || 'Unknown'}</p>
                <a href="#" className="text-sm text-blue-600 hover:underline">View profile</a>
              </div>
            </div>
            <div className="space-y-4">
              {(item.contactInfo?.showPhoneNumber === true || showPhone) ? (
                <div className="w-full bg-green-50 text-green-700 py-3 px-4 flex items-center justify-between rounded-md">
                  <div className="flex items-center gap-2"><Phone className="w-5 h-5" /><span className="font-medium">{phoneNumber}</span></div>
                  <a href={`tel:${phoneNumber}`} className="text-sm text-green-700 hover:underline">Call</a>
                </div>
              ) : (
                <button 
                  onClick={handleShowPhone} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 flex items-center justify-center gap-2 rounded-md transition-colors text-sm font-medium"
                >
                  <Phone className="w-5 h-5" />
                  {showPhone ? 'Hide phone number' : 'Show phone number'}
                </button>
              )}
              <button 
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 flex items-center justify-center gap-2 rounded-md transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-5 h-5" /> Message Seller
              </button>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Location</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span>{locationText}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Safety Tips</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></span> Meet in a public place</li>
                <li className="flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></span> Check the item before paying</li>
                <li className="flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></span> Pay only after inspecting the item</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">AD ID: {item._id?.substring(0, 8) || 'Unknown'}</span>
              <button className="text-blue-600 hover:underline">Report this ad</button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <RelatedItems currentItem={item} />
      </div>
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