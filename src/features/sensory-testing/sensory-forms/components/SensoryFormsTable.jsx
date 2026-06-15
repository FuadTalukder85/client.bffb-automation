import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye } from "lucide-react";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { applicationLabStatusOptions } from "../../../application-lab/application-recipes/constants/projectOptions";

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

export default function SensoryFormsTable({
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnPinning,
  onColumnPinningChange,
  columnSizing,
  onColumnSizingChange,
  onViewDetails,
  noDataMessage,
  noDataDescription,
  emptyState,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;


  const columns = useMemo(
    () => [
      {
            id: "serial",
            header: "SL",
            headerClassName: "table-head-cell text-center",
            cell: ({ row }) => (
                <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
                    <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
                </div>
            ),
            size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
            enableSorting: false,
            enableHiding: false,
            enablePinning: true,
        },
      {
        accessorKey: "projectCode",
        header: "Project Code",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-nav-highlight text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        accessorKey: "projectName",
        header: "Project Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-semibold max-w-50 truncate block mx-auto text-center w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorKey: "raisedDate",
        header: "Raised Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const value = getValue();
          const displayDate = value
            ? new Date(value).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—";
          return (
            <span className="font-medium text-center block w-full">
              {displayDate}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
      },
      {
        accessorKey: "purpose",
        header: "Purpose",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        accessorKey: "purposeName",
        header: "Purpose Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "objective",
        header: "Objective",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        accessorKey: "objectiveDetails",
        header: "Objective Details",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorKey: "applicationCategory",
        header: "Application Category",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => <span className="font-medium text-center block w-full">{getValue() || "—"}</span>,
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "applicationSubcategory",
        header: "Application Subcategory",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => <span className="font-medium text-center block w-full">{getValue() || "—"}</span>,
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
      },
      {
        accessorKey: "applicationSubSubcategory",
        header: "Application Sub-subcategory",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => <span className="font-medium text-center block w-full">{getValue() || "—"}</span>,
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        accessorKey: "applicationTags",
        header: "Application Tags",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
        cell: ({ row }) => {
          const tags = row.original.applicationTags;
          if (!tags || tags.length === 0) return <span className="text-muted-foreground">N/A</span>;
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              {tags.map((tag, idx) => (
                <span key={idx} className="bg-[#f0ebf8] text-[#7c5cc4] text-[10px] px-2 py-0.5 rounded-full border border-[#7c5cc4]/20 border-solid">
                  {tag}
                </span>
              ))}
            </div>
          );
        }
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
        enablePinning: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-0">
            <button 
              className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
              onClick={() => onViewDetails?.(row.original)}
              title="View Details"
              aria-label="View Details"
            >
              <Eye className="action-button-icon" />
            </button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      }
    ],
    [serialOffset, onViewDetails]
  );


  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
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
        columnPinning={columnPinning && (columnPinning.left?.length > 0 || columnPinning.right?.length > 0) ? columnPinning : { left: ["serial"], right: ["actions"] }}
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        headerRowClassName="bg-transparent"
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        tableClassName="custom-scrollbar"
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
        emptyState={emptyState}
      />
    </div>
  );
}


