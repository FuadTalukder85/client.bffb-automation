import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatDate, getDurationInDays } from "@/utils/dateFormatter";
import TruncatedText from "@/components/common/truncated-text";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { useProjectStats } from "@/hooks/useProjectTasks";

function ManageTasksDesktopAction({ project, onManageTasks }) {
  const projectId = project._id || project.id;
  const { data: stats, isLoading } = useProjectStats(projectId);

  const pendingCount = stats?.pending || 0;
  const inProgressCount = stats?.in_progress || 0;
  const totalCount = pendingCount + inProgressCount;

  return (
    <button
      onClick={() => onManageTasks?.(project)}
      className="relative flex items-center justify-center gap-1.5 w-auto h-8 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold rounded-md text-nav-highlight bg-primary-shade-2 border border-primary-shade-2 hover:bg-primary-shade-2/80 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      Manage Tasks
      {!isLoading && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center bg-white border border-primary/20 dark:bg-background rounded-md px-1 py-0.5 text-[10px] lg:text-[8px] 2xl:text-[9px] 3xl:text-[10px] font-bold shadow-sm z-10 leading-none">
          <span className="text-yellow-600 dark:text-yellow-500">{pendingCount}</span>
          <span className="mx-0.5 text-muted-foreground h-2.5 w-[1px] bg-primary/25 dark:bg-primary"></span>
          <span className="text-blue-600 dark:text-blue-500">{inProgressCount}</span>
        </span>
      )}
    </button>
  );
}

// Helper to format status for display
const formatStatus = (status) => {
  if (!status) return "Not Started";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Helper to generate project code
const generateProjectCode = (project) => {
  if (project.projectCode) return project.projectCode;
  if (project.code) return project.code;
  // Generate a placeholder code from ID if available
  const id = project._id || project.id || "";
  if (id) {
    return `PJR ${id.slice(-6).toUpperCase()}`;
  }
  return "N/A";
};

export function DesktopProjectTaskTable({
  projects = [],
  isLoading,
  selectedFilter,
  searchTerm,
  onManageTasks,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  emptyState,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  if (isLoading) {
    const skeletonData = Array.from({ length: 5 }).map((_, i) => ({ id: i }));
    const skeletonColumns = [
      {
        id: "serial",
        header: "SL",
        headerClassName: "table-head-cell text-start",
        cell: () => <Skeleton className="w-8 h-8 rounded-full" />,
        size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
      },
      {
        id: "name",
        header: "Project",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        id: "projectCode",
        header: "Project Code",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-20 h-6 rounded-full" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "duration",
        header: "Duration",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-12 h-5" />,
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
      },
      {
        id: "startDate",
        header: "Start Date",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-24 h-5" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "endDate",
        header: "End Date",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-24 h-5" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        cell: () => (
          <div className="flex items-center justify-end">
            <Skeleton className="w-28 h-8 rounded-full" />
          </div>
        ),
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
    ];

    return (
      <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
        <PaginatedTable
          data={skeletonData}
          columns={skeletonColumns}
          className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
          rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
          enableSorting={false}
          enableColumnResizing={false}
          enablePinning={true}
          enableHiding={false}
          bodyRowClassName="border-0 hover:bg-transparent"
          bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
          showFooter={false}
        />
      </div>
    );
  }

  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "table-head-cell text-start",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-6 p-2 2xl:size-8 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
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
      header: "Project",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => <TruncatedText text={getValue() || "Untitled Project"} className="font-medium text-nav-highlight" />,
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      id: "projectCode",
      header: "Project Code",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => generateProjectCode(row.original),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "status",
      header: "Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const status = formatStatus(getValue());
        return <GlobalStatusBadge status={status} size="lg" />;
      },
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    {
      id: "duration",
      header: "Duration",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => getDurationInDays(row.original.startDate, row.original.endDate, "N/A"),
      size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => formatDate(getValue()),
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => formatDate(getValue()),
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-center",
      className: " ",
      enablePinning: true,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0">
          <ManageTasksDesktopAction project={row.original} onManageTasks={onManageTasks} />
        </div>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
      <PaginatedTable
        data={projects}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
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
