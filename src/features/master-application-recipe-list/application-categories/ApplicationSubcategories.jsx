import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSubcategories, useCategory } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { categoryService } from "@/services/categoryService";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, ChevronLeft, Download, PlusCircleIcon, Upload } from "lucide-react";
import { NoData } from "@/components/ui/NoData";
import { toast } from "sonner";
import { getFilenameFromResponse, hasPermission } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { getApiErrorMessage } from "@/utils/apiError";
import DesktopSubCategoryTable from "./components/DesktopSubCategoryTable";
import MobileSubCategoryCard from "./components/MobileSubCategoryCard";
import { CategoryTableSkeleton } from "./components/CategoryTableSkeleton";
import { MobileCategoryCardSkeleton } from "./components/MobileCategoryCardSkeleton";
import {
  SubCategoryModal,
  ArchiveSubCategoryModal,
  RestoreSubCategoryModal,
} from "./components/SubCategoryModals";
import { UploadSubCategoriesModal } from "./components/Modals/UploadSubCategoriesModal";
import { ExportModal } from "@/components/ui/ExportModal";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DesktopBreadcrumb } from "@/components/ui/DesktopBreadcrumb";
import { useQueryClient } from "@tanstack/react-query";
import MobileBulkActionBar from "@/components/ui/MobileBulkActionBar";

const stateOptions = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function ApplicationSubcategories() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { permissions = [] } = useUserPermissions();
  const canCreateSubCategory = hasPermission(
    permissions,
    PERMISSIONS.SUBCATEGORY.CREATE
  );
  const canImportSubCategories = hasPermission(
    permissions,
    PERMISSIONS.SUBCATEGORY.IMPORT
  );
  const canExportSubCategories = hasPermission(
    permissions,
    PERMISSIONS.SUBCATEGORY.EXPORT
  );

  // Use React Query for cached category fetching
  const { data: categoryData } = useCategory(categoryId);
  const categoryName =
    location.state?.categoryName || categoryData?.name || "Category";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("true");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryModalMode, setSubCategoryModalMode] = useState("create");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [exportPage, setExportPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(20);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
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
    data: subcategoriesData,
    isLoading,
    error,
    refetch,
  } = useSubcategories({
    categoryId,
    searchTerm: debouncedSearchTerm,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const errorMessage = error ? (error?.response?.data?.error || error?.message || "Failed to load subcategories") : "";
  const hasError = Boolean(errorMessage);

  // Extract data and pagination from query result
  const data = subcategoriesData?.data ?? [];
  const pagination = subcategoriesData?.pagination;
  const subCategories = data || [];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const handleAddSubCategory = () => {
    setSelectedSubCategory(null);
    setSubCategoryModalMode("create");
    setIsSubCategoryModalOpen(true);
  };

  const handleEditSubCategory = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSubCategoryModalMode("update");
    setIsSubCategoryModalOpen(true);
  };

  const handleArchiveSubCategory = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreSubCategory = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setIsRestoreModalOpen(true);
  };

  const handleViewChildren = (subCategory) => {
    navigate(
      `/application-categories/${categoryId}/subcategories/${subCategory._id}/subsubcategories`,
      {
        state: { categoryName, subCategoryName: subCategory.name },
      },
    );
  };

  const handleViewTags = (subCategory) => {
    navigate(
      `/application-categories/${categoryId}/subcategories/${subCategory._id}/tags`,
      {
        state: { categoryName, subCategoryName: subCategory.name },
      },
    );
  };

  const handleSubCategoryConfirm = async (formData) => {
    try {
      if (subCategoryModalMode === "create") {
        const response = await categoryService.createSubCategory({
          ...formData,
          category: categoryId,
        });
        toast.success(
          getResponseMessage(response, "Sub-category created successfully")
        );
      } else {
        const response = await categoryService.updateSubCategory(
          selectedSubCategory._id,
          formData,
        );
        toast.success(
          getResponseMessage(response, "Sub-category updated successfully")
        );
      }
      await queryClient.invalidateQueries();
      setIsSubCategoryModalOpen(false);
      setSelectedSubCategory(null);
      refetch();
    } catch (err) {
      console.error("Failed to save sub-category:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to save sub-category")
      );
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleArchiveConfirm = async (subCategory) => {
    try {
      if (Array.isArray(subCategory)) {
        const results = await Promise.allSettled(
          subCategory.map((r) => categoryService.archiveSubCategory(r._id || r.id))
        );
        const succeeded = results.filter((res) => res.status === "fulfilled").length;
        const failed = results.filter((res) => res.status === "rejected");
        if (succeeded > 0) toast.success(`${succeeded} sub-category(ies) archived successfully`);
        if (failed.length > 0) toast.error(`Failed to archive ${failed.length} sub-category(ies)`);
        setSelectedRowIds([]);
      } else {
        const response = await categoryService.archiveSubCategory(subCategory._id || subCategory.id);
        toast.success(
          getResponseMessage(response, "Sub-category archived successfully")
        );
      }
      await queryClient.invalidateQueries();
      setIsArchiveModalOpen(false);
      setSelectedSubCategory(null);
      refetch();
    } catch (err) {
      console.error("Failed to archive sub-category:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to archive sub-category")
      );
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleRestoreConfirm = async (subCategory) => {
    try {
      await categoryService.restoreSubCategory(subCategory._id);
      await queryClient.invalidateQueries();
      setIsRestoreModalOpen(false);
      setSelectedSubCategory(null);
      refetch();
      toast.success("Sub-category restored successfully");
    } catch (err) {
      console.error("Failed to restore sub-category:", err);
      toast.error("Failed to restore sub-category");
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsImporting(true);
      setUploadError(null);
      const result = await categoryService.uploadSubCategories(file, { categoryId });
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
        categoryId,
        search: searchTerm,
        isActive: selectedState,
        ...(exportLimit !== "all" ? { page: exportPage, limit: exportLimit } : {}),
      };
      const response = await categoryService.exportSubCategories(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const d = new Date();
      const fallback = `subcategories-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`;
      
      link.setAttribute("download", getFilenameFromResponse(response, fallback));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to export subcategories:", err);
      toast.error(getApiErrorMessage(err, "Failed to export subcategories"));
    } finally {
      setIsExporting(false);
    }
  };

  const breadcrumbItems = [
    { label: "All", link: "/application-categories" },
    { label: categoryName || "Category" },
  ];

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
    [selectedState, handleStateChange],
  );

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Mobile Header */}
      <div className="flex items-center justify-between py-4 md:px-4 md:hidden">
        {/* Header + Breadcrumb  */}
        <div className="flex items-center justify-between ms-0 lg:ms-5">
          <div className="flex items-center gap-3 py-4 md:p-0 md:m-0">
            <BackButton onClick={handleBack} className="" />
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-primary flex h-8 w-fit rounded-full!">
          {canImportSubCategories && (
            <Button
              size="icon"
              onClick={handleImportClick}
              disabled={isImporting}
              className={`w-10 ${canExportSubCategories || canCreateSubCategory ? "rounded-s-full" : "rounded-full"}`}
            >
              <Upload className="w-5 h-5 text-white" />
            </Button>
          )}
          {canImportSubCategories && (canExportSubCategories || canCreateSubCategory) && <p className="z-10 block w-px my-auto bg-white/20 h-10/12" />}
          {canExportSubCategories && (
            <Button
              size="icon"
              onClick={handleExportClick}
              disabled={isExporting}
              className={`w-10 ${!canImportSubCategories ? "rounded-s-full" : ""} ${!canCreateSubCategory ? "rounded-e-full" : ""}`}
            >
              <Download className="w-5 h-5 text-white" />
            </Button>
          )}
          {canExportSubCategories && canCreateSubCategory && <p className="z-10 block w-px my-auto bg-white/20 h-10/12" />}
          {canCreateSubCategory && (
            <Button
              size="icon"
              onClick={handleAddSubCategory}
              className={`w-10 ${canImportSubCategories || canExportSubCategories ? "rounded-e-full" : "rounded-full"}`}
            >
              <Plus className="w-5 h-5 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="items-center justify-between hidden md:flex ms-0 lg:ms-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton onClick={() => navigate("/application-categories")} />
          <DesktopBreadcrumb items={breadcrumbItems} />
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search sub-categories..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search sub-categories..."
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
          {/* Action Buttons */}
          <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
            {canImportSubCategories && (
              <Button
                size="icon"
                onClick={handleImportClick}
                disabled={isImporting}
                title="Import Sub-categories"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${canExportSubCategories || canCreateSubCategory ? "rounded-s-full" : "rounded-full"}`}
              >
                <Upload className="desktop-page-btn text-background" />
              </Button>
            )}

            {canImportSubCategories && (canExportSubCategories || canCreateSubCategory) && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}

            {canExportSubCategories && (
              <Button
                size="icon"
                onClick={handleExportClick}
                disabled={isExporting}
                title="Export Sub-categories"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${!canImportSubCategories ? "rounded-s-full" : ""} ${!canCreateSubCategory ? "rounded-e-full" : ""}`}
              >
                <Download className="desktop-page-btn text-background" />
              </Button>
            )}

            {canExportSubCategories && canCreateSubCategory && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}

            {canCreateSubCategory && (
              <Button
                size="icon"
                onClick={handleAddSubCategory}
                title="Add Sub-category"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${canImportSubCategories || canExportSubCategories ? "rounded-e-full" : "rounded-full"}`}
              >
                <PlusCircleIcon className="w-5 desktop-page-btn text-background" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* <SearchFilterBar
        searchPlaceholder="Search sub-categories..."
        hideOnDesktop={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
      /> */}

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="md:hidden">
              <MobileCategoryCardSkeleton cards={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:block bg-background border-border/50">
              <CategoryTableSkeleton
                rows={5}
                col1Header="Sub-category Code"
                col2Header="Sub-category Name"
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {subCategories.length > 0 ? (
                subCategories.map((subCategory, index) => (
                  <MobileSubCategoryCard
                    key={subCategory._id}
                    subCategory={subCategory}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditSubCategory}
                    onArchive={handleArchiveSubCategory}
                    onRestore={handleRestoreSubCategory}
                    onViewChildren={handleViewChildren}
                    onViewTags={handleViewTags}
                    selectedRowIds={selectedRowIds}
                    onSelectChange={setSelectedRowIds}
                  />
                ))
              ) : hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : (
                <NoData
                  message="No Records Found"
                  description={
                    searchTerm
                      ? `No sub-categories match "${searchTerm}". Try adjusting your search.`
                      : "No sub-categories available yet."
                  }
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopSubCategoryTable
                subCategories={subCategories}
                selectedRowIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                onBulkArchiveClick={() => {
                  const selectedObjects = subCategories.filter(r => selectedRowIds.includes(r._id || r.id));
                  setSelectedSubCategory(selectedObjects);
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
                onEdit={handleEditSubCategory}
                onArchive={handleArchiveSubCategory}
                onRestore={handleRestoreSubCategory}
                onViewChildren={handleViewChildren}
                onViewTags={handleViewTags}
                sorting={sorting}
                onSortingChange={setSorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnPinning={columnPinning}
                onColumnPinningChange={setColumnPinning}
                columnSizing={columnSizing}
                onColumnSizingChange={setColumnSizing}
                noDataMessage="No Records Found"
                noDataDescription={
                  searchTerm
                    ? `No sub-categories match "${searchTerm}". Try adjusting your search.`
                    : "No sub-categories available yet."
                }
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

      <SubCategoryModal
        open={isSubCategoryModalOpen}
        onOpenChange={setIsSubCategoryModalOpen}
        subCategory={selectedSubCategory}
        mode={subCategoryModalMode}
        onConfirm={handleSubCategoryConfirm}
      />

      <ArchiveSubCategoryModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        subCategory={selectedSubCategory}
        onConfirm={handleArchiveConfirm}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Export Sub-categories"
        description="Select how many sub-categories to export based on the current filters."
        selectedLimit={exportLimit}
        onLimitChange={setExportLimit}
        selectedPage={exportPage}
        onPageChange={setExportPage}
        totalItems={pagination?.total || 0}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />

      <UploadSubCategoriesModal
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
        onUpload={handleUpload}
        isLoading={isImporting}
        uploadResult={uploadResult}
        uploadError={uploadError}
      />

      <RestoreSubCategoryModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        subCategory={selectedSubCategory}
        onConfirm={handleRestoreConfirm}
      />
      <MobileBulkActionBar
        selectedCount={selectedRowIds.length}
        onCancel={() => setSelectedRowIds([])}
        onAction={() => {
          const selectedObjects = subCategories.filter(r => selectedRowIds.includes(r._id || r.id));
          setSelectedSubCategory(selectedObjects);
          setIsArchiveModalOpen(true);
        }}
      />
    </section>
  );
}
