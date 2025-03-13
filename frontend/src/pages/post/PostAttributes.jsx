import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import CategorySelectionDialog from "@/pages/post/CategorySelectionDialog";
import { itemAPI } from "@/api/item"; // Import itemAPI
import { categoryAPI } from "@/api/category"; // Import categoryAPI
import { H1, H2 } from "@/components/shared/Heading";

const PostAttributes = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const { isAuthenticated } = useAuthStore();
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sex: "",
    condition: "",
    location: "",
    images: [],
    name: "",
    phoneNumber: "",
    showPhoneNumber: false,
    rentDuration: type === "rent" ? "" : undefined,
    securityDeposit: type === "rent" ? "" : undefined,
    availabilityDate: type === "rent" ? "" : undefined,
    exchangeFor: type === "exchange" ? "" : undefined,
    exchangePreferences: type === "exchange" ? "" : undefined,
  });

  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!type || !categoryId) {
      navigate("/");
      return;
    }
  
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getCategoryById(categoryId);
        // The issue is here - you need to make sure you're accessing the data correctly
        setSelectedCategory(response.data || response); // Access response.data if it exists, otherwise use response
      } catch (err) {
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategory();
  }, [isAuthenticated, navigate, type, categoryId]);


  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 12) {
      alert("Maximum 12 images allowed");
      return;
    }

    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    navigate(`/post/attributes/${newCategory._id}?type=${type}`);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const itemData = {
      ...formData,
      price: {
        amount: formData.price // Convert from string to the expected object structure
      },
      category: categoryId,
      type,
    };

    const response = await itemAPI.createItem(itemData);

    if (formData.images.length > 0) {
      await itemAPI.uploadItemImages(response.data._id, formData.images);
    }

    navigate("/success");
  } catch (err) {
    setError("Failed to create item: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const getTypeStyles = () => {
    switch (type) {
      case "sell": return "bg-itemTypes-sell-bg text-itemTypes-sell-text";
      case "rent": return "bg-itemTypes-rent-bg text-itemTypes-rent-text";
      case "exchange": return "bg-purple-100 text-purple-800";
      default: return "";
    }
  };

  const getTypeLabel = () => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : "";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="layout bg-background">
      <form onSubmit={handleSubmit} className="container py-section">
        <div className="max-w-profile mx-auto space-y-8">
          {/* Category Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-base font-medium">Category</span>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedCategory?.icon?.url ? (
                      <img
                        src={selectedCategory.icon.url}
                        alt={selectedCategory.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedCategory?.name || "Loading..."}</div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryDialogOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Change
              </button>
            </div>
          </div>

          {/* Rest of the form remains similar, just updating the rendering */}
          {/* Image Upload Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Upload Images</H2>
            <div className="grid grid-cols-4 gap-4">
              <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer flex items-center justify-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
                <Plus className="w-6 h-6 text-gray-400" />
              </label>
              {previewImages.map((url, index) => (
                <div key={index} className="relative aspect-square border border-gray-200 rounded-lg">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Item Details Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Item Details</H2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Sex</label>
                <div className="flex gap-4">
                  {["Men", "Women", "Unisex"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded-md border ${
                        formData.sex.toLowerCase() === option.toLowerCase()
                          ? "border-primary text-primary"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        handleChange({
                          target: { name: "sex", value: option.toLowerCase() },
                        })
                      }
                      disabled={loading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <div className="flex gap-4">
                  {["New", "Used"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded-md border ${
                        formData.condition.toLowerCase() === option.toLowerCase()
                          ? "border-primary text-primary"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        handleChange({
                          target: { name: "condition", value: option.toLowerCase() },
                        })
                      }
                      disabled={loading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Description</H2>
            <div className="space-y-6">
              <Input
                label="Ad title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Mention the key features (e.g. brand, model, age, type)"
                maxLength={70}
                required
                disabled={loading}
              />
              <Input
                type="textarea"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Include condition, features and reason for selling"
                rows={4}
                maxLength={4096}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Price and Location Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Price and Location</H2>
            <div className="space-y-6">
              <Input
                label="Price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter Price"
                required
                prefix="Rs"
                disabled={loading}
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Select Location"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post now"}
            </Button>
          </div>
        </div>
      </form>

      <CategorySelectionDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onSelectCategory={handleCategoryChange}
      />
    </div>
  );
};

export default PostAttributes;