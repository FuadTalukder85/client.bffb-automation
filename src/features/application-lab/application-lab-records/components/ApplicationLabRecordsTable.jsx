import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import { getApplicationLabRecordsColumns } from "../columns/applicationLabRecords.columns";

export const ApplicationLabRecordsTable = ({
  data,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onView,
  sorting,
  onSortingChange,
  noDataMessage,
  noDataDescription,
  emptyState,
}) => {
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const columns = useMemo(
    () =>
      getApplicationLabRecordsColumns({
        serialOffset,
        onView,
      }),
    [serialOffset, onView]
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
        columnPinning={{
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
        emptyState={emptyState}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
      />
    </div>
  );
};

export default ApplicationLabRecordsTable;
