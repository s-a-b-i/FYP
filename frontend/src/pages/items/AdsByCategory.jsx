import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemAPI } from '@/api/item';
import { categoryAPI } from '@/api/category';
import ItemCard from '@/pages/items/ItemCard';
import { MapPin, Grid, List, Phone, MessageCircle, X } from 'lucide-react';

const ContactPopup = ({ isOpen, onClose, contactInfo }) => {
  if (!isOpen) return null;

  const { name, phone } = contactInfo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-700 mb-2">
          <strong>Name:</strong> {name || 'Private User'}
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Phone:</strong> {phone || 'Not available'}
        </p>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Phone className="w-4 h-4" /> Call Now
          </a>
        )}
      </div>
    </div>
  );
};

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
  const [showPopup, setShowPopup] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
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
          sort: sortBy,
          limit: 10,
        };

        const response = await itemAPI.getItems(query);
        const itemsWithTimeAgo = response.data.map(item => ({
          ...item,
          timeAgo: item.createdAt ? formatTimeAgo(item.createdAt) : 'Recently',
        }));

        if (isMounted) {
          setItems(itemsWithTimeAgo || []);
          setTotalItems(response.count || 0);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching items:', err);
          setError(err.message || 'Failed to load items');
        }
      } finally {
        if (isMounted) setLoading(false);
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

  const handleSortChange = (e) => setSortBy(e.target.value);

  const toggleViewMode = (mode) => setViewMode(mode);

  const handleShowContact = (item) => {
    const contactInfo = {
      name: item.contactInfo?.name || item.seller?.name || 'Private User',
      phone: item.contactInfo?.phoneNumber || item.seller?.phone || 'Not available',
    };
    setSelectedContact(contactInfo);
    setShowPopup(true);
    itemAPI.incrementItemStats(item._id, 'phone').catch(err =>
      console.error('Failed to increment phone stat:', err)
    );
  };

  const closePopup = () => setShowPopup(false);

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
              {categories.map(category => (
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
              onChange={e => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pakistan</option>
              {['Punjab', 'Sindh', 'Islamabad Capital Territory', 'Khyber Pakhtunkhwa', 'Balochistan', 'Azad Kashmir', 'Northern Areas'].map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Price</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="100,000"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
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
              {items.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
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
                          <span>{item.timeAgo}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.price?.amount ? `Rs ${item.price.amount.toLocaleString()}` : 'Contact for Price'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={e => {
                              e.preventDefault();
                              handleShowContact(item);
                            }}
                            className="bg-blue-600 text-white py-1 px-3 rounded-md flex items-center gap-2 hover:bg-blue-700"
                          >
                            <Phone className="w-4 h-4" /> Show Contact
                          </button>
                          <button className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md flex items-center gap-2 hover:bg-gray-300">
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
          {items.length === 0 && <p className="text-gray-500 text-center">No items found for this category.</p>}
        </div>
      </div>

      {/* Contact Popup */}
      <ContactPopup isOpen={showPopup} onClose={closePopup} contactInfo={selectedContact} />
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

export default AdsByCategory;