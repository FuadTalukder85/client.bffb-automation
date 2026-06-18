import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import React, { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearch } from "@/hooks/useSearch";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { Plus } from "lucide-react";
import { InviteUserModal } from "./components/InviteUserModal";
import { MobileInvitationList } from "./components/MobileInvitationList";
import { DesktopInvitationTable } from "./components/DesktopInvitationTable";
import { RevokeInviteModal } from "./components/RevokeInviteModal";
import { InviteRevokedModal } from "./components/InviteRevokedModal";
import { InviteResentModal } from "./components/InviteResentModal";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";
import { useDeleteInvitation, useResendInvitation } from "@/hooks/mutations";


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

function EmployeeInvitations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Revoke Modal State
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isRevokeSuccessModalOpen, setIsRevokeSuccessModalOpen] =
    useState(false);
  const [isResendSuccessModalOpen, setIsResendSuccessModalOpen] =
    useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  React.useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedFilter]);

  // Mutation hooks
  const { mutateAsync: deleteInvitation } = useDeleteInvitation();
  const { mutateAsync: resendInvitation } = useResendInvitation();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { searchResults, pagination, isSearching, searchError, refetch } =
    useSearch({
      searchTerm: debouncedSearchTerm,
      statusFilter: selectedFilter,
      page: currentPage,
      limit: itemsPerPage,
    });

  const errorMessage = searchError ? getErrorMessage(searchError, "Failed to load invitations") : "";
  const hasError = Boolean(errorMessage);

  const filterOptions = [
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "All", value: "all" },
    // { label: "Expired", value: "expired" },
    // { label: "Rejected", value: "rejected" },
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleRevokeClick = (invite) => {
    setSelectedInvite(invite);
    setIsRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedInvite) return;

    try {
      if (Array.isArray(selectedInvite)) {
        const results = await Promise.allSettled(
          selectedInvite.map((r) => deleteInvitation(r._id || r.id))
        );
        const succeeded = results.filter((res) => res.status === "fulfilled").length;
        const failed = results.filter((res) => res.status === "rejected");
        if (succeeded > 0) toast.success(`${succeeded} invite(s) revoked successfully`);
        if (failed.length > 0) toast.error(`Failed to revoke ${failed.length} invite(s)`);
        setSelectedRowIds([]);
        setIsRevokeModalOpen(false);
      } else {
        if (!selectedInvite._id) return;
        await deleteInvitation(selectedInvite._id);

        setIsRevokeModalOpen(false);
        // Small delay to make the transition smoother
        setTimeout(() => {
          setIsRevokeSuccessModalOpen(true);
        }, 200);
      }

      // Cache is automatically invalidated by the mutation
    } catch (error) {
      console.error("Failed to revoke invite:", error);
    }
  };

  const handleResendClick = async (invite) => {
    if (!invite?._id) return;

    try {
      await resendInvitation(invite._id);

      setSelectedInvite(invite);
      setIsResendSuccessModalOpen(true);

      // Cache is automatically invalidated by the mutation
    } catch (error) {
      console.error("Failed to resend invite:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of the list when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate total pages from pagination data
  // The API might return totalPages, total, or we calculate it from total and limit
  const totalPages = useMemo(() => {
    if (!pagination) return 1;

    // Check if totalPages is directly provided
    if (pagination.totalPages) {
      return pagination.totalPages;
    }

    // Calculate from total and limit
    if (pagination.total && pagination.limit) {
      return Math.ceil(pagination.total / pagination.limit);
    }

    // Fallback: if we have data and limit, estimate pages
    if (searchResults?.length > 0 && pagination.limit) {
      // If we got a full page of results, there might be more pages
      return searchResults.length === pagination.limit ? 2 : 1;
    }

    return 1;
  }, [pagination, searchResults]);

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const listProps = {
    searchResults,
    isSearching,
    searchError,
    errorMessage,
    hasError,
    onRetry: refetch,
    selectedFilter,
    searchTerm: debouncedSearchTerm,
    onRevoke: handleRevokeClick,
    onResend: handleResendClick,
    currentPage,
    itemsPerPage,
    totalPages,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handleItemsPerPageChange,
  };

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Page Header & Search & Theme Toggle(Desktop Only) */}
      <div className="flex-none flex items-center justify-between ms-0 lg:ms-5">
        <PageHeader
          title="Invites"
          className={"text-heading py-4 md:p-0 md:m-0"}
        />

        <FloatingButton
          className={"md:hidden static m-0"}
          icon={Plus}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Send Invite
        </FloatingButton>

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="email..."
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
        searchPlaceholder="email..."
        filterValue={selectedFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        hideOnDesktop={true}
        defaultFilterValue="pending"
      />

      {/* Desktop Filter Input */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        {/* Filter and Create Invite Button */}
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedFilter}
            options={filterOptions}
            onChange={handleFilterChange}
          />

          <FloatingButton
            className={"hidden md:flex  md:static"}
            icon={Plus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Send Invite
          </FloatingButton>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileInvitationList {...listProps} />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopInvitationTable
            {...listProps}
            selectedRowIds={selectedRowIds}
            onSelectionChange={setSelectedRowIds}
            onBulkArchiveClick={() => {
              const selectedObjects = searchResults.filter(r => selectedRowIds.includes(r._id || r.id));
              setSelectedInvite(selectedObjects);
              setIsRevokeModalOpen(true);
            }}
            isArchived={selectedFilter === "accepted"}
          />
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

      <InviteUserModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        className="sm:rounded-2xl"
      />

      {/* Revoke Modals */}
      <RevokeInviteModal
        open={isRevokeModalOpen}
        onOpenChange={setIsRevokeModalOpen}
        onConfirm={handleConfirmRevoke}
      />

      <InviteRevokedModal
        open={isRevokeSuccessModalOpen}
        onOpenChange={setIsRevokeSuccessModalOpen}
        email={selectedInvite?.email}
      />

      <InviteResentModal
        open={isResendSuccessModalOpen}
        onOpenChange={setIsResendSuccessModalOpen}
        email={selectedInvite?.email}
      />
    </section>
  );
}

export default EmployeeInvitations;
