import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { PERMISSIONS } from "@/constants/permissions";
import { AiFillThunderbolt } from "react-icons/ai";
import { getDaysSince, hasPermission } from "@/lib/utils";
import GlobalStatusBadge from "@/components/ui/StatusBadge";

const ProjectStatusBadge = ({ status, days }) => (
  <div className="flex flex-col items-center gap-1">
    <GlobalStatusBadge status={status || null} size="sm" />
    {days !== null && days !== undefined && (
      <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-[#0D111A]">
        {days === 0 ? "today" : `${days} Day(s)`}
      </span>
    )}
  </div>
);

const DispatchTypeBadge = ({ type, days }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] px-5 lg:px-3 xl:px-3.5 2xl:px-4 3xl:px-5 py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 font-bold capitalize tracking-wider rounded-full bg-[#D4DEFF] text-blue-600 text-sub-text">
      {type || "—"}
    </span>
    {days !== null && days !== undefined && (
      <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-[#0D111A]">
        {days === 0 ? "today" : `${days} Day(s)`}
      </span>
    )}
  </div>
);

export default function DesktopDispatchTable({
  data,
  currentPage = 1,
  itemsPerPage = 20,
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
  permissions = [],
  emptyState,
  isArchived = false,
  selectedRowIds = [],
  onSelectionChange,
  onBulkArchiveClick,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const noDataMessage = "No Records Found";
  const noDataDescription =
    "No records match your current filters. Try adjusting your search or filter criteria.";

  const columns = useMemo(
    () => [
      {
        id: "serial",
        header: "SL",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => (
          <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
            <span className="text-nav-highlight font-semibold">
              {serialOffset + row.index + 1}
            </span>
          </div>
        ),
        size: getResponsiveSize({ lg: 37, xl: 50, '2xl': 56, '3xl': 70 }),
        enableSorting: false,
        enableHiding: false,
        enablePinning: true,
      },
      {
        accessorFn: (row) =>
          row.recipe?.project?.masterProject?.code || row.recipe?.project?.code,
        id: "projectCode",
        header: "Project Code",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-nav-highlight text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorFn: (row) =>
          row.recipe?.project?.masterProject?.title || row.recipe?.project?.title,
        id: "projectName",
        header: "Project Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-semibold block text-center w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorFn: (row) =>
          row.recipe?.project?.masterProject?.purposeDetails ||
          row.recipe?.project?.productDevelopment?.brief ||
          row.recipe?.project?.masterProject?.purpose,
        id: "purposeName",
        header: "Purpose Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full">{getValue() || "—"}</span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorFn: (row) =>
          row.recipe?.project?.masterProject?.objectiveDetails ||
          row.recipe?.project?.masterProject?.objective ||
          row.recipe?.project?.productDevelopment?.objective,
        id: "objectiveDetails",
        header: "Objective Details",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full">{getValue() || "—"}</span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorFn: (row) =>
          row.recipe?.project?.masterProject?.status || row.recipe?.project?.projectStatus,
        id: "projectStatus",
        header: "Project Status",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue, row }) => {
          const status = getValue();
          const days = getDaysSince(row.original.requisitionDate);
          return <ProjectStatusBadge status={status} days={days} />;
        },
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        accessorKey: "dispatchType",
        header: "Dispatch Type",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue, row }) => {
          const type = getValue();
          const days = getDaysSince(row.original.requisitionDate);
          return <DispatchTypeBadge type={type} days={days} />;
        },
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        accessorFn: (row) => row.recipe?.recipeCode,
        id: "recipeCode",
        header: "Recipe Code",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorFn: (row) => row.recipe?.name,
        id: "recipeName",
        header: "Application Recipe Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 117, xl: 157, '2xl': 176, '3xl': 220 }),
      },
      {
        accessorKey: "requisitionDate",
        header: "Requisition Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span className="text-center block w-full">
              {val
                ? new Date(val).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
      },
      {
        accessorFn: (row) => row.requisitionBy?.name,
        id: "requisitionBy",
        header: "Requisition By",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full">{getValue() || "—"}</span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "sendTo",
        header: "Send To",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full">{getValue() || "—"}</span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "productionDate",
        header: "Production Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span className="text-center block w-full">
              {val
                ? new Date(val).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full">{getValue() || "—"}</span>
        ),
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        accessorKey: "pieces",
        header: "Pieces",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="text-center block w-full">{getValue() || "—"}</span>
        ),
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
      },
      {
        accessorKey: "deliveryDate",
        header: "Delivery Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <span className="text-center block w-full">
              {val
                ? new Date(val).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
      },
      {
        accessorKey: "remark",
        header: "Remark",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="truncate max-w-[200px] block text-center w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorKey: "clientFeedback",
        header: "Client Feedback",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="truncate max-w-[200px] block text-center w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        enablePinning: true,
        cell: ({ row }) => {
          const record = row.original;
          const isActive = record.isActive;
          return (
            <div className="flex items-center justify-center gap-0">
              {isActive ? (
                <>
                  {hasPermission(permissions, PERMISSIONS.DISPATCH.UPDATE) && (
                    <button
                      onClick={() => onEdit?.(record)}
                      title="Edit"
                      className="action-button flex items-center justify-center gap-1.5 rounded-l-md rounded-r-none hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                    >
                      <svg
                        className="action-button-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                  {hasPermission(permissions, PERMISSIONS.DISPATCH.DELETE) && (
                    <button
                      onClick={() => onArchive?.(record)}
                      title="Archive"
                      className="action-button flex items-center justify-center text-base-color hover:text-red-600 hover:bg-red-50 bg-background border-2 border-primary-shade-2 border-l-0 rounded-r-md rounded-l-none transition-colors cursor-pointer"
                    >
                      <svg
                        className="action-button-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                hasPermission(permissions, PERMISSIONS.DISPATCH.UPDATE) && (
                  <button
                    onClick={() => onRestore?.(record)}
                    title="Restore"
                    className="action-button flex items-center justify-center text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 rounded-md transition-colors cursor-pointer"
                  >
                    <AiFillThunderbolt className="action-button-icon" />
                  </button>
                )
              )}
            </div>
          );
        },
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [serialOffset, permissions, onEdit, onArchive, onRestore]
  );

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        enableSelection={!isArchived}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => item.isActive ?? true}
        onBulkArchiveClick={onBulkArchiveClick}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnPinning={
          columnPinning &&
          (columnPinning.left?.length > 0 || columnPinning.right?.length > 0)
            ? columnPinning
            : { left: ["serial"], right: ["actions"] }
        }
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        headerRowClassName="bg-transparent"
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        tableClassName="custom-scrollbar"
        emptyState={emptyState}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
      />
    </div>
  );
}

