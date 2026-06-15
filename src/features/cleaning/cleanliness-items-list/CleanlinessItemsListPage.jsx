import React from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Pagination } from "@/components/ui/Pagination";
import { Plus as PlusIcon, Download } from "lucide-react";
import DesktopCleanlinessItemsTable from "./components/DesktopCleanlinessItemsTable";
import MobileCleanlinessItemCard from "./components/MobileCleanlinessItemCard";
import CleanlinessItemsTableSkeleton from "./components/CleanlinessItemsTableSkeleton";
import MobileCleanlinessItemCardSkeleton from "./components/MobileCleanlinessItemCardSkeleton";
import { useCleanlinessItemsLogic } from "./hooks/useCleanlinessItemsLogic";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NoData } from "@/components/ui/NoData";
import { getApiErrorMessage } from "@/utils/apiError";
import { cleanlinessItemStateOptions as statusOptions } from "./constants/cleanlinessItemsOptions";
import { CleanlinessItemModal } from "./components/Modals/CleanlinessItemModal";
import { ArchiveCleanlinessItemModal } from "./components/Modals/ArchiveCleanlinessItemModal";
import { RestoreCleanlinessItemModal } from "./components/Modals/RestoreCleanlinessItemModal";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { toast } from "sonner";

export default function CleanlinessItemsListPage() {
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
    cleanlinessItems,
    pagination,
    isLoading,
    error,
    handleSearchChange,
    handleStateChange,
    handleAddItem,
    handleEditItem,
    handleArchiveItem,
    handleRestoreItem,
    filters,
    // Modal states and handlers
    isItemModalOpen,
    setIsItemModalOpen,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isRestoreModalOpen,
    setIsRestoreModalOpen,
    selectedItem,
    itemModalMode,
    confirmAddItem,
    confirmUpdateItem,
    confirmArchiveItem,
    confirmRestoreItem,
    handleExport,
  } = useCleanlinessItemsLogic();

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

  const errorMessage = error ? getApiErrorMessage(error, "Failed to load cleanliness items") : "";
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

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Cleanliness Items List"
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

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden px-2">
              <MobileCleanlinessItemCardSkeleton cards={5} />
            </div>
            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
               <CleanlinessItemsTableSkeleton rows={itemsPerPage} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {hasError && cleanlinessItems.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : cleanlinessItems.length > 0 ? (
                cleanlinessItems.map((item, index) => (
                  <MobileCleanlinessItemCard
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
                  message="No Records Found"
                  description={searchTerm
                    ? `No items match "${searchTerm}". Try adjusting your search.`
                    : "No cleanliness items available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopCleanlinessItemsTable
                items={cleanlinessItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
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
                noDataMessage="No Records Found"
                noDataDescription={searchTerm
                  ? `No items match "${searchTerm}". Try adjusting your search.`
                  : "No cleanliness items available yet."}
              />
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 0 && (
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

      <CleanlinessItemModal
        open={isItemModalOpen}
        onOpenChange={setIsItemModalOpen}
        item={selectedItem}
        mode={itemModalMode}
        onConfirm={itemModalMode === "create" ? confirmAddItem : confirmUpdateItem}
      />

      <ArchiveCleanlinessItemModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        item={selectedItem}
        onConfirm={confirmArchiveItem}
      />

      <RestoreCleanlinessItemModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        onConfirm={confirmRestoreItem}
      />
    </section>
  );
}
