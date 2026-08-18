import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye, AlertCircle, Trash2 } from "lucide-react";
import { StatusBadge, hasSection } from "../../master-project/components/ProjectShared";
import { format } from "date-fns";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import PERMISSIONS from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";
import { ProjectTaskStatsButton } from "../../components/ProjectTaskStatsButton";

export default function MasterProjectScheduleTable({
    projects,
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    onPageChange,
    onItemsPerPageChange,
    onViewDetails,
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
    emptyState,
}) {
    const { permissions } = useUserPermissions();
    const canArchive = hasPermission(permissions, PERMISSIONS.PROJECT.DELETE);
    const canRestore = hasPermission(permissions, PERMISSIONS.PROJECT.UPDATE);

    const serialOffset = (currentPage - 1) * itemsPerPage;

    const formatDate = (date) => {
        if (!date) return "—";
        try {
            return format(new Date(date), "dd MMM yyyy");
        } catch (e) {
            return "—";
        }
    };

    const renderStatus = (project, section, value) => {
        const hasAccess = hasSection(project, section);
        if (!hasAccess) {
            return (
                <StatusBadge
                    status={null}

                    isNotAvailable={true}
                />
            );
        }
        const statusChangedAt = project.statusChangedAt?.[`${section}Status`];
        return (
            <StatusBadge
                status={value || null}

                isNotAvailable={false}
                statusChangedAt={statusChangedAt}
            />
        );
    };

    const renderDate = (project, section, value) => {
        const hasAccess = hasSection(project, section);
        if (!hasAccess) {
            return (
                <span className="text-muted-foreground italic flex items-center gap-1">
                    <AlertCircle size={12} className="text-yellow-500" />
                    Denied
                </span>
            );
        }
        return <span>{formatDate(value)}</span>;
    };

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
                if (!hasAccess) return <span className="text-muted-foreground italic">Access Denied</span>;
                return <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>;
            },
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "masterProject.title",
            header: "Project Name",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "masterProject");
                if (!hasAccess) return <span className="text-muted-foreground italic">Access Denied</span>;
                return <span className="font-semibold max-w-[200px] truncate block">{getValue() || "—"}</span>;
            },
            size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
        },
        {
            accessorKey: "masterProject.raisedDate",
            header: "Raised",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "masterProject", getValue()),
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "masterProject.startDate",
            header: "Project Start",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "masterProject", getValue()),
            size: getResponsiveSize({ lg: 91, xl: 121, '2xl': 136, '3xl': 170 }),
        },
        {
            accessorKey: "masterProject.endDate",
            header: "Project End",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "masterProject", getValue()),
            size: getResponsiveSize({ lg: 91, xl: 121, '2xl': 136, '3xl': 170 }),
        },
        {
            accessorKey: "applicationLab.nextProductionDate",
            header: "Next Production",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "applicationLab", getValue()),
            size: getResponsiveSize({ lg: 112, xl: 149, '2xl': 168, '3xl': 210 }),
        },
        {
            accessorKey: "applicationLab.lastProductionDate",
            header: "Last Production",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "applicationLab", getValue()),
            size: getResponsiveSize({ lg: 112, xl: 149, '2xl': 168, '3xl': 210 }),
        },
        {
            accessorKey: "sensoryLab.latestDate",
            header: "Latest Sensory",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "sensoryLab", getValue()),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "sensoryLab.nextDate",
            header: "Next Sensory",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "sensoryLab", getValue()),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "businessDevelopment.approvalDate",
            header: "BD Approval",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "businessDevelopment", getValue()),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "businessDevelopment.clientSampleDeliveryDate",
            header: "Sample Delivery",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderDate(row.original, "businessDevelopment", getValue()),
            size: getResponsiveSize({ lg: 112, xl: 149, '2xl': 168, '3xl': 210 }),
        },
        {
            accessorKey: "productDevelopment.status",
            header: "PD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderStatus(row.original, "productDevelopment", getValue()),
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "applicationLab.developmentStatus",
            header: "AD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderStatus(row.original, "applicationLab", getValue()),
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "sensoryLab.status",
            header: "Sensory Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderStatus(row.original, "sensoryLab", getValue()),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "businessDevelopment.status",
            header: "BD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderStatus(row.original, "businessDevelopment", getValue()),
            size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
        },
        {
            accessorKey: "masterProject.status",
            header: "Project Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => renderStatus(row.original, "masterProject", getValue()),
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
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
                            className="action-button flex items-center justify-center gap-1.5 rounded-l-md lg:rounded-l-sm 3xl:rounded-l-md rounded-r-none hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                            <Eye className="action-button-icon" />
                        </button>
                        <ProjectTaskStatsButton projectId={project._id} className="rounded-r-md lg:rounded-r-sm 3xl:rounded-r-md rounded-l-none" />
                        {/* {canArchive && (
                            <button
                                onClick={() => onArchive?.(project)}
                                title="Archive"
                                aria-label="Archive"
                                className="action-button flex items-center justify-center gap-1.5 rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                            >
                                <Trash2 className="action-button-icon" />
                            </button>
                        )} */}
                    </div>
                );
            },
            size: getResponsiveSize({ lg: 74, xl: 85, '2xl': 96, '3xl': 120 }),
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
                columnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial", "masterProject.code"], right: ["actions"] }}
                onColumnPinningChange={onColumnPinningChange}
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
