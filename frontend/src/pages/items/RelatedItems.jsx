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
      if (!currentItem?.id) return;
      try {
        setLoading(true);
        const response = await itemAPI.getRelatedItems(currentItem.id);
        setRelatedItems(response.data?.items || response.data || []);
      } catch (err) {
        console.error('Error fetching related items:', err);
        setError('Failed to load related items');
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedItems();
  }, [currentItem?.id]);

  if (loading) return <div className="py-8"><div className="animate-pulse text-gray-600">Loading related items...</div></div>;
  if (error) return <div className="py-8 text-red-500 text-center">{error}</div>;
  if (!relatedItems.length) return <div className="py-8 text-gray-600 text-center">No related items found</div>;

  return (
    <section className="py-8">
      <div className="mb-6">
        <H2>Related Items</H2>
        <p className="text-sm text-gray-600 mt-1">Similar items you might be interested in</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedItems.map((item) => (
          <ItemCard
            key={item.id || item._id}
            item={{
              id: item.id || item._id,
              title: item.title,
              image: item.images?.[0]?.url || '/placeholder-image.jpg',
              type: item.type,
              price: typeof item.price === 'object' ? item.price?.amount : item.price, // Extract amount if object
              currency: typeof item.price === 'object' ? item.price?.currency : 'PKR', // Extract currency if object
              location: item.location?.address || 'Unknown',
              timeAgo: formatTimeAgo(item.createdAt),
              visibility: item.visibility,
              exchangeDetails: item.exchangeDetails,
              rentDetails: item.rentDetails, // Pass full rentDetails object
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