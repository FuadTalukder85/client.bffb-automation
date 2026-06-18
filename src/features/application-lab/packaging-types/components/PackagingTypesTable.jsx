import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import { getPackagingTypesColumns } from "../columns/packagingTypes.columns";

export const PackagingTypesTable = ({
  data,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onArchive,
  onRestore,
  sorting,
  onSortingChange,
  isArchived = false,
  isLoading = false,
  noDataMessage,
  noDataDescription,
  emptyState,
  selectedRowIds = [],
  onSelectionChange,
  onBulkArchiveClick,
}) => {
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const columns = useMemo(
    () =>
      getPackagingTypesColumns({
        serialOffset,
        onEdit,
        onArchive,
        onRestore,
        isArchived,
      }),
    [serialOffset, onEdit, onArchive, onRestore, isArchived]
  );

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        enableSelection={!isArchived}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => item.isActive ?? true}
        onBulkArchiveClick={onBulkArchiveClick}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={false}
        enablePinning={true}
        enableHiding={false}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnPinning={{ left: ["serial"], right: ["actions"] }}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        isLoading={isLoading}
        emptyState={emptyState}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
      />
    </div>
  );
};

export default PackagingTypesTable;
