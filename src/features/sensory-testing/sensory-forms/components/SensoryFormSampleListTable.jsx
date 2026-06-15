import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye, Pencil } from "lucide-react";

export default function SensoryFormSampleListTable({
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
  onViewDetails,
  noDataMessage,
  noDataDescription,
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
        id: "recipe.recipeCode",
        header: "Recipe Code",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => {
          const code = row.original.recipe?.recipeCode || row.original.recipe?.recipeCode;
          return (
            <span className="font-medium text-nav-highlight text-center block w-full">
              {code || "—"}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "recipe.name",
        header: "Recipe Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => {
          const name =
            row.original.project?.masterProject?.title ||
            row.original.project?.title ||
            "—";
          return (
            <span className="font-semibold block text-center w-full">
              {name}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorKey: "createdAt",
        header: "Production Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const date = getValue();
          if (!date) return "—";
          return (
            <span className="text-center block w-full">
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        enablePinning: true,
        cell: ({ row }) => {
          const sample = row.original;
          const needsForm = !sample.hasSensoryFormOfCurrentUser;
          return (
            <div className="flex items-center justify-center gap-0">
              <button 
                className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
                onClick={() => onViewDetails?.(sample)}
                title={needsForm ? "Fill Evaluation" : "View Details"}
                aria-label={needsForm ? "Fill Evaluation" : "View Details"}
              >
                {needsForm ? (
                  <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                ) : (
                  <Eye className="action-button-icon" />
                )}
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      }
    ],
    [serialOffset, onViewDetails]
  );

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
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
        columnPinning={columnPinning && (columnPinning.left?.length > 0 || columnPinning.right?.length > 0) ? columnPinning : { left: ["serial"], right: ["actions"] }}
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        headerRowClassName="bg-transparent"
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        tableClassName="custom-scrollbar"
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
      />
    </div>
  );
}
