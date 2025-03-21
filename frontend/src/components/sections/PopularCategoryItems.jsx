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

  if (loading) return <div>Loading popular categories...</div>;
  if (error) return <div>{error}</div>;
  if (popularCategories.length === 0) return null;

  const filteredCategories = selectedCategory === 'all' 
    ? popularCategories 
    : popularCategories.filter(cat => cat.name === selectedCategory);

  return (
    <section className="container py-8 sm:py-12 lg:py-16">
      {filteredCategories.map((category) => (
        <div key={category._id} className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <H2>{category.name}</H2>
            <button 
              onClick={() => setSelectedCategory(category.name)}
              className="text-primary-main hover:underline"
            >
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
            {category.items?.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default PopularCategoryItems;