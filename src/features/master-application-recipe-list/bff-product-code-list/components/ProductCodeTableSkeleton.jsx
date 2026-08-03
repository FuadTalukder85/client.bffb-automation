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
      id: "name",
      header: "Product Name",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-32 h-5" />,
      size: columnSizing["name"] || 160,
    },
    {
      id: "bffBrandName",
      header: "BFF Brand Name",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
      size: columnSizing["bffBrandName"] || 150,
    },
    {
      id: "xpCode",
      header: "XP Code",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-5" />,
      size: columnSizing["xpCode"] || 115,
    },
    {
      id: "xpIssueDate",
      header: "XP Issue Date",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-24 h-5" />,
      size: columnSizing["xpIssueDate"] || 125,
    },
    {
      id: "commercialCode",
      header: "Commercial Code",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-5" />,
      size: columnSizing["commercialCode"] || 135,
    },
    {
      id: "commercialCodeIssueDate",
      header: "Commercial Code Issue Date",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-24 h-5" />,
      size: columnSizing["commercialCodeIssueDate"] || 160,
    },
    {
      id: "segment",
      header: "Segment",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-16 h-6 rounded-full" />,
      size: columnSizing["segment"] || 128,
    },
    {
      id: "category",
      header: "Category",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
      size: columnSizing["category"] || 128,
    },
    {
      id: "market",
      header: "Market",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
      size: columnSizing["market"] || 128,
    },
    {
      id: "brand",
      header: "Brand",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
      size: columnSizing["brand"] || 128,
    },
    {
      id: "productType",
      header: "Product Type",
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-16 h-6 rounded-full" />,
      size: columnSizing["productType"] || 128,
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
        defaultColumnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
        columnSizing={columnSizing}
        bodyRowClassName="border-0 hover:bg-transparent"
        bodyCellClassName="first:pl-6 last:pr-6 py-4"
        showFooter={false}
      />
    </div>
  );
}
