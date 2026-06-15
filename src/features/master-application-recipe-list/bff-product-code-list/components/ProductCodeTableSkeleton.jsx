import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';

export function ProductCodeTableSkeleton({
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
      headerClassName: "table-head-cell text-start",
      cell: () => <Skeleton className="w-8 h-8 rounded-full" />,
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
    },
    {
      id: "productCode",
      header: "Product Code",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-24 h-5" />,
      size: columnSizing["productCode"] || 150,
    },
    {
      id: "productName",
      header: "Product Name",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-32 h-5" />,
      size: columnSizing["productName"] || 200,
    },
    {
      id: "productSegment",
      header: "Product Segment",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
      size: columnSizing["productSegment"] || 160,
    },
    {
      id: "type",
      header: "Type",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-16 h-5" />,
      size: columnSizing["type"] || 100,
    },
    {
      id: "cost",
      header: "Cost",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-24 h-5" />,
      size: columnSizing["cost"] || 150,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-center",
      cell: () => (
        <div className="flex justify-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
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
