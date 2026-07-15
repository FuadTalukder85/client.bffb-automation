import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import { getRecordDetailsColumns } from "../columns/recordDetails.columns";

export const RecordDetailsTable = ({
  data,
  currentPage = 1,
  itemsPerPage = 10,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  sorting,
  onSortingChange,
  noDataMessage,
  noDataDescription,
  emptyState,
}) => {
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const columns = useMemo(
    () =>
      getRecordDetailsColumns({
        serialOffset,
        onEdit,
      }),
    [serialOffset, onEdit]
  );

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
        sorting={sorting}
        onSortingChange={onSortingChange}
        defaultColumnPinning={{
          left: ["serial"],
          right: ["actions"],
        }}
        bodyRowClassName="border-0 hover:bg-transparent"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5 bg-background transition-colors"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
        emptyState={emptyState}
      />
    </div>
  );
};

export default RecordDetailsTable;
