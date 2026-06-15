import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Zap, FileText, Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";

export function DesktopTeamFormationTable({
  teams = [],
  isLoading,
  noDataMessage,
  noDataDescription,
  onView,
  onEdit,
  onArchive,
  onRestore,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  emptyState,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const resolvedNoDataMessage = noDataMessage || "No Records Found";
  const resolvedNoDataDescription =
    noDataDescription ||
    "No records match your current filters. Try adjusting your search or filter criteria.";

  if (isLoading) {
    return (
      <div className="hidden px-2 border shadow-sm md:block bg-background border-border/50">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "table-head-cell text-start",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-6 p-2 2xl:size-8 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
          <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
        </div>
      ),
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
      enableSorting: false,
      enableHiding: false,
      enablePinning: true,
    },
    {
      accessorKey: "name",
      header: "Team Name",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => <span className="">{getValue()}</span>,
      size: getResponsiveSize({ lg: 213, xl: 285, '2xl': 320, '3xl': 400 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-right pr-11",
      className: "text-right",
      enablePinning: true,
      cell: ({ row }) => {
        const team = row.original;
        const isActive = team.isActive;
        return (
          <div className="flex items-center justify-end gap-0">
            {isActive ? (
              <>
                <button
                  onClick={() => onView?.(team)}
                  title="View Team"
                  aria-label="View Team"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-l-md rounded-r-none text-nav-highlight hover:bg-purple-200 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                   <Eye className="action-button-icon" />
                </button>
                <button
                  onClick={() => onEdit?.(team)}
                  title="Edit Team"
                  aria-label="Edit Team"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-nav-highlight/15 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                </button>
                <button
                  onClick={() => onArchive?.(team)}
                  title="Archive Team"
                  aria-label="Archive Team"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => onRestore?.(team)}
                title="Restore Team"
                aria-label="Restore Team"
                className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-md 2xl:h-9 2xl:px-3 2xl:py-1.5 3xl:h-10 3xl:px-3 3xl:py-2 text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <AiFillThunderbolt className="action-button-icon" />
              </button>
            )}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
      <PaginatedTable
        data={teams}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        noDataMessage={resolvedNoDataMessage}
        noDataDescription={resolvedNoDataDescription}
        emptyState={emptyState}
      />
    </div>
  );
}

