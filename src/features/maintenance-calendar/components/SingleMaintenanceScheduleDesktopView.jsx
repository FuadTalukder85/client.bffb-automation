import React from "react";
import { PaginatedTable, getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";

export default function SingleMaintenanceScheduleDesktopView({ 
  paginatedRows, 
  columns, 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  noDataMessage,
  noDataDescription,
}) {
  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-sm">
      <PaginatedTable
        data={paginatedRows}
        columns={columns}
        className="flex-1 min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        bodyRowClassName="border-0 hover:bg-muted/10 transition-colors"
        bodyCellClassName="first:pl-6 last:pr-6"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
      />
    </main>
  );
}
