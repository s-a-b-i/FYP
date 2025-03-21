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
  const [type, setType] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sex: "",
    condition: "",
    size: "",
    material: "",
    brand: "",
    color: "",
    location: "",
    images: [],
    name: "",
    phoneNumber: "",
    showPhoneNumber: false,
    rentDuration: "",
    pricePerUnit: "",
    securityDeposit: "",
    availabilityDate: "",
    sizeAvailability: [{ size: "", quantity: 1 }],
    cleaningFee: "",
    lateFee: "",
    careInstructions: "",
    exchangeFor: "",
    preferredSizes: [],
    preferredCondition: "",
    preferredBrands: [],
    exchangePreferences: "",
    shippingPreference: "",
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

        setType(item.type);

        const categoryId = typeof item.category === "object" ? item.category._id : item.category;
        if (categoryId) {
          const categoryResponse = await categoryAPI.getCategoryById(categoryId);
          setSelectedCategory(categoryResponse.data || categoryResponse);
        }

        setFormData({
          title: item.title || "",
          description: item.description || "",
          price: item.type === "sell" && item.price ? item.price.amount || "" : "",
          sex: item.sex || "",
          condition: item.condition || "",
          size: item.size || "",
          material: item.material || "",
          brand: item.brand || "",
          color: item.color || "",
          location: item.location?.address || item.location || "",
          images: [],
          name: item.contactInfo?.name || "",
          phoneNumber: item.contactInfo?.phoneNumber || "",
          showPhoneNumber: item.contactInfo?.showPhoneNumber || false,
          rentDuration: item.rentDetails?.duration || "",
          pricePerUnit: item.rentDetails?.pricePerUnit || "",
          securityDeposit: item.rentDetails?.securityDeposit || "",
          availabilityDate: item.rentDetails?.availabilityDate ? new Date(item.rentDetails.availabilityDate).toISOString().split("T")[0] : "",
          sizeAvailability: item.rentDetails?.sizeAvailability?.length > 0 ? item.rentDetails.sizeAvailability : [{ size: "", quantity: 1 }],
          cleaningFee: item.rentDetails?.cleaningFee || "",
          lateFee: item.rentDetails?.lateFee || "",
          careInstructions: item.rentDetails?.careInstructions || "",
          exchangeFor: item.exchangeDetails?.exchangeFor || "",
          preferredSizes: item.exchangeDetails?.preferredSizes || [],
          preferredCondition: item.exchangeDetails?.preferredCondition || "",
          preferredBrands: item.exchangeDetails?.preferredBrands || [],
          exchangePreferences: item.exchangeDetails?.exchangePreferences || "",
          shippingPreference: item.exchangeDetails?.shippingPreference || "",
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
      [name]: inputType === "checkbox" ? checked : inputType === "select-multiple" ? Array.from(e.target.selectedOptions, option => option.value) : value,
    }));
  };

  const handleNestedChange = (field, subField, value, index) => {
    if (field === "sizeAvailability") {
      setFormData((prev) => {
        const updatedSizes = [...prev.sizeAvailability];
        updatedSizes[index][subField] = value;
        return { ...prev, sizeAvailability: updatedSizes };
      });
    }
  };

  const addSizeAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      sizeAvailability: [...prev.sizeAvailability, { size: "", quantity: 1 }],
    }));
  };

  const removeSizeAvailability = (index) => {
    setFormData((prev) => ({
      ...prev,
      sizeAvailability: prev.sizeAvailability.filter((_, i) => i !== index),
    }));
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setFormData((prev) => ({
      ...prev,
      price: newType === "sell" ? prev.price : "",
      rentDuration: newType === "rent" ? prev.rentDuration : "",
      pricePerUnit: newType === "rent" ? prev.pricePerUnit : "",
      securityDeposit: newType === "rent" ? prev.securityDeposit : "",
      availabilityDate: newType === "rent" ? prev.availabilityDate : "",
      sizeAvailability: newType === "rent" ? prev.sizeAvailability : [{ size: "", quantity: 1 }],
      cleaningFee: newType === "rent" ? prev.cleaningFee : "",
      lateFee: newType === "rent" ? prev.lateFee : "",
      careInstructions: newType === "rent" ? prev.careInstructions : "",
      exchangeFor: newType === "exchange" ? prev.exchangeFor : "",
      preferredSizes: newType === "exchange" ? prev.preferredSizes : [],
      preferredCondition: newType === "exchange" ? prev.preferredCondition : "",
      preferredBrands: newType === "exchange" ? prev.preferredBrands : [],
      exchangePreferences: newType === "exchange" ? prev.exchangePreferences : "",
      shippingPreference: newType === "exchange" ? prev.shippingPreference : "",
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
    const clothingCategoryId = 'clothing_category_id'; // Replace with actual ID
  
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
  
    if (type === "rent" && (!formData.rentDuration || !formData.pricePerUnit || !formData.availabilityDate)) {
      setError("Rent duration, price per unit, and availability date are required for rent items");
      return false;
    }
  
    if (type === "exchange" && !formData.exchangeFor) {
      setError("Exchange for is required for exchange items");
      return false;
    }
  
    if (selectedCategory?._id === clothingCategoryId && !formData.size) {
      setError("Size is required for clothing items");
      return false;
    }
  
    if (formData.size && !["XS", "S", "M", "L", "XL", "XXL", "Custom"].includes(formData.size)) {
      setError("Please select a valid size");
      return false;
    }
  
    return true;
  };
  
// EditItem.js
// EditItem.js
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const categoryId = selectedCategory?._id || "";

    const itemData = new FormData();
    itemData.append("title", formData.title);
    itemData.append("description", formData.description);
    if (type === "sell") {
      itemData.append("price", JSON.stringify({ amount: parseFloat(formData.price) }));
    }
    itemData.append("sex", formData.sex);
    itemData.append("condition", formData.condition);
    if (formData.size) itemData.append("size", formData.size);
    itemData.append("material", formData.material);
    itemData.append("brand", formData.brand);
    itemData.append("color", formData.color);
    itemData.append("location", JSON.stringify({ address: formData.location }));
    itemData.append("category", categoryId);
    itemData.append("type", type);
    itemData.append("removedImages", JSON.stringify(removedImageIds));

    if (type === "rent") {
      itemData.append(
        "rentDetails",
        JSON.stringify({
          duration: formData.rentDuration,
          pricePerUnit: Number(formData.pricePerUnit) || undefined,
          securityDeposit: Number(formData.securityDeposit) || undefined,
          availabilityDate: formData.availabilityDate,
          sizeAvailability: formData.sizeAvailability.filter(s => s.size),
          cleaningFee: Number(formData.cleaningFee) || undefined,
          lateFee: Number(formData.lateFee) || undefined,
          careInstructions: formData.careInstructions,
        })
      );
    }

    if (type === "exchange") {
      itemData.append(
        "exchangeDetails",
        JSON.stringify({
          exchangeFor: formData.exchangeFor,
          preferredSizes: formData.preferredSizes,
          preferredCondition: formData.preferredCondition || "any",
          preferredBrands: formData.preferredBrands,
          exchangePreferences: formData.exchangePreferences,
          shippingPreference: formData.shippingPreference || "local-only",
        })
      );
    }

    itemData.append(
      "contactInfo",
      JSON.stringify({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        showPhoneNumber: formData.showPhoneNumber,
      })
    );

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
                      className={`px-4 py-2 rounded-md border ${type === option ? `${getTypeStyles(option)} border-primary` : "border-gray-200 text-gray-600"}`}
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
                        <img src={selectedCategory.icon.url} alt={selectedCategory.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{selectedCategory?.name || "No category selected"}</div>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setIsCategoryDialogOpen(true)} className="text-blue-600 hover:text-blue-700" disabled={loading}>Change</button>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Images</H2>
            <div className="grid grid-cols-4 gap-4">
              <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer flex items-center justify-center">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
                <Plus className="w-6 h-6 text-gray-400" />
              </label>

              {existingImages.map((image) => (
                <div key={image._id} className="relative aspect-square border border-gray-200 rounded-lg">
                  <img src={image.url} alt={`Image ${image._id}`} className="w-full h-full object-cover rounded-lg" />
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
                  <img src={url} alt={`New Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
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
                      className={`px-4 py-2 rounded-md border ${formData.sex.toLowerCase() === option.toLowerCase() ? "border-primary text-primary" : "border-gray-200"}`}
                      onClick={() => handleChange({ target: { name: "sex", value: option.toLowerCase() } })}
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
                      className={`px-4 py-2 rounded-md border ${formData.condition.toLowerCase() === option.toLowerCase() ? "border-primary text-primary" : "border-gray-200"}`}
                      onClick={() => handleChange({ target: { name: "condition", value: option.toLowerCase() } })}
                      disabled={loading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <Select
                label="Size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                options={["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(s => ({ label: s, value: s }))}
                required={selectedCategory?._id === 'clothing_category_id'}
                disabled={loading}
              />
              <Input label="Material" name="material" value={formData.material} onChange={handleChange} placeholder="e.g., 100% Cotton" disabled={loading} />
              <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Zara" disabled={loading} />
              <Input label="Color" name="color" value={formData.color} onChange={handleChange} placeholder="e.g., Blue" disabled={loading} />
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
                placeholder="Mention key features (e.g. brand, size)"
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
                placeholder="Include condition, features, etc."
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

          {/* Rental Details Section */}
          {type === "rent" && (
            <div className="bg-card rounded-lg p-8 border border-gray-200">
              <H2 className="mb-6">Rental Details</H2>
              <div className="space-y-6">
                <Input
                  label="Rent Duration"
                  name="rentDuration"
                  value={formData.rentDuration}
                  onChange={handleChange}
                  placeholder="e.g., 3 days"
                  required
                  disabled={loading}
                />
                <Input
                  label="Price Per Unit"
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="Enter rental price"
                  required
                  prefix="Rs"
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
                <Input
                  label="Cleaning Fee"
                  type="number"
                  name="cleaningFee"
                  value={formData.cleaningFee}
                  onChange={handleChange}
                  placeholder="Enter cleaning fee"
                  prefix="Rs"
                  disabled={loading}
                />
                <Input
                  label="Late Fee"
                  type="number"
                  name="lateFee"
                  value={formData.lateFee}
                  onChange={handleChange}
                  placeholder="Enter late fee"
                  prefix="Rs"
                  disabled={loading}
                />
                <Input
                  type="textarea"
                  label="Care Instructions"
                  name="careInstructions"
                  value={formData.careInstructions}
                  onChange={handleChange}
                  placeholder="e.g., Dry clean only"
                  rows={4}
                  disabled={loading}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Size Availability</label>
                  {formData.sizeAvailability.map((size, index) => (
                    <div key={index} className="flex gap-4 mb-2">
                      <Select
                        name={`size-${index}`}
                        value={size.size}
                        onChange={(e) => handleNestedChange("sizeAvailability", "size", e.target.value, index)}
                        options={["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(s => ({ label: s, value: s }))}
                        disabled={loading}
                      />
                      <Input
                        type="number"
                        name={`quantity-${index}`}
                        value={size.quantity}
                        onChange={(e) => handleNestedChange("sizeAvailability", "quantity", e.target.value, index)}
                        placeholder="Quantity"
                        min="1"
                        disabled={loading}
                      />
                      <button type="button" onClick={() => removeSizeAvailability(index)} className="text-red-600" disabled={loading}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={addSizeAvailability} className="text-blue-600" disabled={loading}>Add Size</button>
                </div>
              </div>
            </div>
          )}

          {/* Exchange Details Section */}
          {type === "exchange" && (
            <div className="bg-card rounded-lg p-8 border border-gray-200">
              <H2 className="mb-6">Exchange Details</H2>
              <div className="space-y-6">
                <Input
                  label="Exchange For"
                  name="exchangeFor"
                  value={formData.exchangeFor}
                  onChange={handleChange}
                  placeholder="What do you want in exchange?"
                  required
                  disabled={loading}
                />
                <Select
                  label="Preferred Sizes"
                  name="preferredSizes"
                  value={formData.preferredSizes}
                  onChange={handleChange}
                  options={["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(s => ({ label: s, value: s }))}
                  multiple
                  disabled={loading}
                />
                <Select
                  label="Preferred Condition"
                  name="preferredCondition"
                  value={formData.preferredCondition}
                  onChange={handleChange}
                  options={["new", "like-new", "gently-used", "any"].map(c => ({ label: c, value: c }))}
                  disabled={loading}
                />
                <Input
                  label="Preferred Brands"
                  name="preferredBrands"
                  value={formData.preferredBrands.join(',')}
                  onChange={(e) => setFormData({ ...formData, preferredBrands: e.target.value.split(',').map(b => b.trim()) })}
                  placeholder="e.g., Nike, Adidas"
                  disabled={loading}
                />
                <Input
                  type="textarea"
                  label="Exchange Preferences"
                  name="exchangePreferences"
                  value={formData.exchangePreferences}
                  onChange={handleChange}
                  placeholder="Describe your preferences"
                  rows={4}
                  disabled={loading}
                />
                <Select
                  label="Shipping Preference"
                  name="shippingPreference"
                  value={formData.shippingPreference}
                  onChange={handleChange}
                  options={["local-only", "willing-to-ship", "buyer-pays-shipping"].map(s => ({ label: s, value: s }))}
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/my-items")} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
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