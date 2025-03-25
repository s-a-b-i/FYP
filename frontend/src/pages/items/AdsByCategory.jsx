// import { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom'; // Add Link for redirection
// import { itemAPI } from '@/api/item';
// import { categoryAPI } from '@/api/category';
// import ItemCard from '@/pages/items/ItemCard';
// import { MapPin, ChevronDown, Grid, List, Phone, MessageCircle } from 'lucide-react';

// const AdsByCategory = () => {
//   const { categoryId } = useParams();
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
//   const [location, setLocation] = useState('');
//   const [minPrice, setMinPrice] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [sortBy, setSortBy] = useState('newly-listed');
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [totalItems, setTotalItems] = useState(0);
//   const [showPhoneNumbers, setShowPhoneNumbers] = useState({}); // State to track phone number visibility for each item

//   // Fetch categories for the filter dropdown
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await categoryAPI.getCategories();
//         setCategories(response.data || []);
//       } catch (err) {
//         console.error('Error fetching categories:', err);
//         setError('Failed to load categories');
//       }
//     };
//     fetchCategories();
//   }, []);

//   // Fetch items based on filters
//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         setLoading(true);
//         const query = {
//           category: selectedCategory,
//           city: location,
//           minPrice: minPrice || undefined,
//           maxPrice: maxPrice || undefined,
//         };

//         let sortOption = '-createdAt'; // Default: newly listed
//         if (sortBy === 'most-relevant') sortOption = '-stats.views';
//         else if (sortBy === 'lowest-price') sortOption = 'price.amount';
//         else if (sortBy === 'highest-price') sortOption = '-price.amount';

//         const response = await itemAPI.getItems({ ...query, sort: sortOption });
//         const itemsWithTimeAgo = response.data.map(item => ({
//           ...item,
//           timeAgo: item.createdAt ? formatTimeAgo(item.createdAt) : 'Recently',
//         }));
//         setItems(itemsWithTimeAgo || []);
//         setTotalItems(response.pagination?.total || 0);
//       } catch (err) {
//         console.error('Error fetching items:', err);
//         setError('Failed to load items');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItems();
//   }, [selectedCategory, location, minPrice, maxPrice, sortBy]);

//   const handleCategoryChange = (e) => {
//     const newCategory = e.target.value;
//     setSelectedCategory(newCategory);
//     navigate(`/ads/category/${newCategory}`);
//   };

//   const handleSortChange = (e) => {
//     setSortBy(e.target.value);
//   };

//   const toggleViewMode = (mode) => {
//     setViewMode(mode);
//   };

//   const handleShowPhone = (itemId) => {
//     setShowPhoneNumbers((prev) => ({
//       ...prev,
//       [itemId]: !prev[itemId], // Toggle visibility for the specific item
//     }));
//     if (!showPhoneNumbers[itemId]) {
//       // Increment phone stat when showing the phone number
//       itemAPI.incrementItemStats(itemId, 'phone').catch(err => console.error('Failed to increment phone stat:', err));
//     }
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">
//         {categories.find(cat => cat._id === selectedCategory)?.name || 'Fashion & Beauty'} Products in Pakistan
//       </h1>
//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Filters Section */}
//         <div className="w-full lg:w-1/4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
//             <select
//               value={selectedCategory}
//               onChange={handleCategoryChange}
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category._id} value={category._id}>
//                   {category.name} ({category.itemCount || 0})
//                 </option>
//               ))}
//             </select>
//             <div className="mt-2">
//               {categories.map((category) => (
//                 <div key={category._id} className="text-sm text-blue-600 hover:underline cursor-pointer">
//                   {category.name} ({category.itemCount || 0})
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
//             <select
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Pakistan</option>
//               <option value="Punjab">Punjab</option>
//               <option value="Sindh">Sindh</option>
//               <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
//               <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
//               <option value="Balochistan">Balochistan</option>
//               <option value="Azad Kashmir">Azad Kashmir</option>
//               <option value="Northern Areas">Northern Areas</option>
//             </select>
//           </div>

//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Price</h3>
//             <div className="flex gap-4">
//               <input
//                 type="number"
//                 placeholder="0"
//                 value={minPrice}
//                 onChange={(e) => setMinPrice(e.target.value)}
//                 className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 type="number"
//                 placeholder="100,000"
//                 value={maxPrice}
//                 onChange={(e) => setMaxPrice(e.target.value)}
//                 className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <p className="text-sm text-gray-500 mt-2">PKR</p>
//           </div>

//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Deliverable</h3>
//             <label className="flex items-center">
//               <input type="checkbox" className="mr-2" />
//               No
//             </label>
//           </div>
//         </div>

//         {/* Items Section */}
//         <div className="w-full lg:w-3/4">
//           <div className="flex justify-between items-center mb-6">
//             <p className="text-gray-600">{totalItems} ads</p>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => toggleViewMode('grid')}
//                   className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
//                 >
//                   <Grid className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => toggleViewMode('list')}
//                   className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
//                 >
//                   <List className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="flex items-center gap-2">
//                 <label className="text-gray-600">Sort by:</label>
//                 <select
//                   value={sortBy}
//                   onChange={handleSortChange}
//                   className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="newly-listed">Newly listed</option>
//                   <option value="most-relevant">Most relevant</option>
//                   <option value="lowest-price">Lowest price</option>
//                   <option value="highest-price">Highest price</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Items Display */}
//           {viewMode === 'grid' ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {items.map((item) => (
//                 <ItemCard key={item._id} item={item} />
//               ))}
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {items.map((item) => (
//                 <Link to={`/items/${item._id}`} key={item._id} className="block">
//                   <div className="flex bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
//                     <div className="w-1/4">
//                       <img
//                         src={item.images?.[0]?.url || 'https://via.placeholder.com/150'}
//                         alt={item.title}
//                         className="w-full h-32 object-cover rounded-md"
//                       />
//                     </div>
//                     <div className="w-3/4 pl-4 flex flex-col justify-between">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
//                         <p className="text-gray-600 mt-1">{item.description?.substring(0, 100)}...</p>
//                         <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
//                           <MapPin className="w-4 h-4" />
//                           <span>{item.location?.city || 'Unknown'}</span>
//                           <span>·</span>
//                           <span>{item.timeAgo || 'Recently'}</span>
//                         </div>
//                       </div>
//                       <div className="flex items-center justify-between mt-2">
//                         <p className="text-lg font-semibold text-gray-900">
//                           {item.price?.amount ? `Rs ${item.price.amount.toLocaleString()}` : 'Contact for Price'}
//                         </p>
//                         <div className="flex gap-2">
//                           {showPhoneNumbers[item._id] ? (
//                             <div className="bg-green-50 text-green-700 py-2 px-4 flex items-center justify-between rounded-md">
//                               <div className="flex items-center gap-2">
//                                 <Phone className="w-4 h-4" />
//                                 <span className="text-sm">
//                                   {item.contactInfo?.name || item.seller?.name || 'Private User'}: {item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available'}
//                                 </span>
//                               </div>
//                               <a href={`tel:${item.contactInfo?.phoneNumber || item.seller?.phone}`} className="text-sm text-green-700 hover:underline">Call</a>
//                             </div>
//                           ) : (
//                             <button
//                               onClick={(e) => {
//                                 e.preventDefault(); // Prevent Link navigation
//                                 handleShowPhone(item._id);
//                               }}
//                               className="bg-blue-600 text-white py-1 px-3 rounded-md flex items-center gap-2"
//                             >
//                               <Phone className="w-4 h-4" /> Show Contact
//                             </button>
//                           )}
//                           <button className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md flex items-center gap-2">
//                             <MessageCircle className="w-4 h-4" /> Chat
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Function to format time ago (copied from ItemDetail)
// function formatTimeAgo(date) {
//   if (!date) return 'Recently';
//   const now = new Date();
//   const diffInMs = now - new Date(date);
//   const diffInHours = diffInMs / (1000 * 60 * 60);
//   if (diffInHours < 1) return `${Math.floor(diffInMs / (1000 * 60))}m ago`;
//   if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
//   const diffInDays = diffInHours / 24;
//   if (diffInDays < 30) return `${Math.floor(diffInDays)}d ago`;
//   return `${Math.floor(diffInDays / 30)}mo ago`;
// }

// export default AdsByCategory;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI } from '@/api/item';
import { categoryAPI } from '@/api/category';
import ItemCard from '@/pages/items/ItemCard';
import { MapPin, ChevronDown, Grid, List, Phone, MessageCircle } from 'lucide-react';

const AdsByCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newly-listed');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [showPhoneNumbers, setShowPhoneNumbers] = useState({});

  useEffect(() => {
    console.log('Category ID from URL:', categoryId);
    setSelectedCategory(categoryId);
  }, [categoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchItems = async () => {
      try {
        setLoading(true);
        const query = {
          category: categoryId,
          city: location,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        };
        
        console.log('Fetching items with query:', query);

        let sortOption = '-createdAt';
        if (sortBy === 'most-relevant') sortOption = '-stats.views';
        else if (sortBy === 'lowest-price') sortOption = 'price.amount';
        else if (sortBy === 'highest-price') sortOption = '-price.amount';

        const response = await itemAPI.getItems({ ...query, sort: sortOption });
        const itemsWithTimeAgo = response.data.map(item => ({
          ...item,
          timeAgo: item.createdAt ? formatTimeAgo(item.createdAt) : 'Recently',
        }));

        if (isMounted) {
          setItems(itemsWithTimeAgo || []);
          setTotalItems(response.pagination?.total || 0);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching items:', err);
          setError('Failed to load items');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchItems();
    
    return () => {
      isMounted = false;
    };
  }, [categoryId, location, minPrice, maxPrice, sortBy]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    navigate(`/ads/category/${newCategory}`);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleShowPhone = (itemId) => {
    setShowPhoneNumbers((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
    if (!showPhoneNumbers[itemId]) {
      itemAPI.incrementItemStats(itemId, 'phone').catch(err =>
        console.error('Failed to increment phone stat:', err)
      );
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {categories.find(cat => cat._id === selectedCategory)?.name || 'All Categories'} Products in Pakistan
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-1/4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name} ({category.itemCount || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pakistan</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
              <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
              <option value="Balochistan">Balochistan</option>
              <option value="Azad Kashmir">Azad Kashmir</option>
              <option value="Northern Areas">Northern Areas</option>
            </select>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Price</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="100,000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">PKR</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Deliverable</h3>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              No
            </label>
          </div>
        </div>

        {/* Items Section */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{totalItems} ads</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newly-listed">Newly listed</option>
                  <option value="most-relevant">Most relevant</option>
                  <option value="lowest-price">Lowest price</option>
                  <option value="highest-price">Highest price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Link to={`/items/${item._id}`} key={item._id} className="block">
                  <div className="flex bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-1/4">
                      <img
                        src={item.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                    <div className="w-3/4 pl-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 mt-1">{item.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location?.city || 'Unknown'}</span>
                          <span>·</span>
                          <span>{item.timeAgo || 'Recently'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.price?.amount ? `Rs ${item.price.amount.toLocaleString()}` : 'Contact for Price'}
                        </p>
                        <div className="flex gap-2">
                          {showPhoneNumbers[item._id] ? (
                            <div className="bg-green-50 text-green-700 py-2 px-4 flex items-center justify-between rounded-md">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">
                                  {item.contactInfo?.name || item.seller?.name || 'Private User'}: {item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available'}
                                </span>
                              </div>
                              <a href={`tel:${item.contactInfo?.phoneNumber || item.seller?.phone}`} className="text-sm text-green-700 hover:underline">Call</a>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleShowPhone(item._id);
                              }}
                              className="bg-blue-600 text-white py-1 px-3 rounded-md flex items-center gap-2"
                            >
                              <Phone className="w-4 h-4" /> Show Contact
                            </button>
                          )}
                          <button className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {items.length === 0 && (
            <p className="text-gray-500 text-center">No items found for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to format time ago
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

export default AdsByCategory;