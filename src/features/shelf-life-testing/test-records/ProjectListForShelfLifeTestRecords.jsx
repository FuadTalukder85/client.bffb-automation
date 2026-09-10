import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useProjectsForShelfLifeTestRecords } from "@/hooks/useSamples";
import { useDebounce } from "@/hooks/useDebounce";
import DesktopProjectListView from "./components/project-list/DesktopProjectListView";
import MobileProjectListView from "./components/project-list/MobileProjectListView";
import { hasPermission } from "@/lib/utils";

const statusOptions = createFilterOptions(
  buildStatusOptions([
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
  ]),
  "All Status"
);

export default function ProjectListForShelfLifeTestRecords() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [runToggle, setRunToggle] = useState("running");

  const runOptions = [
    { label: "Running", value: "running" },
    { label: "Previous", value: "previous" },
    { label: "All", value: "all" },
  ];

  const { permissions = [] } = useUserPermissions();
  const canViewAllShelfLifeProjects = hasPermission(permissions, "shelf-life-testing:view-all-test-record-projects");

  const filteredRunOptions = canViewAllShelfLifeProjects
    ? runOptions
    : runOptions.filter((o) => o.value !== "all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedDateFrom = useDebounce(dateFrom, 300);
  const debouncedDateTo = useDebounce(dateTo, 300);

  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  const {
    data: projectsResponse,
    isLoading,
  } = useProjectsForShelfLifeTestRecords({
    searchTerm: debouncedSearchTerm,
    status: selectedStatus,
    statusFilter: runToggle,
    isActive: runToggle === "running" ? "true" : runToggle === "previous" ? "false" : "all",
    isFeasible: "all",
    dateFrom: debouncedDateFrom,
    dateTo: debouncedDateTo,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const projects = projectsResponse?.data ?? [];
  const pagination = projectsResponse?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleRunToggleChange = (value) => {
    setRunToggle(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (record) => {
    navigate(`/shelf-life-testing/test-records/${record._id}`, { state: { record } });
  };

  const filters = [
    {
      id: "status-filter",
      label: "Status",
      value: selectedStatus,
      options: statusOptions,
      onChange: handleStatusChange,
      placeholder: "All Status",
    },
    {
      id: "run-toggle",
      label: "Run Type",
      value: runToggle,
      options: filteredRunOptions,
      onChange: handleRunToggleChange,
      placeholder: "Running",
    },
  ];

  const filteredData = projects;
  const totalPages = pagination.totalPages || 0;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Shelf-Life Test Records"
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
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle className="shrink-0" />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search..."
        hideOnDesktop={true}
        filters={filters}
        dateRange={{
          dateFrom,
          dateTo,
          onDateFromChange: handleDateFromChange,
          onDateToChange: handleDateToChange,
        }}
      />

      <div className="flex-none hidden my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 md:block ms-5">
        <div className="flex items-center justify-between">
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

          <div className="flex-none ms-5">
            <DesktopFilterPills
              value={runToggle}
              options={filteredRunOptions}
              onChange={handleRunToggleChange}
              variant="pills"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 w-full min-h-0">
        {!isMobile && (
          <DesktopProjectListView
            isLoading={isLoading}
            data={filteredData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            sorting={sorting}
            setSorting={setSorting}
            onView={handleViewDetails}
            noDataMessage={noDataMessage}
            noDataDescription={noDataDescription}
          />
        )}

        {isMobile && (
          <MobileProjectListView
            data={filteredData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            onView={handleViewDetails}
            noDataMessage={noDataMessage}
            noDataDescription={noDataDescription}
          />
        )}
      </div>
    </section>
  );
}
