import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye, AlertCircle, Trash2, ChefHat } from "lucide-react";
import { GoPlus } from "react-icons/go";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { applicationLabStatusOptions } from "../constants/projectOptions";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import PERMISSIONS from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";
import { ProjectTaskStatsButton } from "../../components/ProjectTaskStatsButton";

// Helper to check for permission/presence of a section
const hasSection = (project, sectionName) => {
    if (!project || typeof project !== 'object') return false;
    return project[sectionName] !== undefined && project[sectionName] !== null;
};

// Application Lab specific StatusBadge wrapper
const StatusBadge = ({ status, size = "sm", isNotAvailable = false, statusChangedAt = null }) => {
    const statusOption = applicationLabStatusOptions.find(
        option => option.label === status || option.value === status
    );

    return (
        <GlobalStatusBadge
            status={status}
            size={size}
            isNotAvailable={isNotAvailable}
            statusChangedAt={statusChangedAt}
            bgColor={statusOption?.bgColor}
            textColor={statusOption?.textColor}
        />
    );
};


export default function DesktopApplicationLabTable({
    projects,
    currentPage = 1,
    itemsPerPage = 10,
    totalPages = 1,
    onPageChange,
    onItemsPerPageChange,
    onViewDetails,
    onCreateRecipe,
    onViewRecipe,
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

    const columns = [
        {
            id: "serial",
            header: "SL",
            headerClassName: "table-head-cell text-start",
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
                            className="font-semibold max-w-[200px] truncate block text-muted-foreground italic flex items-center gap-1"
                            title="You don't have permission to view this field"
                        >
                            <AlertCircle size={14} className="text-yellow-500" />
                            Access Denied
                        </span>
                    );
                }

                return (
                    <span className="font-semibold max-w-[200px] truncate block">
                        {value || "—"}
                    </span>
                );
            },
            size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
        },
        {
            accessorKey: "productDevelopment.status",
            header: "PD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "productDevelopment");
                if (!hasAccess) {
                    return (
                        <StatusBadge
                            status={null}
                            isNotAvailable={true}
                        />
                    );
                }
                const status = getValue();
                const statusChangedAt = project.statusChangedAt?.productDevelopmentStatus;
                return (
                    <StatusBadge
                        status={status || null}
                        isNotAvailable={false}
                        statusChangedAt={statusChangedAt}
                    />
                );
            },
            size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
        },
        {
            accessorKey: "applicationLab.developmentStatus",
            header: "AD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "applicationLab");
                if (!hasAccess) {
                    return (
                        <StatusBadge
                            status={null}
                            isNotAvailable={true}
                        />
                    );
                }
                const status = getValue();
                const statusChangedAt = project.statusChangedAt?.applicationLabStatus;
                return (
                    <StatusBadge
                        status={status || null}
                        isNotAvailable={false}
                        statusChangedAt={statusChangedAt}
                    />
                );
            },
            size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
        },
        {
            accessorKey: "sensoryLab.status",
            header: "Sensory Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "sensoryLab");
                if (!hasAccess) {
                    return (
                        <StatusBadge
                            status={null}
                            isNotAvailable={true}
                        />
                    );
                }
                const status = getValue();
                const statusChangedAt = project.statusChangedAt?.sensoryLabStatus;
                return (
                    <StatusBadge
                        status={status || null}
                        isNotAvailable={false}
                        statusChangedAt={statusChangedAt}
                    />
                );
            },
            size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        },
        {
            accessorKey: "businessDevelopment.status",
            header: "BD Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "businessDevelopment");
                if (!hasAccess) {
                    return (
                        <StatusBadge
                            status={null}
                            isNotAvailable={true}
                        />
                    );
                }
                const status = getValue();
                const statusChangedAt = project.statusChangedAt?.businessDevelopmentStatus;
                return (
                    <StatusBadge
                        status={status || null}
                        isNotAvailable={false}
                        statusChangedAt={statusChangedAt}
                    />
                );
            },
            size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
        },
        {
            accessorKey: "masterProject.status",
            header: "Project Status",
            headerClassName: "table-head-cell",
            className: " ",
            cell: ({ getValue, row }) => {
                const project = row.original;
                const hasAccess = hasSection(project, "masterProject");
                if (!hasAccess) {
                    return (
                        <StatusBadge
                            status={null}
                            size="lg"
                            isNotAvailable={true}
                        />
                    );
                }
                const status = getValue();
                const statusChangedAt = project.statusChangedAt?.masterProjectStatus;
                return (
                    <StatusBadge
                        status={status || null}
                        size="lg"
                        isNotAvailable={false}
                        statusChangedAt={statusChangedAt}
                    />
                );
            },
            size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        },
        {
            id: "actions",
            header: "Actions",
            headerClassName: "table-head-cell",
            className: " ",
            enablePinning: true,
            cell: ({ row }) => {
                const project = row.original;
                const hasRecipe = Boolean(
                    project.latestRecipe ||
                    project.applicationLab?.recipeRef ||
                    project.applicationLab?.recipeCode ||
                    project.applicationLab?.recipeName
                );

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
                        <ProjectTaskStatsButton projectId={project._id} className="rounded-none" />
                        {hasRecipe ? (
                            <button
                                onClick={() => onViewRecipe?.(project)}
                                title="View Recipe Details"
                                aria-label="View Recipe Details"
                                className="action-button flex items-center justify-center gap-1.5 rounded-r-md lg:rounded-r-sm 3xl:rounded-r-md rounded-l-none hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                            >
                                <ChefHat className="action-button-icon" />
                            </button>
                        ) : (
                            <button
                                onClick={() => onCreateRecipe?.(project)}
                                title="Create Recipe"
                                aria-label="Create Recipe"
                                className="action-button flex items-center justify-center gap-1.5 rounded-r-md lg:rounded-r-sm 3xl:rounded-r-md rounded-l-none border border-[#EEEBF4] dark:border-primary-shade-2 hover:bg-purple-200 bg-primary-shade-2 transition-colors cursor-pointer"
                            >
                                <GoPlus className="action-button-icon" />
                            </button>
                        )}
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
            size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
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
                columnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
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
