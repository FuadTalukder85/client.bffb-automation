import React from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";
import { useMasterProjectScheduleLogic } from "./hooks/useMasterProjectScheduleLogic";
import MasterProjectScheduleTable from "./components/MasterProjectScheduleTable";
import MobileMasterProjectScheduleCard from "./components/MobileMasterProjectScheduleCard";
import MobileMasterProjectScheduleCardSkeleton from "./components/MobileMasterProjectScheduleCardSkeleton";
import { ProjectTableSkeleton } from "../master-project/components/ProjectTableSkeleton";
import { NoData } from "@/components/ui/NoData";
import { applicationLabStatusFilterOptions as statusOptions } from "./constants/projectOptions";

export default function MasterProjectSchedule() {
  const {
    searchTerm,
    selectedStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    columnSizing,
    setColumnSizing,
    projects,
    pagination,
    isLoading,
    error,
    handleSearchChange,
    handleStatusChange,
    handleViewProjectDetails,
    filters,
  } = useMasterProjectScheduleLogic();

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load projects";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);
  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Master Project Schedule"
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

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search projects..."
        filters={filters}
        hideOnDesktop={true}
        defaultFilterValue="true"
      />

      <div className="flex-none hidden md:block my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 ms-5">
        <div className="flex items-center gap-2 border-b border-border">
          {statusOptions.map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${isSelected
                  ? ""
                  : "border-transparent text-lighter-text hover:text-foreground"
                  }`}
                style={{
                  color: isSelected ? tab.textColor : undefined,
                  borderBottomColor: isSelected ? tab.textColor : "transparent"
                }}
              >
                {tab.label}
              </button>
            );
          })}

        </div>
      </div>

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileMasterProjectScheduleCardSkeleton cards={5} />
            </div>
            <div className="hidden px-2 border shadow-sm md:flex-1 md:flex md:flex-col md:min-h-0 bg-background border-border/50">
              <ProjectTableSkeleton
                rows={10}
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {hasError && projects.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : projects.length > 0 ? (
                projects.map((project, index) => (
                  <MobileMasterProjectScheduleCard
                    key={project._id}
                    project={project}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onViewDetails={handleViewProjectDetails}
                  />
                ))
              ) : (
                <NoData
                  message="No Projects Found"
                  description={searchTerm
                    ? `No projects match "${searchTerm}". Try adjusting your search.`
                    : "No projects available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <MasterProjectScheduleTable
                projects={projects}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onViewDetails={handleViewProjectDetails}
                sorting={sorting}
                onSortingChange={setSorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnPinning={columnPinning}
                onColumnPinningChange={setColumnPinning}
                columnSizing={columnSizing}
                onColumnSizingChange={setColumnSizing}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">{errorMessage}</div>
                  ) : null
                }
                noDataMessage="No Projects Found"
                noDataDescription={searchTerm
                  ? `No projects match "${searchTerm}". Try adjusting your search.`
                  : "No projects available yet."}
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
    </section>
  );
}
