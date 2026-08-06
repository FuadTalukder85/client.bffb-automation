import React, { useState, useMemo, useEffect } from "react";
import { useParams, Navigate } from "react-router";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import { Plus as PlusIcon } from "lucide-react";
import { NoData } from "@/components/ui/NoData";
import MobileBulkActionBar from "@/components/ui/MobileBulkActionBar";
import { cn, hasPermission } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import {
  BFF_PRODUCT_SEGMENT_LABELS as BFF_PRODUCT_TAXONOMY_LABELS,
  BFF_PRODUCT_SEGMENT_KINDS as BFF_PRODUCT_TAXONOMY_KINDS,
  isValidSegmentKind as isValidTaxonomyKind,
} from "@/constants/bffProductSegment";
import { useBFFProductSegment as useBFFProductTaxonomy } from "@/hooks/useBFFProductSegment";
import {
  useCreateBFFProductSegmentItem as useCreateBFFProductTaxonomyItem,
  useUpdateBFFProductSegmentItem as useUpdateBFFProductTaxonomyItem,
  useArchiveBFFProductSegmentItem as useArchiveBFFProductTaxonomyItem,
  useRestoreBFFProductSegmentItem as useRestoreBFFProductTaxonomyItem,
} from "@/hooks/mutations/useBFFProductSegmentMutations";
import SegmentActions from "./components/SegmentActions";
import DesktopSegmentTable from "./components/DesktopSegmentTable";
import { SegmentFormModal } from "./components/Modals/SegmentFormModal";
import { SegmentConfirmModal } from "./components/Modals/SegmentConfirmModal";

/**
 * Hook to retrieve product segments (kind: "segment") from BFFProductSegmentPage data source.
 */
export function useBFFProductSegments() {
  const { data } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT, {
    status: "active",
    page: 1,
    limit: 200,
  });
  return data?.data || [];
}

export default function BFFProductSegmentPage() {
  const { kind: paramKind } = useParams();
  const kind = paramKind || BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT;
  const label = BFF_PRODUCT_TAXONOMY_LABELS[kind] || "Taxonomy";

  if (paramKind === BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT) {
    return <Navigate to="/bff-product/segment" replace />;
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  useEffect(() => {
    setSelectedRowIds([]);
    setCurrentPage(1);
    setSearchTerm("");
    setSelectedState("active");
  }, [kind]);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedState]);

  const isMobile = useIsMobile();
  const { permissions } = useUserPermissions();
  const { data: taxonomyData, isLoading, error } = useBFFProductTaxonomy(kind, {
    searchTerm,
    status: selectedState,
    page: currentPage,
    limit: itemsPerPage,
  });

  const createMutation = useCreateBFFProductTaxonomyItem(kind);
  const updateMutation = useUpdateBFFProductTaxonomyItem(kind);
  const archiveMutation = useArchiveBFFProductTaxonomyItem(kind);
  const restoreMutation = useRestoreBFFProductTaxonomyItem(kind);

  if (!isValidTaxonomyKind(kind)) {
    return <Navigate to="/bff-product/list" replace />;
  }

  const canCreate = hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_SEGMENT.CREATE);
  const canUpdate = hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_SEGMENT.UPDATE);
  const canDelete = hasPermission(permissions, PERMISSIONS.BFF_PRODUCT_SEGMENT.DELETE);

  const getErrorMessage = (err) =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    `Failed to load ${label.toLowerCase()}`;

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);
  const items = taxonomyData?.data || [];
  const pagination = taxonomyData?.pagination || { totalPages: 1 };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const handleAddConfirm = async (values) => {
    await createMutation.mutateAsync({ name: values.name, isActive: true });
  };

  const handleEditConfirm = async (values) => {
    await updateMutation.mutateAsync({
      id: selectedItem.id,
      data: { name: values.name },
    });
    setSelectedItem(null);
  };

  const handleArchiveConfirm = async (item) => {
    if (Array.isArray(item)) {
      const results = await Promise.allSettled(
        item.map((r) => archiveMutation.mutateAsync(r._id || r.id))
      );
      const succeeded = results.filter((res) => res.status === "fulfilled").length;
      const failed = results.filter((res) => res.status === "rejected");
      if (succeeded > 0) toast.success(`${succeeded} ${label.toLowerCase()}(s) archived successfully`);
      if (failed.length > 0) toast.error(`Failed to archive ${failed.length} ${label.toLowerCase()}(s)`);
      setSelectedRowIds([]);
    } else {
      await archiveMutation.mutateAsync(item.id);
    }
    setSelectedItem(null);
  };

  const handleRestoreConfirm = async (item) => {
    await restoreMutation.mutateAsync(item.id);
    setSelectedItem(null);
  };

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

  const actionButtons = [
    {
      icon: <PlusIcon className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: () => {
        setSelectedItem(null);
        setIsFormModalOpen(true);
      },
      label: `Add ${label}`,
      showLabel: true,
      disabled: !canCreate,
    },
  ];

  const serialOffset = (currentPage - 1) * itemsPerPage;

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader title={label} className="py-4 text-heading md:p-0 md:m-0" />

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
        searchPlaceholder={`Search ${label.toLowerCase()}...`}
        filters={filters}
        hideOnDesktop={true}
      />

      <div className="flex-none hidden my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 md:block ms-5">
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedState}
            options={stateOptions}
            onChange={handleStateChange}
          />
          {selectedState === "active" && (
            <ActionButtonsGroup actions={actionButtons} />
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 w-full min-h-0 md:px-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-lighter-text text-sm italic">
            Loading...
          </div>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {hasError && items.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : items.length > 0 ? (
                items.map((item, index) => {
                  const isArchived = selectedState === "archived" || item.isActive === false;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 mb-3 border rounded-xl bg-background border-table-stroke"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center size-8 bg-primary/10 rounded-full shrink-0">
                          <span className="text-nav-highlight text-sm">
                            {serialOffset + index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-nav-highlight truncate">{item.name}</span>
                      </div>
                      <SegmentActions
                        data={item}
                        onEdit={(row) => {
                          setSelectedItem(row);
                          setIsFormModalOpen(true);
                        }}
                        onArchive={(row) => {
                          setSelectedItem(row);
                          setIsArchiveModalOpen(true);
                        }}
                        onRestore={(row) => {
                          setSelectedItem(row);
                          setIsRestoreModalOpen(true);
                        }}
                        isArchived={isArchived}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                      />
                    </div>
                  );
                })
              ) : (
                <NoData
                  message="No Records Found"
                  description={
                    searchTerm
                      ? `No ${label.toLowerCase()} match "${searchTerm}". Try adjusting your search.`
                      : `No ${label.toLowerCase()} available yet.`
                  }
                />
              )}
            </div>

            <DesktopSegmentTable
              items={items}
              label={label}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              onEdit={(item) => {
                setSelectedItem(item);
                setIsFormModalOpen(true);
              }}
              onArchive={(item) => {
                setSelectedItem(item);
                setIsArchiveModalOpen(true);
              }}
              onRestore={(item) => {
                setSelectedItem(item);
                setIsRestoreModalOpen(true);
              }}
              selectedState={selectedState}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isMobile={isMobile}
              selectedRowIds={selectedRowIds}
              onSelectionChange={setSelectedRowIds}
              onBulkArchiveClick={() => {
                const selectedObjects = items.filter((r) =>
                  selectedRowIds.includes(r._id || r.id)
                );
                setSelectedItem(selectedObjects);
                setIsArchiveModalOpen(true);
              }}
              sorting={sorting}
              onSortingChange={setSorting}
              isLoading={isLoading}
              hasError={hasError}
              errorMessage={errorMessage}
              searchTerm={searchTerm}
            />
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

      <SegmentFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        item={selectedItem && !Array.isArray(selectedItem) ? selectedItem : null}
        label={label}
        onSubmit={selectedItem && !Array.isArray(selectedItem) ? handleEditConfirm : handleAddConfirm}
      />

      <SegmentConfirmModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        item={selectedItem}
        mode="archive"
        label={label}
        onConfirm={handleArchiveConfirm}
      />

      <SegmentConfirmModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        mode="restore"
        label={label}
        onConfirm={handleRestoreConfirm}
      />

      <MobileBulkActionBar
        selectedCount={selectedRowIds.length}
        onCancel={() => setSelectedRowIds([])}
        onAction={() => {
          const selectedObjects = items.filter((p) =>
            selectedRowIds.includes(p._id || p.id)
          );
          setSelectedItem(selectedObjects);
          setIsArchiveModalOpen(true);
        }}
      />
    </section>
  );
}
