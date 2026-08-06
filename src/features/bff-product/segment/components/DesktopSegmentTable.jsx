import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import SegmentActions from "./SegmentActions";

export default function DesktopSegmentTable({
  items = [],
  label = "Taxonomy",
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onArchive,
  onRestore,
  selectedState = "active",
  canUpdate = false,
  canDelete = false,
  isMobile = false,
  selectedRowIds = [],
  onSelectionChange,
  onBulkArchiveClick,
  sorting = [],
  onSortingChange,
  isLoading = false,
  hasError = false,
  errorMessage = "",
  searchTerm = "",
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const columns = useMemo(
    () => [
      {
        id: "serial",
        header: "SL",
        headerClassName: "table-head-cell text-start sticky left-0 z-20 bg-background",
        cell: ({ row }) => (
          <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
            <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
          </div>
        ),
        size: getResponsiveSize({ lg: 32, xl: 43, "2xl": 48, "3xl": 60 }),
        enableSorting: false,
        enableHiding: false,
        enablePinning: true,
      },
      {
        accessorKey: "name",
        header: label,
        headerClassName: "table-head-cell",
        cell: ({ getValue }) => (
          <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>
        ),
        minSize: 400,
        size: getResponsiveSize({ lg: 320, xl: 427, "2xl": 480, "3xl": 600 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell sticky right-0 z-20 bg-background text-center",
        enablePinning: true,
        cell: ({ row }) => (
          <SegmentActions
            data={row.original}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            isArchived={selectedState === "archived" || row.original.isActive === false}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ),
        size: getResponsiveSize({ lg: 64, xl: 85, "2xl": 96, "3xl": 120 }),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [serialOffset, label, selectedState, canUpdate, canDelete, onEdit, onArchive, onRestore]
  );

  return (
    <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={items}
        columns={columns}
        enableSelection={!isMobile && selectedState !== "archived" && canDelete}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => item.isActive ?? true}
        onBulkArchiveClick={onBulkArchiveClick}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ "3xl": "16px", "2xl": "13px", xl: "11.5px", lg: "8.5px", normal: "8px" }}
        enableSorting={true}
        enableColumnResizing={false}
        enablePinning={true}
        enableHiding={false}
        sorting={sorting}
        onSortingChange={onSortingChange}
        defaultColumnPinning={{ left: ["serial"], right: ["actions"] }}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0 bg-background transition-colors"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        isLoading={isLoading}
        emptyState={
          hasError ? (
            <div className="py-10 text-center text-red-500">{errorMessage}</div>
          ) : null
        }
        noDataMessage="No Records Found"
        noDataDescription={
          searchTerm
            ? `No ${label.toLowerCase()} match "${searchTerm}". Try adjusting your search.`
            : `No ${label.toLowerCase()} available yet.`
        }
      />
    </div>
  );
}
