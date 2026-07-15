import React from "react";
import { Send } from "lucide-react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/utils/dateFormatter";

export function DesktopInvitationTable({
  searchResults = [],
  isSearching,
  searchError, // eslint-disable-line no-unused-vars
  errorMessage,
  hasError,
  onRetry, // eslint-disable-line no-unused-vars
  selectedFilter, // eslint-disable-line no-unused-vars
  searchTerm, // eslint-disable-line no-unused-vars
  onRevoke,
  onResend,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnPinning,
  onColumnPinningChange,
  columnSizing,
  onColumnSizingChange,
  isArchived = false,
  selectedRowIds = [],
  onSelectionChange,
  onBulkArchiveClick,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No invitations match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No invitations match your current filters. Try adjusting your search or filter criteria.";

  if (isSearching) {
    const skeletonData = Array.from({ length: 5 }).map((_, i) => ({ id: i }));
    const skeletonColumns = [
      {
        id: "serial",
        header: "SL",
        headerClassName: "text-start",
        className: " ",
        cell: () => <Skeleton className="w-8 h-8 rounded-full" />,
        size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
      },
      {
        id: "employee",
        header: "Employee Details",
        headerClassName: "",
        className: " ",
        cell: () => (
          <div className="flex flex-col gap-1">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-48 h-3" />
          </div>
        ),
        size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
      },
      {
        id: "createdAt",
        header: "Invited On",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-24 h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-center",
        className: "",
        cell: () => (
          <div className="flex justify-center gap-2">
            <Skeleton className="w-16 h-8 rounded-md" />
            <Skeleton className="w-16 h-8 rounded-md" />
          </div>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
    ];

    return (
      <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
        <PaginatedTable
          data={skeletonData}
          columns={skeletonColumns}
          className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
          rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
          enableSorting={false}
          enableColumnResizing={false}
          enablePinning={true}
          enableHiding={false}
          bodyRowClassName="border-0 hover:bg-transparent"
          bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
          showFooter={false}
        />
      </div>
    );
  }


  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "text-start",
      className: " ",
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
      id: "employee",
      header: "Employee Details",
      headerClassName: "text-left",
      className: "text-left",
      cell: ({ row }) => {
        const invitation = row.original;
        const departmentLabel = invitation.department || invitation.roleId?.name || "Department N/A";
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-nav-highlight">{invitation.name}</span>
            <span className="text-xs text-muted-foreground">{departmentLabel} | {invitation.email}</span>
          </div>
        );
      },
      size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
    },
    {
      accessorKey: "createdAt",
      header: "Invited On",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => (
        <span className="font-medium text-nav-highlight">
          {formatDate(getValue())}
        </span>
      ),
      size: getResponsiveSize({ lg: 117, xl: 157, '2xl': 176, '3xl': 220 }),
    },
    {
      accessorKey: "status",
      header: "Status",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => {
        const status = getValue() ?? "pending";
        return <GlobalStatusBadge status={status} size="lg" />;
      },
      size: getResponsiveSize({ lg: 117, xl: 157, '2xl': 176, '3xl': 220 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "",
      enablePinning: true,
      cell: ({ row }) => {
        const invitation = row.original;
        const status = invitation.status?.toLowerCase() ?? "pending";
        const isPending = status === "pending";

        if (!isPending) return null;

        return (
          <div className="flex items-center justify-end gap-0 py-1 3xl:py-2.5">
            <button
                onClick={() => onResend(invitation)}
                title="Resend"
                aria-label="Resend"
                className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-l-md rounded-r-none text-base-color hover:text-nav-highlight border border-primary-shade-2 bg-primary-shade-2 hover:bg-purple-200 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
                <Send className="action-button-icon" />
            </button>
            <button
                onClick={() => onRevoke(invitation)}
                title="Revoke"
                aria-label="Revoke"
                className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
                <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
            </button>
          </div>
        );
      },
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
      <PaginatedTable
        data={searchResults}
        columns={columns}
        enableSelection={!isArchived}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => (item.status?.toLowerCase() ?? "pending") === "pending"}
        onBulkArchiveClick={onBulkArchiveClick}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        defaultColumnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
        emptyState={
          hasError ? (
            <div className="py-10 text-center text-red-500">
              {errorMessage}
            </div>
          ) : null
        }
      />
    </div>
  );
}


