import React from "react";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import SensoryFormsTable from "./SensoryFormsTable";
import { SensoryFormsSkeleton } from "./SensoryFormsSkeleton";
import { AlertCircle } from "lucide-react";

export default function DesktopSensoryFormProjectListPage({
  searchTerm,
  handleSearchChange,
  statusOptions,
  selectedStatus,
  handleStatusChange,
  periodOptions,
  selectedPeriod,
  handlePeriodChange,
  isLoading,
  error,
  errorMessage,
  hasError,
  normalizedProjects,
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
  handleViewProjectDetails,
  noDataMessage,
  noDataDescription,
}) {
  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header & Search */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Sensory Forms"
          className="py-4 pb-6 text-heading md:p-0 md:m-0"
        />

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Status Filter Tabs - Desktop */}
      <div className="hidden md:flex justify-between items-center my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 ms-5">
        <div className="flex items-center gap-2 border-b border-border">
          {statusOptions.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${
                  isSelected
                    ? ""
                    : "border-transparent text-lighter-text hover:text-foreground"
                }`}
                style={{
                  color: isSelected ? tab.textColor : undefined,
                  borderBottomColor: isSelected ? tab.textColor : "transparent",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* Period Filter Pills - Desktop */}
        <div className="flex-none block ms-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start gap-4">
              <DesktopFilterPills
                value={selectedPeriod}
                options={periodOptions}
                onChange={handlePeriodChange}
                variant="pills"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 w-full min-h-0">

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
            <SensoryFormsTable
              data={normalizedProjects}
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
              onViewDetails={handleViewProjectDetails}
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
        )}
      </div>
    </section>
  );
}
