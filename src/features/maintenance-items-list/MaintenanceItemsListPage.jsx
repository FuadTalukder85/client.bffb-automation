import React from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Plus as PlusIcon, Download } from "lucide-react";
import DesktopMaintenanceItemsTable from "./components/DesktopMaintenanceItemsTable";
import MobileMaintenanceItemCard from "./components/MobileMaintenanceItemCard";
import MaintenanceItemsTableSkeleton from "./components/MaintenanceItemsTableSkeleton";
import MobileMaintenanceItemCardSkeleton from "./components/MobileMaintenanceItemCardSkeleton";
import { useMaintenanceItemsLogic } from "./hooks/useMaintenanceItemsLogic";
import { useIsMobile } from "@/hooks/useIsMobile";
import { maintenanceItemStateOptions as statusOptions } from "./constants/maintenanceItemsOptions";
import { MaintenanceItemModal } from "./components/Modals/MaintenanceItemModal";
import { ArchiveMaintenanceItemModal } from "./components/Modals/ArchiveMaintenanceItemModal";
import { RestoreMaintenanceItemModal } from "./components/Modals/RestoreMaintenanceItemModal";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { NoData } from "@/components/ui/NoData";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";

export default function MaintenanceItemsListPage() {
  const isMobile = useIsMobile();
  const {
    searchTerm,
    selectedState,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sorting,
    setSorting,
    maintenanceItems,
    pagination,
    isLoading,
    error,
    handleSearchChange,
    handleStateChange,
    handleAddItem,
    handleEditItem,
    handleArchiveItem,
    handleRestoreItem,
    handleItemConfirm,
    handleArchiveConfirm,
    handleRestoreConfirm,
    filters,
    isItemModalOpen,
    setIsItemModalOpen,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isRestoreModalOpen,
    setIsRestoreModalOpen,
    selectedItem,
    itemModalMode,
    handleExport,
  } = useMaintenanceItemsLogic();

  // getErrorMessage was removed in favor of getApiErrorMessage

  const handleExportWithPermission = async () => {
    try {
      await handleExport();
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "");
      if (errorMessage) {
        toast.error(errorMessage);
      }
    }
  };

  const errorMessage = error ? getApiErrorMessage(error, "Failed to load maintenance items") : "";
  const hasError = Boolean(errorMessage);

  const actionButtons = [
    {
      icon: <Download className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: handleExportWithPermission,
      label: "Export",
    },
    {
      icon: <PlusIcon className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: handleAddItem,
      label: "Add Item",
    },
  ];

  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Maintenance Items List"
          className="py-4 text-heading md:p-0 md:m-0"
        />

        <div className="flex items-center gap-2 md:hidden">
          <ActionButtonsGroup actions={actionButtons} />
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search items..."
        filters={filters}
        hideOnDesktop={true}
      />

      <div className="flex-none hidden my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 md:block ms-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-start gap-4">
            <DesktopFilterPills
              value={selectedState}
              options={statusOptions}
              onChange={handleStateChange}
            />
          </div>

          <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
            <Button
              size="icon"
              onClick={handleAddItem}
              title="Add Item"
              className="transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 rounded-s-full"
            >
              <PlusIcon className="desktop-page-btn text-background" />
            </Button>

            <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />

            <Button
              size="icon"
              onClick={handleExportWithPermission}
              className="transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 rounded-e-full"
            >
              <Download className="desktop-page-btn text-background" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0 lg:mx-2">
        <div className="flex-1 flex flex-col min-h-0">
          {isLoading ? (
            <>
              <div className="mt-6 md:hidden px-2">
                <MobileMaintenanceItemCardSkeleton cards={5} />
              </div>
              <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
                 <MaintenanceItemsTableSkeleton rows={itemsPerPage} />
              </div>
            </>
          ) : isMobile ? (
            <div className="flex-1 overflow-auto pb-20 custom-scrollbar">
              {hasError && maintenanceItems.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : maintenanceItems.length > 0 ? (
                maintenanceItems.map((item, index) => (
                  <MobileMaintenanceItemCard
                    key={item._id}
                    item={item}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditItem}
                    onArchive={handleArchiveItem}
                    onRestore={handleRestoreItem}
                  />
                ))
              ) : (
                <NoData
                  message={noDataMessage}
                  description={noDataDescription}
                />
              )}
            </div>
          ) : (
            <DesktopMaintenanceItemsTable
              items={maintenanceItems}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={pagination?.totalPages || 1}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onEdit={handleEditItem}
              onArchive={handleArchiveItem}
              onRestore={handleRestoreItem}
              sorting={sorting}
              onSortingChange={setSorting}
              emptyState={
                hasError ? (
                  <div className="py-10 text-center text-red-500">{errorMessage}</div>
                ) : null
              }
              noDataMessage={noDataMessage}
              noDataDescription={noDataDescription}
            />
          )}
        </div>
      </div>

      <MaintenanceItemModal
        open={isItemModalOpen}
        onOpenChange={setIsItemModalOpen}
        onConfirm={handleItemConfirm}
        mode={itemModalMode}
        item={selectedItem}
      />

      <ArchiveMaintenanceItemModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        item={selectedItem}
        onConfirm={handleArchiveConfirm}
      />

      <RestoreMaintenanceItemModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        onConfirm={handleRestoreConfirm}
      />
    </section>
  );
}
