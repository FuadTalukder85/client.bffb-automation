import { getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { Eye } from "lucide-react";

export const RecordStatusBadge = ({ status, days }) => {
  if (!status) return <GlobalStatusBadge status={null} />;

  return (
    <div className="flex flex-col items-center gap-1">
      <GlobalStatusBadge status={status} size="lg" />
      {days !== null && days !== undefined && (
        <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-muted-foreground opacity-70 font-medium whitespace-nowrap">
          {days === 0 ? 'today' : `${days} days`}
        </span>
      )}
    </div>
  );
};

export const ApplicationLabRecordActions = ({ onView, data }) => {
  return (
    <div className="flex items-center justify-center gap-0">
      <button
        onClick={() => onView?.(data)}
        title="View Details"
        aria-label="View Details"
        className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
      >
        <Eye className="action-button-icon" />
      </button>
    </div>
  );
};

export const getApplicationLabRecordsColumns = ({ serialOffset = 0, onView }) => [
  {
    id: "serial",
    header: "SL",
    headerClassName: "table-head-cell text-start sticky left-0 z-20 bg-background",
    cell: ({ row }) => (
      <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-5 bg-primary/10 rounded-full">
        <span className="font-medium text-nav-highlight">{(serialOffset + row.index + 1)}</span>
      </div>
    ),
    size: getResponsiveSize({ lg: 37, xl: 50, '2xl': 56, '3xl': 70 }),
    enablePinning: true,
  },
  {
    accessorKey: "projectCode",
    header: "Project Code",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-semibold text-nav-highlight">{getValue()}</span>,
    size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
  },
  {
    accessorKey: "projectName",
    header: "Project Name",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-semibold text-nav-highlight truncate max-w-[150px] inline-block">{getValue()}</span>,
    size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
  },
  {
    accessorKey: "raisedDate",
    header: "Raised Date",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-medium text-center text-nav-highlight/80 whitespace-nowrap">{getValue()}</span>,
    size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }),
  },
  {
    accessorKey: "pdStatus",
    header: "Product Development Status",
    headerClassName: "table-head-cell text-center",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.pdStatus} days={row.original.pdDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    accessorKey: "adStatus",
    header: "Application Development Status",
    headerClassName: "table-head-cell text-center",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.adStatus} days={row.original.adDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    accessorKey: "sensoryStatus",
    header: "Sensory Status",
    headerClassName: "table-head-cell text-center",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.sensoryStatus} days={row.original.sensoryDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
  },
  {
    accessorKey: "bdStatus",
    header: "Business Development Status",
    headerClassName: "table-head-cell text-center",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.bdStatus} days={row.original.bdDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    accessorKey: "projectStatus",
    header: "Project Status",
    headerClassName: "table-head-cell text-center",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.projectStatus} days={row.original.projectDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
  },
  {
    accessorKey: "hodStatus",
    header: "HOD Status",
    headerClassName: "table-head-cell text-center",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.hodStatus} days={row.original.hodDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-bold text-center text-nav-highlight whitespace-nowrap">{getValue()}</span>,
    size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }),
  },
  {
    accessorKey: "purposeName",
    header: "Purpose Name",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-semibold text-center text-nav-highlight whitespace-nowrap">{getValue()}</span>,
    size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
  },
  {
    accessorKey: "objective",
    header: "Objective",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-semibold text-center text-nav-highlight whitespace-nowrap">{getValue()}</span>,
    size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
  },
  {
    accessorKey: "objectiveDetails",
    header: "Objective Details",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="text-nav-highlight block text-center font-semibold min-w-[180px]">{getValue()}</span>,
    size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
  },
  {
    accessorKey: "category",
    header: "Application Category",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-semibold text-center text-nav-highlight whitespace-nowrap">{getValue()?.name}</span>,
    size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
  },
  {
    accessorKey: "subcategory",
    header: "Application Subcategory",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-semibold text-center text-nav-highlight whitespace-nowrap">{getValue()?.name}</span>,
    size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
  },
  {
    accessorKey: "subSubcategory",
    header: "Application Sub-subcategory",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => <span className="block font-semibold text-center text-nav-highlight whitespace-nowrap">{getValue()?.name}</span>,
    size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
  },
  {
    accessorKey: "tags",
    header: "Application Tags",
    headerClassName: "table-head-cell text-center",
    cell: ({ getValue }) => (
       <div className="flex flex-wrap justify-center gap-1">
         {getValue()?.map((tag, idx) => (
           <span key={idx} className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-nav-highlight font-semibold whitespace-nowrap">{tag.name}</span>
         ))}
       </div>
    ),
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    id: "actions",
    header: "Actions",
    headerClassName: "table-head-cell sticky right-0 z-20 bg-background text-center",
    cell: ({ row }) => <ApplicationLabRecordActions onView={onView} data={row.original} />,
    size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    enablePinning: true,
  },
];
