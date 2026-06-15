import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTags, useCategory, useSubcategory } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { categoryService } from "@/services/categoryService";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, Download, PlusCircleIcon, Upload } from "lucide-react";
import { NoData } from "@/components/ui/NoData";
import { toast } from "sonner";
import { getFilenameFromResponse, hasPermission } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { getApiErrorMessage } from "@/utils/apiError";
import DesktopTagTable from "./components/DesktopTagTable";
import MobileTagCard from "./components/MobileTagCard";
import { CategoryTableSkeleton } from "./components/CategoryTableSkeleton";
import { MobileCategoryCardSkeleton } from "./components/MobileCategoryCardSkeleton";
import {
  TagModal,
  ArchiveTagModal,
  RestoreTagModal,
} from "./components/TagModals";
import { UploadTagsModal } from "./components/Modals/UploadTagsModal";
import { ExportModal } from "@/components/ui/ExportModal";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DesktopBreadcrumb } from "@/components/ui/DesktopBreadcrumb";
import { useQueryClient } from "@tanstack/react-query";

const stateOptions = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function ApplicationTags() {
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { permissions = [] } = useUserPermissions();
  const canCreateTag = hasPermission(
    permissions,
    PERMISSIONS.APPLICATION_TAG.CREATE
  );
  const canImportTags = hasPermission(
    permissions,
    PERMISSIONS.APPLICATION_TAG.IMPORT
  );
  const canExportTags = hasPermission(
    permissions,
    PERMISSIONS.APPLICATION_TAG.EXPORT
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

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagModalMode, setTagModalMode] = useState("create");
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
  const [selectedTag, setSelectedTag] = useState(null);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnSizing, setColumnSizing] = useState({});

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder =
    sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  const {
    data: tagsData,
    isLoading,
    error,
    refetch,
  } = useTags({
    subCategoryId,
    searchTerm: debouncedSearchTerm,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  // Extract data and pagination from query result
  const data = tagsData?.data ?? [];
  const pagination = tagsData?.pagination;
  const tags = data || [];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const handleAddTag = () => {
    setSelectedTag(null);
    setTagModalMode("create");
    setIsTagModalOpen(true);
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalMode("update");
    setIsTagModalOpen(true);
  };

  const handleArchiveTag = (tag) => {
    setSelectedTag(tag);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreTag = (tag) => {
    setSelectedTag(tag);
    setIsRestoreModalOpen(true);
  };

  const handleTagConfirm = async (formData) => {
    try {
      if (tagModalMode === "create") {
        const response = await categoryService.createTag({
          ...formData,
          subCategory: subCategoryId,
        });
        toast.success(getResponseMessage(response, "Tag created successfully"));
      } else {
        const response = await categoryService.updateTag(
          selectedTag._id,
          formData
        );
        toast.success(getResponseMessage(response, "Tag updated successfully"));
      }
      await queryClient.invalidateQueries();
      setIsTagModalOpen(false);
      setSelectedTag(null);
      refetch();
    } catch (err) {
      console.error("Failed to save tag:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to save tag")
      );
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleArchiveConfirm = async (tag) => {
    try {
      const response = await categoryService.archiveTag(tag._id);
      await queryClient.invalidateQueries();
      setIsArchiveModalOpen(false);
      setSelectedTag(null);
      refetch();
      toast.success(getResponseMessage(response, "Tag archived successfully"));
    } catch (err) {
      console.error("Failed to archive tag:", err);
      toast.error(
        getApiErrorMessage(err, "Failed to archive tag")
      );
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleRestoreConfirm = async (tag) => {
    try {
      await categoryService.restoreTag(tag._id);
      await queryClient.invalidateQueries();
      setIsRestoreModalOpen(false);
      setSelectedTag(null);
      refetch();
      toast.success("Tag restored successfully");
    } catch (err) {
      console.error("Failed to restore tag:", err);
      toast.error("Failed to restore tag");
      throw err; // Re-throw so modal can display the error
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsImporting(true);
      setUploadError(null);
      const result = await categoryService.uploadTags(file, { subCategoryId });
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
      const response = await categoryService.exportTags(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const d = new Date();
      const fallback = `tags-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`;
      
      link.setAttribute("download", getFilenameFromResponse(response, fallback));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to export tags:", err);
      toast.error(getApiErrorMessage(err, "Failed to export tags"));
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
        placeholder: "All",
      },
    ],
    [selectedState, handleStateChange]
  );

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Mobile Header */}
      <div className="flex items-center justify-between py-4 md:x-4 md:hidden">
        {/* Header + Breadcrumb  */}
        <div className="flex items-center justify-between ms-0 lg:ms-5">
          <div className="flex items-center gap-3 py-4 md:p-0 md:m-0">
            <BackButton onClick={handleBack} className="" />
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="bg-primary flex h-8 w-fit rounded-full!">
          {canImportTags && (
            <Button
              size="icon"
              onClick={handleImportClick}
              disabled={isImporting}
              className={`w-10 ${canExportTags || canCreateTag ? "rounded-s-full" : "rounded-full"}`}
            >
              <Upload className="w-5 h-5 text-white" />
            </Button>
          )}
          {canImportTags && (canExportTags || canCreateTag) && <p className="z-10 block w-px my-auto bg-white/20 h-10/12" />}
          {canExportTags && (
            <Button
              size="icon"
              onClick={handleExportClick}
              disabled={isExporting}
              className={`w-10 ${!canImportTags ? "rounded-s-full" : ""} ${!canCreateTag ? "rounded-e-full" : ""}`}
            >
              <Download className="w-5 h-5 text-white" />
            </Button>
          )}
          {canExportTags && canCreateTag && <p className="z-10 block w-px my-auto bg-white/20 h-10/12" />}
          {canCreateTag && (
            <Button
              size="icon"
              onClick={handleAddTag}
              className={`w-10 ${canImportTags || canExportTags ? "rounded-e-full" : "rounded-full"}`}
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
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

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
            {canImportTags && (
              <Button
                size="icon"
                onClick={handleImportClick}
                disabled={isImporting}
                title="Import Tags"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${canExportTags || canCreateTag ? "rounded-s-full" : "rounded-full"}`}
              >
                <Upload className="desktop-page-btn text-background" />
              </Button>
            )}

            {canImportTags && (canExportTags || canCreateTag) && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}

            {canExportTags && (
              <Button
                size="icon"
                onClick={handleExportClick}
                disabled={isExporting}
                title="Export Tags"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${!canImportTags ? "rounded-s-full" : ""} ${!canCreateTag ? "rounded-e-full" : ""}`}
              >
                <Download className="desktop-page-btn text-background" />
              </Button>
            )}

            {canExportTags && canCreateTag && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}

            {canCreateTag && (
              <Button
                size="icon"
                onClick={handleAddTag}
                title="Add Tag"
                className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${canImportTags || canExportTags ? "rounded-e-full" : "rounded-full"}`}
              >
                <PlusCircleIcon className="w-5 desktop-page-btn text-background" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Search tags..."
        hideOnDesktop={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
      />

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="md:hidden">
              <MobileCategoryCardSkeleton cards={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:block bg-background border-border/50">
              <CategoryTableSkeleton
                rows={5}
                col1Header="Tag Name"
                col2Header=""
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-red-500">Error: {error?.response?.data?.error || error?.message || "Failed to load tags"}</div>
          </div>
        ) : (
          <>
            <div className="mt-6 md:px-4 md:hidden">
              {tags.length > 0 ? (
                tags.map((tag, index) => (
                  <MobileTagCard
                    key={tag._id}
                    tag={tag}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditTag}
                    onArchive={handleArchiveTag}
                    onRestore={handleRestoreTag}
                  />
                ))
              ) : (
                <NoData
                  message="No Records Found"
                  description={searchTerm
                    ? `No tags match "${searchTerm}". Try adjusting your search.`
                    : "No tags available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopTagTable
                tags={tags}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onEdit={handleEditTag}
                onArchive={handleArchiveTag}
                onRestore={handleRestoreTag}
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
                  ? `No tags match "${searchTerm}". Try adjusting your search.`
                  : "No tags available yet."}
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

      <TagModal
        open={isTagModalOpen}
        onOpenChange={setIsTagModalOpen}
        tag={selectedTag}
        mode={tagModalMode}
        onConfirm={handleTagConfirm}
      />

      <ArchiveTagModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        tag={selectedTag}
        onConfirm={handleArchiveConfirm}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Export Tags"
        description="Select how many tags to export based on the current filters."
        selectedLimit={exportLimit}
        onLimitChange={setExportLimit}
        selectedPage={exportPage}
        onPageChange={setExportPage}
        totalItems={pagination?.total || 0}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />

      <UploadTagsModal
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
        onUpload={handleUpload}
        isLoading={isImporting}
        uploadResult={uploadResult}
        uploadError={uploadError}
      />

      <RestoreTagModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        tag={selectedTag}
        onConfirm={handleRestoreConfirm}
      />
    </section>
  );
}
