import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import { getRawMaterialsColumns } from "../columns/rawMaterials.columns";

export const RawMaterialsTable = ({
  data,
  currentPage = 1,
  itemsPerPage = 10,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onArchive,
  onRestore,
  onView,
  sorting,
  onSortingChange,
  isArchived = false,
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
      getRawMaterialsColumns({
        serialOffset,
        onEdit,
        onArchive,
        onRestore,
        onView,
        isArchived,
      }),
    [serialOffset, onEdit, onArchive, onRestore, onView, isArchived]
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
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
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
        emptyState={emptyState}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
      />
    </div>
  );
};

export default RawMaterialsTable;
