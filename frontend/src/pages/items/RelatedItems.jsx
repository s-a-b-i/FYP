import { useState, useEffect } from 'react';
import ItemCard from '@/pages/items/ItemCard';
import { itemAPI } from '@/api/item';
import { H2 } from '@/components/shared/Heading';

const RelatedItems = ({ currentItem }) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!currentItem?._id) return; // Use _id to match MongoDB convention
      try {
        setLoading(true);
        const response = await itemAPI.getRelatedItems(currentItem._id);
        setRelatedItems(response.data?.items || response.data || []);
      } catch (err) {
        console.error('Error fetching related items:', err);
        setError('Failed to load related items');
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedItems();
  }, [currentItem?._id]);

  if (loading) return <div className="px-4 sm:px-6 lg:px-8 py-12 text-gray-600"><div className="animate-pulse">Loading related items...</div></div>;
  if (error) return <div className="px-4 sm:px-6 lg:px-8 py-12 text-red-500">{error}</div>;
  if (!relatedItems.length) return <div className="px-4 sm:px-6 lg:px-8 py-12 text-gray-600">No related items found</div>;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <H2 className="text-2xl font-bold text-gray-900">Related Items</H2>
        <p className="text-sm text-gray-600 mt-1">Similar items you might be interested in</p>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedItems.map((item) => (
          <ItemCard
            key={item._id || item.id}
            item={{
              id: item._id || item.id,
              title: item.title,
              images: item.images || [], // Pass full images array
              type: item.type,
              price: item.price, // Pass full price object
              currency: item.price?.currency || 'PKR',
              location: item.location || {}, // Pass full location object
              timeAgo: formatTimeAgo(item.createdAt),
              visibility: item.visibility || {},
              exchangeDetails: item.exchangeDetails || {},
              rentDetails: item.rentDetails || {},
            }}
          />
        ))}
      </div>
    </section>
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

export default RelatedItems;