import React from "react";
import { PaginatedTable, getResponsiveSize, getColumnPinningProps } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye, AlertCircle } from "lucide-react";
import { RecordStatusBadge } from "@/features/application-lab/application-lab-records/columns/applicationLabRecords.columns";
import GlobalStatusBadge from "@/components/ui/StatusBadge";

const HodStatusBadge = ({ status }) => {
    const fallbackColors = status === "Not Approved"
        ? { bgColor: "#FFD5D5", textColor: "#E80000" }
        : {};

    return (
        <GlobalStatusBadge
            status={status}
            size="sm"
            bgColor={fallbackColors.bgColor}
            textColor={fallbackColors.textColor}
        />
    );
};

// Helper to check for permission/presence of a section
const hasSection = (project, sectionName) => {
    if (!project || typeof project !== 'object') return false;
    return project[sectionName] !== undefined && project[sectionName] !== null;
};

export default function DesktopSamplePreparationTable({
    projects,
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    onPageChange,
    onItemsPerPageChange,
    onViewDetails,
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
            headerClassName: "table-head-cell text-start",
            cell: ({ row }) => (
                <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
                    <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
                </div>
            ),
            size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
            enableSorting: false,
            enableHiding: false,
            enablePinning: true,
        },
        {
            accessorKey: "masterProject.code",
            header: "Project Code",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "masterProject");
                const value = getValue();

                if (!hasAccess) {
                    return (
                        <span
                            className="font-medium text-muted-foreground italic flex items-center gap-1"
                            title="You don't have permission to view this field"
                        >
                            <AlertCircle size={14} className="text-yellow-500" />
                            Access Denied
                        </span>
                    );
                }

                return (
                    <span className="font-medium text-nav-highlight">
                        {value || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
        },
        {
            accessorKey: "masterProject.title",
            header: "Project Name",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "masterProject");
                const value = getValue();

                if (!hasAccess) {
                    return (
                        <span
                            className="font-semibold max-w-50 truncate text-muted-foreground italic flex items-center gap-1"
                            title="You don't have permission to view this field"
                        >
                            <AlertCircle size={14} className="text-yellow-500" />
                            Access Denied
                        </span>
                    );
                }

                return (
                    <span className="font-semibold max-w-50 truncate block">
                        {value || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "masterProject.raisedDate",
            header: "Raised Date",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "masterProject");
                const value = getValue();

                if (!hasAccess) {
                    return (
                        <span
                            className="text-muted-foreground italic flex items-center gap-1"
                            title="You don't have permission to view this field"
                        >
                            <AlertCircle size={14} className="text-yellow-500" />
                            N/A
                        </span>
                    );
                }

                const displayDate = value ? new Date(value).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                }) : "N/A";

                return (
                    <span className="font-medium">
                        {displayDate}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
        },
        {
            accessorKey: "productDevelopment.status",
            header: "Product Development Status",
            headerClassName: "table-head-cell text-center",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "productDevelopment");
                if (!hasAccess) {
                    return (
                        <div className="flex justify-center">
                            <RecordStatusBadge status={null} days={null} />
                        </div>
                    );
                }
                const status = getValue();
                const statusDays = project.productDevelopment?.statusDays;

                return (
                    <div className="flex justify-center">
                        <RecordStatusBadge status={status || null} days={statusDays ?? null} />
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
        },
        {
            accessorKey: "applicationLab.developmentStatus",
            header: "Application Development Status",
            headerClassName: "table-head-cell text-center",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "applicationLab");
                if (!hasAccess) {
                    return (
                        <div className="flex justify-center">
                            <RecordStatusBadge status={null} days={null} />
                        </div>
                    );
                }
                const status = getValue();
                const statusDays = project.applicationLab?.statusDays;
                return (
                    <div className="flex justify-center">
                        <RecordStatusBadge status={status || null} days={statusDays ?? null} />
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
        },
        {
            accessorKey: "sensoryLab.status",
            header: "Sensory Status",
            headerClassName: "table-head-cell text-center",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "sensoryLab");
                if (!hasAccess) {
                    return (
                        <div className="flex justify-center">
                            <RecordStatusBadge status={null} days={null} />
                        </div>
                    );
                }
                const status = getValue();
                const statusDays = project.sensoryLab?.statusDays;
                return (
                    <div className="flex justify-center">
                        <RecordStatusBadge status={status || null} days={statusDays ?? null} />
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "businessDevelopment.status",
            header: "Business Development Status",
            headerClassName: "table-head-cell text-center",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "businessDevelopment");
                if (!hasAccess) {
                    return (
                        <div className="flex justify-center">
                            <RecordStatusBadge status={null} days={null} />
                        </div>
                    );
                }
                const status = getValue();
                const statusDays = project.businessDevelopment?.statusDays;
                return (
                    <div className="flex justify-center">
                        <RecordStatusBadge status={status || null} days={statusDays ?? null} />
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
        },
        {
            accessorKey: "masterProject.status",
            header: "Project Status",
            headerClassName: "table-head-cell text-center",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "masterProject");
                if (!hasAccess) {
                    return (
                        <div className="flex justify-center">
                            <RecordStatusBadge status={null} days={null} />
                        </div>
                    );
                }
                const status = getValue();
                const statusDays = project.masterProject?.statusDays;
                return (
                    <div className="flex justify-center">
                        <RecordStatusBadge status={status || null} days={statusDays ?? null} />
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "latestSampleHODStatus",
            header: "HOD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const status = getValue();
                const displayText = status === true ? "Approved" : status === false ? "Not Approved" : null;
                return <HodStatusBadge status={displayText} />;
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "table-head-cell",
            className: " ",
            enablePinning: true,
            cell: ({ row }) => {
                const project = row.original;

                return (
                    <div className="flex items-center justify-center gap-0">
                        <button
                            onClick={() => onViewDetails?.(project)}
                            title="View Details"
                            aria-label="View Details"
                            className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
                        >
                            <Eye className="action-button-icon" />
                        </button>
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
            <PaginatedTable
                data={projects}
                columns={columns}
                className={`scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0`}
                rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
                enableSorting={true}
                enableColumnResizing={true}
                enablePinning={true}
                enableHiding={true}
                sorting={sorting}
                onSortingChange={onSortingChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={onColumnVisibilityChange}
                {...getColumnPinningProps({ columnPinning, onColumnPinningChange })}
                columnSizing={columnSizing}
                onColumnSizingChange={onColumnSizingChange}
                bodyRowClassName="border-0"
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
