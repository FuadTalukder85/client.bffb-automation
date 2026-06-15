import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Button } from "@/components/ui/Button";
import { Eye, RefreshCw, Zap } from "lucide-react";

export function DesktopSingleTeamFormationTable({
  members = [],
  isLoading,
  onReplace,
  onDelete,
  onRestore,
  currentPage = 1,
  itemsPerPage = 10,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  noDataMessage,
  noDataDescription,
  emptyState,
}) {
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
const serialOffset = (currentPage - 1) * itemsPerPage;
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
      id: "user",
      header: "User",
      headerClassName: "table-head-cell text-left",
      className: " ",
      cell: ({ row }) => {
        const member = row.original;
        const user = member.user || member;
        const name = user.name || user.username || "Unknown";
        const email = user.email || "No email";
        const employeeId = user.employeeId || "N/A";

        return (
          <div className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
            <div className="flex items-center justify-center w-5 lg:w-6.5 xl:w-8.5 2xl:w-9.5 3xl:w-12 h-5 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium rounded-full bg-primary-shade-2 shrink-0 text-primary">
              {employeeId}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-semibold truncate text-nav-highlight">
                {name}
              </p>
              <p className="truncate text-muted-foreground">{email}</p>
            </div>
          </div>
        );
      },
      size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
    },
    {
      id: "role",
      header: "Role",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const member = row.original;
        const user = member.user || member;
        return user.activeRole?.roleName || user.department || "N/A";
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-right pr-10! lg:pr-5.5! xl:pr-6.5! 2xl:pr-8! 3xl:pr-10!",
      className: " ",
      enablePinning: true,
      cell: ({ row }) => {
        const member = row.original;
        const isMemberActive = member.isActive !== false;
        return (
          <div className="flex items-center justify-end gap-0">
            {isMemberActive ? (
              <>
                <button
                  onClick={() => onReplace?.(member)}
                  title="Replace Member"
                  aria-label="Replace Member"
                  className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-l-md rounded-r-none 2xl:h-9 2xl:px-3 2xl:py-1.5 3xl:h-10 3xl:px-3 3xl:py-2 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                   <Eye className="action-button-icon" />
                </button>
                <button
                  onClick={() => onDelete?.(member)}
                  title="Archive Member"
                  aria-label="Archive Member"
                  className="action-button flex items-center justify-center gap-1.5 rounded-r-md rounded-l-none 2xl:h-9 2xl:px-3 2xl:py-1.5 3xl:h-10 3xl:px-3 3xl:py-2 text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => onRestore?.(member)}
                title="Restore Member"
                aria-label="Restore Member"
                className="action-button rounded-lg flex items-center justify-center gap-1.5 text-nav-highlight border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <Zap className="action-button-icon" />
              </button>
            )}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
      <PaginatedTable
        data={members}
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
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
        emptyState={emptyState}
      />
    </div>
  );
}

export default DesktopSingleTeamFormationTable;

