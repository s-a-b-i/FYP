import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { X, Plus, Image as ImageIcon, MapPinIcon, ChevronUp } from "lucide-react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import CategorySelectionDialog from "@/pages/post/CategorySelectionDialog";
import { itemAPI } from "@/api/item";
import { categoryAPI } from "@/api/category";
import { H1, H2 } from "@/components/shared/Heading";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { State, City } from "country-state-city"; // Import for provinces and cities

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

  // Location-related state
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isNeighborhoodDropdownOpen, setIsNeighborhoodDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: type === "sell" ? "" : undefined,
    sex: "",
    condition: "",
    size: "",
    material: "",
    brand: "",
    color: "",
    location: { city: "", neighborhood: "" },
    images: [],
    name: "",
    phoneNumber: "",
    showPhoneNumber: false,
    ...(type === "rent" && {
      rentDuration: "",
      pricePerUnit: "",
      securityDeposit: "",
      availabilityDate: "",
      sizeAvailability: [{ size: "", quantity: 1 }],
      cleaningFee: "",
      lateFee: "",
      careInstructions: "",
    }),
    ...(type === "exchange" && {
      exchangeFor: "",
      preferredSizes: [],
      preferredCondition: "",
      preferredBrands: [],
      exchangePreferences: "",
      shippingPreference: "",
    }),
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
        setSelectedCategory(response.data || response);
      } catch (err) {
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    // Fetch all provinces in Pakistan
    const pakistanProvinces = State.getStatesOfCountry("PK");
    setProvinces(pakistanProvinces);

    fetchCategory();
  }, [isAuthenticated, navigate, type, categoryId]);

  // Fetch cities when a province is selected
  useEffect(() => {
    if (selectedProvince) {
      const provinceCities = City.getCitiesOfState("PK", selectedProvince);
      setCities(provinceCities);
      setSelectedCity("");
      setSelectedNeighborhood("");
      setNeighborhoods([]);
    }
  }, [selectedProvince]);

  // Comprehensive neighborhood mock data for all major cities in Pakistan
  useEffect(() => {
    if (selectedCity) {
      const neighborhoodData = {
        // Punjab
        "Lahore": [
          "Gulberg", "DHA", "Model Town", "Johar Town", "Cantt", "Iqbal Town", "Faisal Town", 
          "Shadman", "Garden Town", "Township", "Samanabad", "Wapda Town", "Valencia Town", 
          "Shalimar", "Ravi Road", "Sabzazar", "Thokar Niaz Baig", "Green Town", "Baghbanpura"
        ],
        "Faisalabad": [
          "D Ground", "Peoples Colony", "Madina Town", "Gulberg", "Jinnah Colony", "Civil Lines", 
          "Sargodha Road", "Satiana Road", "Kohinoor City", "Susan Road", "Factory Area", 
          "Gulistan Colony", "Railway Colony", "Abdullahpur"
        ],
        "Rawalpindi": [
          "Saddar", "Satellite Town", "Chaklala", "Bahria Town", "DHA", "West Ridge", "Adiala Road", 
          "Gulraiz", "Pindora", "Shalley Valley", "Rawal Town", "Committee Chowk", "Korang Town"
        ],
        "Multan": [
          "Cantt", "Gulgasht Colony", "Model Town", "Shah Rukn-e-Alam", "Boson Road", "New Multan", 
          "Wapda Town", "Qasim Bela", "Mumtazabad", "Nishtar Road", "Suraj Miani", "Chowk Kumharanwala"
        ],
        "Gujranwala": [
          "Satellite Town", "Model Town", "Civil Lines", "Wapda Town", "G.T. Road", "DHA", 
          "Peoples Colony", "Rahwali", "Nowshera Virkan", "Jinnah Road", "Master City"
        ],
        "Sialkot": [
          "Cantt", "Model Town", "Rangpura", "Defence", "Gohadpur", "Kashmir Road", "Paris Road", 
          "Daska Road", "Sadar Bazar", "Khawaja Safdar Road", "Shahabpura"
        ],
        "Bahawalpur": [
          "Model Town", "Satellite Town", "Cantt", "Farid Gate", "Yazman Road", "Gulberg Colony", 
          "Trust Colony", "Sadiq Colony", "Circular Road"
        ],
        "Sargodha": [
          "Satellite Town", "Cantt", "Civil Lines", "Faisalabad Road", "Club Road", "Zafar Ullah Road", 
          "New Satellite Town", "Lahore Road", "University Road"
        ],
      
        // Sindh
        "Karachi": [
          "Clifton", "DHA", "Gulshan-e-Iqbal", "North Nazimabad", "Saddar", "PECHS", "Korangi", 
          "Malir", "Nazimabad", "Federal B Area", "Gulistan-e-Johar", "Shahrah-e-Faisal", 
          "Tariq Road", "Lyari", "Defence View", "KDA Scheme 1", "Bahadurabad", "Landhi"
        ],
        "Hyderabad": [
          "Latifabad", "Qasimabad", "Saddar", "Hussainabad", "Auto Bhan Road", "Civil Lines", 
          "Thandi Sarak", "Hala Naka", "Citizen Colony", "Hirabad", "Gulshan-e-Sajjad"
        ],
        "Sukkur": [
          "Shalimar", "Queens Road", "Minara Road", "Military Road", "New Sukkur", "Old Sukkur", 
          "Barrage Colony", "Shikarpur Road", "Golimar"
        ],
        "Larkana": [
          "Bakrani Road", "Sheikh Zayed Road", "VIP Road", "Station Road", "Lahori Mohalla", 
          "Allahabad", "Nazar Mohalla", "Rehmatpur"
        ],
        "Nawabshah": [
          "Sakrand Road", "Hospital Road", "Masjid Road", "Civil Lines", "Housing Society", 
          "Mohni Bazar", "Qazi Ahmed Road"
        ],
      
        // Khyber Pakhtunkhwa
        "Peshawar": [
          "Hayatabad", "University Town", "Cantt", "Saddar", "Gulberg", "DHA", "Warsak Road", 
          "Board Bazar", "Karkhano Market", "Faqirabad", "Gulbahar", "Tehkal"
        ],
        "Abbottabad": [
          "Supply", "Mandian", "PMA Road", "Jinnahabad", "Habibullah Colony", "Kaghan Colony", 
          "Pine View Road", "Nawanshehr", "Bilal Town"
        ],
        "Mardan": [
          "Cantonment", "Shamsi Road", "Baghdada", "Toru", "Sheikh Maltoon Town", "Par Hoti", 
          "Bank Road", "Nowshera Road"
        ],
        "Swat": [
          "Mingora", "Saidu Sharif", "Fiza Gat", "Malam Jabba Road", "Amankot", "Rahimabad", 
          "Qambar", "Kalam Road"
        ],
        "Kohat": [
          "Cantt", "KDA Township", "Bannu Road", "Hangu Road", "Pindi Road", "Jungle Khel", 
          "Mirza Khail"
        ],
      
        // Balochistan
        "Quetta": [
          "Cantt", "Jinnah Town", "Satellite Town", "Brewery Road", "Sariab Road", "Zarghoon Road", 
          "Hanna Road", "Patel Bagh", "Samungli Road", "Airport Road", "Chiltan Housing Scheme"
        ],
        "Gwadar": [
          "Marine Drive", "Airport Road", "Koh-e-Batil", "West Bay", "East Bay", "Jinnah Avenue", 
          "Surbandan", "Pishukan Road"
        ],
        "Turbat": [
          "Main Bazar", "Airport Road", "D-Baloch Colony", "Mirani Road", "Absar Town", 
          "Satellite Town", "Kech Road"
        ],
        "Zhob": [
          "Cantt", "Killi Shabo", "Killi Mengal", "Main Bazaar", "Hospital Road", "Police Line"
        ],
      
        // Islamabad Capital Territory
        "Islamabad": [
          "F-6", "F-7", "F-8", "F-10", "F-11", "G-6", "G-7", "G-8", "G-9", "G-10", "G-11", 
          "E-7", "E-11", "D-12", "Blue Area", "DHA", "Bahria Town", "I-8", "I-9", "I-10", 
          "H-8", "H-9", "H-11", "Bani Gala", "Chak Shahzad"
        ],
      
        // Gilgit-Baltistan
        "Gilgit": [
          "Jutial", "River View", "Konodas", "Danyore", "Nomal", "Airport Road", "Kashrote", 
          "Zulfiqarabad"
        ],
        "Skardu": [
          "Yadgar Chowk", "Hussainabad", "Satellite Town", "New Bazaar", "Olding", "Aliabad", 
          "Airport Road"
        ],
      
        // Azad Jammu and Kashmir
        "Muzaffarabad": [
          "CMH Road", "Madina Market", "Plateau", "Gojra", "Chella Bandi", "Tariqabad", 
          "Lower Chatter", "Upper Chatter"
        ],
        "Mirpur": [
          "Sector F-1", "Sector F-2", "Sector F-3", "Allama Iqbal Road", "New City", "Old City", 
          "Chowk Shaheedan", "Kashmir Colony"
        ],
        "Rawalakot": [
          "Main Bazaar", "Housing Scheme", "Khaigala Road", "Dothan", "Paniola", "CMH Road"
        ]
      };
      setNeighborhoods(neighborhoodData[selectedCity] || []);
      setSelectedNeighborhood("");
    }
  }, [selectedCity]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 12) {
      alert("Maximum 12 images allowed");
      return;
    }

    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
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

  const handleProvinceSelect = (provinceIsoCode, provinceName) => {
    setSelectedProvince(provinceIsoCode);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, city: "", neighborhood: "" },
    }));
    setIsProvinceDropdownOpen(false);
  };

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, city: cityName, neighborhood: "" },
    }));
    setIsCityDropdownOpen(false);
  };

  const handleNeighborhoodSelect = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, neighborhood },
    }));
    setIsNeighborhoodDropdownOpen(false);
  };

  const ProvinceDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
      {provinces.map((province) => (
        <button
          key={province.isoCode}
          onClick={() => handleProvinceSelect(province.isoCode, province.name)}
          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <MapPinIcon className="h-4 w-4 text-gray-500" />
          <span>{province.name}</span>
        </button>
      ))}
    </div>
  );

  const CityDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
      {cities.map((city) => (
        <button
          key={city.name}
          onClick={() => handleCitySelect(city.name)}
          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <MapPinIcon className="h-4 w-4 text-gray-500" />
          <span>{city.name}</span>
        </button>
      ))}
    </div>
  );

  const NeighborhoodDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
      {neighborhoods.map((neighborhood) => (
        <button
          key={neighborhood}
          onClick={() => handleNeighborhoodSelect(neighborhood)}
          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <MapPinIcon className="h-4 w-4 text-gray-500" />
          <span>{neighborhood}</span>
        </button>
      ))}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const clothingCategoryId = 'clothing_category_id';
      const isClothing = categoryId === clothingCategoryId;

      if (isClothing && !formData.size) {
        throw new Error("Size is required for clothing items");
      }
      if (!formData.location.city || !formData.location.neighborhood) {
        throw new Error("City and neighborhood are required");
      }
      if (formData.images.length === 0) {
        throw new Error("At least one image is required");
      }
      if (type === "exchange" && !formData.exchangeFor.trim()) {
        throw new Error("Exchange For is required for exchange items");
      }
      if (type === "sell" && (!formData.price || Number(formData.price) <= 0)) {
        throw new Error("Price is required and must be greater than 0 for sell items");
      }
      if (type === "rent" && (!formData.rentDuration || !formData.pricePerUnit || !formData.availabilityDate)) {
        throw new Error("Rent duration, price per unit, and availability date are required for rent items");
      }

      const itemData = new FormData();
      itemData.append("category", categoryId);
      itemData.append("type", type);
      itemData.append("title", formData.title);
      itemData.append("description", formData.description);
      itemData.append("condition", formData.condition);
      itemData.append("sex", formData.sex);
      if (isClothing) itemData.append("size", formData.size);
      itemData.append("material", formData.material);
      itemData.append("brand", formData.brand);
      itemData.append("color", formData.color);
      itemData.append("location", JSON.stringify(formData.location));

      if (type === "sell") {
        itemData.append("price", JSON.stringify({ amount: Number(formData.price), currency: "PKR" }));
      }

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

      formData.images.forEach((image, index) => {
        itemData.append("images", image);
      });

      const response = await itemAPI.createItem(itemData);

      setPreviewImages([]);
      setFormData((prev) => ({ ...prev, images: [] }));
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

  if (loading) return <LoadingSpinner />;
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
                      <img src={selectedCategory.icon.url} alt={selectedCategory.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedCategory?.name || "Loading..."}</div>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setIsCategoryDialogOpen(true)} className="text-blue-600 hover:text-blue-700">Change</button>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Upload Images</H2>
            <div className="grid grid-cols-4 gap-4">
              <label className="relative aspect-square w-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer flex items-center justify-center">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
                <Plus className="w-4 h-4 text-gray-400" />
              </label>
              {previewImages.map((url, index) => (
                <div key={index} className="relative aspect-square w-32 border border-gray-200 rounded-lg">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Description</H2>
            <div className="space-y-6">
              <Input label="Ad title" name="title" value={formData.title} onChange={handleChange} placeholder="Mention key features (e.g. brand, size)" maxLength={70} required disabled={loading} />
              <Input type="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Include condition, features, etc." rows={4} maxLength={4096} required disabled={loading} />
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
                    <button key={option} type="button" className={`px-4 py-2 rounded-md border ${formData.sex.toLowerCase() === option.toLowerCase() ? "border-primary text-primary" : "border-gray-200"}`} onClick={() => handleChange({ target: { name: "sex", value: option.toLowerCase() } })} disabled={loading}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <div className="flex gap-4">
                  {["New", "Used"].map((option) => (
                    <button key={option} type="button" className={`px-4 py-2 rounded-md border ${formData.condition.toLowerCase() === option.toLowerCase() ? "border-primary text-primary" : "border-gray-200"}`} onClick={() => handleChange({ target: { name: "condition", value: option.toLowerCase() } })} disabled={loading}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <Select label="Size" name="size" value={formData.size} onChange={handleChange} options={["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(s => ({ label: s, value: s }))} required={categoryId === 'clothing_category_id'} disabled={loading} />
              <Input label="Material" name="material" value={formData.material} onChange={handleChange} placeholder="e.g., 100% Cotton" disabled={loading} />
              <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Zara" disabled={loading} />
              <Input label="Color" name="color" value={formData.color} onChange={handleChange} placeholder="e.g., Blue" disabled={loading} />
            </div>
          </div>

          {/* Price and Location Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">{type === "sell" ? "Price and Location" : "Location"}</H2>
            <div className="space-y-6">
              {type === "sell" && (
                <Input label="Price" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Enter Price" required prefix="PKR" disabled={loading} />
              )}
              <div className="space-y-4">
                {/* Province Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Province</label>
                  <button
                    type="button"
                    onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                    className="w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-700" />
                      <span className="truncate">{selectedProvince ? provinces.find(p => p.isoCode === selectedProvince)?.name : "Select Province"}</span>
                    </div>
                    <ChevronUp className={`h-4 w-4 transition-transform ${isProvinceDropdownOpen ? '' : 'rotate-180'}`} />
                  </button>
                  {isProvinceDropdownOpen && <ProvinceDropdown />}
                </div>

                {/* City Selection */}
                {selectedProvince && (
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">City</label>
                    <button
                      type="button"
                      onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      className="w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                      disabled={loading}
                    >
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-700" />
                        <span className="truncate">{selectedCity || "Select City"}</span>
                      </div>
                      <ChevronUp className={`h-4 w-4 transition-transform ${isCityDropdownOpen ? '' : 'rotate-180'}`} />
                    </button>
                    {isCityDropdownOpen && <CityDropdown />}
                  </div>
                )}

                {/* Neighborhood Selection */}
                {selectedCity && (
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Neighborhood</label>
                    <button
                      type="button"
                      onClick={() => setIsNeighborhoodDropdownOpen(!isNeighborhoodDropdownOpen)}
                      className="w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
                      disabled={loading}
                    >
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-700" />
                        <span className="truncate">{selectedNeighborhood || "Select Neighborhood"}</span>
                      </div>
                      <ChevronUp className={`h-4 w-4 transition-transform ${isNeighborhoodDropdownOpen ? '' : 'rotate-180'}`} />
                    </button>
                    {isNeighborhoodDropdownOpen && <NeighborhoodDropdown />}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rental Details Section */}
          {type === "rent" && (
            <div className="bg-card rounded-lg p-8 border border-gray-200">
              <H2 className="mb-6">Rental Details</H2>
              <div className="space-y-6">
                <Input label="Rent Duration" name="rentDuration" value={formData.rentDuration} onChange={handleChange} placeholder="e.g., 3 days" required disabled={loading} />
                <Input label="Price Per Unit" type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleChange} placeholder="Enter rental price" required prefix="PKR" disabled={loading} />
                <Input label="Security Deposit" type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} placeholder="Enter security deposit" prefix="PKR" disabled={loading} />
                <Input label="Availability Date" type="date" name="availabilityDate" value={formData.availabilityDate} onChange={handleChange} required disabled={loading} />
                <Input label="Cleaning Fee" type="number" name="cleaningFee" value={formData.cleaningFee} onChange={handleChange} placeholder="Enter cleaning fee" prefix="PKR" disabled={loading} />
                <Input label="Late Fee" type="number" name="lateFee" value={formData.lateFee} onChange={handleChange} placeholder="Enter late fee" prefix="PKR" disabled={loading} />
                <Input type="textarea" label="Care Instructions" name="careInstructions" value={formData.careInstructions} onChange={handleChange} placeholder="e.g., Dry clean only" rows={4} disabled={loading} />
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
                <Input label="Exchange For" name="exchangeFor" value={formData.exchangeFor} onChange={handleChange} placeholder="What do you want in exchange?" required disabled={loading} />
                <Select label="Preferred Sizes" name="preferredSizes" value={formData.preferredSizes} onChange={(e) => setFormData({ ...prev, preferredSizes: Array.from(e.target.selectedOptions, option => option.value) })} options={["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(s => ({ label: s, value: s }))} multiple disabled={loading} />
                <Select label="Preferred Condition" name="preferredCondition" value={formData.preferredCondition} onChange={handleChange} options={["new", "like-new", "gently-used", "any"].map(c => ({ label: c, value: c }))} disabled={loading} />
                <Input label="Preferred Brands" name="preferredBrands" value={formData.preferredBrands.join(',')} onChange={(e) => setFormData({ ...formData, preferredBrands: e.target.value.split(',').map(b => b.trim()) })} placeholder="e.g., Nike, Adidas" disabled={loading} />
                <Input type="textarea" label="Exchange Preferences" name="exchangePreferences" value={formData.exchangePreferences} onChange={handleChange} placeholder="Describe your preferences" rows={4} disabled={loading} />
                <Select label="Shipping Preference" name="shippingPreference" value={formData.shippingPreference} onChange={handleChange} options={["local-only", "willing-to-ship", "buyer-pays-shipping"].map(s => ({ label: s, value: s }))} disabled={loading} />
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <H2 className="mb-6">Contact Information</H2>
            <div className="space-y-6">
              <Input label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required disabled={loading} />
              <Input label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter your phone number" required disabled={loading} />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="showPhoneNumber" checked={formData.showPhoneNumber} onChange={handleChange} disabled={loading} />
                <span className="text-sm">Show phone number in ad</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-card rounded-lg p-8 border border-gray-200">
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Posting..." : "Post now"}
            </Button>
          </div>
        </div>
      </form>

      <CategorySelectionDialog isOpen={isCategoryDialogOpen} onClose={() => setIsCategoryDialogOpen(false)} onSelectCategory={handleCategoryChange} />
    </div>
  );
};

export default PostAttributes;