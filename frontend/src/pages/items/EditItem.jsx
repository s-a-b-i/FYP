import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import CategorySelectionDialog from "@/pages/post/CategorySelectionDialog";
import { itemAPI } from "@/api/item";
import { categoryAPI } from "@/api/category";
import { H1, H2 } from "@/components/shared/Heading";

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState(""); // Editable type state

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "", // Will only be used for "sell"
    sex: "",
    condition: "",
    location: "",
    images: [],
    name: "",
    phoneNumber: "",
    showPhoneNumber: false,
    rentDuration: "",
    securityDeposit: "",
    availabilityDate: "",
    exchangeFor: "",
    exchangePreferences: "",
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchItemData = async () => {
      try {
        setLoading(true);
        const itemResponse = await itemAPI.getItemById(id);
        const item = itemResponse.data;

        if (!item) {
          setError("Item not found");
          return;
        }

        // Set the item type
        setType(item.type);

        // Fetch and set the category
        const categoryId = typeof item.category === "object" ? item.category._id : item.category;
        if (categoryId) {
          const categoryResponse = await categoryAPI.getCategoryById(categoryId);
          setSelectedCategory(categoryResponse.data || categoryResponse);
        }

        // Set form data based on item type
        setFormData({
          title: item.title || "",
          description: item.description || "",
          price: item.type === "sell" && item.price ? item.price.amount || "" : "", // Only for "sell"
          sex: item.sex || "",
          condition: item.condition || "",
          location: item.location?.address || item.location || "",
          images: [],
          name: item.contactInfo?.name || "",
          phoneNumber: item.contactInfo?.phoneNumber || "",
          showPhoneNumber: item.contactInfo?.showPhoneNumber || false,
          rentDuration: item.rentDetails?.duration || "",
          securityDeposit: item.rentDetails?.securityDeposit || "",
          availabilityDate: item.rentDetails?.availabilityDate ? 
            new Date(item.rentDetails.availabilityDate).toISOString().split("T")[0] : "",
          exchangeFor: item.exchangeDetails?.exchangeFor || "",
          exchangePreferences: item.exchangeDetails?.exchangePreferences || "",
        });

        if (item.images && item.images.length > 0) {
          setExistingImages(item.images);
        }
      } catch (err) {
        setError("Failed to load item: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [isAuthenticated, navigate, id]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    // Reset type-specific fields when type changes
    setFormData((prev) => ({
      ...prev,
      price: newType === "sell" ? prev.price : "", // Only keep price for "sell"
      rentDuration: newType === "rent" ? prev.rentDuration : "",
      securityDeposit: newType === "rent" ? prev.securityDeposit : "",
      availabilityDate: newType === "rent" ? prev.availabilityDate : "",
      exchangeFor: newType === "exchange" ? prev.exchangeFor : "",
      exchangePreferences: newType === "exchange" ? prev.exchangePreferences : "",
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = files.length + previewImages.length + existingImages.length - removedImageIds.length;

    if (totalImages > 12) {
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

  const removeNewImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
    setRemovedImageIds((prev) => [...prev, imageId]);
  };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
  };

  const validateForm = () => {
    const totalImagesAfterUpdate = existingImages.length - removedImageIds.length + formData.images.length;

    if (totalImagesAfterUpdate === 0) {
      setError("At least one image is required");
      return false;
    }

    if (!selectedCategory || !selectedCategory._id) {
      setError("Category is required");
      return false;
    }

    if (!type) {
      setError("Item type is required");
      return false;
    }

    if (type === "sell" && !formData.price) {
      setError("Price is required for sell items");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const categoryId = selectedCategory?._id || "";

      const itemData = {
        title: formData.title,
        description: formData.description,
        ...(type === "sell" && { price: { amount: parseFloat(formData.price) } }), // Only for "sell"
        sex: formData.sex,
        condition: formData.condition,
        location: { address: formData.location },
        category: categoryId,
        type,
        removedImages: removedImageIds,
        ...(type === "rent" && {
          rentDetails: {
            duration: formData.rentDuration,
            securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : undefined,
            availabilityDate: formData.availabilityDate,
          }
        }),
        ...(type === "exchange" && {
          exchangeDetails: {
            exchangeFor: formData.exchangeFor,
            exchangePreferences: formData.exchangePreferences,
          }
        }),
        contactInfo: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          showPhoneNumber: formData.showPhoneNumber,
        },
      };

      await itemAPI.updateItem(id, itemData);

      if (formData.images.length > 0) {
        await itemAPI.uploadItemImages(id, formData.images);
      }

      navigate("/my-items");
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update item: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyles = (selectedType) => {
    switch (selectedType) {
      case "sell": return "bg-itemTypes-sell-bg text-itemTypes-sell-text";
      case "rent": return "bg-itemTypes-rent-bg text-itemTypes-rent-text";
      case "exchange": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (typeValue) => {
    return typeValue ? typeValue.charAt(0).toUpperCase() + typeValue.slice(1) : "";
  };

  if (loading && !selectedCategory) return <div>Loading...</div>;

  return (
    <div className="layout bg-background">
      <form onSubmit={handleSubmit} className="container py-section">
        <div className="max-w-profile mx-auto space-y-8">
          <H1 className="mb-6">Edit Item</H1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Item Type Selection */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-base font-medium">Type</span>
                <div className="flex gap-4">
                  {["sell", "rent", "exchange"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded-md border ${
                        type === option
                          ? `${getTypeStyles(option)} border-primary`
                          : "border-gray-200 text-gray-600"
                      }`}
                      onClick={() => handleTypeChange(option)}
                      disabled={loading}
                    >
                      {getTypeLabel(option)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-base font-medium">Category</span>
                {loading && !selectedCategory ? (
                  <span>Loading category...</span>
                ) : (
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
                      <div className="font-medium">
                        {selectedCategory?.name || "No category selected"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryDialogOpen(true)}
                className="text-blue-600 hover:text-blue-700"
                disabled={loading}
              >
                Change
              </button>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Images</H2>
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

              {existingImages.map((image) => (
                <div key={image._id} className="relative aspect-square border border-gray-200 rounded-lg">
                  <img
                    src={image.url}
                    alt={`Image ${image._id}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image._id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    disabled={loading || existingImages.length - removedImageIds.length + formData.images.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {previewImages.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square border border-gray-200 rounded-lg">
                  <img
                    src={url}
                    alt={`New Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    disabled={loading || (existingImages.length - removedImageIds.length === 0 && formData.images.length <= 1)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {existingImages.length - removedImageIds.length + formData.images.length === 0 && (
              <div className="mt-4 text-red-500 text-sm">At least one image is required</div>
            )}
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
            <H2 className="mb-6">{type === "sell" ? "Price and Location" : "Location"}</H2>
            <div className="space-y-6">
              {type === "sell" && (
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
              )}
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

          {/* Rental Details Section (for Rent type only) */}
          {type === "rent" && (
            <div className="bg-card rounded-lg p-8 border border-gray-200">
              <H2 className="mb-6">Rental Details</H2>
              <div className="space-y-6">
                <Input
                  label="Rent Duration"
                  name="rentDuration"
                  value={formData.rentDuration}
                  onChange={handleChange}
                  placeholder="e.g., 1 month, 3 days"
                  required
                  disabled={loading}
                />
                <Input
                  label="Security Deposit"
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="Enter security deposit"
                  prefix="Rs"
                  disabled={loading}
                />
                <Input
                  label="Availability Date"
                  type="date"
                  name="availabilityDate"
                  value={formData.availabilityDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Exchange Details Section (for Exchange type only) */}
          {type === "exchange" && (
            <div className="bg-card rounded-lg p-8 border border-gray-200">
              <H2 className="mb-6">Exchange Details</H2>
              <div className="space-y-6">
                <Input
                  label="Exchange For"
                  name="exchangeFor"
                  value={formData.exchangeFor}
                  onChange={handleChange}
                  placeholder="What are you looking to exchange for?"
                  required
                  disabled={loading}
                />
                <Input
                  type="textarea"
                  label="Exchange Preferences"
                  name="exchangePreferences"
                  value={formData.exchangePreferences}
                  onChange={handleChange}
                  placeholder="Describe your preferences for the exchange"
                  rows={4}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Contact Information</H2>
            <div className="space-y-6">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={loading}
              />
              <Input
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                disabled={loading}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showPhoneNumber"
                  checked={formData.showPhoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span className="text-sm">Show phone number in ad</span>
              </label>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/my-items")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Ad"}
              </Button>
            </div>
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

export default EditItem;