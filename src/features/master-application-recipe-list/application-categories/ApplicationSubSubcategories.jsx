import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useSubSubcategories,
  useCategory,
  useSubcategory,
} from "@/hooks/useCategories";
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
import DesktopSubSubCategoryTable from "./components/DesktopSubSubCategoryTable";
import MobileSubSubCategoryCard from "./components/MobileSubSubCategoryCard";
import { CategoryTableSkeleton } from "./components/CategoryTableSkeleton";
import { MobileCategoryCardSkeleton } from "./components/MobileCategoryCardSkeleton";
import {
  SubSubCategoryModal,
  ArchiveSubSubCategoryModal,
  RestoreSubSubCategoryModal,
} from "./components/SubSubCategoryModals";
import { UploadSubSubCategoriesModal } from "./components/Modals/UploadSubSubCategoriesModal";
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

export default function ApplicationSubSubcategories() {
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { permissions = [] } = useUserPermissions();
  const canCreateSubSubCategory = hasPermission(
    permissions,
    PERMISSIONS.SUBSUBCATEGORY.CREATE
  );
  const canImportSubSubCategories = hasPermission(
    permissions,
    PERMISSIONS.SUBSUBCATEGORY.IMPORT
  );
  const canExportSubSubCategories = hasPermission(
    permissions,
    PERMISSIONS.SUBSUBCATEGORY.EXPORT
  );

  // Use React Query for cached fetching
  const { data: categoryData } = useCategory(categoryId);
  const { data: subCategoryData } = useSubcategory(subCategoryId);

  const categoryName =
    location.state?.categoryName ||
    categoryData?.name ||
    subCategoryData?.category?.name ||
    "Category";
  const subCategoryName =
    location.state?.subCategoryName || subCategoryData?.name || "Sub-category";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("true");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const [isSubSubCategoryModalOpen, setIsSubSubCategoryModalOpen] =
    useState(false);
  const [subSubCategoryModalMode, setSubSubCategoryModalMode] =
    useState("create");
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
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(null);
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
    data: subsubcategoriesData,
    isLoading,
    error,
    refetch,
  } = useSubSubcategories({
    subCategoryId,
    searchTerm: debouncedSearchTerm,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const errorMessage = error ? (error?.response?.data?.error || error?.message || "Failed to load sub-subcategories") : "";
  const hasError = Boolean(errorMessage);

  // Extract data and pagination from query result
  const data = subsubcategoriesData?.data ?? [];
  const pagination = subsubcategoriesData?.pagination;
  const subSubCategories = data || [];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const handleAddSubSubCategory = () => {
    setSelectedSubSubCategory(null);
    setSubSubCategoryModalMode("create");
    setIsSubSubCategoryModalOpen(true);
  };

  const handleEditSubSubCategory = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    setSubSubCategoryModalMode("update");
    setIsSubSubCategoryModalOpen(true);
  };

  const handleArchiveSubSubCategory = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreSubSubCategory = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    setIsRestoreModalOpen(true);
  };

  const handleSubSubCategoryConfirm = async (formData) => {
    try {
      if (subSubCategoryModalMode === "create") {
        const response = await categoryService.createSubSubCategory({
          ...formData,
          category: categoryId,
          subCategory: subCategoryId,
        });
        toast.success(
          getResponseMessage(
            response,
            "Sub-sub-category created successfully"
          )
        );
      } else {
        const response = await categoryService.updateSubSubCategory(
          selectedSubSubCategory._id,
          formData,
        );
        toast.success(
          getResponseMessage(
            response,
            "Sub-sub-category updated successfully"
          )
        );
      }
      await queryClient.invalidateQueries();
      setIsSubSubCategoryModalOpen(false);
      setSelectedSubSubCategory(null);
      refetch();
    } catch (err) {
      console.error("Failed to save sub-sub-category:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to save sub-sub-category")
      );
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleArchiveConfirm = async (subSubCategory) => {
    try {
      if (Array.isArray(subSubCategory)) {
        const results = await Promise.allSettled(
          subSubCategory.map((r) => categoryService.archiveSubSubCategory(r._id || r.id))
        );
        const succeeded = results.filter((res) => res.status === "fulfilled").length;
        const failed = results.filter((res) => res.status === "rejected");
        if (succeeded > 0) toast.success(`${succeeded} sub-sub-category(ies) archived successfully`);
        if (failed.length > 0) toast.error(`Failed to archive ${failed.length} sub-sub-category(ies)`);
        setSelectedRowIds([]);
      } else {
        const response = await categoryService.archiveSubSubCategory(
          subSubCategory._id
        );
        toast.success(
          getResponseMessage(
            response,
            "Sub-sub-category archived successfully"
          )
        );
      }
      await queryClient.invalidateQueries();
      setIsArchiveModalOpen(false);
      setSelectedSubSubCategory(null);
      refetch();
    } catch (err) {
      console.error("Failed to archive sub-sub-category:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to archive sub-sub-category")
      );
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleRestoreConfirm = async (subSubCategory) => {
    try {
      await categoryService.restoreSubSubCategory(subSubCategory._id);
      await queryClient.invalidateQueries();
      setIsRestoreModalOpen(false);
      setSelectedSubSubCategory(null);
      refetch();
      toast.success("Sub-sub-category restored successfully");
    } catch (err) {
      console.error("Failed to restore sub-sub-category:", err);
      toast.error("Failed to restore sub-sub-category");
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsImporting(true);
      setUploadError(null);
      const result = await categoryService.uploadSubSubCategories(file, { subCategoryId });
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
        subCategoryId,
        search: searchTerm,
        isActive: selectedState,
        ...(exportLimit !== "all" ? { page: exportPage, limit: exportLimit } : {}),
      };
      const response = await categoryService.exportSubSubCategories(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const d = new Date();
      const fallback = `subsubcategories-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`;
      
      link.setAttribute("download", getFilenameFromResponse(response, fallback));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to export sub-subcategories:", err);
      toast.error(getApiErrorMessage(err, "Failed to export sub-subcategories"));
    } finally {
      setIsExporting(false);
    }
  };

  const breadcrumbItems = [
    { label: "All", link: "/application-categories" },
    {
      label: categoryName || "Category",
      link: `/application-categories/${categoryId}/subcategories`,
    },
    { label: subCategoryName || "Sub-category" },
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

        <div className="bg-primary flex h-8 w-fit rounded-full!">
          {canImportSubSubCategories && (
            <Button
              size="icon"
              onClick={handleImportClick}
              disabled={isImporting}
              className={`w-10 ${canExportSubSubCategories || canCreateSubSubCategory ? "rounded-s-full" : "rounded-full"}`}
            >
              <Upload className="w-5 h-5 text-white" />
            </Button>
          )}
          {canImportSubSubCategories && (canExportSubSubCategories || canCreateSubSubCategory) && <p className="z-10 block w-px my-auto bg-white/20 h-10/12" />}
          {canExportSubSubCategories && (
            <Button
              size="icon"
              onClick={handleExportClick}
              disabled={isExporting}
              className={`w-10 ${!canImportSubSubCategories ? "rounded-s-full" : ""} ${!canCreateSubSubCategory ? "rounded-e-full" : ""}`}
            >
              <Download className="w-5 h-5 text-white" />
            </Button>
          )}
          {canExportSubSubCategories && canCreateSubSubCategory && <p className="z-10 block w-px my-auto bg-white/20 h-10/12" />}
          {canCreateSubSubCategory && (
            <Button
              size="icon"
              onClick={handleAddSubSubCategory}
              className={`w-10 ${canImportSubSubCategories || canExportSubSubCategories ? "rounded-e-full" : "rounded-full"}`}
            >
              <Plus className="w-5 h-5 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="items-center justify-between hidden md:flex ms-0 lg:ms-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton
            onClick={() =>
              navigate(`/application-categories/${categoryId}/subcategories`)
            }
          />
          <DesktopBreadcrumb items={breadcrumbItems} />
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search sub-sub-categories..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search sub-sub-categories..."
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
            {canImportSubSubCategories && (
              <Button
                size="icon"
                onClick={handleImportClick}
                disabled={isImporting}
                title="Import Sub-sub-categories"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${canExportSubSubCategories || canCreateSubSubCategory ? "rounded-s-full" : "rounded-full"}`}
              >
                <Upload className="desktop-page-btn text-background" />
              </Button>
            )}

            {canImportSubSubCategories && (canExportSubSubCategories || canCreateSubSubCategory) && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}

            {canExportSubSubCategories && (
              <Button
                size="icon"
                onClick={handleExportClick}
                disabled={isExporting}
                title="Export Sub-sub-categories"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${!canImportSubSubCategories ? "rounded-s-full" : ""} ${!canCreateSubSubCategory ? "rounded-e-full" : ""}`}
              >
                <Download className="desktop-page-btn text-background" />
              </Button>
            )}

            {canExportSubSubCategories && canCreateSubSubCategory && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}

            {canCreateSubSubCategory && (
              <Button
                size="icon"
                onClick={handleAddSubSubCategory}
                title="Add Sub-Sub-category"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${canImportSubSubCategories || canExportSubSubCategories ? "rounded-e-full" : "rounded-full"}`}
              >
                <PlusCircleIcon className="w-5 desktop-page-btn text-background" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* <SearchFilterBar
        searchPlaceholder="Search sub-sub-categories..."
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
                col1Header="Sub-sub-category Code"
                col2Header="Sub-sub-category Name"
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 md:hidden md:mt-0">
              {subSubCategories.length > 0 ? (
                subSubCategories.map((subSubCategory, index) => (
                  <MobileSubSubCategoryCard
                    key={subSubCategory._id}
                    subSubCategory={subSubCategory}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditSubSubCategory}
                    onArchive={handleArchiveSubSubCategory}
                    onRestore={handleRestoreSubSubCategory}
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
                      ? `No sub-sub-categories match "${searchTerm}". Try adjusting your search.`
                      : "No sub-sub-categories available yet."
                  }
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopSubSubCategoryTable
                subSubCategories={subSubCategories}
                selectedRowIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                onBulkArchiveClick={() => {
                  const selectedObjects = subSubCategories.filter(r => selectedRowIds.includes(r._id || r.id));
                  setSelectedSubSubCategory(selectedObjects);
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
                onEdit={handleEditSubSubCategory}
                onArchive={handleArchiveSubSubCategory}
                onRestore={handleRestoreSubSubCategory}
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
                    ? `No sub-sub-categories match "${searchTerm}". Try adjusting your search.`
                    : "No sub-sub-categories available yet."
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

      <SubSubCategoryModal
        open={isSubSubCategoryModalOpen}
        onOpenChange={setIsSubSubCategoryModalOpen}
        subSubCategory={selectedSubSubCategory}
        mode={subSubCategoryModalMode}
        onConfirm={handleSubSubCategoryConfirm}
      />

      <ArchiveSubSubCategoryModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        subSubCategory={selectedSubSubCategory}
        onConfirm={handleArchiveConfirm}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Export Sub-sub-categories"
        description="Select how many sub-sub-categories to export based on the current filters."
        selectedLimit={exportLimit}
        onLimitChange={setExportLimit}
        selectedPage={exportPage}
        onPageChange={setExportPage}
        totalItems={pagination?.total || 0}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />

      <UploadSubSubCategoriesModal
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
        onUpload={handleUpload}
        isLoading={isImporting}
        uploadResult={uploadResult}
        uploadError={uploadError}
      />

      <RestoreSubSubCategoryModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        subSubCategory={selectedSubSubCategory}
        onConfirm={handleRestoreConfirm}
      />
      <MobileBulkActionBar
        selectedCount={selectedRowIds.length}
        onCancel={() => setSelectedRowIds([])}
        onAction={() => {
          const selectedObjects = subSubCategories.filter(r => selectedRowIds.includes(r._id || r.id));
          setSelectedSubSubCategory(selectedObjects);
          setIsArchiveModalOpen(true);
        }}
      />
    </section>
  );
}
