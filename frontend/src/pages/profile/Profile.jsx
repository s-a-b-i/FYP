import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import { H1, H2, H3 } from "@/components/shared/Heading";
import { profileAPI } from "@/api/profile";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

import { useAuthStore } from "@/store/authStore"; // Import authStore
import ConfirmationModal from "@/components/shared/ConfirmationModal";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    },
    preferences: {},
  });

  const [errors, setErrors] = useState({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  // Get logout function from authStore
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      if (response && response.data) {
        const profile = response.data.data;
        setHasExistingProfile(true);

        // Parse date of birth
        const dob = new Date(profile.dateOfBirth);

        setFormData({
          ...profile,
          dateOfBirth: {
            day: dob.getDate().toString(),
            month: (dob.getMonth() + 1).toString(),
            year: dob.getFullYear().toString(),
          },
        });

        if (profile.profilePhoto) {
          setProfilePhotoPreview(profile.profilePhoto);
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.dateOfBirth.day) newErrors.day = "Day is required";
    if (!formData.dateOfBirth.month) newErrors.month = "Month is required";
    if (!formData.dateOfBirth.year) newErrors.year = "Year is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.about && formData.about.length > 200) {
      newErrors.about = "About me should be max 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profilePhoto") {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          toast.error("File size should be less than 5MB");
          return;
        }

        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
          toast.error("Only JPG, JPEG and PNG files are allowed");
          return;
        }

        setFormData((prev) => ({ ...prev, profilePhoto: file }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSocialConnect = async (platform) => {
    try {
      const newStatus = !formData.socialConnections[platform];
      await profileAPI.updateSocialConnections(platform, newStatus);

      setFormData((prev) => ({
        ...prev,
        socialConnections: {
          ...prev.socialConnections,
          [platform]: newStatus,
        },
      }));

      toast.success(
        `Successfully ${
          newStatus ? "connected to" : "disconnected from"
        } ${platform}`
      );
    } catch (error) {
      toast.error(`Failed to update ${platform} connection`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      const dateOfBirth = new Date(
        parseInt(formData.dateOfBirth.year),
        parseInt(formData.dateOfBirth.month) - 1,
        parseInt(formData.dateOfBirth.day)
      ).toISOString();
  
      const submitData = {
        ...formData,
        dateOfBirth,
      };
  
      if (hasExistingProfile) {
        const response = await profileAPI.updateProfile(submitData);
        toast.success("Profile updated successfully");
        // Update profile in auth store
        useAuthStore.getState().updateProfile(response.data.data);
      } else {
        const response = await profileAPI.createProfile(submitData);
        setHasExistingProfile(true);
        toast.success("Profile created successfully");
        // Update profile in auth store
        useAuthStore.getState().updateProfile(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await profileAPI.deleteAccount();
      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    if (hasExistingProfile) {
      fetchProfile();
    } else {
      setFormData({
        profilePhoto: null,
        name: "",
        dateOfBirth: { day: "", month: "", year: "" },
        gender: "",
        about: "",
        phone: "",
        email: "",
        socialConnections: { facebook: false, google: false },
        preferences: {},
      });
      setProfilePhotoPreview(null);
    }
    setErrors({});
  };

  const generateOptions = (type) => {
    switch (type) {
      case "day":
        return Array.from({ length: 31 }, (_, i) => ({
          value: (i + 1).toString(),
          label: (i + 1).toString(),
        }));
      case "month":
        return [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].map((month, index) => ({
          value: (index + 1).toString(),
          label: month,
        }));
      case "year":
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 100 }, (_, i) => ({
          value: (currentYear - i).toString(),
          label: (currentYear - i).toString(),
        }));
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="layout bg-background">
      <form onSubmit={handleSubmit} className="container py-section">
        <div className="max-w-profile mx-auto bg-card rounded-lg p-8 border border-gray-200">
          <H1 withBorder className="mb-8">
            {hasExistingProfile ? "Edit Profile" : "Create Profile"}
          </H1>

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
                    onClick={() =>
                      document.getElementById("profilePhotoInput").click()
                    }
                  >
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-500">
                    JPG, JPEG, PNG (max: 5MB)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <section className="section-sm border-b border-gray-200 pb-6">
            <H2 className="mb-6">Personal Information</H2>

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
                { value: "other", label: "Other" },
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
              <div
                key={platform}
                className="flex justify-between items-center py-4 border-gray-200"
              >
                <div className="space-y-1">
                  <H3>{platform}</H3>
                  <p className="text-sm text-gray-500">
                    {platform === "Facebook"
                      ? "Connect with Facebook to find trusted connections"
                      : "Link your Google account for easier access"}
                  </p>
                </div>
                <Button
                  variant={
                    formData.socialConnections[platform.toLowerCase()]
                      ? "primary"
                      : "outline"
                  }
                  onClick={() => handleSocialConnect(platform.toLowerCase())}
                  type="button"
                >
                  {formData.socialConnections[platform.toLowerCase()]
                    ? "Connected"
                    : "Connect"}
                </Button>
              </div>
            ))}
          </section>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-8">
            <Button
              variant="outline"
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Discard Changes
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : hasExistingProfile
                ? "Save Changes"
                : "Create Profile"}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Account Container */}
      {hasExistingProfile && (
        <>
          <div className="container py-section">
            <div className="max-w-profile mx-auto bg-card rounded-lg p-8 border border-border">
              <H1 withBorder className="mb-4">
                Delete this account
              </H1>

              <div className="space-y-4">
                <div className="pb-4 border-b border-border">
                  <p className="text-base text-gray-700">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full md:w-auto"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            title="Delete Account"
            message="Are you sure you want to delete your account? All data related to this account will be permanently deleted ."
            confirmText="Yes, delete my account"
            cancelText="No, keep my account"
            variant="destructive"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
