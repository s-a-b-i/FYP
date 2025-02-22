import React, { useState, useEffect, useRef } from "react";
import { categoryAPI } from "@/api/category";
import { H2, H3 } from "@/components/adminSharedComp/Heading";
import Button from "@/components/adminSharedComp/Button";
import Input from "@/components/adminSharedComp/Input";
import Select from "@/components/adminSharedComp/Select";
import ConfirmationModal from "@/components/adminSharedComp/ConfirmationModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiAlertCircle,
} from "react-icons/fi";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const fileInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(null);
const [isForceDelete, setIsForceDelete] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    icon: {
      url: "",
      public_id: "",
    },
    parent: null,
    isActive: true,
    metadata: {
      backgroundColor: "#FFFFFF",
      borderColor: "#E2E8F0",
      savedWater: 0,
      savedCO2: 0,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories. Please try again.");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("icon", file);

      const response = await categoryAPI.uploadCategoryImage(file);

      setFormData((prev) => ({
        ...prev,
        icon: {
          url: response.data.url,
          public_id: response.data.public_id,
        },
      }));
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Error uploading image:", err);
    } finally {
      setImageUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("metadata.")) {
      const metadataField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (formMode === "create") {
        await categoryAPI.createCategory(formData);
      } else {
        await categoryAPI.updateCategory(selectedCategory._id, formData);
      }

      await fetchCategories();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to save category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

// Update the handleDelete function
const handleDelete = async (categoryId) => {
  try {
    setLoading(true);
    const response = await categoryAPI.deleteCategory(categoryId, isForceDelete);
    
    if (response.status === 'success') {
      await fetchCategories();
      setIsModalOpen(false);
      setDeleteWarning(null);
      setIsForceDelete(false);
      setError(null);
    }
  } catch (err) {
    // Better error handling
    if (err.response?.status === 400) {
      // Handle validation error
      setDeleteWarning(err.response.data.details);
    } else {
      setError(err.response?.data?.message || "Failed to delete category. Please try again.");
    }
    console.error("Delete error:", err);
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      name: "",
      icon: {
        url: "",
        public_id: "",
      },
      parent: null,
      isActive: true,
      metadata: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        savedWater: 0,
        savedCO2: 0,
      },
    });
    setFormMode("create");
    setSelectedCategory(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <H2>Categories Management</H2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2">
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <div className="flex items-center justify-between mb-6">
              <H3>
                {formMode === "create" ? "Create Category" : "Edit Category"}
              </H3>
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex items-center gap-2 hover:bg-accent/10"
              >
                <FiPlus size={16} />
                New Category
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full"
                placeholder="Enter category name"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Category Icon
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}

                    {formData.icon.url ? (
                      <img
                        src={formData.icon.url}
                        alt="Category icon"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FiPlus size={24} className="text-gray-400" />
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                    >
                      {imageUploading ? "Uploading..." : "Choose Image"}
                    </Button>

                    {formData.icon.url && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            icon: { url: "", public_id: "" },
                          }));
                        }}
                        disabled={imageUploading}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Select
                label="Parent Category"
                name="parent"
                value={formData.parent}
                onChange={handleInputChange}
                options={[
                  { value: null, label: "None" },
                  ...categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  })),
                ]}
                className="w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Background Color
                  </label>
                  <Input
                    name="metadata.backgroundColor"
                    type="color"
                    value={formData.metadata.backgroundColor}
                    onChange={handleInputChange}
                    className="w-full h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Border Color
                  </label>
                  <Input
                    name="metadata.borderColor"
                    type="color"
                    value={formData.metadata.borderColor}
                    onChange={handleInputChange}
                    className="w-full h-10"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="hover:bg-accent/10"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  {formMode === "create" ? (
                    <>
                      <FiPlus size={16} />
                      Create Category
                    </>
                  ) : (
                    <>
                      <FiEdit2 size={16} />
                      Update Category
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Categories List */}
        <div className="w-full md:w-1/2">
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <H3 className="mb-6">Categories List</H3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No categories found. Create your first category.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-accent/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden"
                        style={{
                          backgroundColor: category.metadata.backgroundColor,
                          border: `2px solid ${category.metadata.borderColor}`,
                        }}
                      >
                        {category.icon && category.icon.url ? (
                          <img
                            src={category.icon.url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiFolder className="text-xl" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <p className="text-sm text-muted-foreground">
                            Parent: {category.parent?.name || "None"}
                          </p>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setFormData({
                            ...category,
                            parent: category.parent || null,
                          });
                          setFormMode("edit");
                        }}
                        className="flex items-center gap-1 hover:bg-accent/10"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive/10 text-destructive p-4 rounded-md shadow-lg flex items-center gap-2 animate-slide-up">
          <FiAlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setDeleteWarning(null);
    setIsForceDelete(false);
  }}
  onConfirm={() => handleDelete(selectedCategory?._id)}
  title="Delete Category"
  message={
    deleteWarning ? (
      <div className="space-y-4">
        <p className="text-destructive font-medium">Warning:</p>
        {deleteWarning.hasSubcategories && (
          <p>This category has {deleteWarning.subcategoriesCount} subcategories.</p>
        )}
        {deleteWarning.hasItems && (
          <p>This category contains {deleteWarning.itemsCount} items.</p>
        )}
        <p>Deleting this category will also delete all its subcategories and associated items.</p>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="forceDelete"
            checked={isForceDelete}
            onChange={(e) => setIsForceDelete(e.target.checked)}
          />
          <label htmlFor="forceDelete" className="text-sm text-destructive">
            I understand and want to delete everything
          </label>
        </div>
      </div>
    ) : (
      `Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`
    )
  }
  confirmText={deleteWarning ? "Force Delete" : "Delete"}
  confirmDisabled={deleteWarning && !isForceDelete}
  variant="destructive"
/>
    </div>
  );
};

export default CategoriesManagement;
