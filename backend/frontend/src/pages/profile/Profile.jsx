// Profile.jsx
import React, { useState } from "react";
import { Upload } from "lucide-react";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select"
import { H1, H2, H3 } from "@/components/shared/Heading";
const Profile = () => {
  const [formData, setFormData] = useState({
    profilePhoto: null,
    name: "",
    dateOfBirth: {
      day: "",
      month: "",
      year: "",
    },
    gender: "",
    about: "",
    phone: "",
    email: "",
    socialConnections: {
      facebook: false,
      google: false,
    }
  });

  const [errors, setErrors] = useState({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.dateOfBirth.day) newErrors.day = "Day is required";
    if (!formData.dateOfBirth.month) newErrors.month = "Month is required";
    if (!formData.dateOfBirth.year) newErrors.year = "Year is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.about.length > 200) newErrors.about = "About me should be max 200 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "profilePhoto") {
      const file = files[0];
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSocialConnect = (platform) => {
    setFormData(prev => ({
      ...prev,
      socialConnections: {
        ...prev.socialConnections,
        [platform]: !prev.socialConnections[platform]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Add actual submission logic
    }
  };

  const handleDeleteAccount = () => {
    // Add account deletion logic
    console.log("Account deletion requested");
  };

  const generateOptions = (type) => {
    switch(type) {
      case 'day':
        return Array.from({length: 31}, (_, i) => i + 1);
      case 'month':
        return [
          'January', 'February', 'March', 'April', 
          'May', 'June', 'July', 'August', 
          'September', 'October', 'November', 'December'
        ];
      case 'year':
        return Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);
      default:
        return [];
    }
  };

  const resetForm = () => {
    setFormData({
      profilePhoto: null,
      name: "",
      dateOfBirth: { day: "", month: "", year: "" },
      gender: "",
      about: "",
      phone: "",
      email: "",
      socialConnections: { facebook: false, google: false }
    });
    setProfilePhotoPreview(null);
  };

  return (
    <div className="layout bg-background">
      <form onSubmit={handleSubmit} className="container py-section">
        <div className="max-w-profile mx-auto bg-card rounded-lg  p-8 border border-gray-200">
        <H1 withBorder className="mb-8">Edit Profile</H1>

          {/* Profile Photo Section */}
{/* Profile Photo Section */}
<section className="section-sm border-b border-gray-200 pb-6">
  <div className="space-y-4">
    <p className="text-sm font-medium text-gray-500">Profile Photo</p>
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        {profilePhotoPreview ? (
          <img 
            src={profilePhotoPreview} 
            alt="Profile Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <input
          type="file"
          id="profilePhotoInput"
          name="profilePhoto"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
        />
        <Button 
          variant="primary" 
          type="button"
          onClick={() => document.getElementById('profilePhotoInput').click()}
        >
          Upload Photo
        </Button>
        <p className="text-xs text-gray-500">
          JPG, JPEG, PNG (min: 400px, max: 1024px)
        </p>
      </div>
    </div>
  </div>
</section>

          {/* Personal Information */}
          <section className="section-sm border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>

            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              error={errors.name}
            />

            <div className="grid grid-cols-3 gap-4 mt-4">
              {["day", "month", "year"].map((field) => (
                <Select
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={`dateOfBirth.${field}`}
                  value={formData.dateOfBirth[field]}
                  onChange={handleInputChange}
                  options={generateOptions(field)}
                  placeholder={`Select ${field}`}
                  error={errors[field]}
                />
              ))}
            </div>

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" }
              ]}
              placeholder="Select gender"
              error={errors.gender}
              className="mt-4"
            />

            <Input
              type="textarea"
              label="About Me"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              maxLength={200}
              error={errors.about}
              className="mt-4"
            />
          </section>

          {/* Contact Information */}
          <section className="section-sm border-b border-gray-200 pb-6">
          <H2 className="mb-6">Contact Information</H2>
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              error={errors.phone}
            />

            <Input
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              error={errors.email}
              className="mt-4"
            />
          </section>

          {/* Social Connections */}
          <section className="section-sm border-b border-gray-200 pb-6">
          <H2 className="mb-6">Social Connections</H2>

            {["Facebook", "Google"].map((platform) => (
              <div key={platform} className="flex justify-between items-center py-4 border-b border-gray-200">
                <div className="space-y-1">
                <H3>{platform}</H3>
                  <p className="text-sm text-gray-500">
                    {platform === "Facebook"
                      ? "Connect with Facebook to find trusted connections"
                      : "Link your Google account for easier access"}
                  </p>
                </div>
                <Button
                  variant={formData.socialConnections[platform.toLowerCase()] ? "primary" : "outline"}
                  onClick={() => handleSocialConnect(platform.toLowerCase())}
                >
                  {formData.socialConnections[platform.toLowerCase()] ? 'Connected' : 'Connect'}
                </Button>
              </div>
            ))}
          </section>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-8">
            <Button variant="outline" onClick={resetForm}>
              Discard Changes
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Account Container */}
      <div className="container py-section">
        <div className="max-w-profile mx-auto bg-card rounded-lg  p-8 border border-border">
        <H1 withBorder className="mb-4">Delete this account</H1>

          <div className="space-y-4">
            <div className="pb-4 border-b border-border">
              <p className="text-base text-gray-700">
                Are you sure you want to delete your account?
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                className="w-full md:w-auto"
              >
                Yes, delete my account
              </Button>

              <Button variant="link">
                See more info
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;