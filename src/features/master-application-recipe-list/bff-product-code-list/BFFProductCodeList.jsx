import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useBFFProductCodes,
  PRODUCT_SEGMENTS,
} from "@/hooks/useBFFProductCodes";
import { useDebounce } from "@/hooks/useDebounce";
import { bffProductCodeService } from "@/services/bffProductCodeService";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Plus, Download, PlusCircleIcon, Trash2, RefreshCw } from "lucide-react";
import DesktopProductCodeTable from "./components/DesktopProductCodeTable";
import MobileProductCodeCard from "./components/MobileProductCodeCard";
import { ProductCodeTableSkeleton } from "./components/ProductCodeTableSkeleton";
import { MobileProductCodeCardSkeleton } from "./components/MobileProductCodeCardSkeleton";
import {
  ProductCodeModal,
  ArchiveProductCodeModal,
  RestoreProductCodeModal,
} from "./components/ProductCodeModals";
import { ViewProductDetailsModal } from "./components/ViewProductDetailsModal";
import { UploadProductCodesModal } from "./components/UploadProductCodesModal";
import { SyncRecipePricesModal } from "./components/SyncRecipePricesModal";
import { ExportModal } from "@/components/ui/ExportModal";
import { Upload } from "lucide-react";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS, RESOURCES } from "@/constants/permissions";
import { Pagination } from "@/components/ui/Pagination";
import { NoData } from "@/components/ui/NoData";
import { toast } from "sonner";
import { getFilenameFromResponse, hasPermission } from "@/lib/utils";

// Session storage keys
const STORAGE_KEYS = {
  COLUMN_VISIBILITY: "bffProductCode_columnVisibility",
  COLUMN_PINNING: "bffProductCode_columnPinning",
  COLUMN_SIZING: "bffProductCode_columnSizing",
};

// Helper functions to get/set session storage
const getStoredValue = (key, defaultValue) => {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredValue = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};

// Segment tabs
const segmentTabs = [
  { label: "All", value: "all" },
  { label: "Flavours", value: PRODUCT_SEGMENTS.FLAVOURS },
  { label: "Colours", value: PRODUCT_SEGMENTS.COLOURS },
  { label: "Ingredients", value: PRODUCT_SEGMENTS.INGREDIENTS },
  { label: "Seasonings", value: PRODUCT_SEGMENTS.SEASONINGS },
];

// State filter options
const stateOptions = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function BFFProductCodeList() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedState, setSelectedState] = useState("true");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPage, setExportPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(itemsPerPage);
  const fileInputRef = useRef(null);
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No product codes match "${searchTerm}". Try adjusting your search.`
    : selectedSegment !== "all"
      ? `No product codes in the ${selectedSegment} segment.`
      : "No product codes available yet.";


  const handleUploadClick = () => {
    setUploadError(null);
    setUploadResult(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadModalClose = (isOpen) => {
    setIsUploadModalOpen(isOpen);
    // Clear error messages when modal is closed
    if (!isOpen) {
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleExportModalClose = (isOpen) => {
    if (!isExporting) {
      setIsExportModalOpen(isOpen);
    }
  };

  const handleExportClick = () => {
    setExportPage(currentPage);
    setExportLimit(itemsPerPage);
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = async () => {
    try {
      setIsExporting(true);
      const params = {
        segment: selectedSegment !== "all" ? selectedSegment : undefined,
        isActive: selectedState !== "all" ? selectedState : undefined,
        ...(exportLimit !== "all" ? { page: exportPage, limit: exportLimit } : {}),
      };
      const response = await bffProductCodeService.exportProductCodes(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const d = new Date();
      const fallback = `product-codes-${selectedSegment}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`;

      link.setAttribute("download", getFilenameFromResponse(response, fallback));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(
        getResponseMessage(response, "BFF product codes exported successfully"),
      );
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to export product codes:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to export product codes"
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Define filters for SearchFilterBar
  const filters = [
    {
      id: "segment",
      options: segmentTabs,
      value: selectedSegment,
      onChange: setSelectedSegment,
      placeholder: "Select segment...",
      defaultValue: "all",
    },
    {
      id: "state",
      options: stateOptions,
      value: selectedState,
      onChange: setSelectedState,
      placeholder: "Select state...",
      defaultValue: "true",
    },
  ];

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsImporting(true);
    setUploadError(null);

    try {
      const response = await bffProductCodeService.uploadProductCodes(file, {
        segment: selectedSegment !== "all" ? selectedSegment : undefined,
      });
      setUploadResult(response?.data);
      setUploadMessage(
        getResponseMessage(response, "Product codes imported successfully"),
      );
      refetch();
      toast.success(getResponseMessage(response, "Product codes imported successfully"));
    } catch (err) {
      console.error("Failed to import product codes:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to import product codes";
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  // Modal states
  const [isProductCodeModalOpen, setIsProductCodeModalOpen] = useState(false);
  const [productCodeModalMode, setProductCodeModalMode] = useState("create");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedProductCode, setSelectedProductCode] = useState(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Table state with session storage persistence
  const [columnVisibility, setColumnVisibility] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_VISIBILITY, {}),
  );
  const [columnPinning, setColumnPinning] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_PINNING, {}),
  );
  const [columnSizing, setColumnSizing] = useState(() =>
    getStoredValue(STORAGE_KEYS.COLUMN_SIZING, {}),
  );

  // Persist table state to session storage
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_VISIBILITY, columnVisibility);
  }, [columnVisibility]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_PINNING, columnPinning);
  }, [columnPinning]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.COLUMN_SIZING, columnSizing);
  }, [columnSizing]);

  useEffect(() => {
    setSelectedProductIds([]);
  }, [currentPage, searchTerm, selectedSegment, selectedState]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder =
    sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  // Fetch product codes
  const {
    data: productCodesData,
    isLoading,
    error,
    refetch,
  } = useBFFProductCodes({
    searchTerm: debouncedSearchTerm,
    segment: selectedSegment,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const getErrorMessage = (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load BFF product codes";
    return typeof message === "object"
      ? message.message || JSON.stringify(message)
      : message;
  };

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  // Extract data and pagination from query result
  const data = productCodesData?.data ?? [];
  const pagination = productCodesData?.pagination;
  const productCodes = data || [];

  // Event handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSegmentChange = useCallback((value) => {
    setSelectedSegment(value);
    setCurrentPage(1);
  }, []);

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const handleAddProductCode = () => {
    setSelectedProductCode(null);
    setProductCodeModalMode("create");
    setIsProductCodeModalOpen(true);
  };

  const handleEditProductCode = (productCode) => {
    setSelectedProductCode(productCode);
    setProductCodeModalMode("update");
    setIsProductCodeModalOpen(true);
  };

  const handleArchiveProductCode = (productCode) => {
    setSelectedProductCode(productCode);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreProductCode = (productCode) => {
    setSelectedProductCode(productCode);
    setIsRestoreModalOpen(true);
  };

  const handleViewProductCode = (productCode) => {
    setSelectedProductCode(productCode);
    setIsRemarksModalOpen(true);
  };

  const handleProductCodeConfirm = async (formData) => {
    try {
      if (productCodeModalMode === "create") {
        const response = await bffProductCodeService.createProductCode(formData);
        toast.success(
          getResponseMessage(response, "BFF product code created successfully")
        );
      } else {
        const response = await bffProductCodeService.updateProductCode(
          selectedProductCode._id,
          formData,
        );
        toast.success(
          getResponseMessage(response, "BFF product code updated successfully")
        );
      }
      refetch();
    } catch (err) {
      console.error("Failed to save product code:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save product code"
      );
      throw err;
    }
  };

  const handleArchiveConfirm = async (productCode) => {
    try {
      if (Array.isArray(productCode)) {
        const results = await Promise.allSettled(
          productCode.map((pc) => bffProductCodeService.archiveProductCode(pc._id))
        );
        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected");

        if (succeeded > 0) {
          toast.success(`${succeeded} BFF product code(s) archived successfully`);
        }
        if (failed.length > 0) {
          console.error("Some archive operations failed:", failed);
          const firstError = failed[0].reason?.response?.data?.message || failed[0].reason?.message || "Some product codes could not be archived.";
          toast.error(`Failed to archive ${failed.length} product code(s): ${firstError}`);
        }
        setSelectedProductIds([]);
      } else {
        const response = await bffProductCodeService.archiveProductCode(productCode._id);
        toast.success(
          getResponseMessage(response, "BFF product code archived successfully")
        );
      }
      refetch();
    } catch (err) {
      console.error("Failed to archive product code:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to archive product code"
      );
      throw err;
    }
  };

  const handleRestoreConfirm = async (productCode) => {
    try {
      const response = await bffProductCodeService.restoreProductCode(productCode._id);
      refetch();
      toast.success(
        getResponseMessage(response, "BFF product code restored successfully")
      );
    } catch (err) {
      console.error("Failed to restore product code:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to restore product code"
      );
      throw err;
    }
  };

  const handleSyncConfirm = async () => {
    try {
      const response = await bffProductCodeService.syncRecipePrices();
      toast.success(
        getResponseMessage(response, "Recipe prices synced successfully")
      );
      refetch();
    } catch (err) {
      console.error("Failed to sync recipe prices:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to sync recipe prices"
      );
      throw err;
    }
  };

  // Check if we're on a specific segment tab (not "all")
  const isSpecificSegment = selectedSegment !== "all";

  const canImport = !permissionsLoading && hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_CODE.IMPORT);
  const canExport = !permissionsLoading && hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_CODE.EXPORT);
  const canCreate = !permissionsLoading && hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_CODE.CREATE);
  const canUpdate = !permissionsLoading && hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_CODE.UPDATE);
  const canArchive = !permissionsLoading && hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_CODE.DELETE);
  const canManageCommercialized = !permissionsLoading && hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_CODE.MANAGE_COMMERCIALIZED);

  const canRestore = canUpdate;

  const canEditRecord = useCallback(
    (record) => {
      if (!canUpdate) return false;
      return record?.commercializedProductCode ? canManageCommercialized : true;
    },
    [canManageCommercialized, canUpdate],
  );

  const canArchiveRecord = useCallback(
    (record) => {
      if (!canArchive) return false;
      return record?.commercializedProductCode ? canManageCommercialized : true;
    },
    [canArchive, canManageCommercialized],
  );

  // Get the default segment for the modal when creating from a specific segment tab
  const getDefaultSegmentForModal = () => {
    return isSpecificSegment ? selectedSegment : "";
  };

  const actions = useMemo(
    () =>
      [
        canImport && {
          icon: Upload,
          onClick: handleUploadClick,
          disabled: isImporting,
          loading: isImporting,
          title: "Upload product codes from Excel/CSV",
          key: "import",
        },
        canExport && {
          icon: Download,
          onClick: handleExportClick,
          disabled: isExporting,
          loading: isExporting,
          title: "Export product codes",
          key: "export",
        },
        canCreate && {
          icon: PlusCircleIcon,
          onClick: handleAddProductCode,
          title: "Add Product Code",
          key: "create",
        },
      ].filter(Boolean),
    [
      canImport,
      canExport,
      canCreate,
      isImporting,
      isExporting,
      handleUploadClick,
      handleExportClick,
      handleAddProductCode,
    ],
  );

  const mobileActions = actions.map((a) => ({
    icon: <a.icon className="w-5 h-5" />,
    onClick: a.onClick,
    disabled: a.disabled,
    loading: a.loading,
    label: a.title,
  }));

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Page Header & Search & Theme Toggle (Desktop Only) */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="BFF Product Code List"
          className="py-4 pb-6 text-heading md:p-0 md:m-0"
        />

        <div className="flex items-center gap-2 md:hidden">
          {canUpdate && (
            <Button
              size="icon"
              onClick={() => setIsSyncModalOpen(true)}
              title="Sync recipe prices with current product costs"
              className="bg-primary text-background hover:bg-primary/90 rounded-full! shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          )}
          {isSpecificSegment && (
            <ActionButtonsGroup actions={mobileActions} />
          )}
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search product codes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop: Segment Tabs */}
      <div className="hidden md:flex justify-between ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center gap-2 border-b border-border">
          {segmentTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleSegmentChange(tab.value)}
              className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${selectedSegment === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Desktop: State Filter Pills and Action Buttons */}
        <div className="flex-none hidden md:block">
          <div className="flex items-center gap-3 lg:gap-2 xl:gap-3 2xl:gap-3.5 3xl:gap-3">
            <div className="flex items-center justify-start">
              <DesktopFilterPills
                value={selectedState}
                options={stateOptions}
                onChange={handleStateChange}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Sync button - always visible */}
              {canUpdate && (
                <Button
                  size="icon"
                  onClick={() => setIsSyncModalOpen(true)}
                  title="Sync recipe prices with current product costs"
                  className="transition-colors bg-primary text-background hover:bg-primary/90 rounded-full! shadow-sm"
                >
                  <RefreshCw className="desktop-page-btn" />
                </Button>
              )}
              {/* Show Create and Download buttons only on specific segment tabs */}
              {isSpecificSegment && actions.length > 0 && (
                <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
                  {actions.map((action, index) => {
                    const Icon = action.icon;
                    const isFirst = index === 0;
                    const isLast = index === actions.length - 1;

                    return (
                      <React.Fragment key={action.key}>
                        <Button
                          size="icon"
                          onClick={action.onClick}
                          disabled={action.disabled || action.loading}
                          title={action.title}
                          className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${isFirst ? "rounded-s-full" : "rounded-none"} ${isLast ? "rounded-e-full" : ""}`}
                        >
                          <Icon className="desktop-page-btn text-background" />
                        </Button>

                        {!isLast && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bar */}
      <SearchFilterBar
        searchPlaceholder="Search product codes..."
        hideOnDesktop={true}
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        filters={filters}
      />

      {/* Content Area */}
      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileProductCodeCardSkeleton count={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:block bg-background border-border/50">
              <ProductCodeTableSkeleton
                rows={5}
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="mt-6 md:hidden">
              {hasError && productCodes.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : productCodes.length > 0 ? (
                productCodes.map((productCode, index) => (
                  <MobileProductCodeCard
                    key={productCode._id}
                    productCode={productCode}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={
                      canEditRecord(productCode)
                        ? handleEditProductCode
                        : undefined
                    }
                    onArchive={
                      canArchiveRecord(productCode)
                        ? handleArchiveProductCode
                        : undefined
                    }
                    onRestore={canRestore ? handleRestoreProductCode : undefined}
                    onViewDetails={handleViewProductCode}
                    selectedProductIds={selectedProductIds}
                    onSelectChange={setSelectedProductIds}
                    canArchive={canArchive}
                    canArchiveRecord={canArchiveRecord}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <NoData
                    message={noDataMessage}
                    description={noDataDescription}
                  />
                  {isSpecificSegment && (
                    <Button
                      onClick={handleAddProductCode}
                      className="mt-4 text-white bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add First Product Code
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0 ">
              <DesktopProductCodeTable
                productCodes={productCodes}
                selectedProductIds={selectedProductIds}
                onSelectChange={setSelectedProductIds}
                canArchive={canArchive}
                onBulkArchiveClick={() => {
                  const selectedObjects = productCodes.filter(pc => selectedProductIds.includes(pc._id));
                  setSelectedProductCode(selectedObjects);
                  setIsArchiveModalOpen(true);
                }}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onEdit={handleEditProductCode}
                onArchive={handleArchiveProductCode}
                onRestore={canRestore ? handleRestoreProductCode : undefined}
                onViewDetails={handleViewProductCode}
                canEditRecord={canEditRecord}
                canArchiveRecord={canArchiveRecord}
                canRestoreRecord={() => canRestore}
                sorting={sorting}
                onSortingChange={setSorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnPinning={columnPinning}
                onColumnPinningChange={setColumnPinning}
                columnSizing={columnSizing}
                onColumnSizingChange={setColumnSizing}
                noDataMessage={noDataMessage}
                noDataDescription={noDataDescription}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">
                      {errorMessage}
                    </div>
                  ) : null
                }
              />
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! lg:hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={handleExportModalClose}
        title="Export Product Codes"
        description="Select how many product codes to export based on the current filters."
        selectedLimit={exportLimit}
        onLimitChange={setExportLimit}
        selectedPage={exportPage}
        onPageChange={setExportPage}
        totalItems={pagination?.total || 0}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />

      {/* Upload Modal */}
      <UploadProductCodesModal
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
        onUpload={handleFileUpload}
        isLoading={isImporting}
        uploadResult={uploadResult}
        uploadError={uploadError}
        selectedSegment={selectedSegment}
      />

      {/* Sync Recipe Prices Modal */}
      <SyncRecipePricesModal
        open={isSyncModalOpen}
        onOpenChange={setIsSyncModalOpen}
        onConfirm={handleSyncConfirm}
      />

      {/* Modals */}
      <ProductCodeModal
        open={isProductCodeModalOpen}
        onOpenChange={setIsProductCodeModalOpen}
        productCode={selectedProductCode}
        mode={productCodeModalMode}
        defaultSegment={getDefaultSegmentForModal()}
        onConfirm={handleProductCodeConfirm}
      />

      <ArchiveProductCodeModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        productCode={selectedProductCode}
        onConfirm={handleArchiveConfirm}
      />

      <RestoreProductCodeModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        productCode={selectedProductCode}
        onConfirm={handleRestoreConfirm}
      />

      <ViewProductDetailsModal
        open={isRemarksModalOpen}
        onOpenChange={setIsRemarksModalOpen}
        productCode={selectedProductCode}
      />

      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col md:flex-row items-center gap-2.5 md:gap-4 px-5 md:px-6 py-3 md:py-3 rounded-2xl md:rounded-full bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl animate-in slide-in-from-bottom duration-300 w-[90%] max-w-[340px] md:w-auto md:max-w-none md:hidden">
          <span className="text-xs md:text-sm font-semibold text-foreground text-center">
            {selectedProductIds.length} item(s) selected
          </span>
          <div className="hidden md:block w-px h-5 bg-border" />
          <div className="flex items-center justify-center gap-2 w-full md:w-auto">
            <Button
              size="sm"
              intent="outline"
              className="rounded-full text-xs font-semibold px-4 h-8 cursor-pointer flex-1 md:flex-none"
              onClick={() => setSelectedProductIds([])}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              intent="primary"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 h-8 flex items-center justify-center gap-1.5 cursor-pointer border-none flex-1 md:flex-none"
              onClick={() => {
                const selectedObjects = productCodes.filter(pc => selectedProductIds.includes(pc._id));
                setSelectedProductCode(selectedObjects);
                setIsArchiveModalOpen(true);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Archive <span className="hidden md:block">Selected</span>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
