import RawMaterialTypeBadge from "../components/RawMaterialTypeBadge";
import RawMaterialActions from "../components/RawMaterialActions";
import { getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";

export const getRawMaterialsColumns = ({ serialOffset = 0, onEdit, onArchive, onRestore, onView, isArchived = false }) => [
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
    accessorKey: "name",
    header: "Raw Material Name",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => (
      <span className="font-medium text-nav-highlight">
        {getValue() || "—"}
      </span>
    ),
    size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
  },
  {
    accessorKey: "type",
    header: "Type",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => <RawMaterialTypeBadge type={getValue()} />,
    size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
  },
  {
    accessorKey: "cost",
    header: "Cost (৳/kg)",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => (
      <span className="font-medium text-nav-highlight">
        {getValue() || "—"}
      </span>
    ),
    size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
  },
  {
    id: "actions",
    header: "Actions",
    headerClassName: "table-head-cell",
    enablePinning: true,
    cell: ({ row }) => (
      <RawMaterialActions
        data={row.original}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        onView={onView}
        isArchived={isArchived || row.original.isActive === false}
      />
    ),
    size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    enableSorting: false,
    enableHiding: false,
  },
];
