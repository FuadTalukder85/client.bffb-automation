
import { getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import { RecordStatusBadge } from "./applicationLabRecords.columns";

export const RecordDetailActions = ({ onEdit, data }) => {
  return (
    <div className="flex items-center justify-center gap-0">
      <button
        onClick={() => onEdit?.(data)}
        title="Edit Record"
        aria-label="Edit Record"
        className="action-button flex items-center justify-center gap-1.5 rounded-md  text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
      >
       <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
      </button>
    </div>
  );
};

export const getRecordDetailsColumns = ({ serialOffset = 0, onEdit }) => [
  {
    id: "serial",
    header: "SL",
    headerClassName: "table-head-cell text-start sticky left-0 z-20 bg-background",
    cell: ({ row }) => (
      <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
        <span className="text-nav-highlight font-medium">{(serialOffset + row.index + 1)}</span>
      </div>
    ),
    size: getResponsiveSize({ lg: 37, xl: 50, '2xl': 56, '3xl': 70 }),
    enablePinning: true,
  },
  {
    accessorKey: "raisedDate",
    header: "Raised Date",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
  },
  {
    accessorKey: "projectStartDate",
    header: "Project Start Date",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    accessorKey: "lastProductionDate",
    header: "Last Production Date",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
  },
  {
    accessorKey: "nextProductionDate",
    header: "Next Production Date",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
  },
  {
    accessorKey: "recipeCode",
    header: "Recipe Code",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-bold text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    accessorKey: "recipeName",
    header: "Application Recipe Name",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="text-nav-highlight font-medium min-w-[150px]">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
  },
  {
    accessorKey: "applicationOfficer.name",
    header: "Application Officer",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
  },
  {
    accessorKey: "batchSize",
    header: "Batch Size (g)",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
  },
  {
    accessorKey: "output",
    header: "Output (pcs)",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
  },
  {
    accessorKey: "suggestions",
    header: "Application Suggestions",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight opacity-80 max-w-[200px] truncate" title={getValue()}>{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
  },
  {
    accessorKey: "hodStatus",
    header: "HOD Status",
    headerClassName: "table-head-cell",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.hodStatus} days={row.original.hodStatusDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 75, xl: 100, '2xl': 112, '3xl': 140 }),
  },
  {
    accessorKey: "hodEvaluation",
    header: "HOD Evaluation",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <span className="font-medium text-nav-highlight opacity-80 max-w-[200px] truncate" title={getValue()}>{getValue() || "—"}</span>,
    size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
  },
  {
    accessorKey: "sensoryApproval",
    header: "Approval for Sensory",
    headerClassName: "table-head-cell",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RecordStatusBadge status={row.original.sensoryApproval} days={row.original.sensoryApprovalDays} />
      </div>
    ),
    size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
  },
  {
    id: "actions",
    header: "Actions",
    headerClassName: "table-head-cell sticky right-0 z-20 bg-background text-center",
    cell: ({ row }) => <RecordDetailActions onEdit={onEdit} data={row.original} />,
    size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
    enablePinning: true,
  },
];


