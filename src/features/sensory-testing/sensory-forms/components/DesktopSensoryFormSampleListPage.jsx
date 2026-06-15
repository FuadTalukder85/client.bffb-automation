import React from "react";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import SensoryFormSampleListTable from "./SensoryFormSampleListTable";
import { SensoryFormsSkeleton } from "./SensoryFormsSkeleton";
import { AlertCircle } from "lucide-react";

export default function DesktopSensoryFormSampleListPage({
  project,
  searchTerm,
  handleSearchChange,
  isLoading,
  error,
  samples,
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
  handleItemsPerPageChange,
  sorting,
  setSorting,
  columnVisibility,
  setColumnVisibility,
  columnPinning,
  setColumnPinning,
  columnSizing,
  setColumnSizing,
  handleSampleClick,
  noDataMessage,
  noDataDescription,
}) {
  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 flex-none ms-0 lg:ms-5 bg-background">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton className="" />
          <div className="flex flex-col">
            <h1 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-foreground leading-tight">
              {project?.masterProject?.title || project?.title || "Samples"}
            </h1>
            <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
               <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
                 {project?.masterProject?.code || project?.code || "—"}
               </span>
            </div>
          </div>
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 w-full min-h-0">
        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 mx-5 mb-4 border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Error loading samples</p>
              <p className="mt-1 text-sm">{error?.message || JSON.stringify(error)}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <SensoryFormsSkeleton 
            rows={10}
            columnVisibility={columnVisibility}
            columnPinning={columnPinning}
            columnSizing={columnSizing}
          />
        ) : (
          <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
            <SensoryFormSampleListTable
              data={samples}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              sorting={sorting}
              onSortingChange={setSorting}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
              columnSizing={columnSizing}
              onColumnSizingChange={setColumnSizing}
              onViewDetails={handleSampleClick}
              noDataMessage={noDataMessage}
              noDataDescription={noDataDescription}
            />
          </div>
        )}
      </div>
    </section>
  );
}
