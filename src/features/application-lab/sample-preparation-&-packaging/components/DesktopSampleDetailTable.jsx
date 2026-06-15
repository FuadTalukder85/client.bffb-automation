import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { samplePreparationStatusOptions } from "../constants/projectOptions";
import { AiFillThunderbolt } from "react-icons/ai";

// Status badge wrapper aligned with Application Recipes styling
const StatusBadge = ({
    status,
    size = "sm",
    isNotAvailable = false,
    statusChangedAt = null,
}) => {
    const statusOption = samplePreparationStatusOptions.find(
        (option) => option.label === status || option.value === status
    );

    const fallbackColors = status === "Not Approved"
        ? { bgColor: "#FFD5D5", textColor: "#E80000" }
        : {};

    return (
        <GlobalStatusBadge
            status={status}
            size={size}
            isNotAvailable={isNotAvailable}
            statusChangedAt={statusChangedAt}
            bgColor={statusOption?.bgColor || fallbackColors.bgColor}
            textColor={statusOption?.textColor || fallbackColors.textColor}
        />
    );
};

export default function DesktopSampleDetailTable({
    samples,
    currentPage = 1,
    itemsPerPage = 20,
    totalPages = 1,
    onPageChange,
    onItemsPerPageChange,
    onEdit,
    onDelete,
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
    emptyState,
}) {
    const serialOffset = (currentPage - 1) * itemsPerPage;

    const columns = [
        {
            id: "serial",
            header: "SL",
            headerClassName: "table-head-cell text-center",
            cell: ({ row }) => (
                <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
                    <span className="text-nav-highlight">
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
            accessorKey: "project.masterProject.code",
            header: "Project Code",
            headerClassName: "table-head-cell",
            cell: ({ row }) => {
                const code = row.original.project?.masterProject?.code;
                return (
                    <span className="font-medium text-nav-highlight">
                        {code || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        },
        {
            accessorKey: "project.masterProject.title",
            header: "Project Name",
            headerClassName: "table-head-cell",
            cell: ({ row }) => {
                const title = row.original.project?.masterProject?.title;
                return (
                    <span className="block font-semibold truncate max-w-50">
                        {title || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "createdAt",
            header: "Raised Date",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => {
                const value = getValue();
                const displayDate = value
                    ? new Date(value).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                      })
                    : "N/A";
                return <span className="font-medium">{displayDate}</span>;
            },
            size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
        },
        {
            accessorKey: "applicationOfficer.name",
            header: "Application Officer",
            headerClassName: "table-head-cell",
            cell: ({ row }) => {
                const officer = row.original.applicationOfficer?.name;
                return (
                    <span className="font-medium">
                        {officer || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "recipe.recipeCode",
            header: "Recipe Code",
            headerClassName: "table-head-cell",
            cell: ({ row }) => {
                const code = row.original.recipe?.recipeCode;
                return (
                    <span className="font-medium text-nav-highlight">
                        {code || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        },
        {
            accessorKey: "batchSize",
            header: "Batch Size (g)",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue() ?? "—"}</span>
            ),
            size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
        },
        {
            accessorKey: "output",
            header: "Output (g)",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue() ?? "—"}</span>
            ),
            size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }),
        },
        {
            accessorKey: "packagingStatus",
            header: "Packaging Status",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => {
                const status = getValue();
                return <StatusBadge status={status || null} />;
            },
            size: getResponsiveSize({ lg: 91, xl: 121, '2xl': 136, '3xl': 170 }),
        },
        {
            accessorKey: "packageType.title",
            header: "Packaging Type",
            headerClassName: "table-head-cell",
            cell: ({ row }) => {
                const title = row.original.packageType?.title;
                return <span className="font-medium">{title || "—"}</span>;
            },
            size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        },
        {
            accessorKey: "perPackQuantity",
            header: "Per Pack Quantity",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => (
                <span className="font-medium">{getValue() ?? "—"}</span>
            ),
            size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        },
        {
            accessorKey: "applicationSuggestion",
            header: "Application Suggestions",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => (
                <span className="block font-medium truncate max-w-60" title={getValue()}>
                    {getValue() || "—"}
                </span>
            ),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "HODStatus",
            header: "HOD Status",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => {
                const status = getValue();
                const displayText = status === true ? "Approved" : status === false ? "Not Approved" : null;
                return <StatusBadge status={displayText} />;
            },
            size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
        },
        {
            accessorKey: "HODEvaluation",
            header: "HOD Evaluation",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => (
                <span className="block font-medium truncate max-w-60" title={getValue()}>
                    {getValue() || "—"}
                </span>
            ),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "approvalForSensory",
            header: "Approval for Sensory",
            headerClassName: "table-head-cell",
            cell: ({ getValue }) => {
                const isApproved = getValue();
                return (
                    <StatusBadge
                        status={isApproved ? "Approved" : "Pending"}
                    />
                );
            },
            size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "table-head-cell",
            enablePinning: true,
            cell: ({ row }) => {
                const sample = row.original;
                return (
                    <div className="flex items-center justify-center gap-0">
                        {sample.isActive ? (
                            <>
                                <button
                                    onClick={() => onEdit?.(sample)}
                                    title="Edit"
                                    aria-label="Edit"
                                    className="action-button flex items-center justify-center gap-1.5 rounded-l-md rounded-r-none hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                                >
                                    <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                                </button>
                                <button
                                    onClick={() => onDelete?.(sample)}
                                    title="Archive"
                                    aria-label="Archive"
                                    className="action-button flex items-center justify-center gap-1.5 rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                                >
                                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onRestore?.(sample)}
                                title="Restore"
                                aria-label="Restore"
                                className="action-button flex items-center justify-center p-1.5 rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                            >
                                <AiFillThunderbolt className="action-button-icon" />
                            </button>
                        )}
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
            <PaginatedTable
                data={samples}
                columns={columns}
                className="transition-all duration-300 scroll-smooth md:flex-1 md:min-h-0"
                rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
                enableSorting={true}
                enableColumnResizing={true}
                enablePinning={true}
                enableHiding={true}
                sorting={sorting}
                onSortingChange={onSortingChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={onColumnVisibilityChange}
                columnPinning={
                    columnPinning && (columnPinning.left || columnPinning.right)
                        ? columnPinning
                        : { left: ["serial"], right: ["actions"] }
                }
                onColumnPinningChange={onColumnPinningChange}
                columnSizing={columnSizing}
                onColumnSizingChange={onColumnSizingChange}
                bodyRowClassName="border-0"
                headerCellClassName=" first:pl-6 last:pr-6"
                bodyCellClassName=" first:pl-6 last:pr-6 py-0.5"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                noDataMessage={noDataMessage}
                noDataDescription={noDataDescription}
                emptyState={emptyState}
            />
        </div>
    );
}


