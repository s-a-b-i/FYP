import React, { useState, useEffect } from "react";
import { itemAPI } from "@/api/item";
import { categoryAPI } from "@/api/category";
import {
  FiSearch,
  FiFilter,
  FiCheck,
  FiX,
  FiEye,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Button from "@/components/adminSharedComp/Button";
import { H2, H3, H4 } from "@/components/adminSharedComp/Heading";
import Input from "@/components/adminSharedComp/Input";
import Select from "@/components/adminSharedComp/Select";
import ConfirmationModal from "@/components/adminSharedComp/ConfirmationModal";
import { useTheme } from "@/context/ThemeContext";

// Skeleton Component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

const ItemModeration = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationStats, setModerationStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filter, setFilter] = useState({
    category: "",
    search: "",
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    selectedIds: [],
  });
  const [moderationForm, setModerationForm] = useState({
    status: "active",
    moderationNotes: "",
    rejectionReason: "",
    featuredItem: false,
    urgentItem: false,
  });
  const [bulkSelection, setBulkSelection] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [categories, setCategories] = useState([]);

  // Fetch pending items
  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const response = await itemAPI.getItemsPendingModeration(
        pagination.page,
        pagination.limit,
        filter.category
      );

      if (response.data) {
        if (response.data.pagination) {
          setPendingItems(response.data.data || []);
          setPagination(response.data.pagination);
        } else if (Array.isArray(response.data)) {
          setPendingItems(response.data);
        } else {
          setPendingItems(response.data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching pending items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when pagination or filters change
  useEffect(() => {
    if (pagination && pagination.page) {
      fetchPendingItems();
    }
  }, [pagination.page, pagination.limit, filter.category]);

  // Fetch categories for filtering
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching pending items...");
    fetchPendingItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("Pending Items:", pendingItems);
    console.log("Categories:", categories);
  }, [pendingItems, categories]);

  // Handle item selection for detailed view
  const handleViewItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await itemAPI.getItemForModeration(itemId);
      console.log("Item detail response:", response);

      if (response && response.data) {
        const itemData = response.data.data || response.data;
        console.log("Processed item data:", itemData);
        setSelectedItem(itemData);
        setViewMode("detail");
      } else {
        console.error("Invalid response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle moderation actions
  const handleModerateItem = async () => {
    try {
      setLoading(true);
      await itemAPI.moderateItem(selectedItem.item._id, moderationForm);

      fetchPendingItems();
      setModalState({ isOpen: false, type: null, selectedIds: [] });
      setViewMode("list");
      setSelectedItem(null);
      resetModerationForm();
    } catch (error) {
      console.error("Error moderating item:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk moderation
  const handleBulkModerate = async () => {
    try {
      setLoading(true);
      await itemAPI.bulkModerateItems({
        itemIds: modalState.selectedIds,
        status: modalState.type === "bulk-approve" ? "active" : "moderated",
        moderationNotes: moderationForm.moderationNotes,
      });

      fetchPendingItems();
      setModalState({ isOpen: false, type: null, selectedIds: [] });
      setBulkSelection([]);
      resetModerationForm();
    } catch (error) {
      console.error("Error bulk moderating items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset moderation form
  const resetModerationForm = () => {
    setModerationForm({
      status: "active",
      moderationNotes: "",
      rejectionReason: "",
      featuredItem: false,
      urgentItem: false,
    });
  };

  // Handle checkbox selection for bulk actions
  const handleSelectItem = (itemId) => {
    if (bulkSelection.includes(itemId)) {
      setBulkSelection(bulkSelection.filter((id) => id !== itemId));
    } else {
      setBulkSelection([...bulkSelection, itemId]);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (bulkSelection.length === pendingItems.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(pendingItems.map((item) => item._id));
    }
  };

  // Open modal for approval/rejection
  const openModal = (type, ids = []) => {
    setModalState({
      isOpen: true,
      type,
      selectedIds: ids,
    });

    if (type === "approve" || type === "bulk-approve") {
      setModerationForm({ ...moderationForm, status: "active" });
    } else if (type === "reject" || type === "bulk-reject") {
      setModerationForm({ ...moderationForm, status: "moderated" });
    }
  };

  // Helper function to render price or type-specific details
  const renderPriceOrDetails = (item) => {
    if (item.type === "sell" && item.price?.amount !== undefined) {
      return `${item.price.currency} ${item.price.amount.toFixed(2)}`;
    } else if (item.type === "rent" && item.rentDetails) {
      return `${item.rentDetails.duration} (Deposit: ${item.rentDetails.securityDeposit || 0} ${item.price?.currency || "Rs"})`;
    } else if (item.type === "exchange" && item.exchangeDetails) {
      return `Exchange for: ${item.exchangeDetails.exchangeFor || "Not specified"}`;
    }
    return "N/A";
  };

  return (
    <div className="container px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <H2>Item Moderation</H2>

        <div className="flex gap-4 mt-4 md:mt-0">
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            onClick={() => setViewMode("list")}
          >
            Pending Items
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`bg-${
          theme === "dark" ? "admin.cardDark" : "admin.card"
        } rounded-lg shadow-md border border-${
          theme === "dark" ? "admin.borderDark" : "admin.border"
        }`}
      >
        {viewMode === "list" && (
          <>
            {/* Filter Bar */}
            <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={filter.search}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                />
              </div>

              <div className="min-w-[200px]">
                <Select
                  placeholder="Filter by category"
                  options={[
                    { value: "", label: "All Categories" },
                    ...categories.map((c) => ({ value: c._id, label: c.name })),
                  ]}
                  value={filter.category}
                  onChange={(e) =>
                    setFilter({ ...filter, category: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                {bulkSelection.length > 0 && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => openModal("bulk-approve", bulkSelection)}
                    >
                      <FiCheck className="mr-2" />
                      Approve ({bulkSelection.length})
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openModal("bulk-reject", bulkSelection)}
                    >
                      <FiX className="mr-2" />
                      Reject ({bulkSelection.length})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b border-${
                    theme === "dark" ? "admin.borderDark" : "admin.border"
                  } text-${
                    theme === "dark"
                      ? "admin.textDark.secondary"
                      : "admin.text.secondary"
                  }`}
                >
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={
                          bulkSelection.length === pendingItems.length &&
                          pendingItems.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left">Seller</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton Loading for Table Rows
                    [...Array(5)].map((_, index) => (
                      <tr
                        key={index}
                        className={`border-b border-${
                          theme === "dark" ? "admin.borderDark" : "admin.border"
                        }`}
                      >
                        <td className="p-3">
                          <Skeleton className="h-4 w-4" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-12 w-12" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-8 w-40" />
                        </td>
                      </tr>
                    ))
                  ) : pendingItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-4 text-center">
                        No items pending moderation.
                      </td>
                    </tr>
                  ) : (
                    pendingItems.map((item) => (
                      <tr
                        key={item._id}
                        className={`border-b border-${
                          theme === "dark" ? "admin.borderDark" : "admin.border"
                        } hover:bg-${
                          theme === "dark" ? "admin.hoverDark" : "admin.hover"
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={bulkSelection.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                          />
                        </td>
                        <td className="p-3">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={
                                item.images.find((img) => img.isMain)?.url ||
                                item.images[0].url
                              }
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No image
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">{item.title}</td>
                        <td className="p-3">
                          {item.category?.name || "Unknown"}
                        </td>
                        <td className="p-3">{renderPriceOrDetails(item)}</td>
                        <td className="p-3">{item.user?.name || "Unknown"}</td>
                        <td className="p-3">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(item._id)}
                            >
                              <FiEye className="mr-1" /> View
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedItem({ item });
                                openModal("approve", [item._id]);
                              }}
                            >
                              <FiCheck className="mr-1" /> Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedItem({ item });
                                openModal("reject", [item._id]);
                              }}
                            >
                              <FiX className="mr-1" /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex justify-between items-center border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {pendingItems.length} of {pagination.total} items
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                >
                  <FiChevronLeft className="mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                >
                  Next <FiChevronRight className="ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}

        {viewMode === "detail" && selectedItem && (
          <div className="p-6">
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => {
                setViewMode("list");
                setSelectedItem(null);
              }}
            >
              <FiChevronLeft className="mr-2" />
              Back to list
            </Button>

            {loading ? (
              // Skeleton Loading for Detail View
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Skeleton className="h-8 w-64 mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                    {[...Array(4)].map((_, index) => (
                      <Skeleton key={index} className="h-32 w-full" />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index}>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-24 w-full mb-6" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(2)].map((_, index) => (
                      <div key={index}>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-64 w-full mb-6" />
                  <Skeleton className="h-48 w-full mb-6" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Item Details */}
                <div className="lg:col-span-2">
                  <H3 className="mb-4">
                    {selectedItem.item?.title || "No Title"}
                  </H3>

                  {/* Item Images */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedItem.item?.images &&
                      selectedItem.item.images.length > 0 ? (
                        selectedItem.item.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`${selectedItem.item.title} - ${index}`}
                            className={`w-full h-32 object-cover rounded ${
                              image.isMain ? "ring-2 ring-primary" : ""
                            }`}
                          />
                        ))
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No images available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Category
                      </h4>
                      <p>{selectedItem.item?.category?.name || "Unknown"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Details
                      </h4>
                      <p>{renderPriceOrDetails(selectedItem.item)}</p>
                      {selectedItem.item?.type === "sell" && selectedItem.item?.price?.negotiable && (
                        <span className="text-xs text-muted-foreground">
                          (Negotiable)
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Condition
                      </h4>
                      <p className="capitalize">
                        {selectedItem.item?.condition || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Type
                      </h4>
                      <p className="capitalize">
                        {selectedItem.item?.type || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Gender
                      </h4>
                      <p className="capitalize">
                        {selectedItem.item?.sex || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Location
                      </h4>
                      <p>
                        {selectedItem.item?.location?.address ||
                          "Not specified"}
                      </p>
                    </div>
                    {selectedItem.item?.type === "rent" && (
                      <>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Availability Date
                          </h4>
                          <p>
                            {selectedItem.item.rentDetails?.availabilityDate
                              ? new Date(selectedItem.item.rentDetails.availabilityDate).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                      </>
                    )}
                    {selectedItem.item?.type === "exchange" && (
                      <>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Exchange Preferences
                          </h4>
                          <p>
                            {selectedItem.item.exchangeDetails?.exchangePreferences || "Not specified"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Item Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`p-3 rounded bg-${
                          theme === "dark" ? "gray-800" : "gray-100"
                        } text-center`}
                      >
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-medium">
                          {selectedItem.item?.stats?.views || 0}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded bg-${
                          theme === "dark" ? "gray-800" : "gray-100"
                        } text-center`}
                      >
                        <p className="text-xs text-muted-foreground">
                          Phone Calls
                        </p>
                        <p className="font-medium">
                          {selectedItem.item?.stats?.phones || 0}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded bg-${
                          theme === "dark" ? "gray-800" : "gray-100"
                        } text-center`}
                      >
                        <p className="text-xs text-muted-foreground">Chats</p>
                        <p className="font-medium">
                          {selectedItem.item?.stats?.chats || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Description</h4>
                    <div
                      className={`p-3 rounded bg-${
                        theme === "dark" ? "gray-800" : "gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-line">
                        {selectedItem.item?.description}
                      </p>
                    </div>
                  </div>

                  {/* Visibility Settings */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Visibility Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Start Date
                        </p>
                        <p>
                          {selectedItem.item?.visibility?.startDate
                            ? new Date(
                                selectedItem.item.visibility.startDate
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          End Date
                        </p>
                        <p>
                          {selectedItem.item?.visibility?.endDate
                            ? new Date(
                                selectedItem.item.visibility.endDate
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Similar Items */}
                  {selectedItem.similarItems &&
                    selectedItem.similarItems.length > 0 && (
                      <div className="mb-6">
                        <H4 className="mb-3">Similar Items</H4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedItem.similarItems.map((item) => (
                            <div
                              key={item._id}
                              className={`p-2 rounded border border-${
                                theme === "dark"
                                  ? "admin.borderDark"
                                  : "admin.border"
                              } flex items-center gap-2`}
                            >
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0].url}
                                  alt={item.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm">{item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {renderPriceOrDetails(item)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Seller Info & Moderation Controls */}
                <div>
                  {/* Seller Information */}
                  <div
                    className={`p-4 rounded-lg mb-6 bg-${
                      theme === "dark" ? "admin.cardDark" : "admin.card"
                    } border border-${
                      theme === "dark" ? "admin.borderDark" : "admin.border"
                    }`}
                  >
                    <h4 className="font-medium mb-3">Seller Information</h4>
                    <div className="flex items-center gap-3 mb-3">
                      {selectedItem.seller?.profilePhoto ? (
                        <img
                          src={selectedItem.seller.profilePhoto}
                          alt={selectedItem.seller.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg text-gray-500">
                            {selectedItem.seller?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {selectedItem.seller?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedItem.seller?.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p>{selectedItem.seller?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p>
                          {selectedItem.seller?.memberSince
                            ? `${new Date(selectedItem.seller.memberSince).getFullYear()} (${
                                selectedItem.seller.memberSinceFormatted || "Recently"
                              })`
                            : "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gender</p>
                        <p className="capitalize">
                          {selectedItem.seller?.gender || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">About</p>
                        <p>
                          {selectedItem.seller?.about ||
                            "No information provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User History */}
                  {selectedItem.userHistory &&
                    selectedItem.userHistory.length > 0 && (
                      <div
                        className={`p-4 rounded-lg mb-6 bg-${
                          theme === "dark" ? "admin.cardDark" : "admin.card"
                        } border border-${
                          theme === "dark" ? "admin.borderDark" : "admin.border"
                        }`}
                      >
                        <h4 className="font-medium mb-3">User History</h4>
                        <div className="space-y-2">
                          {selectedItem.userHistory.map((item) => (
                            <div
                              key={item._id}
                              className={`p-2 rounded border border-${
                                theme === "dark"
                                  ? "admin.borderDark"
                                  : "admin.border"
                              }`}
                            >
                              <p className="text-sm truncate">{item.title}</p>
                              <div className="flex justify-between text-xs">
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    item.status === "active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : item.status === "moderated"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                                >
                                  {item.status === "active"
                                    ? "Approved"
                                    : item.status === "moderated"
                                    ? "Rejected"
                                    : item.status}
                                </span>
                                <span className="text-muted-foreground">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Moderation Actions */}
                  <div
                    className={`p-4 rounded-lg mb-6 bg-${
                      theme === "dark" ? "admin.cardDark" : "admin.card"
                    } border border-${
                      theme === "dark" ? "admin.borderDark" : "admin.border"
                    }`}
                  >
                    <h4 className="font-medium mb-3">Moderation Actions</h4>
                    <div className="space-y-4">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() =>
                          openModal("approve", [selectedItem.item?._id])
                        }
                      >
                        <FiCheck className="mr-2" />
                        Approve Item
                      </Button>
                      <Button
                        variant="destructive"
                        fullWidth
                        onClick={() =>
                          openModal("reject", [selectedItem.item?._id])
                        }
                      >
                        <FiX className="mr-2" />
                        Reject Item
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {modalState.isOpen && (
        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={
            modalState.type.includes("bulk")
              ? handleBulkModerate
              : handleModerateItem
          }
          title={
            modalState.type === "approve" || modalState.type === "bulk-approve"
              ? "Approve Item"
              : "Reject Item"
          }
          message={
            <div className="space-y-4">
              <p>
                {modalState.type === "approve" ||
                modalState.type === "bulk-approve"
                  ? `Are you sure you want to approve ${
                      modalState.selectedIds.length > 1
                        ? "these items"
                        : "this item"
                    }?`
                  : `Are you sure you want to reject ${
                      modalState.selectedIds.length > 1
                        ? "these items"
                        : "this item"
                    }?`}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    Moderation Notes:
                  </label>
                  <textarea
                    className="w-full p-2 mt-1 border border-input rounded-md"
                    value={moderationForm.moderationNotes}
                    onChange={(e) =>
                      setModerationForm({
                        ...moderationForm,
                        moderationNotes: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Add internal notes about this moderation decision..."
                  />
                </div>

                {(modalState.type === "reject" ||
                  modalState.type === "bulk-reject") && (
                  <div>
                    <label className="text-sm font-medium">
                      Rejection Reason (sent to seller):
                    </label>
                    <textarea
                      className="w-full p-2 mt-1 border border-input rounded-md"
                      value={moderationForm.rejectionReason}
                      onChange={(e) =>
                        setModerationForm({
                          ...moderationForm,
                          rejectionReason: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Explain why this item was rejected..."
                    />
                  </div>
                )}

                {modalState.type === "approve" && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featuredItem"
                        checked={moderationForm.featuredItem}
                        onChange={(e) =>
                          setModerationForm({
                            ...moderationForm,
                            featuredItem: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-primary"
                      />
                      <label htmlFor="featuredItem" className="ml-2 text-sm">
                        Mark as featured item
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="urgentItem"
                        checked={moderationForm.urgentItem}
                        onChange={(e) =>
                          setModerationForm({
                            ...moderationForm,
                            urgentItem: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-primary"
                      />
                      <label htmlFor="urgentItem" className="ml-2 text-sm">
                        Mark as urgent item
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
          confirmText={
            modalState.type === "approve" || modalState.type === "bulk-approve"
              ? "Approve"
              : "Reject"
          }
          variant={
            modalState.type === "approve" || modalState.type === "bulk-approve"
              ? "primary"
              : "destructive"
          }
          isLoading={loading}
          confirmDisabled={
            (modalState.type === "reject" ||
              modalState.type === "bulk-reject") &&
            !moderationForm.rejectionReason
          }
        />
      )}
    </div>
  );
};

export default ItemModeration;