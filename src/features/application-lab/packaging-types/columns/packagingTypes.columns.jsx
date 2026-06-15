import { getResponsiveSize } from "@/components/ui/PaginatedTable/PaginatedTable";
import PackagingTypeActions from "../components/PackagingTypeActions";

export const getPackagingTypesColumns = ({ serialOffset = 0, onEdit, onArchive, onRestore, isArchived = false }) => [
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
    accessorKey: "name",
    header: "Packaging Type",
    headerClassName: "table-head-cell",
    cell: ({ getValue }) => (
      <span className="font-medium text-nav-highlight">
        {getValue() || "—"}
      </span>
    ),
    minSize: 400,
    size: getResponsiveSize({ lg: 320, xl: 427, '2xl': 480, '3xl': 600 }),
  },
  {
    id: "actions",
    header: "Actions",
    headerClassName: "table-head-cell",
    enablePinning: true,
    cell: ({ row }) => (
      <PackagingTypeActions
        data={row.original}
        onEdit={onEdit}
        onArchive={onArchive}
        onRestore={onRestore}
        isArchived={isArchived}
      />
    ),
    size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    enableSorting: false,
    enableHiding: false,
  },
];
