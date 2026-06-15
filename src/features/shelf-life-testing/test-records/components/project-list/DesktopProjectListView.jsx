import React, { useMemo } from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye } from "lucide-react";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { ApplicationLabRecordsTableSkeleton } from "@/features/application-lab/application-lab-records/components/ApplicationLabRecordsTableSkeleton";

const StatusBadge = ({ label, days }) => {
  if (!label) return <GlobalStatusBadge status={null} />;

  return (
    <div className="flex flex-col items-center gap-1">
      <GlobalStatusBadge status={label} size="lg" />
      {days !== null && days !== undefined && (
        <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-muted-foreground whitespace-nowrap font-medium">
          {days === 0 ? "today" : `${days} days`}
        </span>
      )}
    </div>
  );
};

export default function DesktopProjectListView({
  isLoading,
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  setItemsPerPage,
  sorting,
  setSorting,
  onView,
  noDataMessage,
  noDataDescription,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const effectiveNoDataMessage = noDataMessage || "No Records Found";
  const effectiveNoDataDescription =
    noDataDescription ||
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
          <span className="font-medium text-nav-highlight text-center block w-full whitespace-nowrap px-4 tracking-tight">
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
          <span className="font-semibold block text-center w-full max-w-40 truncate mx-auto leading-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
      },
      {
        accessorKey: "raisedDate",
        header: "Raised Date",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => {
          const date = getValue();
          if (!date) return "—";
          return (
            <span className="text-center block w-full whitespace-nowrap px-2 font-medium">
              {date}
            </span>
          );
        },
        size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
      },
      {
        accessorKey: "adStatus",
        header: "Application Development Status",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.adStatus}
            days={row.original.adDays}
          />
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "sensoryStatus",
        header: "Sensory Status",
        headerClassName: "table-head-cell text-center",
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.sensoryStatus}
            days={row.original.sensoryDays}
          />
        ),
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
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
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
      },
      {
        accessorKey: "purposeName",
        header: "Purpose Name",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full px-2 leading-tight">
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
        size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
      },
      {
        accessorKey: "objectiveDetails",
        header: "Objective Details",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium block text-center w-full px-2 leading-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
      },
      {
        accessorKey: "category",
        header: "Application Category",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full px-2 leading-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "subcategory",
        header: "Application Subcategory",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full px-2 leading-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
      },
      {
        accessorKey: "subSubcategory",
        header: "Application Sub-subcategory",
        headerClassName: "table-head-cell text-center",
        cell: ({ getValue }) => (
          <span className="font-medium text-center block w-full px-2 leading-tight">
            {getValue() || "—"}
          </span>
        ),
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
      },
      {
        accessorKey: "tags",
        header: "Application Tags",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
        cell: ({ row }) => {
          const tags = row.original.tags;
          if (!tags || tags.length === 0)
            return (
              <span className="text-muted-foreground block text-center">
                N/A
              </span>
            );
          return (
            <div className="flex flex-wrap gap-1 justify-center px-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#f0ebf8] text-[#7c5cc4] text-[10px] px-2 py-0.5 rounded-full border border-[#7c5cc4]/20 border-solid whitespace-nowrap uppercase font-bold tracking-tight"
                >
                  {tag}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "table-head-cell text-center",
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
        enablePinning: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-0">
            <button
              className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
              onClick={() => onView?.(row.original)}
              title="View Details"
              aria-label="View Details"
            >
              <Eye className="action-button-icon" />
            </button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [serialOffset, onView]
  );

  if (isLoading) {
    return <ApplicationLabRecordsTableSkeleton rows={5} />;
  }

  return (
    <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={data}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        columnPinning={{ left: ["serial"], right: ["actions"] }}
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        headerRowClassName="bg-transparent"
        bodyRowClassName="border-0 group hover:bg-muted/30 transition-colors"
        bodyCellClassName="first:pl-6 last:pr-6 py-1.5"
        tableClassName="custom-scrollbar"
        noDataMessage={effectiveNoDataMessage}
        noDataDescription={effectiveNoDataDescription}
      />
    </div>
  );
}
