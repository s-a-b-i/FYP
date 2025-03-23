import { useEffect, useState } from "react";
import { H2 } from "@/components/shared/Heading";
import ItemCard from "@/pages/items/ItemCard";
import { categoryAPI } from "@/api/category";

const PopularCategoryItems = ({ selectedCategory, setSelectedCategory }) => {
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getPopularCategoriesWithItems(4, 4);
        console.log('API Response:', response.data); // Debug the response
        setPopularCategories(response.data || []);
      } catch (err) {
        console.error("Error fetching popular categories with items:", err);
        setError("Failed to load categories and items");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCategories();
  }, []);

  if (loading) return <div className="px-4 sm:px-6 lg:px-8 py-12 text-gray-600">Loading popular categories...</div>;
  if (error) return <div className="px-4 sm:px-6 lg:px-8 py-12 text-red-600">{error}</div>;
  if (popularCategories.length === 0) return null;

  const filteredCategories = selectedCategory === 'all' 
    ? popularCategories 
    : popularCategories.filter(cat => cat.name === selectedCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {filteredCategories.map((category) => (
        <div key={category._id} className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <H2 className="text-2xl font-bold text-gray-900">{category.name}</H2>
            <button 
              onClick={() => setSelectedCategory(category.name)}
              className="text-primary-main hover:underline text-sm font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.items?.length > 0 ? (
              category.items.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">No items available in this category</p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default PopularCategoryItems;