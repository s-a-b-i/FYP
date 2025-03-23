import React, { useState, useMemo, useEffect } from 'react';
import { H1 } from '@/components/shared/Heading';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import cn from 'classnames';
import { 
  Search,
  Eye, 
  Phone, 
  MessageCircle,
  PackageOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { itemAPI } from '@/api/item';
import { useAuthStore } from '@/store/authStore';

const MyItems = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [ads, setAds] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserItems = async () => {
      try {
        setLoading(true);
        const response = await itemAPI.getUserItems();
        setAds(response.data || []);
      } catch (err) {
        setError("Failed to load items: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, [isAuthenticated, navigate]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'View All', count: ads.length },
    { id: 'active', label: 'Active', count: ads.filter(ad => ad.status === 'active').length },
    { id: 'inactive', label: 'Inactive', count: ads.filter(ad => ad.status === 'inactive').length },
    { id: 'pending', label: 'Pending', count: ads.filter(ad => ad.status === 'pending').length },
    { id: 'moderated', label: 'Moderated', count: ads.filter(ad => ad.status === 'moderated').length },
  ], [ads]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'sell': return 'bg-green-100 text-green-800';
      case 'rent': return 'bg-blue-100 text-blue-800';
      case 'exchange': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-400';
      case 'pending': return 'bg-yellow-500';
      case 'moderated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAds = useMemo(() => {
    let filtered = [...ads];
    
    if (searchQuery) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(ad => ad.status === activeTab);
    }

    return filtered;
  }, [ads, searchQuery, activeTab]);

  const handleEdit = (adId) => {
    navigate(`/items/edit/${adId}`);
  };

  const handleDelete = async (adId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await itemAPI.deleteItem(adId);
        setAds(prev => prev.filter(ad => ad._id !== adId));
      } catch (err) {
        setError("Failed to delete item: " + err.message);
      }
    }
  };

  if (loading) return <div className="text-left py-12">Loading...</div>;
  if (error) return <div className="text-left py-12 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <H1 className="text-3xl font-bold text-gray-900">Manage Your Ads</H1>
        <Button 
          variant="primary"
          onClick={() => navigate('/post')}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Post New Ad
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-8 relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search by Title or Category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full border-gray-300 focus:ring-primary focus:border-primary"
          disabled={loading}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            disabled={loading}
          >
            {`${tab.label} (${tab.count})`}
          </button>
        ))}
      </div>

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <div className="py-16 bg-gray-50 rounded-lg border border-gray-200">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg text-center">No ads found for this category</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAds.map((ad) => (
            <div 
              key={ad._id} 
              className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Ad Image */}
                <div className="w-full sm:w-40 h-40 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  {ad.images?.[0]?.url ? (
                    <img 
                      src={ad.images[0].url} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Ad Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                          {ad.title}
                        </h3>
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                          getTypeStyles(ad.type)
                        )}>
                          {ad.type}
                        </span>
                        <span className={cn(
                          'w-2.5 h-2.5 rounded-full',
                          getStatusStyles(ad.status)
                        )} title={ad.status}></span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Category:</span> {ad.category?.name || 'Uncategorized'}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span> {ad.location?.city && ad.location?.neighborhood 
                            ? `${ad.location.neighborhood}, ${ad.location.city}` 
                            : 'Location not specified'}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {ad.type === 'sell' && ad.price?.amount
                          ? `Rs ${ad.price.amount.toLocaleString()}`
                          : ad.type === 'rent' && ad.rentDetails?.pricePerUnit
                          ? `Rs ${ad.rentDetails.pricePerUnit.toLocaleString()} / ${ad.rentDetails.durationUnit || 'unit'}`
                          : 'Price not specified'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button 
                        variant="outline"
                        onClick={() => handleEdit(ad._id)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDelete(ad._id)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Eye size={18} className="text-gray-500" />
                      <span>{ad.stats?.views || 0} Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-gray-500" />
                      <span>{ad.stats?.phones || 0} Phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-gray-500" />
                      <span>{ad.stats?.chats || 0} Chats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;