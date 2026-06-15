import React, { useState, useMemo } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { Plus as PlusIcon } from "lucide-react";
import PackagingTypesTable from "./components/PackagingTypesTable";
import PackagingTypesMobileCard from "./components/PackagingTypesMobileCard";
import { AddPackagingTypeModal } from "./components/Modals/AddPackagingTypeModal";
import { EditPackagingTypeModal } from "./components/Modals/EditPackagingTypeModal";
import { ArchivePackagingTypeModal } from "./components/Modals/ArchivePackagingTypeModal";
import { RestorePackagingTypeModal } from "./components/Modals/RestorePackagingTypeModal";
import { usePackagingTypes } from "@/hooks/usePackagingTypes";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NoData } from "@/components/ui/NoData";
import { cn, hasPermission } from "@/lib/utils";
import {
  useCreatePackagingType,
  useUpdatePackagingType,
  useArchivePackagingType,
  useRestorePackagingType,
} from "@/hooks/mutations/usePackagingTypeMutations";

export default function PackagingTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Hooks
  const isMobile = useIsMobile();
  const { permissions } = useUserPermissions();
  const {
    data: packagingTypesData,
    isLoading,
    error,
  } = usePackagingTypes({
    searchTerm,
    status: selectedState,
    page: currentPage,
    limit: itemsPerPage,
  });
  const createMutation = useCreatePackagingType();
  const updateMutation = useUpdatePackagingType();
  const archiveMutation = useArchivePackagingType();
  const restoreMutation = useRestorePackagingType();

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load packaging types";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  // Permissions
  const canCreate = hasPermission(permissions, 'packaging-type:create');
  const canUpdate = hasPermission(permissions, 'packaging-type:update');
  const canDelete = hasPermission(permissions, 'packaging-type:delete');

  // Handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const handleAddShow = () => setIsAddModalOpen(true);
  const handleAddConfirm = async (values) => {
    // Transform values to match server format
    const transformedData = {
      title: values.name, // Client uses 'name', server uses 'title'
      isActive: true,
    };

    await createMutation.mutateAsync(transformedData);
    setIsAddModalOpen(false);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = async (values) => {
    // Transform values to match server format
    const transformedData = {
      title: values.name, // Client uses 'name', server uses 'title'
    };

    await updateMutation.mutateAsync({ id: selectedItem.id, data: transformedData });
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleArchiveClick = (item) => {
    setSelectedItem(item);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async (item) => {
    await archiveMutation.mutateAsync(item.id);
    setIsArchiveModalOpen(false);
    setSelectedItem(null);
  };

  const handleRestoreClick = (item) => {
    setSelectedItem(item);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = async (item) => {
    await restoreMutation.mutateAsync(item.id);
    setIsRestoreModalOpen(false);
    setSelectedItem(null);
  };

  // State options for Active/Archive
  const stateOptions = [
    { label: "Active", value: "active" },
    { label: "Archive", value: "archived" },
    { label: "All", value: "all" },
  ];

  const filters = useMemo(
    () => [
      {
        id: "state",
        value: selectedState,
        onChange: handleStateChange,
        options: stateOptions,
        placeholder: "Active",
      },
    ],
    [selectedState]
  );

  // Action buttons configuration for ActionButtonsGroup
  const actionButtons = [
    {
      icon: <PlusIcon className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: handleAddShow,
      label: "Add Packaging Type",
      showLabel: true,
      disabled: !canCreate,
    },
  ];

  // Use data from hook
  const packagingTypes = packagingTypesData?.data || [];
  const pagination = packagingTypesData?.pagination || { totalPages: 1 };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Packaging Types"
          className="py-4 text-heading md:p-0 md:m-0"
        />

        <div className="flex items-center gap-2 md:hidden">
            <ActionButtonsGroup actions={canCreate && selectedState === "active" ? actionButtons : []} />
        </div>

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search packaging types..."
        filters={filters}
        hideOnDesktop={true}
      />

      {/* Tabs / Filter Pills Section */}
      <div className="flex-none hidden my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 md:block ms-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-start gap-4">
            <DesktopFilterPills
              value={selectedState}
              options={stateOptions}
              onChange={handleStateChange}
            />
          </div>

          {/* Action Buttons Group */}
          {selectedState === "active" && (
            <div>
                <ActionButtonsGroup actions={actionButtons} />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 w-full min-h-0 md:px-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-lighter-text text-sm italic">Loading...</div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="mt-6 md:hidden">
              {hasError && packagingTypes.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : packagingTypes.length > 0 ? (
                packagingTypes.map((item, index) => (
                  <PackagingTypesMobileCard
                    key={item.id}
                    data={item}
                    serial={(currentPage - 1) * itemsPerPage + index + 1}
                    onEdit={handleEditClick}
                    onArchive={handleArchiveClick}
                    onRestore={handleRestoreClick}
                    isArchived={selectedState === "archived"}
                  />
                ))
              ) : (
                <NoData
                  message="No Records Found"
                  description={searchTerm
                    ? `No packaging types match "${searchTerm}". Try adjusting your search.`
                    : "No packaging types available yet."}
                />
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <PackagingTypesTable
                data={packagingTypes}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                sorting={sorting}
                onSortingChange={setSorting}
                onEdit={handleEditClick}
                onArchive={handleArchiveClick}
                onRestore={handleRestoreClick}
                isArchived={selectedState === "archived"}
                isLoading={isLoading}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">{errorMessage}</div>
                  ) : null
                }
                noDataMessage="No Records Found"
                noDataDescription={searchTerm
                  ? `No packaging types match "${searchTerm}". Try adjusting your search.`
                  : "No packaging types available yet."}
              />
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
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

      {/* Modals */}
      <AddPackagingTypeModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddConfirm}
      />

      <EditPackagingTypeModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        item={selectedItem}
        onEdit={handleEditConfirm}
      />

      <ArchivePackagingTypeModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        item={selectedItem}
        onConfirm={handleArchiveConfirm}
      />

      <RestorePackagingTypeModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        onConfirm={handleRestoreConfirm}
      />
    </section>
  );
}
