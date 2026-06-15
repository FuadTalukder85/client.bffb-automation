import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';

/**
 * Skeleton component for the desktop table view during loading
 * Matches the structure of DesktopInDevelopmentRecipeTable using PaginatedTable
 */
export function DesktopInDevelopmentRecipeTableSkeleton({
  rows = 5,
  columnVisibility = {},
  columnPinning = {},
  columnSizing = {},
}) {
  const data = React.useMemo(
    () => Array.from({ length: rows }).map((_, i) => ({ id: i })),
    [rows]
  );

  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "table-head-cell",
      cell: () => (
        <Skeleton className="w-8 h-8 rounded-full" />
      ),
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
    },
    {
      id: "recipeCode",
      header: "Recipe Code",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["recipeCode"] || 150,
    },
    {
      id: "name",
      header: "Recipe Name",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["name"] || 300,
    },
    {
      id: "projectCode",
      header: "Project Code",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["projectCode"] || 150,
    },
    {
      id: "project.name",
      header: "Project Name",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["project.name"] || 200,
    },
    {
      id: "category.name",
      header: "Category",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["category.name"] || 150,
    },
    {
      id: "subCategory.name",
      header: "Sub Category",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["subCategory.name"] || 150,
    },
    {
      id: "subSubCategory.name",
      header: "Sub Subcategory",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["subSubCategory.name"] || 150,
    },
    {
      id: "tags",
      header: "Tags",
      headerClassName: "table-head-cell",
      cell: () => (
        <div className="flex flex-wrap gap-1 justify-center">
          <Skeleton className="w-12 h-5 rounded" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>
      ),
      size: columnSizing["tags"] || 150,
    },
    {
      id: "createdAt",
      header: "Date",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full h-5" />,
      size: columnSizing["createdAt"] || 150,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-center",
      cell: () => (
        <div className="flex items-center gap-0 justify-end">
          <Skeleton className="w-9 h-9 rounded-l-md" />
          <Skeleton className="w-9 h-9 rounded-none" />
          <Skeleton className="w-9 h-9 rounded-none" />
          <Skeleton className="w-9 h-9 rounded-r-md" />
        </div>
      ),
      size: columnSizing["actions"] || 150,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={false}
        enableColumnResizing={false}
        enablePinning={true}
        enableHiding={false}
        columnVisibility={columnVisibility}
        columnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
        columnSizing={columnSizing}
        bodyRowClassName="border-0 hover:bg-transparent"
        bodyCellClassName="first:pl-6 last:pr-6 py-4"
        showFooter={false}
      />
    </div>
  );
}
