import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';

export function CategoryTableSkeleton({
  rows = 5,
  col1Header = "Code",
  col2Header = "Name",
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
      id: "code",
      header: col1Header,
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-24 h-5" />,
      size: columnSizing["code"] || 150,
    },
    {
      id: "name",
      header: col2Header,
      headerClassName: "table-head-cell",
      cell: () => <Skeleton className="w-full max-w-[200px] h-5" />,
      size: columnSizing["name"] || 300,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-center",
      cell: () => (
        <div className="flex items-center gap-0 justify-end">
          <Skeleton className="w-9 h-9 rounded-l-md" />
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
