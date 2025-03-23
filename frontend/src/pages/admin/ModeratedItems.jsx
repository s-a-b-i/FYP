import React, { useState, useEffect } from "react";
import { itemAPI } from "@/api/item";
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import Button from "@/components/adminSharedComp/Button";
import { H2, H3, H4 } from "@/components/adminSharedComp/Heading";
import Input from "@/components/adminSharedComp/Input";
import Select from "@/components/adminSharedComp/Select";
import ConfirmationModal from "@/components/adminSharedComp/ConfirmationModal";
import { useTheme } from "@/context/ThemeContext";

// Skeleton Component
const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

const ModeratedItems = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [moderatedItems, setModeratedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filter, setFilter] = useState({
    status: "",
    moderator: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [moderators, setModerators] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    itemId: null,
  });
  const [revisionForm, setRevisionForm] = useState({
    status: "active",
    moderationNotes: "",
    rejectionReason: "",
    featuredItem: false,
    urgentItem: false,
  });

  // Fetch moderated items for the list view
  const fetchModeratedItems = async () => {
    setLoading(true);
    try {
      const response = await itemAPI.getModeratedItems(
        pagination.page,
        pagination.limit,
        filter.status,
        filter.moderator,
        filter.startDate,
        filter.endDate,
        filter.search
      );

      if (response.data) {
        setModeratedItems(response.data.data || response.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching moderated items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch moderators list for the filter dropdown using getAdminDashboardStats
  const fetchModerators = async () => {
    try {
      const response = await itemAPI.getAdminDashboardStats({ period: "30d" });
      if (response?.data?.data?.moderationStats) {
        const mappedModerators = response.data.data.moderationStats.map(
          (mod) => ({
            id: mod._id,
            name: mod.moderator || "Unknown",
          })
        );
        setModerators(mappedModerators);
      }
    } catch (error) {
      console.error("Error fetching moderators from admin stats:", error);
    }
  };

  // Fetch item details for the detail view
  const fetchItemDetails = async (itemId) => {
    try {
      setLoading(true);
      const response = await itemAPI.getItemForModeration(itemId);

      if (response && response.data) {
        const itemData = response.data.data || response.data;
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

  // Revise moderation decision
  const handleReviseModeration = async () => {
    try {
      setLoading(true);
      const payload = {
        status: revisionForm.status,
        moderationNotes: revisionForm.moderationNotes,
        ...(revisionForm.status === "moderated" && {
          rejectionReason: revisionForm.rejectionReason,
        }),
        ...(revisionForm.status === "active" && {
          visibility: {
            featured: revisionForm.featuredItem,
            urgent: revisionForm.urgentItem,
          },
        }),
      };
      await itemAPI.reviseModeration(modalState.itemId, payload);

      fetchModeratedItems();
      setModalState({ isOpen: false, type: null, itemId: null });
      if (selectedItem) {
        fetchItemDetails(selectedItem.item._id);
      }
      resetRevisionForm();
    } catch (error) {
      console.error("Error revising moderation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset revision form
  const resetRevisionForm = () => {
    setRevisionForm({
      status: "active",
      moderationNotes: "",
      rejectionReason: "",
      featuredItem: false,
      urgentItem: false,
    });
  };

  // Initial data loading
  useEffect(() => {
    fetchModeratedItems();
    fetchModerators();
  }, []);

  // Refetch when pagination or filters change
  useEffect(() => {
    fetchModeratedItems();
  }, [
    pagination.page,
    pagination.limit,
    filter.status,
    filter.moderator,
    filter.startDate,
    filter.endDate,
    filter.search,
  ]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({
      ...pagination,
      page: 1,
    });
    fetchModeratedItems();
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({
      status: "",
      moderator: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPagination({
      ...pagination,
      page: 1,
    });
    fetchModeratedItems();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "moderated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : "N/A";
  };

  // Open revision modal
  const openRevisionModal = (type, itemId) => {
    setModalState({
      isOpen: true,
      type,
      itemId,
    });

    if (type === "revise-approve") {
      setRevisionForm({ ...revisionForm, status: "active" });
    } else if (type === "revise-reject") {
      setRevisionForm({ ...revisionForm, status: "moderated" });
    }
  };

  // Helper function to render price or type-specific details
  const renderPriceOrDetails = (item) => {
    if (item.type === "sell" && item.price?.amount !== undefined) {
      return `${
        item.price.currency || "Rs"
      } ${item.price.amount.toLocaleString()}${
        item.price.negotiable ? " (Negotiable)" : ""
      }`;
    } else if (item.type === "rent" && item.rentDetails) {
      return `${item.rentDetails.pricePerUnit || 0} ${
        item.price?.currency || "Rs"
      } / ${item.rentDetails.duration || "N/A"} (Deposit: ${
        item.rentDetails.securityDeposit || 0
      })`;
    } else if (item.type === "exchange" && item.exchangeDetails) {
      return `Exchange for: ${
        item.exchangeDetails.exchangeFor || "Not specified"
      }`;
    }
    return "N/A";
  };

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <H2 className="text-2xl font-bold">Moderated Items</H2>
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
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <div className="min-w-[150px]">
                <Select
                  placeholder="Filter by status"
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "active", label: "Approved" },
                    { value: "moderated", label: "Rejected" },
                  ]}
                  value={filter.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <Select
                  placeholder="Filter by moderator"
                  options={[
                    { value: "", label: "All Moderators" },
                    ...moderators.map((mod) => ({
                      value: mod.id,
                      label: mod.name,
                    })),
                  ]}
                  value={filter.moderator}
                  onChange={(e) =>
                    handleFilterChange("moderator", e.target.value)
                  }
                />
              </div>

              <div className="min-w-[150px]">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filter.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="min-w-[150px]">
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filter.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button variant="primary" onClick={applyFilters}>
                  <FiFilter className="mr-2" />
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
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
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Seller</th>
                    <th className="p-3 text-left">Moderated By</th>
                    <th className="p-3 text-left">Moderated At</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <tr
                        key={index}
                        className={`border-b border-${
                          theme === "dark" ? "admin.borderDark" : "admin.border"
                        }`}
                      >
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
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-28" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-8 w-40" />
                        </td>
                      </tr>
                    ))
                  ) : moderatedItems.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-4 text-center">
                        No moderated items found.
                      </td>
                    </tr>
                  ) : (
                    moderatedItems.map((item) => (
                      <tr
                        key={item._id}
                        className={`border-b border-${
                          theme === "dark" ? "admin.borderDark" : "admin.border"
                        } hover:bg-${
                          theme === "dark" ? "admin.hoverDark" : "admin.hover"
                        }`}
                      >
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
                        <td className="p-3 truncate max-w-[200px]">
                          {item.title}
                        </td>
                        <td className="p-3">
                          {item.category?.name || "Unknown"}
                        </td>
                        <td className="p-3 truncate max-w-[150px]">
                          {renderPriceOrDetails(item)}
                        </td>
                        <td className="p-3 truncate max-w-[150px]">
                          {item.location?.city && item.location?.neighborhood
                            ? `${item.location.neighborhood}, ${item.location.city}`
                            : item.location?.address || "Not specified"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status === "active" ? (
                              <>
                                <FiCheckCircle className="inline mr-1" />{" "}
                                Approved
                              </>
                            ) : item.status === "moderated" ? (
                              <>
                                <FiXCircle className="inline mr-1" /> Rejected
                              </>
                            ) : (
                              item.status
                            )}
                          </span>
                        </td>
                        <td className="p-3">
                          {item.sellerProfile?.name ||
                            item.user?.email ||
                            "Unknown"}
                        </td>
                        <td className="p-3">
                          {item.moderatorProfile?.name || "Unknown"}
                        </td>
                        <td className="p-3">
                          {formatDate(item.moderationInfo?.moderatedAt)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchItemDetails(item._id)}
                            >
                              <FiEye className="mr-1" /> View
                            </Button>
                            {item.status === "active" ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  openRevisionModal("revise-reject", item._id)
                                }
                              >
                                <FiXCircle className="mr-1" /> Reject
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  openRevisionModal("revise-approve", item._id)
                                }
                              >
                                <FiCheckCircle className="mr-1" /> Approve
                              </Button>
                            )}
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
                Showing {moderatedItems.length} of {pagination.total} items
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
            {/* Back button */}
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
                  <Skeleton className="h-24 w-full mb-6" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-48 w-full mb-6" />
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
                  <H3 className="mb-4 text-xl font-semibold">
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
                        <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center col-span-full">
                          <span className="text-xs text-gray-500">
                            No images available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item General Details */}
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
                        Size
                      </h4>
                      <p>{selectedItem.item?.size || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Material
                      </h4>
                      <p>{selectedItem.item?.material || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Brand
                      </h4>
                      <p>{selectedItem.item?.brand || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Color
                      </h4>
                      <p>{selectedItem.item?.color || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Location
                      </h4>
                      <p>
                        {selectedItem.item?.location?.city &&
                        selectedItem.item?.location?.neighborhood
                          ? `${selectedItem.item.location.neighborhood}, ${selectedItem.item.location.city}`
                          : selectedItem.item?.location?.address ||
                            "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Type-Specific Details */}
                  {selectedItem.item?.type === "rent" && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Rent Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Availability Date
                          </h5>
                          <p>
                            {selectedItem.item.rentDetails?.availabilityDate
                              ? new Date(
                                  selectedItem.item.rentDetails.availabilityDate
                                ).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Cleaning Fee
                          </h5>
                          <p>
                            {selectedItem.item.rentDetails?.cleaningFee
                              ? `${selectedItem.item.price?.currency || "Rs"} ${
                                  selectedItem.item.rentDetails.cleaningFee
                                }`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Late Fee
                          </h5>
                          <p>
                            {selectedItem.item.rentDetails?.lateFee
                              ? `${selectedItem.item.price?.currency || "Rs"} ${
                                  selectedItem.item.rentDetails.lateFee
                                }`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Care Instructions
                          </h5>
                          <p>
                            {selectedItem.item.rentDetails?.careInstructions ||
                              "Not specified"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <h5 className="text-sm text-muted-foreground">
                            Size Availability
                          </h5>
                          <p>
                            {selectedItem.item.rentDetails?.sizeAvailability
                              ?.length > 0
                              ? selectedItem.item.rentDetails.sizeAvailability
                                  .map((s) => `${s.size} (${s.quantity})`)
                                  .join(", ")
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.item?.type === "exchange" && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Exchange Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Preferred Sizes
                          </h5>
                          <p>
                            {selectedItem.item.exchangeDetails?.preferredSizes
                              ?.length > 0
                              ? selectedItem.item.exchangeDetails.preferredSizes.join(
                                  ", "
                                )
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Preferred Condition
                          </h5>
                          <p>
                            {selectedItem.item.exchangeDetails
                              ?.preferredCondition || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Preferred Brands
                          </h5>
                          <p>
                            {selectedItem.item.exchangeDetails?.preferredBrands
                              ?.length > 0
                              ? selectedItem.item.exchangeDetails.preferredBrands.join(
                                  ", "
                                )
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Exchange Preferences
                          </h5>
                          <p>
                            {selectedItem.item.exchangeDetails
                              ?.exchangePreferences || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Shipping Preference
                          </h5>
                          <p>
                            {selectedItem.item.exchangeDetails
                              ?.shippingPreference || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {selectedItem.item?.metadata && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Metadata</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Sustainability Score
                          </h5>
                          <p>
                            {selectedItem.item.metadata.sustainabilityScore ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm text-muted-foreground">
                            Custom Tags
                          </h5>
                          <p>
                            {selectedItem.item.metadata.tags?.length > 0
                              ? selectedItem.item.metadata.tags.join(", ")
                              : "None"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Item Statistics */}
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
                        {selectedItem.item?.description ||
                          "No description provided"}
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
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Featured
                        </p>
                        <p>
                          {selectedItem.item?.visibility?.featured
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Urgent</p>
                        <p>
                          {selectedItem.item?.visibility?.urgent ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Moderation History */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Moderation History</h4>
                    <div
                      className={`p-3 rounded bg-${
                        theme === "dark" ? "gray-800" : "gray-100"
                      }`}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                              selectedItem.item?.status
                            )}`}
                          >
                            {selectedItem.item?.status === "active"
                              ? "Approved"
                              : "Rejected"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Moderated By
                          </p>
                          <p>
                            {selectedItem.item?.moderatorProfile?.name ||
                              "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Moderated At
                          </p>
                          <p>
                            {formatDate(
                              selectedItem.item?.moderationInfo?.moderatedAt
                            )}
                          </p>
                        </div>

                        {selectedItem.item?.moderationInfo?.moderationNotes && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Moderation Notes
                            </p>
                            <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              {selectedItem.item.moderationInfo.moderationNotes}
                            </p>
                          </div>
                        )}

                        {selectedItem.item?.moderationInfo?.rejectionReason && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Rejection Reason
                            </p>
                            <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              {selectedItem.item.moderationInfo.rejectionReason}
                            </p>
                          </div>
                        )}

                        {selectedItem.item?.moderationInfo?.revisedAt && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium">
                              Revision History
                            </p>
                            <div className="mt-2 space-y-2">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Revised By
                                </p>
                                <p>
                                  {selectedItem.item?.moderationInfo?.revisedBy
                                    ?.name || "Unknown"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Revised At
                                </p>
                                <p>
                                  {formatDate(
                                    selectedItem.item?.moderationInfo?.revisedAt
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Previous Status
                                </p>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                    selectedItem.item?.moderationInfo
                                      ?.previousStatus
                                  )}`}
                                >
                                  {selectedItem.item?.moderationInfo
                                    ?.previousStatus === "active"
                                    ? "Approved"
                                    : "Rejected"}
                                </span>
                              </div>
                              {selectedItem.item?.moderationInfo
                                ?.revisionNotes && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Revision Notes
                                  </p>
                                  <p className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    {
                                      selectedItem.item.moderationInfo
                                        .revisionNotes
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                                  {item.price?.amount
                                    ? `${
                                        item.price.currency || "Rs"
                                      } ${item.price.amount.toLocaleString()}`
                                    : item.type
                                    ? renderPriceOrDetails(item)
                                    : "Details N/A"}
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
                          {selectedItem.seller?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedItem.seller?.email || "No email provided"}
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
                            ? new Date(
                                selectedItem.seller.memberSince
                              ).toLocaleDateString()
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
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Moderation Controls */}
                  <div
                    className={`p-4 rounded-lg bg-${
                      theme === "dark" ? "admin.cardDark" : "admin.card"
                    } border border-${
                      theme === "dark" ? "admin.borderDark" : "admin.border"
                    }`}
                  >
                    <h4 className="font-medium mb-3">Moderation Controls</h4>
                    <div className="space-y-4">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() =>
                          openRevisionModal(
                            "revise-approve",
                            selectedItem.item._id
                          )
                        }
                        disabled={selectedItem.item?.status === "active"}
                      >
                        <FiCheckCircle className="mr-2" />
                        Revise to Approve
                      </Button>
                      <Button
                        variant="destructive"
                        fullWidth
                        onClick={() =>
                          openRevisionModal(
                            "revise-reject",
                            selectedItem.item._id
                          )
                        }
                        disabled={selectedItem.item?.status === "moderated"}
                      >
                        <FiXCircle className="mr-2" />
                        Revise to Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revision Confirmation Modal */}
        {modalState.isOpen && (
          <ConfirmationModal
            isOpen={modalState.isOpen}
            onClose={() => setModalState({ ...modalState, isOpen: false })}
            onConfirm={handleReviseModeration}
            title={
              modalState.type === "revise-approve"
                ? "Revise to Approve"
                : "Revise to Reject"
            }
            message={
              <div className="space-y-4">
                <p>
                  {modalState.type === "revise-approve"
                    ? "Are you sure you want to revise this item to approved status?"
                    : "Are you sure you want to revise this item to rejected status?"}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">
                      Moderation Notes:
                    </label>
                    <textarea
                      className="w-full p-2 mt-1 border border-input rounded-md"
                      value={revisionForm.moderationNotes}
                      onChange={(e) =>
                        setRevisionForm({
                          ...revisionForm,
                          moderationNotes: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Add internal notes about this revision..."
                    />
                  </div>

                  {modalState.type === "revise-reject" && (
                    <div>
                      <label className="text-sm font-medium">
                        Rejection Reason (sent to seller):
                      </label>
                      <textarea
                        className="w-full p-2 mt-1 border border-input rounded-md"
                        value={revisionForm.rejectionReason}
                        onChange={(e) =>
                          setRevisionForm({
                            ...revisionForm,
                            rejectionReason: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Explain why this item was rejected..."
                      />
                    </div>
                  )}

                  {modalState.type === "revise-approve" && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featuredItem"
                          checked={revisionForm.featuredItem}
                          onChange={(e) =>
                            setRevisionForm({
                              ...revisionForm,
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
                          checked={revisionForm.urgentItem}
                          onChange={(e) =>
                            setRevisionForm({
                              ...revisionForm,
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
              modalState.type === "revise-approve" ? "Approve" : "Reject"
            }
            variant={
              modalState.type === "revise-approve" ? "primary" : "destructive"
            }
            isLoading={loading}
            confirmDisabled={
              modalState.type === "revise-reject" &&
              !revisionForm.rejectionReason
            }
          />
        )}
      </div>
    </div>
  );
};

export default ModeratedItems;
