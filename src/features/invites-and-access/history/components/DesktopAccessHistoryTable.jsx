import React from "react";
import { ClipboardList, Eye } from "lucide-react";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import { format } from "date-fns";

// Utility Functions
const formatName = (user) => {
  if (!user) return "-";
  return user.name || user.email || "-";
};

const safeDisplayValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if ("from" in value || "to" in value) {
      const from = safeDisplayValue(value.from);
      const to = safeDisplayValue(value.to);
      if (from && to) return `${from} → ${to}`;
      return to || from || "";
    }
    if (value.name) return value.name;
    return JSON.stringify(value);
  }
  return String(value);
};

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "-", time: "-" };
  try {
    const date = new Date(isoString);
    return {
      date: format(date, "dd/MM/yyyy"),
      time: format(date, "hh:mm a"),
    };
  } catch {
    return { date: "-", time: "-" };
  }
};

export function DesktopAccessHistoryTable({
  searchResults = [],
  isSearching,
  searchError, // eslint-disable-line no-unused-vars
  errorMessage,
  hasError,
  selectedFilter,
  searchTerm,
  onView,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
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
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No history records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No history records match your current filters. Try adjusting your search or filter criteria.";

  if (isSearching) {
    const skeletonData = Array.from({ length: 5 }).map((_, i) => ({ id: i }));
    const skeletonColumns = [
      {
        id: "serial",
        header: "SL",
        headerClassName: "text-start",
        className: " ",
        cell: () => <Skeleton className="w-8 h-8 rounded-full" />,
        size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
      },
      {
        id: "managedBy",
        header: "Managed By",
        headerClassName: "",
        className: " ",
        cell: () => (
          <div className="flex flex-col gap-1">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-48 h-3" />
          </div>
        ),
        size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
      },
      {
        id: "target",
        header: selectedFilter === "permissions" ? "Role" : (selectedFilter === "invites" ? "User" : "Managed User"),
        headerClassName: "",
        className: " ",
        cell: () => (
          <div className="flex flex-col gap-1">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-48 h-3" />
          </div>
        ),
        size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
      },
      {
        id: "action",
        header: "Action",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-24 h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "date",
        header: "Date",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-20 h-5" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "time",
        header: "Time",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-16 h-5" />,
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-center",
        className: "",
        cell: () => (
          <div className="flex justify-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        ),
        size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
      },
    ];

    return (
      <div className="w-full hidden md:flex md:flex-1 md:flex-col md:min-h-0">
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
      headerClassName: "table-head-cell",
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
      id: "managedBy",
      header: "Managed By",
      headerClassName: "",
      className: " ",
      cell: ({ row }) => {
        const history = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-nav-highlight">
              {formatName(history.managedBy)}
            </span>
            <span className="text-xs text-muted-foreground">
              {safeDisplayValue(history.managedBy?.department)} | {safeDisplayValue(history.managedBy?.email)}
            </span>
          </div>
        );
      },
      size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
    },
    {
      id: "target",
      header: selectedFilter === "permissions" ? "Role" : (selectedFilter === "invites" ? "User" : "Managed User"),
      headerClassName: "",
      className: " ",
      cell: ({ row }) => {
        const history = row.original;
        if (selectedFilter === "permissions") {
          const roleName = safeDisplayValue(history.targetId?.name || history.changes?.roleName || history.changes?.name) || "-";
          return <span className="font-medium text-nav-highlight">{roleName}</span>;
        }

        let displayName = "-";
        let displaySub = "";

        if (selectedFilter === "invites") {
          const email = safeDisplayValue(history.changes?.email || history.targetId?.email);
          displayName = email || "-";
          displaySub = safeDisplayValue(history.changes?.department || history.targetId?.department);
        } else if (selectedFilter === "roles") {
          const user = history.targetId;
          displayName = formatName(user);
          const dept = safeDisplayValue(user?.department);
          const email = safeDisplayValue(user?.email);
          displaySub = [dept, email].filter(Boolean).join(" | ");
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-nav-highlight">{displayName}</span>
            <span className="text-xs text-muted-foreground">{displaySub}</span>
          </div>
        );
      },
      size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
    },
    {
      accessorKey: "action",
      header: "Action",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => (
        <span className="capitalize font-medium">
          {getValue()?.toLowerCase().replace(/_/g, " ")}
        </span>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "date",
      header: "Date",
      headerClassName: "",
      className: " ",
      cell: ({ row }) => formatDateTime(row.original.createdAt).date,
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    {
      id: "time",
      header: "Time",
      headerClassName: "",
      className: " ",
      cell: ({ row }) => formatDateTime(row.original.createdAt).time,
      size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-center",
      className: " ",
      enablePinning: true,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0 py-1 3xl:py-2.5">
          <button
              onClick={() => onView?.(row.original)}
              title="View Details"
              aria-label="View Details"
              className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-md text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
              <Eye className="action-button-icon" />
          </button>
        </div>
      ),
      size: getResponsiveSize({ lg: 53, xl: 71, '2xl': 80, '3xl': 100 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="w-full hidden md:flex md:flex-1 md:flex-col md:min-h-0">
      <PaginatedTable
        data={searchResults}
        columns={columns}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
         // Adapt columnPinning logic
        columnPinning={columnPinning && (columnPinning.left || columnPinning.right) ? columnPinning : { left: ["serial"], right: ["actions"] }}
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
        emptyState={
          hasError ? (
            <div className="py-10 text-center text-red-500">
              {errorMessage}
            </div>
          ) : null
        }
      />
    </div>
  );
}
