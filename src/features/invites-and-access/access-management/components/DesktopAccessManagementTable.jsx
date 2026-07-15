import React from "react";
import { AiFillThunderbolt } from "react-icons/ai";
import { PaginatedTable, getResponsiveSize, getColumnPinningProps } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";

export function DesktopAccessManagementTable({
  searchResults = [],
  searchTerm = "",
  isSearching,
  searchError, // eslint-disable-line no-unused-vars
  errorMessage,
  hasError,
  onRetry, // eslint-disable-line no-unused-vars
  onEdit,
  onDelete,
  onRestore,
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
  const trimmedSearchTerm = searchTerm?.trim();
  const noDataMessage = "No Records Found";
  const noDataDescription = trimmedSearchTerm
    ? `No roles match "${trimmedSearchTerm}". Try adjusting your search or filter criteria.`
    : "No roles match your current filters. Try adjusting your search or filter criteria.";

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
        id: "name",
        header: "Role Name",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-48 h-5" />,
        size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
      },
      {
        id: "platform",
        header: "Platform",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-16 h-6 rounded-full" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "isActive",
        header: "Status",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-center",
        className: "",
        cell: () => (
          <div className="flex justify-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        ),
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
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
      accessorKey: "name",
      header: "Role Name",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => (
        <span className="font-semibold text-nav-highlight">
          {getValue() || "N/A"}
        </span>
      ),
      size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
    },
    {
      accessorKey: "scope",
      header: "Platform",
      headerClassName: "",
      className: "",
      cell: ({ getValue }) => {
        const scope = getValue();
        if (!scope) return <span className="text-gray-400">N/A</span>;
        const styles = {
          application: "bg-blue-100 text-blue-700",
          global: "bg-purple-100 text-purple-700",
          crm: "bg-amber-100 text-amber-700",
        };
        const labels = {
          application: "Lab",
          global: "Global",
          crm: "CRM",
        };
        const colorClass = styles[scope] || "bg-gray-100 text-gray-600";
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {labels[scope] || scope}
          </span>
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => {
        const isActive = getValue();
        return (
          <span className={`px-3 lg:px-3 xl:px-3.5 2xl:px-4 3xl:px-5 py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 text-sub-text font-medium rounded-full ${isActive ? "lg:px-3 xl:px-3.5 2xl:px-4 3xl:px-5 py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 text-sub-text bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
            {isActive ? "Active" : "Archived"}
          </span>
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "",
      enablePinning: true,
      cell: ({ row }) => {
        const role = row.original;
        const isActive = role.isActive;

        return (
          <div className="flex items-center justify-end gap-0 py-1  3xl:py-2.5">
            {isActive ? (
                <>
                <button
                    onClick={() => onEdit?.(role)}
                    title="Edit"
                    aria-label="Edit"
                    className="action-button flex items-center justify-center gap-1.5   font-semibold rounded-l-md rounded-r-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                </button>
                <button
                    onClick={() => onDelete?.(role)}
                    title="Archive"
                    aria-label="Archive"
                    className="action-button flex items-center justify-center gap-1.5   font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                </button>
                </>
            ) : (
                <button
                    onClick={() => onRestore?.(role)}
                    title="Restore"
                    aria-label="Restore"
                    className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
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
        data={searchResults}
        columns={columns}
        enableSelection={!isArchived}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => item.isActive !== false}
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
        {...getColumnPinningProps({ columnPinning, onColumnPinningChange })}
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


