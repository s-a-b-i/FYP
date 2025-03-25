import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { H1, H3 } from "@/components/shared/Heading";
import { categoryAPI } from "@/api/category";

const Categories = ({ selectedCategory, setSelectedCategory }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryAPI.getCategories();

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && typeof data === "object") {
          const categoriesArray = data.categories || data.data || Object.values(data);
          if (Array.isArray(categoriesArray)) {
            setCategories(categoriesArray);
          } else {
            console.error("Unexpected API response format:", data);
            setError("Received unexpected data format from the API");
          }
        } else {
          console.error("Unexpected API response:", data);
          setError("Received unexpected response from the API");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    console.log('Setting selected category:', categoryId);
    setSelectedCategory(categoryId);
    navigate(`/ads/category/${categoryId}`);
  };

  const parentCategories = categories.filter((cat) => cat && !cat.parent);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="container py-8 sm:py-12 lg:py-16">
      <H1 className="text-center mb-8 sm:mb-12" withBorder={false}>
        All Categories
      </H1>

      <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-6 flex-wrap max-w-[280px] xs:max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto">
        {parentCategories.map((category) => (
          <div
            key={category._id.$oid || category._id}
            className="flex flex-col items-center gap-3 group cursor-pointer"
            onClick={() => handleCategoryClick(category._id.$oid || category._id)}
          >
            <div
              className={`w-24 h-24 rounded-full ${
                category.backgroundColor || "bg-gray-100"
              } ${category.borderColor || "border-gray-300"} border-2
                flex items-center justify-center transition-transform duration-300
                hover:scale-110 hover:shadow-lg overflow-hidden`}
            >
              {category.icon && category.icon.url ? (
                <img
                  src={category.icon.url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">
                  {category.icon || category.name.charAt(0)}
                </span>
              )}
            </div>
            <H3 className="font-medium text-gray-800">{category.name}</H3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;