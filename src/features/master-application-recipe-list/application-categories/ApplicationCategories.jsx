import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { categoryService } from "@/services/categoryService";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { getApiErrorMessage } from "@/utils/apiError";
import { Pagination } from "@/components/ui/Pagination";
import { PlusCircleIcon, Download, Upload } from "lucide-react";
import { NoData } from "@/components/ui/NoData";
import { toast } from "sonner";
import { getFilenameFromResponse, hasPermission } from "@/lib/utils";
import DesktopCategoryTable from "./components/DesktopCategoryTable";
import MobileCategoryCard from "./components/MobileCategoryCard";
import { CategoryTableSkeleton } from "./components/CategoryTableSkeleton";
import { MobileCategoryCardSkeleton } from "./components/MobileCategoryCardSkeleton";
import {
  CategoryModal,
  ArchiveCategoryModal,
  RestoreCategoryModal,
} from "./components/CategoryModals";
import { UploadCategoriesModal } from "./components/Modals/UploadCategoriesModal";
import { ExportModal } from "@/components/ui/ExportModal";
import { useQueryClient } from "@tanstack/react-query";

const stateOptions = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function ApplicationCategories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { permissions = [] } = useUserPermissions();
  const canCreateCategory = hasPermission(
    permissions,
    PERMISSIONS.CATEGORY.CREATE
  );
  const canImportCategories = hasPermission(
    permissions,
    PERMISSIONS.CATEGORY.IMPORT
  );
  const canExportCategories = hasPermission(
    permissions,
    PERMISSIONS.CATEGORY.EXPORT
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("true");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState("create");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [exportPage, setExportPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  React.useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedState]);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnSizing, setColumnSizing] = useState({});

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder =
    sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = useCategories({
    searchTerm: debouncedSearchTerm,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const errorMessage = error ? (error?.response?.data?.error || error?.message || "Failed to load categories") : "";
  const hasError = Boolean(errorMessage);

  // Extract data and pagination from query result
  const data = categoriesData?.data ?? [];
  const pagination = categoriesData?.pagination;
  const categories = data || [];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryModalMode("create");
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryModalMode("update");
    setIsCategoryModalOpen(true);
  };

  const handleArchiveCategory = (category) => {
    setSelectedCategory(category);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreCategory = (category) => {
    setSelectedCategory(category);
    setIsRestoreModalOpen(true);
  };

  const handleViewChildren = (category) => {
    navigate(`/application-categories/${category._id}/subcategories`, {
      state: { categoryName: category.name },
    });
  };

  const handleCategoryConfirm = async (formData) => {
    try {
      console.log(
        "DEBUG - Parent: handleCategoryConfirm called with:",
        formData
      );
      console.log("DEBUG - Parent: categoryModalMode:", categoryModalMode);

      if (categoryModalMode === "create") {
        console.log("DEBUG - Parent: Creating category...");
        const response = await categoryService.createCategory(formData);
        toast.success(
          getResponseMessage(response, "Application category created successfully")
        );
      } else {
        console.log(
          "DEBUG - Parent: Updating category ID:",
          selectedCategory._id
        );
        const response = await categoryService.updateCategory(selectedCategory._id, formData);
        toast.success(
          getResponseMessage(response, "Application category updated successfully")
        );
      }
      console.log("DEBUG - Parent: Operation successful, calling refetch()");
      await queryClient.invalidateQueries();
      setIsCategoryModalOpen(false);
      setSelectedCategory(null);
      refetch();
    } catch (err) {
      console.error("DEBUG - Parent: Failed to save category:", err);
      console.error("DEBUG - Parent: Error response:", err.response);
      console.error("DEBUG - Parent: Error response data:", err.response?.data);
      toast.error(
        getApiErrorMessage(err, "Failed to save category")
      );
      // Re-throw the error so the modal can catch and display it
      throw err;
    }
  };

  const handleArchiveConfirm = async (category) => {
    try {
      if (Array.isArray(category)) {
        const results = await Promise.allSettled(
          category.map((r) => categoryService.archiveCategory(r._id || r.id))
        );
        const succeeded = results.filter((res) => res.status === "fulfilled").length;
        const failed = results.filter((res) => res.status === "rejected");
        if (succeeded > 0) toast.success(`${succeeded} category(ies) archived successfully`);
        if (failed.length > 0) toast.error(`Failed to archive ${failed.length} category(ies)`);
        setSelectedRowIds([]);
      } else {
        const response = await categoryService.archiveCategory(category._id || category.id);
        toast.success(
          getResponseMessage(response, "Application category archived successfully")
        );
      }
      await queryClient.invalidateQueries();
      setIsArchiveModalOpen(false);
      setSelectedCategory(null);
      refetch();
    } catch (err) {
      console.error("DEBUG - Parent: Failed to archive category:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to archive category")
      );
      // Re-throw the error so the modal can catch and display it
      throw err;
    }
  };

  const handleRestoreConfirm = async (category) => {
    try {
      console.log(
        "DEBUG - Parent: handleRestoreConfirm called for category:",
        category._id
      );
      const response = await categoryService.restoreCategory(category._id);
      console.log("DEBUG - Parent: Restore successful, calling refetch()");
      await queryClient.invalidateQueries();
      setIsRestoreModalOpen(false);
      setSelectedCategory(null);
      refetch();
      toast.success(
        getResponseMessage(response, "Application category restored successfully")
      );
    } catch (err) {
      console.error("DEBUG - Parent: Failed to restore category:", err);
      console.error("DEBUG - Parent: Error response:", err.response);
      console.error("DEBUG - Parent: Error response data:", err.response?.data);
      toast.error(
        getApiErrorMessage(err, "Failed to restore category")
      );
      // Re-throw the error so the modal can catch and display it
      throw err;
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsImporting(true);
      setUploadError(null);
      const result = await categoryService.uploadCategories(file);
      setUploadResult(result);
      await queryClient.invalidateQueries();
      refetch();
    } catch (err) {
      setUploadError(getApiErrorMessage(err));
    } finally {
      setIsImporting(false);
    }
  };

  const handleUploadModalClose = (isOpen) => {
    setIsUploadModalOpen(isOpen);
    if (!isOpen) {
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleImportClick = () => {
    setIsUploadModalOpen(true);
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
        search: searchTerm,
        isActive: selectedState,
        ...(exportLimit !== "all" ? { page: exportPage, limit: exportLimit } : {}),
      };
      const response = await categoryService.exportCategories(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const d = new Date();
      const fallback = `categories-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`;
      
      link.setAttribute("download", getFilenameFromResponse(response, fallback));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to export categories:", err);
      toast.error(getApiErrorMessage(err, "Failed to export categories"));
    } finally {
      setIsExporting(false);
    }
  };

  const actions = useMemo(
    () => [
      {
        icon: Upload,
        onClick: handleImportClick,
        disabled: isImporting,
        loading: isImporting,
        title: "Import categories",
        key: "import",
        show: canImportCategories,
      },
      {
        icon: Download,
        onClick: handleExportClick,
        disabled: isExporting,
        loading: isExporting,
        title: "Export categories",
        key: "export",
        show: canExportCategories,
      },
      {
        icon: PlusCircleIcon,
        onClick: handleAddCategory,
        title: "Add Category",
        key: "create",
        show: canCreateCategory,
      },
    ],
    [handleAddCategory, handleImportClick, handleExportClick, isImporting, isExporting, canImportCategories, canExportCategories, canCreateCategory]
  );

  const mobileActions = actions
    .filter(a => a.show !== false)
    .map((action) => {
      const Icon = action.icon;
      return {
        icon: <Icon className="w-5 h-5" />,
        onClick: action.onClick,
        disabled: action.disabled,
        loading: action.loading,
        label: action.title,
      };
    });

  const breadcrumbItems = [{ label: "Application Categories" }];

  const filters = useMemo(
    () => [
      {
        id: "state",
        value: selectedState,
        onChange: handleStateChange,
        options: stateOptions,
        placeholder: "Active",
      },
    ],
    [selectedState, handleStateChange]
  );

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between ms-0 lg:ms-5">
        <PageHeader
          title="Application Categories"
          className="py-4 pb-6 text-heading md:p-0 md:m-0"
        />

        <ActionButtonsGroup actions={mobileActions} className="md:hidden" />

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search categories..."
        filters={filters}
        hideOnDesktop={true}
        defaultFilterValue="true"
      />

      <div className="hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <DesktopFilterPills
              value={selectedState}
              options={stateOptions}
              onChange={handleStateChange}
            />
          </div>
          <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
            {actions.filter(a => a.show !== false).map((action, index, filteredActions) => {
              const Icon = action.icon;
              const isFirst = index === 0;
              const isLast = index === filteredActions.length - 1;

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
        </div>
      </div>

      {/* <SearchFilterBar
        searchPlaceholder="Search categories..."
        hideOnDesktop={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
      /> */}

      <div className="flex-1 w-full flex flex-col min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden ">
              <MobileCategoryCardSkeleton cards={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:block bg-background border-border/50">
              <CategoryTableSkeleton
                rows={5}
                col1Header="Category Code"
                col2Header="Category Name"
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <MobileCategoryCard
                    key={category._id}
                    category={category}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditCategory}
                    onArchive={handleArchiveCategory}
                    onRestore={handleRestoreCategory}
                    onViewChildren={handleViewChildren}
                  />
                ))
              ) : hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : (
                <NoData
                  message="No Records Found"
                  description={searchTerm
                    ? `No categories match "${searchTerm}". Try adjusting your search.`
                    : "No categories available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopCategoryTable
                categories={categories}
                selectedRowIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                onBulkArchiveClick={() => {
                  const selectedObjects = categories.filter(r => selectedRowIds.includes(r._id || r.id));
                  setSelectedCategory(selectedObjects);
                  setIsArchiveModalOpen(true);
                }}
                isArchived={selectedState === "false"}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onEdit={handleEditCategory}
                onArchive={handleArchiveCategory}
                onRestore={handleRestoreCategory}
                onViewChildren={handleViewChildren}
                sorting={sorting}
                onSortingChange={setSorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnPinning={columnPinning}
                onColumnPinningChange={setColumnPinning}
                columnSizing={columnSizing}
                onColumnSizingChange={setColumnSizing}
                noDataMessage="No Records Found"
                noDataDescription={searchTerm
                  ? `No categories match "${searchTerm}". Try adjusting your search.`
                  : "No categories available yet."}
                errorMessage={errorMessage}
                hasError={hasError}
              />
            </div>
          </>
        )}

        {pagination && (
          <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
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

      <CategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        category={selectedCategory}
        mode={categoryModalMode}
        onConfirm={handleCategoryConfirm}
      />

      <ArchiveCategoryModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        category={selectedCategory}
        onConfirm={handleArchiveConfirm}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Export Application Categories"
        description="Select how many categories to export based on the current filters."
        selectedLimit={exportLimit}
        onLimitChange={setExportLimit}
        selectedPage={exportPage}
        onPageChange={setExportPage}
        totalItems={pagination?.total || 0}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />

      <UploadCategoriesModal
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
        onUpload={handleUpload}
        isLoading={isImporting}
        uploadResult={uploadResult}
        uploadError={uploadError}
      />

      <RestoreCategoryModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        category={selectedCategory}
        onConfirm={handleRestoreConfirm}
      />
    </section>
  );
}
