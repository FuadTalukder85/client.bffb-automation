import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { useSamplePreparationLogic } from "./hooks/useSamplePreparationLogic";
import { statusOptions } from "./constants/projectOptions";
import DesktopSamplePreparationTable from "./components/DesktopSamplePreparationTable";
import MobileSamplePreparationCard from "./components/MobileSamplePreparationCard";
import { SamplePreparationTableSkeleton } from "./components/SamplePreparationTableSkeleton";
import { MobileSamplePreparationCardSkeleton } from "./components/MobileSamplePreparationCardSkeleton";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Pagination } from "@/components/ui/Pagination";
import { NoData } from "@/components/ui/NoData";
const SamplePreparationAndPackagingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    projects,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedPeriod,
    setSelectedPeriod,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filters,
    filteredPeriodOptions,
    dateFrom,
    dateTo,
    handleDateFromChange,
    handleDateToChange,
  } = useSamplePreparationLogic();

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load projects";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (statusKey) => {
    setSelectedStatus(statusKey);
    setCurrentPage(1);
  };

  const handlePeriodChange = (periodKey) => {
    setSelectedPeriod(periodKey);
    setCurrentPage(1);
  };

  const handleViewProjectDetails = (project) => {
    navigate(`/application-lab/sample-preparation-and-packaging/${project._id}`, { state: { project } });
  };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Desktop/Mobile Header */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Sample Preparation & Packaging"
          className="py-4 text-heading md:p-0 md:m-0"
        />

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <div className="shrink-0 w-96">
            <DateRangeFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={handleDateFromChange}
              onDateToChange={handleDateToChange}
            />
          </div>
          <SearchInput
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle className="shrink-0" />
        </div>
      </div>

      {/* Mobile Search & Filters */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search projects..."
        hideOnDesktop={true}
        filters={filters}
        dateRange={{
          dateFrom,
          dateTo,
          onDateFromChange: handleDateFromChange,
          onDateToChange: handleDateToChange,
        }}
      />

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
        <div className="flex-none hidden md:block ms-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start gap-4">
              <DesktopFilterPills
                value={selectedPeriod}
                options={filteredPeriodOptions}
                onChange={handlePeriodChange}
                variant="pills"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Loading State */}
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileSamplePreparationCardSkeleton />
            </div>
            <div className="hidden md:block ms-5">
              <SamplePreparationTableSkeleton />
            </div>
          </>
        ) : (
          <>
            {/* Desktop Table (Desktop only) */}
            {!isMobile && (
              <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
                <DesktopSamplePreparationTable
                  projects={projects}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                  onViewDetails={handleViewProjectDetails}
                  emptyState={
                    hasError ? (
                      <div className="py-10 text-center text-red-500">{errorMessage}</div>
                    ) : null
                  }
                  noDataMessage="No Projects Found"
                  noDataDescription={searchTerm
                    ? `No projects match "${searchTerm}". Try adjusting your search.`
                    : "No projects match your current filters. Try adjusting your search or filter criteria."}
                />
              </div>
            )}

            {/* Mobile View (Listing + Pagination) */}
            {isMobile && (
              <div className="md:hidden">
                {hasError && projects.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-center text-red-500">
                    {errorMessage}
                  </div>
                ) : projects.length > 0 ? (
                  projects.map((project, index) => (
                    <MobileSamplePreparationCard
                      key={project._id}
                      project={project}
                      serialNumber={(currentPage - 1) * itemsPerPage + (index + 1)}
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
            )}

            {/* Mobile Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SamplePreparationAndPackagingPage;
