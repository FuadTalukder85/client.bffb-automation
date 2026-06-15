import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye, Pencil } from "lucide-react";

export default function DesktopSampleListView({
  data,
  currentPage,
  itemsPerPage,
  totalPages,
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
  onOpen, // Mapping to onViewDetails essentially
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const columns = useMemo(
    () => [
      {
        id: "serial",
        header: "SL",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => (
          <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
            <span className="text-nav-highlight font-semibold">
              {serialOffset + row.index + 1}
            </span>
          </div>
        ),
        size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
        enableSorting: false,
        enableHiding: false,
        enablePinning: true,
      },
      {
        accessorKey: "recipeCode",
        header: "Recipe Code",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-nav-highlight text-center block w-full px-4 tracking-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
      },
      {
        accessorKey: "recipeName",
        header: "Application Recipe Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-semibold block text-center w-full max-w-40 truncate mx-auto leading-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
      },
      {
        accessorKey: "raisedDate",
        header: "Production Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full whitespace-nowrap px-2 font-medium">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        enablePinning: true,
        cell: ({ row }) => {
          const isSubmitted = row.original.isSubmitted;
          return (
            <div className="flex items-center justify-center gap-0">
              <button
                className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
                onClick={() => onOpen?.(row.original)}
                title={isSubmitted ? "View Details" : "Edit"}
                aria-label={isSubmitted ? "View Details" : "Edit"}
              >
                {isSubmitted ? (
                  <Eye className="action-button-icon" />
                ) : (
                  <Pencil className="action-button-icon" />
                )}
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [serialOffset, onOpen]
  );

  return (
    <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnPinning={
          columnPinning &&
          (columnPinning.left?.length > 0 || columnPinning.right?.length > 0)
            ? columnPinning
            : { left: ["serial"], right: ["actions"] }
        }
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        headerRowClassName="bg-transparent"
        bodyRowClassName="border-0 group hover:bg-muted/30 transition-colors"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        tableClassName="custom-scrollbar"
      />
    </div>
  );
}
