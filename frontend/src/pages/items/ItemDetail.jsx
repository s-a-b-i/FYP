// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { MapPin, Clock, Phone, MessageCircle, Plus } from 'lucide-react';
// import { itemAPI } from '@/api/item'; // Adjust the import path based on your project structure
// import RelatedItems from './RelatedItems';

// const ItemDetail = () => {
//   const { id } = useParams();
//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showPhone, setShowPhone] = useState(false); // State to toggle phone number visibility

//   useEffect(() => {
//     const fetchItem = async () => {
//       try {
//         setLoading(true);
//         const response = await itemAPI.getItemById(id);
//         setItem(response.data);
//         window.scrollTo(0, 0);
//       } catch (err) {
//         setError('Failed to load item details');
//         console.error('Error fetching item:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItem();
//   }, [id]);

//   const handleShowPhone = () => {
//     setShowPhone(true);
//     // Increment phone stat when revealing the number
//     itemAPI.incrementItemStats(id, 'phone').catch(err => console.error('Failed to increment phone stat:', err));
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;
//   if (!item) return <div>Item not found</div>;

//   // Get the phone number based on contactInfo
//   const phoneNumber = item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available';

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Content Section */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//             <div className="p-6 space-y-8">
//               {/* Image Section */}
//               <div className="space-y-4">
//                 <div className="aspect-w-1 aspect-h-1">
//                   <img 
//                     src={item.images?.find(img => img.isMain)?.url || item.images[0]?.url} 
//                     alt={item.title} 
//                     className="w-full h-[500px] object-cover rounded-lg border border-gray-200"
//                   />
//                 </div>
//               </div>

//               {/* Details Section */}
//               <div className="space-y-6">
//                 <div className="flex justify-between items-start">
//                   <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
//                   <div className="flex gap-2">
//                     {/* Featured/Urgent Badges - Moved here */}
//                     {item.visibility?.featured && (
//                       <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
//                         ⭐ Featured
//                       </span>
//                     )}
//                     {item.visibility?.urgent && (
//                       <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
//                         🔥 Urgent
//                       </span>
//                     )}
//                     {/* Item Type Badge */}
//                     <span className={`
//                       px-4 py-2 rounded-full font-medium shadow-sm
//                       ${item.type === 'sell' ? 'bg-blue-100 text-blue-800' : ''}
//                       ${item.type === 'rent' ? 'bg-green-100 text-green-800' : ''}
//                       ${item.type === 'exchange' ? 'bg-purple-100 text-purple-800' : ''}
//                     `}>
//                       {item.type === 'sell' && '🏷️ For Sale'}
//                       {item.type === 'rent' && '🔄 For Rent'}
//                       {item.type === 'exchange' && '↔️ Exchange'}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Price Section */}
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   {item.type === 'exchange' ? (
//                     <div className="space-y-2">
//                       <span className="text-xl font-bold text-purple-600">Exchange Offer</span>
//                       {item.exchangeDetails?.exchangeFor && (
//                         <p className="text-gray-700">Looking for: {item.exchangeDetails.exchangeFor}</p>
//                       )}
//                       {item.exchangeDetails?.exchangePreferences && (
//                         <p className="text-gray-700">Preferences: {item.exchangeDetails.exchangePreferences}</p>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="flex items-baseline gap-4">
//                       <span className="text-3xl font-bold text-green-600">
//                         {item.price?.currency === 'Rs' 
//                           ? `Rs. ${item.price.amount?.toLocaleString() || 'Contact for Price'}` 
//                           : `$${item.price.amount?.toLocaleString() || 'Contact for Price'}`}
//                       </span>
//                       {item.price?.negotiable && (
//                         <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Negotiable</span>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Location and Time Section */}
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                   <div className="flex items-center gap-2">
//                     <MapPin className="w-5 h-5 text-gray-500" />
//                     <span className="text-gray-700">{item.location?.address || 'Unknown'}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Clock className="w-5 h-5 text-gray-500" />
//                     <span className="text-gray-700">{formatTimeAgo(item.createdAt)}</span>
//                   </div>
//                 </div>

//                 {/* Item Details Grid */}
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold border-b pb-2">Item Details</h3>
//                   <div className="grid grid-cols-2 gap-6">
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <p className="text-gray-600 text-sm mb-1">Category</p>
//                       <p className="font-medium text-gray-900">{item.category?.name || 'N/A'}</p>
//                     </div>
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <p className="text-gray-600 text-sm mb-1">Condition</p>
//                       <p className="font-medium text-gray-900">{item.condition || 'N/A'}</p>
//                     </div>
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                       <p className="text-gray-600 text-sm mb-1">Gender</p>
//                       <p className="font-medium text-gray-900">{item.sex || 'Unisex'}</p>
//                     </div>
//                     {item.type === 'rent' && (
//                       <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                         <p className="text-gray-600 text-sm mb-1">Rental Period</p>
//                         <p className="font-medium text-gray-900">{item.rentalPeriod || 'Not specified'}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-2">
//                   <h3 className="text-lg font-semibold border-b pb-2">Description</h3>
//                   <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Seller Profile Section */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 sticky top-8">
//             <div className="flex items-center gap-4">
//               <img 
//                 src={item.seller?.avatar || '/default-avatar.png'} 
//                 alt="Seller" 
//                 className="w-16 h-16 rounded-full border border-gray-200"
//               />
//               <div>
//                 <h3 className="font-semibold text-lg">{item.contactInfo?.name || item.seller?.name || 'Private User'}</h3>
//                 <p className="text-sm text-gray-500">Member since {item.seller?.memberSince || 'Unknown'}</p>
//                 <a href="#" className="text-blue-600 text-sm hover:underline">See profile</a>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {/* Show Phone Number Button */}
//               {(item.contactInfo?.showPhoneNumber !== false || showPhone) ? (
//                 <div className="w-full bg-green-100 text-green-800 py-3 rounded-lg flex items-center justify-center gap-2 font-bold">
//                   <Phone className="w-5 h-5" />
//                   <span>{phoneNumber}</span>
//                 </div>
//               ) : (
//                 <button 
//                   onClick={handleShowPhone}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
//                 >
//                   <Phone className="w-5 h-5" />
//                   Show phone number
//                 </button>
//               )}
              
//               <button className="w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
//                 <MessageCircle className="w-5 h-5" />
//                 Chat
//               </button>
//             </div>

//             <div className="pt-4 border-t">
//               <h4 className="font-semibold mb-2">Location</h4>
//               <div className="flex items-center gap-2">
//                 <MapPin className="w-5 h-5 text-gray-500" />
//                 <span>{item.location?.address || 'Unknown'}</span>
//               </div>
//             </div>

//             {/* Stats Section */}

//             <div className="pt-4 border-t">
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-500">AD ID {item._id}</span>
//                 <button className="text-blue-600 text-sm hover:underline">Report this ad</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <RelatedItems currentItem={item} />
//     </div>
//   );
// };

// // Helper function to format time ago
// function formatTimeAgo(date) {
//   const now = new Date();
//   const diffInMs = now - new Date(date);
//   const diffInHours = diffInMs / (1000 * 60 * 60);
  
//   if (diffInHours < 24) {
//     return `${Math.floor(diffInHours)}h ago`;
//   } else {
//     const diffInDays = diffInHours / 24;
//     return `${Math.floor(diffInDays)}d ago`;
//   }
// }

// export default ItemDetail;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, MessageCircle, Share2, Flag, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { itemAPI } from '@/api/item'; // Adjust the import path based on your project structure
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
    // You might want to add API call to save this state
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-lg text-gray-600">Loading item details...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-red-500 text-center">
        <div className="text-lg font-medium mb-2">{error}</div>
        <button className="text-blue-600 hover:underline" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    </div>
  );
  
  if (!item) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-gray-600 text-center">
        <div className="text-lg font-medium mb-2">Item not found</div>
        <button className="text-blue-600 hover:underline" onClick={() => window.history.back()}>
          Go back
        </button>
      </div>
    </div>
  );

  // Get the phone number based on contactInfo
  const phoneNumber = item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available';
  const images = item.images || [];
  const currentImage = images.length ? images[currentImageIndex]?.url : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-w-16 aspect-h-10 bg-gray-100">
                {currentImage ? (
                  <img 
                    src={currentImage} 
                    alt={item.title} 
                    className="w-full h-[400px] object-contain"
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              
              {/* Image Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-blue-600' : 'bg-white/60'}`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Favorite Button */}
              <button 
                onClick={toggleFavorite}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-sm z-10
                  ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-white/90 text-gray-500'}`}
                aria-label="Add to favorites"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Preview */}
            {images.length > 1 && (
              <div className="p-2 flex overflow-x-auto gap-2 bg-gray-50">
                {images.map((image, index) => (
                  <button 
                    key={index} 
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 
                      ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img 
                      src={image.url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 space-y-5">
              {/* Title and Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {/* Item Type Badge */}
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium shadow-sm
                    ${item.type === 'sell' ? 'bg-blue-100 text-blue-800' : ''}
                    ${item.type === 'rent' ? 'bg-green-100 text-green-800' : ''}
                    ${item.type === 'exchange' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {item.type === 'sell' && 'For Sale'}
                    {item.type === 'rent' && 'For Rent'}
                    {item.type === 'exchange' && 'Exchange'}
                  </span>
                  
                  {/* Featured/Urgent Badges */}
                  {item.visibility?.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                  {item.visibility?.urgent && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                      Urgent
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                
                {/* Location and Time Section */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location?.address || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                {item.type === 'exchange' ? (
                  <div className="space-y-2">
                    <span className="text-lg font-bold text-purple-600">Exchange Offer</span>
                    {item.exchangeDetails?.exchangeFor && (
                      <p className="text-gray-700">Looking for: {item.exchangeDetails.exchangeFor}</p>
                    )}
                    {item.exchangeDetails?.exchangePreferences && (
                      <p className="text-gray-700">Preferences: {item.exchangeDetails.exchangePreferences}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-green-600">
                      {item.price?.currency === 'Rs' 
                        ? `Rs. ${item.price.amount?.toLocaleString() || 'Contact for Price'}` 
                        : `$${item.price.amount?.toLocaleString() || 'Contact for Price'}`}
                    </span>
                    {item.price?.negotiable && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Negotiable</span>
                    )}
                  </div>
                )}
              </div>

              {/* Item Details Grid */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800">Item Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-800">{item.category?.name || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Condition</p>
                    <p className="text-sm font-medium text-gray-800">{item.condition || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Gender</p>
                    <p className="text-sm font-medium text-gray-800">{item.sex || 'Unisex'}</p>
                  </div>
                  {item.type === 'rent' && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Rental Period</p>
                      <p className="text-sm font-medium text-gray-800">{item.rentalPeriod || 'Not specified'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800">Description</h3>
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-5 sticky top-4">
            {/* Seller Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img 
                src={item.seller?.avatar || '/default-avatar.png'} 
                alt="Seller" 
                className="w-12 h-12 rounded-full border border-gray-200"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{item.contactInfo?.name || item.seller?.name || 'Private User'}</h3>
                <p className="text-xs text-gray-500">Member since {item.seller?.memberSince || 'Unknown'}</p>
                <a href="#" className="text-xs text-blue-600 hover:underline">View profile</a>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              {/* Show Phone Number Button */}
              {(item.contactInfo?.showPhoneNumber !== false || showPhone) ? (
                <div className="w-full bg-green-50 text-green-700 py-2.5 px-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">{phoneNumber}</span>
                  </div>
                  <a href={`tel:${phoneNumber}`} className="text-xs text-green-700 hover:underline">Call</a>
                </div>
              ) : (
                <button 
                  onClick={handleShowPhone}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                >
                  <Phone className="w-4 h-4" />
                  Show phone number
                </button>
              )}
              
              <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                <MessageCircle className="w-4 h-4" />
                Message seller
              </button>
              
              <div className="flex gap-2">
                <button className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg flex items-center justify-center transition-colors text-sm">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg flex items-center justify-center transition-colors text-sm">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Location</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{item.location?.address || 'Unknown'}</span>
              </div>
              
              {/* Simple Map Placeholder - You could integrate a real map here */}
              <div className="mt-2 bg-gray-100 rounded-lg h-32 flex items-center justify-center text-sm text-gray-500">
                Map view unavailable
              </div>
            </div>

            {/* Safety Tips */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Safety Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Meet in a public place</li>
                <li>• Check the item before paying</li>
                <li>• Pay only after inspecting the item</li>
              </ul>
            </div>

            {/* AD ID */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">AD ID: {item._id?.substring(0, 8) || 'Unknown'}</span>
              <button className="text-blue-600 hover:underline">Report this ad</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Items Section */}
      <div className="mt-8">
        <RelatedItems currentItem={item} />
      </div>
    </div>
  );
};

// Helper function to format time ago
function formatTimeAgo(date) {
  if (!date) return 'Recently';
  
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    const diffInDays = diffInHours / 24;
    if (diffInDays < 30) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      const diffInMonths = diffInDays / 30;
      return `${Math.floor(diffInMonths)}mo ago`;
    }
  }
}

export default ItemDetail;