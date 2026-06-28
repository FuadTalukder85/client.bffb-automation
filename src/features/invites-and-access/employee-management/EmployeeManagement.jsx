import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useEmployees } from "@/hooks/useEmployees";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import MobileManageUserList from "./components/MobileManageUserList";
import MobileBulkActionBar from "@/components/ui/MobileBulkActionBar";
import DesktopManageUserTable from "./components/DesktopManageUserTable";
import { UpdateRoleModal } from "./components/UpdateRoleModal";
import { ArchiveUserModal } from "./components/ArchiveUserModal";
import { RestoreUserModal } from "./components/RestoreUserModal";
import { CreateUserModal } from "./components/CreateUserModal";
import { UpdatePasswordModal } from "./components/UpdatePasswordModal";
import { UnblockUserModal } from "./components/UnblockUserModal";
import { Plus } from "lucide-react";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { hasPermission } from "@/lib/utils";

const EmployeeManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: employeesData,
    isLoading: isSearching,
    error: searchError,
    refetch,
  } = useEmployees({
    searchTerm: debouncedSearchTerm,
    statusFilter: selectedFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Extract searchResults array and pagination from the query result
  const searchResults = employeesData?.data ?? [];
  const pagination = employeesData?.pagination;
  const { permissions } = useUserPermissions();
  
  const getErrorMessage = (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load employees";
    return typeof message === "object"
      ? message.message || JSON.stringify(message)
      : message;
  };

  const errorMessage = searchError ? getErrorMessage(searchError) : "";
  const hasError = Boolean(errorMessage);

  const canUpdatePassword = hasPermission(permissions, PERMISSIONS.USER.UPDATE_PASSWORD);
  const canDeleteUser = hasPermission(permissions, PERMISSIONS.USER.DELETE);
  const canUnblockUser = hasPermission(permissions, PERMISSIONS.USER.UNBLOCK);

  const filterOptions = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
    { label: "Blocked", value: "blocked" },
    { label: "All", value: "all" },
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate total pages from pagination data
  const totalPages = useMemo(() => {
    if (!pagination) return 1;

    if (pagination.totalPages) {
      return pagination.totalPages;
    }

    if (pagination.total && pagination.limit) {
      return Math.ceil(pagination.total / pagination.limit);
    }

    // Fallback: if we have data and limit, estimate pages
    if (searchResults?.length > 0 && pagination.limit) {
      return searchResults.length === pagination.limit
        ? currentPage + 1
        : currentPage;
    }

    return 1;
  }, [pagination, searchResults, currentPage]);

  // Reset selection on filter, search or page changes
  useEffect(() => {
    setSelectedRowIds([]);
  }, [selectedFilter, debouncedSearchTerm, currentPage]);

  // Update Role Modal State
  const [isUpdateRoleModalOpen, setIsUpdateRoleModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setIsUpdateRoleModalOpen(true);
  };

  const handleUpdateRoleSuccess = () => {
    setSelectedUserForEdit(null);
    refetch();
  };

  // Archive User Modal State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedUserForArchive, setSelectedUserForArchive] = useState(null);

  const handleDeleteUser = (user) => {
    if (!canDeleteUser) return;
    setSelectedUserForArchive(user);
    setIsArchiveModalOpen(true);
  };

  const handleBulkArchive = (ids) => {
    if (!canDeleteUser) return;
    const usersToArchive = searchResults.filter((user) => ids.includes(user._id || user.id));
    if (usersToArchive.length > 0) {
      setSelectedUserForArchive(usersToArchive);
      setIsArchiveModalOpen(true);
    }
  };

  const handleArchiveSuccess = () => {
    setSelectedUserForArchive(null);
    setSelectedRowIds([]);
    refetch();
  };

  // Restore User Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedUserForRestore, setSelectedUserForRestore] = useState(null);

  const handleReactivateUser = (user) => {
    setSelectedUserForRestore(user);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreSuccess = () => {
    setSelectedUserForRestore(null);
    refetch();
  };

  // Update Password Modal State
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

  const handleUpdatePassword = (user) => {
    if (!canUpdatePassword) return;
    setSelectedUserForPassword(user);
    setIsUpdatePasswordModalOpen(true);
  };

  const handleUpdatePasswordSuccess = () => {
    setSelectedUserForPassword(null);
  };

  // Unblock User Modal State
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [selectedUserForUnblock, setSelectedUserForUnblock] = useState(null);

  const handleUnblockUser = (user) => {
    if (!canUnblockUser) return;
    setSelectedUserForUnblock(user);
    setIsUnblockModalOpen(true);
  };

  const handleUnblockSuccess = () => {
    setSelectedUserForUnblock(null);
    refetch();
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const listProps = {
    searchResults,
    isSearching,
    searchError,
    errorMessage,
    hasError,
    onRetry: refetch,
    selectedFilter,
    searchTerm: debouncedSearchTerm,
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
          title="Manage Users"
          className={"text-heading py-4 pb-6 md:p-0 md:m-0"}
        />

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="name, email, or username..."
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
        searchPlaceholder="name, email, or username..."
        filterValue={selectedFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        hideOnDesktop={true}
        defaultFilterValue="active"
      />
        <FloatingButton
            className={"md:hidden"}
            icon={Plus}
            onClick={() => setIsCreateUserModalOpen(true)}
          >
            Create User
        </FloatingButton>
      {/* Desktop Filter Input */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedFilter}
            options={filterOptions}
            onChange={handleFilterChange}
          />
          <FloatingButton
            className={"hidden md:flex  md:static"}
            icon={Plus}
            onClick={() => setIsCreateUserModalOpen(true)}
          >
            Create User
          </FloatingButton>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileManageUserList
          {...listProps}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onReactivate={handleReactivateUser}
          onUpdatePassword={handleUpdatePassword}
          onUnblock={handleUnblockUser}
          canUpdatePassword={canUpdatePassword}
          canDeleteUser={canDeleteUser}
          canUnblockUser={canUnblockUser}
          selectedRowIds={selectedRowIds}
          onSelectChange={setSelectedRowIds}
        />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopManageUserTable
            {...listProps}
            isArchived={selectedFilter === "archived"}
            selectedRowIds={selectedRowIds}
            onSelectionChange={setSelectedRowIds}
            onBulkArchiveClick={handleBulkArchive}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onReactivate={handleReactivateUser}
            onUpdatePassword={handleUpdatePassword}
            onUnblock={handleUnblockUser}
            canUpdatePassword={canUpdatePassword}
            canDeleteUser={canDeleteUser}
            canUnblockUser={canUnblockUser}
            onView={(user) => console.log("View user", user)}
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

      <UpdateRoleModal
        open={isUpdateRoleModalOpen}
        onOpenChange={setIsUpdateRoleModalOpen}
        user={selectedUserForEdit}
        onSuccess={handleUpdateRoleSuccess}
      />

      <ArchiveUserModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        user={selectedUserForArchive}
        onSuccess={handleArchiveSuccess}
      />

      <RestoreUserModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        user={selectedUserForRestore}
        onSuccess={handleRestoreSuccess}
      />

      <CreateUserModal
        open={isCreateUserModalOpen}
        onOpenChange={setIsCreateUserModalOpen}
        onSuccess={refetch}
        className="sm:rounded-2xl"
      />

      <UpdatePasswordModal
        open={isUpdatePasswordModalOpen}
        onOpenChange={setIsUpdatePasswordModalOpen}
        user={selectedUserForPassword}
        onSuccess={handleUpdatePasswordSuccess}
        className="sm:rounded-2xl"
      />

      <UnblockUserModal
        open={isUnblockModalOpen}
        onOpenChange={setIsUnblockModalOpen}
        user={selectedUserForUnblock}
        onSuccess={handleUnblockSuccess}
        className="sm:rounded-2xl"
      />

      <MobileBulkActionBar
        selectedIds={selectedRowIds}
        onClearSelection={() => setSelectedRowIds([])}
        actions={[
          {
            label: "Archive",
            onClick: () => handleBulkArchive(selectedRowIds),
            className: "bg-red-600 hover:bg-red-700 text-white",
          },
        ]}
      />
    </section>
  );
};

export default EmployeeManagement;
