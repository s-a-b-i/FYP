import React, { useState, useMemo } from 'react';
import { H1 } from '@/components/shared/Heading';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import cn from 'classnames';
import { 
  Search,
  Eye, 
  Phone, 
  MessageCircle,
  MoreVertical,
  PackageOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyItems = () => {
  const navigate = useNavigate();
  
  // Mock data structure matching the post form
  const [ads] = useState([
    {
      id: 1,
      title: 'Designer Jacket',
      description: 'Excellent condition designer jacket',
      price: 2000,
      status: 'active',
      startDate: '17 Feb',
      endDate: '19 Mar',
      images: ['/path-to-image.jpg'],
      location: 'Western',
      category: {
        name: 'Jackets',
        icon: '/path-to-icon.jpg'
      },
      sex: 'men',
      condition: 'used',
      name: 'John Doe',
      phoneNumber: '+1234567890',
      showPhoneNumber: true,
      stats: {
        views: 0,
        phones: 0,
        chats: 0
      },
      type: 'sell' // sell, rent, or exchange
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'View all', count: ads.length },
    { id: 'active', label: 'Active Ads', count: ads.filter(ad => ad.status === 'active').length },
    { id: 'inactive', label: 'Inactive Ads', count: ads.filter(ad => ad.status === 'inactive').length },
    { id: 'pending', label: 'Pending Ads', count: ads.filter(ad => ad.status === 'pending').length },
    { id: 'moderated', label: 'Moderated Ads', count: ads.filter(ad => ad.status === 'moderated').length },
  ];

  const getTypeStyles = (type) => {
    switch (type) {
      case 'sell':
        return 'bg-itemTypes-sell-bg text-itemTypes-sell-text';
      case 'rent':
        return 'bg-itemTypes-rent-bg text-itemTypes-rent-text';
      case 'exchange':
        return 'bg-purple-100 text-purple-800';
      default:
        return '';
    }
  };

  const filteredAds = useMemo(() => {
    let filtered = [...ads];
    
    if (searchQuery) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <H1>Manage and view your Ads</H1>
        <Button 
          variant="primary"
          onClick={() => navigate('/post')}
        >
          Post New Ad
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search by Ad Title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm transition-colors',
              activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            {`${tab.label} (${tab.count})`}
          </button>
        ))}
      </div>

      {/* Packages Banner */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageOpen className="text-primary" size={20} />
            <span className="text-gray-600">Heavy discount on Packages</span>
          </div>
          <Button variant="primary" size="sm">View Packages</Button>
        </div>
      </div>

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No ads found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start gap-4">
                {/* Ad Image */}
                <div className="w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
                  {ad.images[0] && (
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Ad Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {ad.title}
                        </h3>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getTypeStyles(ad.type)
                        )}>
                          {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>{ad.category.name} • {ad.condition.charAt(0).toUpperCase() + ad.condition.slice(1)} • {ad.sex.charAt(0).toUpperCase() + ad.sex.slice(1)}</p>
                        <p>{ad.location}</p>
                      </div>
                      <p className="text-lg font-semibold mt-2">Rs {ad.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Active from {ad.startDate} to {ad.endDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleEdit(ad.id)}
                      >
                        Edit
                      </Button>
                      <Button variant="primary">Sell faster now</Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <Eye size={18} className="text-gray-500" />
                      <span>{ad.stats.views} Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-gray-500" />
                      <span>{ad.stats.phones} Phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-gray-500" />
                      <span>{ad.stats.chats} Chats</span>
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