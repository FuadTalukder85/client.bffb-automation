import React, { useState } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import { Undo2 } from "lucide-react";
import { EditTaskModal } from "./EditTaskModal";
import { ArchiveTaskModal } from "./ArchiveTaskModal";
import { RestoreTaskModal } from "./RestoreTaskModal";
import TruncatedText from "@/components/common/truncated-text";
import { formatDate } from "@/utils/dateFormatter";
import { getStatusColor } from "@/constants/statusColors";

// Helper to format status
const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const DesktopSingleProjectTaskTable = ({
  tasks = [],
  isLoading,
  onArchive,
  onRestore,
  onEditSuccess,
  showTooltips = true,
  currentPage = 1,
  itemsPerPage = 10,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  noDataMessage,
  noDataDescription,
  emptyState,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const serialOffset = (currentPage - 1) * itemsPerPage;

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
        id: "task",
        header: "Task",
        headerClassName: "table-head-cell",
        cell: () => (
          <div className="flex flex-col gap-1">
            <Skeleton className="w-full max-w-[150px] h-4" />
            <Skeleton className="w-full max-w-[100px] h-3" />
          </div>
        ),
        size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
      },
      {
        id: "team",
        header: "Team",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-24 h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "assignedTo",
        header: "Assigned To",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-24 h-5" />,
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
        id: "completedAt",
        header: "Completed Date",
        headerClassName: "table-head-cell",
        cell: () => <Skeleton className="w-24 h-5" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
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
          <div className="flex items-center justify-end gap-0">
            <Skeleton className="w-9 h-9 rounded-l-md" />
            <Skeleton className="w-9 h-9 rounded-r-md" />
          </div>
        ),
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
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

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDelete = (task) => {
    setSelectedTask(task);
    setIsArchiveModalOpen(true);
  };

  const handleReactivate = (task) => {
    setSelectedTask(task);
    setIsRestoreModalOpen(true);
  };

  const handleArchiveConfirm = (task) => {
    onArchive?.(task);
    setIsArchiveModalOpen(false);
    setSelectedTask(null);
  };

  const handleRestoreConfirm = (task) => {
    onRestore?.(task);
    setIsRestoreModalOpen(false);
    setSelectedTask(null);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
    onEditSuccess?.();
  };

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
      id: "task",
      header: "Task",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const { title } = row.original;
        return (
          <div className="flex flex-col min-w-0">
            <TruncatedText
              text={title || "Untitled"}
              className="font-medium text-nav-highlight"
              showTooltip={showTooltips}
            />
          </div>
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "description",
      header: "Description",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const { description } = row.original;
        return (
          <div className="flex flex-col min-w-0">
            <TruncatedText
          text={description || "N/A"}
          className="text-foreground"
          showTooltip={showTooltips}
        />
          </div>
        );
      },
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      id: "team",
      header: "Team",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => (
        <TruncatedText
          text={row.original.team?.name || "N/A"}
          className="text-foreground"
          showTooltip={showTooltips}
        />
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => (
        <TruncatedText
          text={row.original.assignedTo?.name || row.original.assignedTo?.username || "Unassigned"}
          className="text-foreground"
          showTooltip={showTooltips}
        />
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "status",
      header: "Task Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const status = formatStatus(getValue());
        return (
          <span
            className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-[2px] xl:py-[2.5px] 2xl:py-[3.5px] 3xl:py-1 font-medium rounded-full inline-flex items-center justify-center"
            style={getStatusColor(status)}
          >
            {status}
          </span>
        );
      },
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },

    {
      accessorKey: "completedAt",
      header: "Completed Date",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => row.original?.completedAt ? formatDate(row.original?.completedAt) : "N/A",
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
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
      accessorKey: "dueDate",
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
      cell: ({ row }) => {
        const task = row.original;
        const isTaskActive = task.isActive !== false;
        return (
          <div className="flex items-center justify-end gap-0">
            {isTaskActive ? (
              <>
                <button
                  onClick={() => handleEdit(task)}
                  title="Edit Task"
                  aria-label="Edit Task"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-l-md rounded-r-none text-base-color dark:text-nav-highlight hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  title="Archive Task"
                  aria-label="Archive Task"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-r-md rounded-l-none text-base-color dark:text-nav-highlight hover:text-red-600 hover:bg-red-50 bg-background border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                </button>
              </>
            ) : (
                <button
                  onClick={() => handleReactivate(task)}
                  title="Restore Task"
                  aria-label="Restore Task"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-md 2xl:h-9 2xl:px-3 2xl:py-1.5 3xl:h-10 3xl:px-3 3xl:py-2 text-nav-highlight border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <Undo2 className="action-button-icon" />
                </button>
            )}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <>
      <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
        <PaginatedTable
          data={tasks}
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

      {/* Edit Modal */}
      {selectedTask && (
        <EditTaskModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          task={selectedTask}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Archive Modal */}
      {selectedTask && (
        <ArchiveTaskModal
          open={isArchiveModalOpen}
          onOpenChange={setIsArchiveModalOpen}
          task={selectedTask}
          onConfirm={handleArchiveConfirm}
        />
      )}

      {/* Restore Modal */}
      {selectedTask && (
        <RestoreTaskModal
          open={isRestoreModalOpen}
          onOpenChange={setIsRestoreModalOpen}
          task={selectedTask}
          onConfirm={handleRestoreConfirm}
        />
      )}
    </>
  );
};

