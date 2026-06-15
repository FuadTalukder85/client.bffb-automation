import React from "react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Eye } from "lucide-react";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { applicationLabStatusOptions } from "../constants/projectOptions";
import { GoPlus } from "react-icons/go";

// Application Lab specific StatusBadge wrapper
const StatusBadge = ({
  status,
  size = "sm",
  isNotAvailable = false,
  statusChangedAt = null,
}) => {
  const statusOption = applicationLabStatusOptions.find(
    (option) => option.label === status || option.value === status,
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

export default function DesktopApplicationRecipesTable({
  projects,
  currentPage = 1,
  itemsPerPage = 10,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onViewDetails,
  onCreateRecipe,
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
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "table-head-cell text-start",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
          <span className="text-nav-highlight">
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
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className="font-medium text-nav-highlight">{value || "—"}</span>
        );
      },
      size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
    },
    {
      accessorKey: "projectName",
      header: "Project Name",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <div className="relative max-w-50 group">
            <span
              className="font-semibold truncate block"
            >
              {value || "—"}
            </span>
            {value ? (
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden min-w-[180px] max-w-[320px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-lg shadow-slate-900/10 group-hover:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                {value}
              </div>
            ) : null}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      accessorKey: "raisedDate",
      header: "Raised Date",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const value = getValue();
        const displayDate = value
          ? new Date(value).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A";

        return <span className="font-medium">{displayDate}</span>;
      },
      size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
    },
    {
      id: "latestRecipeCreatedAt",
      header: "Latest Recipe Creation Date",
      headerClassName: "table-head-cell",
      className: " ",
      accessorFn: (row) => row.latestRecipe?.createdAt ?? null,
      cell: ({ getValue }) => {
        const value = getValue();
        const displayDate = value
          ? new Date(value).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A";

        return <span className="font-medium">{displayDate}</span>;
      },
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      id: "recipeCode",
      header: "Recipe Code",
      headerClassName: "table-head-cell",
      className: " ",
      accessorFn: (row) => row.latestRecipe?.recipeCode ?? null,
      cell: ({ getValue }) => (
        <span className="font-medium text-primary">{getValue() || "N/A"}</span>
      ),
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      id: "recipeName",
      header: "Application Recipe Name",
      headerClassName: "table-head-cell",
      className: " ",
      accessorFn: (row) => row.latestRecipe?.recipeName ?? null,
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className="font-medium max-w-50 truncate block">
            {value || "N/A"}
          </span>
        );
      },
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      accessorKey: "applicationCategory",
      header: "Application Category",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const value = getValue();
        let displayValue = "N/A";
        if (typeof value === "object" && value !== null) {
          displayValue = value.name || value.label || "N/A";
        } else if (value) {
          displayValue = value;
        }

        return <span className="font-medium">{displayValue}</span>;
      },
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      accessorKey: "applicationSubCategory",
      header: "Application Subcategory",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const value = getValue();
        let displayValue = "N/A";
        if (typeof value === "object" && value !== null) {
          displayValue = value.name || value.label || "N/A";
        } else if (value) {
          displayValue = value;
        }

        return <span className="font-medium">{displayValue}</span>;
      },
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      accessorKey: "applicationSubSubCategory",
      header: "Application Sub-subcategory",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const value = getValue();
        let displayValue = "N/A";
        if (typeof value === "object" && value !== null) {
          displayValue = value.name || value.label || "N/A";
        } else if (value) {
          displayValue = value;
        }

        return <span className="font-medium">{displayValue}</span>;
      },
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      accessorKey: "applicationTags",
      header: "Application Tags",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const tags = getValue();

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return <span className="text-muted-foreground">N/A</span>;
        }

        return (
          <div className="flex justify-center flex-wrap gap-1">
            {tags.map((tag, index) => {
              const tagName =
                typeof tag === "object" && tag !== null
                  ? tag.name || tag.label || tag.value || String(tag)
                  : String(tag);

              return (
                <span
                  key={index}
                  className="px-2 lg:px-1 xl:px-1 2xl:px-1.5 3xl:px-2 py-0.5 lg:py-[1px] 2xl:py-0.5 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                >
                  {tagName}
                </span>
              );
            })}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      accessorKey: "pdStatus",
      header: "Product Development Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const status = row.original.pdStatus;
        return (
          <StatusBadge
            status={status || null}
            isNotAvailable={false}
            statusChangedAt={
              row.original.statusChangedAt?.productDevelopmentStatus
            }
          />
        );
      },
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      accessorKey: "applicationDevelopmentStatus",
      header: "Application Development Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const status = row.original.applicationDevelopmentStatus;
        return (
          <StatusBadge
            status={status || null}
            isNotAvailable={false}
            statusChangedAt={row.original.statusChangedAt?.applicationLabStatus}
          />
        );
      },
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      accessorKey: "sensoryStatus",
      header: "Sensory Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const status = row.original.sensoryStatus;
        return (
          <StatusBadge
            status={status || null}
            isNotAvailable={false}
            statusChangedAt={row.original.statusChangedAt?.sensoryLabStatus}
          />
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "bdStatus",
      header: "Business Development Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const status = row.original.bdStatus;
        return (
          <StatusBadge
            status={status || null}
            isNotAvailable={false}
            statusChangedAt={
              row.original.statusChangedAt?.businessDevelopmentStatus
            }
          />
        );
      },
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      accessorKey: "projectStatus",
      header: "Project Status",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => {
        const status = row.original.projectStatus;
        return (
          <StatusBadge
            status={status || null}
            size="lg"
            isNotAvailable={false}
            statusChangedAt={row.original.statusChangedAt?.masterProjectStatus}
          />
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell",
      className: " ",
      enablePinning: true,
      cell: ({ row }) => {
        const project = row.original;
        const hasRecipe = project.latestRecipe != null;

        return (
          <div className="flex items-center justify-center gap-0">
            {hasRecipe ? (
              <button
                onClick={() => onViewDetails?.(project)}
                title="View Details"
                aria-label="View Details"
                className="action-button flex items-center justify-center bg-primary-shade-2 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors border border-transparent"
              >
                <Eye className="action-button-icon" />
              </button>
            ) : (
              <button
                onClick={() => onCreateRecipe?.(project)}
                title="Create Recipe"
                aria-label="Create Recipe"
                className="action-button flex items-center justify-center border border-[#EEEBF4] dark:border-primary-shade-2 rounded-md cursor-pointer"
              >
                <GoPlus className="action-button-icon" />
              </button>
            )}
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
        columnPinning={
          columnPinning && (columnPinning.left || columnPinning.right)
            ? columnPinning
            : { left: ["serial"], right: ["actions"] }
        }
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        bodyRowClassName="border-0"
        bodyCellClassName=" first:pl-6 last:pr-6 py-0.5"
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
