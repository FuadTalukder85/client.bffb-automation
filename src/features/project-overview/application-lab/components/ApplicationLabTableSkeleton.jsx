import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';

export function ApplicationLabTableSkeleton({
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
            id: "masterProject.code",
            header: "Project Code",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-20 h-5" />,
            size: columnSizing["masterProject.code"] || 130,
        },
        {
            id: "masterProject.title",
            header: "Project Name",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-full max-w-[180px] h-5" />,
            size: columnSizing["masterProject.title"] || 200,
        },
        {
            id: "productDevelopment.status",
            header: "PD Status",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
            size: columnSizing["productDevelopment.status"] || 130,
        },
        {
            id: "applicationLab.developmentStatus",
            header: "AD Status",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
            size: columnSizing["applicationLab.developmentStatus"] || 130,
        },
        {
            id: "sensoryLab.status",
            header: "Sensory Status",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
            size: columnSizing["sensoryLab.status"] || 150,
        },
        {
            id: "businessDevelopment.status",
            header: "BD Status",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
            size: columnSizing["businessDevelopment.status"] || 120,
        },
        {
            id: "masterProject.status",
            header: "Project Status",
            headerClassName: "table-head-cell",
            cell: () => <Skeleton className="w-24 h-7 rounded-full" />,
            size: columnSizing["masterProject.status"] || 140,
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "table-head-cell text-center",
            cell: () => (
                <div className="flex items-center gap-0 justify-end">
                    <Skeleton className="w-9 h-9 rounded-md" />
                </div>
            ),
            size: columnSizing["actions"] || 100,
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
