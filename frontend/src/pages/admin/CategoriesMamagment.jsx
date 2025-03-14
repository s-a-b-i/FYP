// import React, { useState, useEffect, useRef } from "react";
// import { categoryAPI } from "@/api/category";
// import { H2, H3 } from "@/components/adminSharedComp/Heading";
// import Button from "@/components/adminSharedComp/Button";
// import Input from "@/components/adminSharedComp/Input";
// import Select from "@/components/adminSharedComp/Select";
// import ConfirmationModal from "@/components/adminSharedComp/ConfirmationModal";
// import LoadingSpinner from "@/components/shared/LoadingSpinner";
// import {
//   FiPlus,
//   FiEdit2,
//   FiTrash2,
//   FiFolder,
//   FiAlertCircle,
// } from "react-icons/fi";

// const CategoriesManagement = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formMode, setFormMode] = useState("create");
//   const fileInputRef = useRef(null);
//   const [imageUploading, setImageUploading] = useState(false);
//   const [deleteWarning, setDeleteWarning] = useState(null);
//   const [isForceDelete, setIsForceDelete] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     icon: {
//       url: "",
//       public_id: "",
//     },
//     parent: null,
//     isActive: true,
//     metadata: {
//       backgroundColor: "#FFFFFF",
//       borderColor: "#E2E8F0",
//       savedWater: 0,
//       savedCO2: 0,
//     },
//   });

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await categoryAPI.getCategories();
//       setCategories(response.data);
//       setError(null);
//     } catch (err) {
//       setError("Failed to fetch categories. Please try again.");
//       console.error("Error fetching categories:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       setImageUploading(true);
//       setError(null);

//       const formData = new FormData();
//       formData.append("icon", file);

//       const response = await categoryAPI.uploadCategoryImage(file);

//       setFormData((prev) => ({
//         ...prev,
//         icon: {
//           url: response.data.url,
//           public_id: response.data.public_id,
//         },
//       }));
//     } catch (err) {
//       setError("Failed to upload image. Please try again.");
//       console.error("Error uploading image:", err);
//     } finally {
//       setImageUploading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes("metadata.")) {
//       const metadataField = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         metadata: {
//           ...prev.metadata,
//           [metadataField]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);

//       if (formMode === "create") {
//         await categoryAPI.createCategory(formData);
//       } else {
//         await categoryAPI.updateCategory(selectedCategory._id, formData);
//       }

//       await fetchCategories();
//       resetForm();
//       setError(null);
//     } catch (err) {
//       setError(err.message || "Failed to save category. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (categoryId) => {
//     try {
//       setLoading(true);
//       const response = await categoryAPI.deleteCategory(categoryId, isForceDelete);

//       if (response.status === "success") {
//         await fetchCategories();
//         setIsModalOpen(false);
//         setDeleteWarning(null);
//         setIsForceDelete(false);
//         setError(null);
//       }
//     } catch (err) {
//       if (err.response?.status === 400) {
//         setDeleteWarning(err.response.data.details);
//       } else {
//         setError(err.response?.data?.message || "Failed to delete category. Please try again.");
//       }
//       console.error("Delete error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       icon: {
//         url: "",
//         public_id: "",
//       },
//       parent: null,
//       isActive: true,
//       metadata: {
//         backgroundColor: "#FFFFFF",
//         borderColor: "#E2E8F0",
//         savedWater: 0,
//         savedCO2: 0,
//       },
//     });
//     setFormMode("create");
//     setSelectedCategory(null);
//     setError(null);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   return (
//     <div className="p-3 sm:p-4 md:p-6 max-w-[1400px] mx-auto">
//       <div className="mb-4 sm:mb-6 md:mb-8">
//         <H2>Categories Management</H2>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
//         {/* Left Side - Form */}
//         <div className="w-full lg:w-1/2">
//           <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
//             <H3 className="mb-4 sm:mb-6">
//               {formMode === "create" ? "Create Category" : "Edit Category"}
//             </H3>

//             <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
//               <Input
//                 label="Category Name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full"
//                 placeholder="Enter category name"
//               />

//               <div className="space-y-2">
//                 <label className="block text-sm font-medium">Category Icon</label>
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
//                   <div
//                     className="relative w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     {imageUploading && (
//                       <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
//                         <LoadingSpinner size="sm" />
//                       </div>
//                     )}

//                     {formData.icon.url ? (
//                       <img
//                         src={formData.icon.url}
//                         alt="Category icon"
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                     ) : (
//                       <FiPlus size={24} className="text-gray-400" />
//                     )}
//                   </div>

//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     accept="image/*"
//                     className="hidden"
//                   />

//                   <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => fileInputRef.current?.click()}
//                       disabled={imageUploading}
//                       className="w-full sm:w-auto"
//                     >
//                       {imageUploading ? "Uploading..." : "Choose Image"}
//                     </Button>

//                     {formData.icon.url && (
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => {
//                           setFormData((prev) => ({
//                             ...prev,
//                             icon: { url: "", public_id: "" },
//                           }));
//                         }}
//                         disabled={imageUploading}
//                         className="w-full sm:w-auto"
//                       >
//                         Remove Image
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <Select
//                 label="Parent Category"
//                 name="parent"
//                 value={formData.parent}
//                 onChange={handleInputChange}
//                 options={[
//                   { value: null, label: "None" },
//                   ...categories.map((cat) => ({
//                     value: cat._id,
//                     label: cat.name,
//                   })),
//                 ]}
//                 className="w-full"
//               />

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium">Background Color</label>
//                   <Input
//                     name="metadata.backgroundColor"
//                     type="color"
//                     value={formData.metadata.backgroundColor}
//                     onChange={handleInputChange}
//                     className="w-full h-10"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium">Border Color</label>
//                   <Input
//                     name="metadata.borderColor"
//                     type="color"
//                     value={formData.metadata.borderColor}
//                     onChange={handleInputChange}
//                     className="w-full h-10"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={resetForm}
//                   className="w-full sm:w-auto hover:bg-accent/10"
//                 >
//                   Cancel
//                 </Button>
//                 <Button 
//                   type="submit" 
//                   className="w-full sm:w-auto flex items-center justify-center gap-2"
//                 >
//                   {formMode === "create" ? (
//                     <>
//                       <FiPlus size={16} />
//                       Create 
//                     </>
//                   ) : (
//                     <>
//                       <FiEdit2 size={16} />
//                       Update 
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Right Side - Categories List */}
//         <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
//           <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
//             <H3 className="mb-4 sm:mb-6">Categories List</H3>
//             <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar">
//               {categories.length === 0 ? (
//                 <div className="text-center py-6 sm:py-8 text-muted-foreground">
//                   No categories found. Create your first category.
//                 </div>
//               ) : (
//                 categories.map((category) => (
//                   <div
//                     key={category._id}
//                     className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-border rounded-md hover:bg-accent/5 transition-all duration-200"
//                   >
//                     <div className="flex items-center gap-3 mb-3 sm:mb-0 w-full sm:w-auto">
//                       <div
//                         className="w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden"
//                         style={{
//                           backgroundColor: category.metadata.backgroundColor,
//                           border: `2px solid ${category.metadata.borderColor}`,
//                         }}
//                       >
//                         {category.icon && category.icon.url ? (
//                           <img
//                             src={category.icon.url}
//                             alt={category.name}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <FiFolder className="text-xl" />
//                         )}
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-foreground truncate max-w-[150px] sm:max-w-full">
//                           {category.name}
//                         </h3>
//                         <p className="text-xs sm:text-sm text-muted-foreground">
//                           Parent: {category.parent?.name || "None"}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex space-x-2 w-full sm:w-auto justify-end">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedCategory(category);
//                           setFormData({
//                             ...category,
//                             parent: category.parent || null,
//                           });
//                           setFormMode("edit");
//                         }}
//                         className="flex-1 sm:flex-none items-center gap-1 hover:bg-accent/10"
//                       >
//                         <FiEdit2 size={14} className="hidden sm:inline" />
//                         Edit
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedCategory(category);
//                           setIsModalOpen(true);
//                         }}
//                         className="flex-1 sm:flex-none items-center gap-1"
//                       >
//                         <FiTrash2 size={14} className="hidden sm:inline" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="fixed bottom-4 right-4 z-50 bg-destructive/10 text-destructive p-3 sm:p-4 rounded-xl shadow-lg flex items-center gap-2 sm:gap-3 animate-slide-up border border-destructive/20 max-w-[90%] sm:max-w-md">
//           <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
//           <p className="text-sm sm:text-base">{error}</p>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       <ConfirmationModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setDeleteWarning(null);
//           setIsForceDelete(false);
//         }}
//         onConfirm={() => handleDelete(selectedCategory?._id)}
//         title="Delete Category"
//         message={
//           selectedCategory?.parent === null || selectedCategory?.hasSubcategories || selectedCategory?.hasItems ? (
//             <div className="space-y-3 sm:space-y-4">
//               <div className="flex-1">
//                 <h4 className="text-sm sm:text-base font-medium text-destructive mb-2">
//                   Warning: This action will affect multiple items
//                 </h4>
//                 <div className="space-y-2 sm:space-y-3 text-muted-foreground">
//                   {selectedCategory?.hasSubcategories && (
//                     <div className="bg-accent/5 p-2 sm:p-3 rounded-lg">
//                       <p className="text-sm">This category has {selectedCategory.subcategoriesCount} subcategories</p>
//                     </div>
//                   )}
//                   {selectedCategory?.hasItems && (
//                     <div className="bg-accent/5 p-2 sm:p-3 rounded-lg">
//                       <p className="text-sm">This category contains {selectedCategory.itemsCount} items</p>
//                     </div>
//                   )}
//                   <p className="text-sm sm:text-base">
//                     Deleting this category will also delete all its subcategories and associated items.
//                   </p>
//                 </div>
//               </div>
//               <div className="mt-4 sm:mt-6 p-3 sm:p-4 border border-border/20 dark:border-border/40 rounded-lg bg-accent/5">
//                 <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     id="forceDelete"
//                     checked={isForceDelete}
//                     onChange={(e) => setIsForceDelete(e.target.checked)}
//                     className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-destructive/30 text-destructive focus:ring-destructive"
//                   />
//                   <span className="text-sm sm:text-base font-medium text-destructive">
//                     I understand and want to delete everything
//                   </span>
//                 </label>
//               </div>
//             </div>
//           ) : (
//             <p className="text-sm sm:text-base text-muted-foreground">
//               Are you sure you want to delete "<span className="font-medium text-foreground">{selectedCategory?.name}</span>"? 
//               This action cannot be undone.
//             </p>
//           )
//         }
//         confirmText={selectedCategory?.parent === null || selectedCategory?.hasSubcategories || selectedCategory?.hasItems ? "Force Delete" : "Delete"}
//         confirmDisabled={selectedCategory?.parent === null || selectedCategory?.hasSubcategories || selectedCategory?.hasItems ? !isForceDelete : false}
//         variant="destructive"
//         isLoading={loading}
//       />
//     </div>
//   );
// };

// export default CategoriesManagement;
import React, { useState, useEffect, useRef } from "react";
import { categoryAPI } from "@/api/category";
import { H2, H3 } from "@/components/adminSharedComp/Heading";
import Button from "@/components/adminSharedComp/Button";
import Input from "@/components/adminSharedComp/Input";
import Select from "@/components/adminSharedComp/Select";
import ConfirmationModal from "@/components/adminSharedComp/ConfirmationModal";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiAlertCircle,
} from "react-icons/fi";

const SkeletonCategory = () => (
  <div className="animate-pulse flex items-center justify-between p-3 sm:p-4 border border-border rounded-md">
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
    <div className="flex space-x-2">
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);


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

  const handleDelete = async (categoryId) => {
    try {
      setLoading(true);
      const response = await categoryAPI.deleteCategory(categoryId, isForceDelete);

      if (response.status === "success") {
        await fetchCategories();
        setIsModalOpen(false);
        setDeleteWarning(null);
        setIsForceDelete(false);
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 400) {
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

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <H2>Categories Management</H2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
            <H3 className="mb-4 sm:mb-6">
              {formMode === "create" ? "Create Category" : "Edit Category"}
            </H3>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                <label className="block text-sm font-medium">Category Icon</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div
                    className="relative w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="w-full sm:w-auto"
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
                        className="w-full sm:w-auto"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Background Color</label>
                  <Input
                    name="metadata.backgroundColor"
                    type="color"
                    value={formData.metadata.backgroundColor}
                    onChange={handleInputChange}
                    className="w-full h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Border Color</label>
                  <Input
                    name="metadata.borderColor"
                    type="color"
                    value={formData.metadata.borderColor}
                    onChange={handleInputChange}
                    className="w-full h-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="w-full sm:w-auto hover:bg-accent/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {formMode === "create" ? (
                    <>
                      <FiPlus size={16} />
                      Create 
                    </>
                  ) : (
                    <>
                      <FiEdit2 size={16} />
                      Update 
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Categories List */}
        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
            <H3 className="mb-4 sm:mb-6">Categories List</H3>
            <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <>
                  <SkeletonCategory />
                  <SkeletonCategory />
                  <SkeletonCategory />
                </>
              ) : categories.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  No categories found. Create your first category.
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-border rounded-md hover:bg-accent/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-3 sm:mb-0 w-full sm:w-auto">
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
                        <h3 className="font-medium text-foreground truncate max-w-[150px] sm:max-w-full">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Parent: {category.parent?.name || "None"}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto justify-end">
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
                        className="flex-1 sm:flex-none items-center gap-1 hover:bg-accent/10"
                      >
                        <FiEdit2 size={14} className="hidden sm:inline" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none items-center gap-1"
                      >
                        <FiTrash2 size={14} className="hidden sm:inline" />
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
        <div className="fixed bottom-4 right-4 z-50 bg-destructive/10 text-destructive p-3 sm:p-4 rounded-xl shadow-lg flex items-center gap-2 sm:gap-3 animate-slide-up border border-destructive/20 max-w-[90%] sm:max-w-md">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm sm:text-base">{error}</p>
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
          selectedCategory?.parent === null || selectedCategory?.hasSubcategories || selectedCategory?.hasItems ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-medium text-destructive mb-2">
                  Warning: This action will affect multiple items
                </h4>
                <div className="space-y-2 sm:space-y-3 text-muted-foreground">
                  {selectedCategory?.hasSubcategories && (
                    <div className="bg-accent/5 p-2 sm:p-3 rounded-lg">
                      <p className="text-sm">This category has {selectedCategory.subcategoriesCount} subcategories</p>
                    </div>
                  )}
                  {selectedCategory?.hasItems && (
                    <div className="bg-accent/5 p-2 sm:p-3 rounded-lg">
                      <p className="text-sm">This category contains {selectedCategory.itemsCount} items</p>
                    </div>
                  )}
                  <p className="text-sm sm:text-base">
                    Deleting this category will also delete all its subcategories and associated items.
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 border border-border/20 dark:border-border/40 rounded-lg bg-accent/5">
                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="forceDelete"
                    checked={isForceDelete}
                    onChange={(e) => setIsForceDelete(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-destructive/30 text-destructive focus:ring-destructive"
                  />
                  <span className="text-sm sm:text-base font-medium text-destructive">
                    I understand and want to delete everything
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-muted-foreground">
              Are you sure you want to delete "<span className="font-medium text-foreground">{selectedCategory?.name}</span>"? 
              This action cannot be undone.
            </p>
          )
        }
        confirmText={selectedCategory?.parent === null || selectedCategory?.hasSubcategories || selectedCategory?.hasItems ? "Force Delete" : "Delete"}
        confirmDisabled={selectedCategory?.parent === null || selectedCategory?.hasSubcategories || selectedCategory?.hasItems ? !isForceDelete : false}
        variant="destructive"
        isLoading={loading}
      />
    </div>
  );
};

export default CategoriesManagement;