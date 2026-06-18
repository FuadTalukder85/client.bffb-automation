import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { Plus as PlusIcon, PlusCircle as PlusCircleIcon, Download, Upload } from "lucide-react";
import DesktopRawMaterialsTable from "./components/DesktopRawMaterialsTable";
import MobileRawMaterialCard from "./components/MobileRawMaterialCard";
import { MobileRawMaterialCardSkeleton } from "./components/MobileRawMaterialCardSkeleton";
import { ProjectTableSkeleton as RawMaterialsTableSkeleton } from "@/features/project-overview/master-project/components/ProjectTableSkeleton";
import { ArchiveRawMaterialModal } from "./components/Modals/ArchiveRawMaterialModal";
import { RestoreRawMaterialModal } from "./components/Modals/RestoreRawMaterialModal";
import { AddRawMaterialModal } from "./components/Modals/AddRawMaterialModal";
import { EditRawMaterialModal } from "./components/Modals/EditRawMaterialModal";
import { UploadRawMaterialsModal } from "./components/Modals/UploadRawMaterialsModal";
import { ExportModal } from "@/components/ui/ExportModal";
import { cn, getFilenameFromResponse } from "@/lib/utils";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NoData } from "@/components/ui/NoData";
import { hasPermission } from "@/lib/utils";
import {
  useCreateRawMaterial,
  useUpdateRawMaterial,
  useArchiveRawMaterial,
  useRestoreRawMaterial,
} from "@/hooks/mutations/useRawMaterialMutations";
import { rawMaterialService } from "@/services/rawMaterialService";

export default function RawMaterialsPricePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedState]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPage, setExportPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(20);

  // Hooks
  const isMobile = useIsMobile();
  const { permissions } = useUserPermissions();
  const { data: rawMaterialsData, isLoading, error, refetch } = useRawMaterials({
    searchTerm,
    status: selectedState,
    page: currentPage,
    limit: itemsPerPage,
  });
  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();
  const archiveMutation = useArchiveRawMaterial();
  const restoreMutation = useRestoreRawMaterial();

  // Permissions
  const canCreate = hasPermission(permissions, 'raw-material:create');
  const canImport = hasPermission(permissions, 'raw-material:import');
  const canExport = hasPermission(permissions, 'raw-material:export');

  // Handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const handleAddListItemShow = () => setIsAddModalOpen(true);
  const handleAddListItem = async (values) => {
    // Transform values to match server format
    const transformedData = {
      name: values.name,
      type: values.type.toLowerCase(), // 'solid' or 'liquid'
      cost: parseFloat(values.cost), // Convert to number
      isActive: true,
    };

    await createMutation.mutateAsync(transformedData);
    setIsAddModalOpen(false);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = async (values) => {
    // Transform values to match server format
    const transformedData = {
      name: values.name,
      type: values.type.toLowerCase(), // 'solid' or 'liquid'
      cost: parseFloat(values.cost), // Convert to number
    };

    await updateMutation.mutateAsync({ id: selectedItem.id, data: transformedData });
    setIsEditModalOpen(false);
    setSelectedItem(null);
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
        search: searchTerm,
        isActive: selectedState === "active" ? "true" : selectedState === "archived" ? "false" : "all",
        ...(exportLimit !== "all" ? { page: exportPage, limit: exportLimit } : {}),
      };
      const response = await rawMaterialService.exportRawMaterials(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const d = new Date();
      const fallback = `raw-materials-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`;
      
      link.setAttribute("download", getFilenameFromResponse(response, fallback));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to export raw materials:", err);
    } finally {
      setIsExporting(false);
    }
  };
  const handleUploadShow = () => {
    setUploadError(null);
    setUploadResult(null);
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (file) => {
    try {
      setIsImporting(true);
      setUploadError(null);
      const result = await rawMaterialService.uploadRawMaterials(file);
      setUploadResult(result);
      refetch();
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message);
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

  const handleArchiveClick = (item) => {
    setSelectedItem(item);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async (item) => {
    if (Array.isArray(item)) {
      const results = await Promise.allSettled(
        item.map((r) => archiveMutation.mutateAsync(r._id || r.id))
      );
      const succeeded = results.filter((res) => res.status === "fulfilled").length;
      const failed = results.filter((res) => res.status === "rejected");
      if (succeeded > 0) toast.success(`${succeeded} raw material(s) archived successfully`);
      if (failed.length > 0) toast.error(`Failed to archive ${failed.length} raw material(s)`);
      setSelectedRowIds([]);
    } else {
      await archiveMutation.mutateAsync(item.id);
    }
    setIsArchiveModalOpen(false);
    setSelectedItem(null);
  };

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load raw materials";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const handleRestoreClick = (item) => {
    setSelectedItem(item);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = async (item) => {
    await restoreMutation.mutateAsync(item.id);
    setIsRestoreModalOpen(false);
    setSelectedItem(null);
  };

  // State options for All/Active/Archive
  const stateOptions = [
    { label: "Active", value: "active" },
    { label: "Archive", value: "archived" },
    { label: "All", value: "all" },
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
    [selectedState]
  );

  // Action buttons for mobile header
  const actionButtons = [];
  if (canImport) {
    actionButtons.push({
      icon: <Upload className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: handleUploadShow,
      label: "Import",
    });
  }
  if (canCreate) {
    actionButtons.push({
      icon: <PlusCircleIcon className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: handleAddListItemShow,
      label: "Add Raw Material",
    });
  }

  const desktopActions = [];
  if (canImport) {
    desktopActions.push({
      icon: Upload,
      onClick: handleUploadShow,
      title: "Upload",
      key: "import",
    });
  }
  if (canExport) {
    desktopActions.push({
      icon: Download,
      onClick: handleExportClick,
      disabled: isExporting,
      loading: isExporting,
      title: "Export",
      key: "export",
    });
  }
  if (canCreate) {
    desktopActions.push({
      icon: PlusCircleIcon,
      onClick: handleAddListItemShow,
      title: "Add List Item",
      key: "create",
    });
  }

  // Use data from hook
  const rawMaterials = rawMaterialsData?.data || [];
  const pagination = rawMaterialsData?.pagination || { totalPages: 1 };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Raw Materials Price List"
          className="py-4 text-heading md:p-0 md:m-0"
        />

        <div className="flex items-center gap-2 md:hidden">
            <ActionButtonsGroup actions={actionButtons} />
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search raw materials..."
        filters={filters}
        hideOnDesktop={true}
      />

      {/* Tabs / Filter Pills Section */}
      <div className="flex-none hidden my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 md:block ms-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-start gap-4">
            <DesktopFilterPills
              value={selectedState}
              options={stateOptions}
              onChange={handleStateChange}
            />
          </div>

          {/* Action Buttons Group */}
          {(selectedState === "active" || selectedState === "all") && desktopActions.length > 0 && (
            <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
              {desktopActions.map((action, index) => {
                const isFirst = index === 0;
                const isLast = index === desktopActions.length - 1;
                const Icon = action.icon;

                return (
                  <React.Fragment key={action.key}>
                    <Button
                      size="icon"
                      onClick={action.onClick}
                      title={action.title}
                      className={`transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 ${isFirst ? "rounded-s-full" : "rounded-none"} ${isLast ? "rounded-e-full" : ""}`}
                    >
                      <Icon className={`${action.key === "create" ? "w-5 " : ""}desktop-page-btn text-background`} />
                    </Button>

                    {!isLast && <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileRawMaterialCardSkeleton cards={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:flex-1 md:flex md:flex-col md:min-h-0 bg-background border-border/50">
              <RawMaterialsTableSkeleton rows={10} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {hasError && rawMaterials.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : rawMaterials.length > 0 ? (
                rawMaterials.map((item, index) => (
                  <MobileRawMaterialCard
                    key={item._id || item.id}
                    item={item}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditClick}
                    onArchive={handleArchiveClick}
                    onRestore={handleRestoreClick}
                    isArchived={selectedState === "archived"}
                  />
                ))
              ) : (
                <NoData
                  message="No Records Found"
                  description={searchTerm
                    ? `No raw materials match "${searchTerm}". Try adjusting your search.`
                    : "No raw materials available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopRawMaterialsTable
                data={rawMaterials}
                selectedRowIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                onBulkArchiveClick={() => {
                  const selectedObjects = rawMaterials.filter(r => selectedRowIds.includes(r._id || r.id));
                  setSelectedItem(selectedObjects);
                  setIsArchiveModalOpen(true);
                }}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                sorting={sorting}
                onSortingChange={setSorting}
                onEdit={handleEditClick}
                onArchive={handleArchiveClick}
                onRestore={handleRestoreClick}
                onView={(item) => console.log("View", item)}
                isArchived={selectedState === "archived"}
                isLoading={isLoading}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">{errorMessage}</div>
                  ) : null
                }
                noDataMessage="No Records Found"
                noDataDescription={searchTerm
                  ? `No raw materials match "${searchTerm}". Try adjusting your search.`
                  : "No raw materials available yet."}
              />
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
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

      <AddRawMaterialModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddListItem}
        isLoading={createMutation.isPending}
      />

      <EditRawMaterialModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        item={selectedItem}
        onEdit={handleEditConfirm}
        isLoading={updateMutation.isPending}
      />

      <ArchiveRawMaterialModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        item={selectedItem}
        onConfirm={handleArchiveConfirm}
        isLoading={archiveMutation.isPending}
      />

      <RestoreRawMaterialModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        onConfirm={handleRestoreConfirm}
        isLoading={restoreMutation.isPending}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={handleExportModalClose}
        title="Export Raw Materials"
        description="Select how many raw materials to export based on the current filters."
        selectedLimit={exportLimit}
        onLimitChange={setExportLimit}
        selectedPage={exportPage}
        onPageChange={setExportPage}
        totalItems={rawMaterialsData?.pagination?.total || 0}
        onConfirm={handleExportConfirm}
        isLoading={isExporting}
      />

      <UploadRawMaterialsModal
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
        onUpload={handleUpload}
        isLoading={isImporting}
        uploadResult={uploadResult}
        uploadError={uploadError}
      />
    </section>
  );
}
