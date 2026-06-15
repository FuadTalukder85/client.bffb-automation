import React, { useState, useMemo, useCallback } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { useDebounce } from "@/hooks/useDebounce";
import { useAccessHistory } from "@/hooks/useAccessHistory";
import MobileHistoryList from "./components/MobileHistoryList";
import { LogDetailsModal } from "./components/LogDetailsModal";
import { DesktopAccessHistoryTable } from "./components/DesktopAccessHistoryTable";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";

// Constants
const FILTER_OPTIONS = [
  { label: "User Invitations", value: "invites" },
  { label: "Role Assignments", value: "roles" },
  { label: "Roles & Permissions", value: "permissions" },
];

const DEFAULT_FILTER = "invites";
const DEFAULT_ITEMS_PER_PAGE = 20;

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(DEFAULT_FILTER);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: historyQueryData,
    isLoading,
    error,
    refetch,
  } = useAccessHistory({
    searchTerm: debouncedSearchTerm,
    categoryFilter: selectedFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  const getErrorMessage = (error, fallback) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      fallback;
    return typeof message === "object"
      ? message.message || JSON.stringify(message)
      : message;
  };

  // Extract historyData and pagination from query result
  const historyData = useMemo(
    () => historyQueryData?.data ?? [],
    [historyQueryData?.data]
  );
  const pagination = historyQueryData?.pagination;
  const errorMessage = error ? getErrorMessage(error, "Failed to load history") : "";
  const hasError = Boolean(errorMessage);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((value) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  }, []);

  // Handle page change with scroll to top
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle view history modal
  const handleViewHistory = useCallback((history) => {
    setSelectedLog(history);
    setIsLogModalOpen(true);
  }, []);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  }, []);

  // Calculate total pages memoized
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    if (pagination.totalPages) return pagination.totalPages;
    if (pagination.total && pagination.limit)
      return Math.ceil(pagination.total / pagination.limit);
    return 1;
  }, [pagination]);

  // Memoized list props to prevent unnecessary re-renders
  const listProps = useMemo(
    () => ({
      historyData,
      searchResults: historyData,
      isSearching: isLoading,
      searchError: error,
      errorMessage,
      hasError,
      onRetry: refetch,
      selectedFilter,
      searchTerm: debouncedSearchTerm,
      onView: handleViewHistory,
      currentPage,
      itemsPerPage,
      totalPages,
      onPageChange: handlePageChange,
      onItemsPerPageChange: handleItemsPerPageChange,
    }),
    [
      historyData,
      isLoading,
      error,
      errorMessage,
      hasError,
      refetch,
      selectedFilter,
      debouncedSearchTerm,
      handleViewHistory,
      handlePageChange,
      handleItemsPerPageChange,
      currentPage,
      itemsPerPage,
      totalPages,
    ]
  );

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Page Header & Search & Theme Toggle(Desktop Only) */}
      <div className="flex-none flex items-center justify-between ms-0 lg:ms-5">
        <PageHeader
          title="User & Access History"
          className={"text-heading py-4 pb-6 md:p-0 md:m-0"}
        />

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Filter Input */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="name or email..."
        filterValue={selectedFilter}
        onFilterChange={handleFilterChange}
        filterOptions={FILTER_OPTIONS}
        hideOnDesktop={true}
        defaultFilterValue={DEFAULT_FILTER}
      />

      {/* Desktop Filter Input */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedFilter}
            options={FILTER_OPTIONS}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileHistoryList {...listProps} />

        <LogDetailsModal
          open={isLogModalOpen}
          onOpenChange={setIsLogModalOpen}
          log={selectedLog}
        />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopAccessHistoryTable {...listProps} />
        </div>
      </div>

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </section>
  );
};

export default History;
