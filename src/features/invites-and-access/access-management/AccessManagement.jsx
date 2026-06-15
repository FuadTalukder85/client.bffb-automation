import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import MobileAccessRoleList from "./components/MobileAccessRoleList";
import { DesktopAccessManagementTable } from "./components/DesktopAccessManagementTable";
import { RestoreRoleModal } from "./components/RestoreRoleModal";
import { RemoveRoleModal } from "./components/RemoveRoleModal";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { FaPlus } from "react-icons/fa6";
import { useArchiveRole, useRestoreRole } from "@/hooks/mutations";
import { useRoles } from "@/hooks/useRoles";
import { toast } from "sonner";

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

const AccessManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Mutation hooks
  const { mutateAsync: archiveRole } = useArchiveRole();
  const { mutateAsync: restoreRole } = useRestoreRole();

  // Determine isActive filter for API
  const isActiveFilter = useMemo(() => {
    if (selectedFilter === "active") return true;
    if (selectedFilter === "archived") return false;
    if (selectedFilter === "all") return undefined;
    return undefined;
  }, [selectedFilter]);

  const {
    data: rolesData,
    isLoading: isSearching,
    error: searchError,
    refetch,
  } = useRoles({
    page: currentPage,
    limit: itemsPerPage,
    isActive: isActiveFilter,
    search: debouncedSearchTerm,
  });

  // Extract searchResults array and pagination from the query result
  const searchResults = rolesData?.data ?? [];
  const pagination = rolesData?.pagination;

  const errorMessage = searchError ? getErrorMessage(searchError, "Failed to load roles") : "";
  const hasError = Boolean(errorMessage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    if (pagination.totalPages) return pagination.totalPages;
    if (pagination.total && pagination.limit) {
      return Math.ceil(pagination.total / pagination.limit);
    }
    return 1;
  }, [pagination]);

  const enrichedSearchResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.map((role) => ({
      ...role,
      canEdit: true,
      canDelete: role.isActive,
      canRestore: !role.isActive,
    }));
  }, [searchResults]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  const filterOptions = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
    { label: "All", value: "all" },
  ];

  // Restore Role Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedRoleForRestore, setSelectedRoleForRestore] = useState(null);

  // Remove Role Modal State
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedRoleForRemove, setSelectedRoleForRemove] = useState(null);

  const handleEditRole = (role) => {
    navigate(`/access-management/update-role/${role.id}`, { state: { role } });
  };

  const handleDeleteRole = (role) => {
    setSelectedRoleForRemove(role);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedRoleForRemove?.id) return;
    try {
      await archiveRole(selectedRoleForRemove.id);
      setIsRemoveModalOpen(false);
      // Cache is automatically invalidated by the mutation
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error(
        getErrorMessage(error, "Failed to delete role. Please try again.")
      );
    }
  };

  const handleRestoreRole = (role) => {
    setSelectedRoleForRestore(role);
    setIsRestoreModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedRoleForRestore?.id) return;
    try {
      await restoreRole(selectedRoleForRestore.id);
      setIsRestoreModalOpen(false);
      // Cache is automatically invalidated by the mutation
    } catch (error) {
      console.error("Failed to restore role:", error);
      toast.error(
        getErrorMessage(error, "Failed to restore role. Please try again.")
      );
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const listProps = {
    searchResults: enrichedSearchResults,
    isSearching,
    searchError,
    errorMessage,
    hasError,
    onRetry: refetch,
    selectedFilter,
    searchTerm: debouncedSearchTerm,
    onEdit: handleEditRole,
    onDelete: handleDeleteRole,
    onRestore: handleRestoreRole,
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
          title="Manage Roles"
          className={"text-heading py-4 md:p-0 md:m-0"}
        />

        <FloatingButton
          className={"md:hidden static m-0"}
          icon={FaPlus}
          to="/access-management/create-role"
        >
          Create Role
        </FloatingButton>

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="name or description..."
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
        searchPlaceholder="name or description..."
        filterValue={selectedFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        hideOnDesktop={true}
        defaultFilterValue="active"
      />

      {/* Desktop Filter Input */}
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
            className={"hidden md:flex md:static px-4 lg:py-1.5 xl:py-2 2xl:py-2.5"}
            icon={FaPlus}
            to="/access-management/create-role"
          >
            Create Role
          </FloatingButton>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileAccessRoleList {...listProps} />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopAccessManagementTable {...listProps} />
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

      <RestoreRoleModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        onConfirm={handleConfirmRestore}
      />

      <RemoveRoleModal
        open={isRemoveModalOpen}
        onOpenChange={setIsRemoveModalOpen}
        onConfirm={handleConfirmRemove}
      />
    </section>
  );
};

export default AccessManagement;
