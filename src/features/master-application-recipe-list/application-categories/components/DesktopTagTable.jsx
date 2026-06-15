import React from "react";
import { AiFillThunderbolt } from "react-icons/ai";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';

export default function DesktopTagTable({
    tags,
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    onPageChange,
    onItemsPerPageChange,
    onEdit,
    onArchive,
    onRestore,
    sorting,
    onSortingChange,
    columnVisibility,
    onColumnVisibilityChange,
    columnPinning,
    onColumnPinningChange,
    columnSizing,
    onColumnSizingChange,
    noDataMessage,
    noDataDescription,
}) {
    const serialOffset = (currentPage - 1) * itemsPerPage;

    const columns = [
        {
            id: "serial",
            header: "SL",
            headerClassName: "text-start",
            className: " ",
            cell: ({ row }) => (
                <div className="flex items-center justify-center  size-5.5 p-2 2xl:size-6.5 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
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
            header: "Tag Name",
            headerClassName: "",
            className: " ",
            cell: ({ getValue }) => (
                <span className="font-semibold">
                    {getValue() || "N/A"}
                </span>
            ),
            size: getResponsiveSize({ lg: 160, xl: 213, '2xl': 240, '3xl': 300 }),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "text-center",
            className: "",
            enablePinning: true,
            cell: ({ row }) => {
                const tag = row.original;
                const isActive = tag.isActive;

                return (
                    <div className="flex items-center justify-end gap-0 py-1 3xl:py-2.5">
                        {isActive ? (
                            <>
                                <button
                                    onClick={() => onEdit?.(tag)}
                                    title="Edit"
                                    aria-label="Edit"
                                    className="flex items-center justify-center gap-1.5 font-semibold rounded-l-md rounded-r-none text-base-color dark:text-nav-highlight hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
                                >
                                    <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                                </button>
                                <button
                                    onClick={() => onArchive?.(tag)}
                                    title="Archive"
                                    aria-label="Archive"
                                    className="flex items-center justify-center gap-1.5 font-semibold rounded-r-md rounded-l-none text-base-color dark:text-nav-highlight hover:text-red-600 hover:bg-red-50 bg-background border border-primary-shade-2 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
                                >
                                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onRestore?.(tag)}
                                title="Restore"
                                aria-label="Restore"
                                className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
                            >
                                <AiFillThunderbolt className="h-4 w-4 3xl:h-6 3xl:w-6" />
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
        <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
            <PaginatedTable
                data={tags}
                columns={columns}
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
                columnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
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
            />
        </div>
    );
}


