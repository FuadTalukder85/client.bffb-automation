import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';

export default function MaintenanceItemsTableSkeleton({
    rows = 5,
    columnPinning = { left: ["serial"], right: ["actions"] },
}) {
    const data = React.useMemo(
        () => Array.from({ length: rows }).map((_, i) => ({ id: i })),
        [rows]
    );

    const columns = [
        {
            id: "serial",
            header: "SL",
            headerClassName: "table-head-cell text-center",
            cell: () => (
                <div className="flex items-center justify-center size-5.5 p-2 bg-primary/10 rounded-full mx-auto">
                    <Skeleton className="w-4 h-4 rounded-full" />
                </div>
            ),
            size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
        },
        {
            id: "name",
            header: "Maintenance Item Name",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-full max-w-[300px] h-5" />,
            size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
        },
        {
            id: "department",
            header: "Department",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-24 h-6 rounded-full" />,
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "table-head-cell text-center",
            cell: () => (
                <div className="flex items-center justify-center gap-0">
                    <Skeleton className="w-9 h-9 rounded-l-md" />
                    <Skeleton className="w-9 h-9 rounded-r-md" />
                </div>
            ),
            size: getResponsiveSize({ lg: 21, xl: 28, '2xl': 32, '3xl': 40 }),
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
                columnPinning={columnPinning}
                bodyRowClassName="border-0 hover:bg-transparent"
                bodyCellClassName="first:pl-6 last:pr-6 py-4"
                showFooter={false}
            />
        </div>
    );
}
