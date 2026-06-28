import { AiFillThunderbolt } from "react-icons/ai";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { Skeleton } from "@/components/ui/Skeleton";
import { format } from "date-fns";
import { MdLockOpen, MdLockReset } from "react-icons/md";

const DesktopManageUserTable = ({
  searchResults = [],
  isSearching,
  searchError,
  errorMessage,
  hasError,
  onRetry,
  selectedFilter, // eslint-disable-line no-unused-vars
  searchTerm, // eslint-disable-line no-unused-vars
  onEdit,
  onDelete, // Archive
  onReactivate, // Restore
  onUpdatePassword,
  onUnblock,
  canUpdatePassword = false,
  canDeleteUser = false,
  canUnblockUser = false,
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
  isArchived = false,
  selectedRowIds = [],
  onSelectionChange,
  onBulkArchiveClick,
}) => {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No employees match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No employees match your current filters. Try adjusting your search or filter criteria.";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "N/A";
    }
  };

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
        id: "name",
        header: "Name",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "email",
        header: "Email",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      },
      {
        id: "department",
        header: "Department",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "role",
        header: "Role",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
      },
      {
        id: "joinDate",
        header: "Join Date",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "leaveDate",
        header: "Leave Date",
        headerClassName: "",
        className: " ",
        cell: () => <Skeleton className="w-full h-5" />,
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-center",
        className: "",
        cell: () => (
          <div className="flex justify-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        ),
        size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
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
      accessorKey: "name",
      header: "Name",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => (
        <span className="font-semibold text-nav-highlight">
          {getValue() || "N/A"}
        </span>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "email",
      header: "Email",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => (
        <span className="font-medium">
            {getValue() || "N/A"}
        </span>
      ),
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      accessorKey: "department",
      header: "Department",
      headerClassName: "",
      className: " ",
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "role",
      header: "Role",
      headerClassName: "",
      className: " ",
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "joinDate",
      header: "Join Date",
      headerClassName: "",
      className: " ",
      cell: ({ row }) => formatDate(row.original.joinDate || row.original.createdAt),
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    {
      accessorKey: "leaveDate",
      header: "Leave Date",
      headerClassName: "",
      className: " ",
      cell: ({ getValue }) => getValue() || "N/A",
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: " text-center",
      className: "",
      enablePinning: true,
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.isActive !== false;
        const isLocked = Boolean(
          user?.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()
        );
        const isBlockedFilter = selectedFilter === "blocked";
        const showUpdatePassword =
          !isBlockedFilter && canUpdatePassword && typeof onUpdatePassword === "function";
        const showDeleteUser =
          !isBlockedFilter && canDeleteUser && typeof onDelete === "function";
        const showEdit = !isBlockedFilter;
        const showUnblockUser =
          canUnblockUser &&
          typeof onUnblock === "function" &&
          isLocked &&
          (selectedFilter === "blocked" || selectedFilter === "all");

        const actionButtons = [];
        if (showUnblockUser) {
          actionButtons.push({
            key: "unblock",
            title: "Unblock",
            onClick: () => onUnblock?.(user),
            icon: <MdLockOpen className="action-button-icon" />,
            outlineClasses:
              "action-button flex items-center justify-center text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke",
            fillClasses:
              "action-button flex items-center justify-center bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
          });
        }
        if (showUpdatePassword) {
          actionButtons.push({
            key: "updatePassword",
            title: "Update Password",
            onClick: () => onUpdatePassword?.(user),
            icon: <MdLockReset className="action-button-icon" />,
            outlineClasses:
              "action-button flex items-center justify-center text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke",
            fillClasses:
              "action-button flex items-center justify-center bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
          });
        }
        if (showEdit) {
          actionButtons.push({
            key: "edit",
            title: "Edit",
            onClick: () => onEdit?.(user),
            icon: (
              <svg
                className="action-button-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="4"
                height="4"
                viewBox="0 0 16 16"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            outlineClasses:
              "action-button flex items-center justify-center text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke",
            fillClasses:
              "action-button flex items-center justify-center bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
          });
        }
        if (showDeleteUser) {
          actionButtons.push({
            key: "delete",
            title: "Archive",
            onClick: () => onDelete?.(user),
            icon: (
              <svg
                className="action-button-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="4"
                height="4"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
                />
              </svg>
            ),
            outlineClasses:
              "action-button flex items-center justify-center text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
            fillClasses:
              "action-button flex items-center justify-center bg-primary-shade-2 text-base-color hover:text-nav-highlight hover:bg-primary-shade-2/80 border border-nav-highlight/15 border-l-table-stroke",
          });
        }

        const getActionButtonClass = (index, action) => {
          const isSingle = actionButtons.length === 1;
          const isFirst = index === 0;
          const isLast = index === actionButtons.length - 1;
          const shapeClass = isSingle
            ? "rounded-l-md rounded-r-md"
            : isFirst
            ? "rounded-l-md rounded-r-none"
            : isLast
            ? "rounded-r-md rounded-l-none"
            : "rounded-none";
          const styleClass = index % 2 === 0 ? action.outlineClasses : action.fillClasses;
          return `${shapeClass} ${styleClass}`;
        };

        return (
          <div className="flex items-center justify-end gap-0 py-1 3xl:py-2.5">
            {isActive ? (
              <>
                {actionButtons.map((action, index) => (
                  <button
                    key={action.key}
                    type="button"
                    title={action.title}
                    aria-label={action.title}
                    onClick={action.onClick}
                    className={getActionButtonClass(index, action)}
                  >
                    {action.icon}
                  </button>
                ))}
              </>
            ) : (
              <button
                onClick={() => onReactivate?.(user)}
                title="Reactivate"
                aria-label="Reactivate"
                className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
              >
                <AiFillThunderbolt className="action-button-icon" />
              </button>
            )}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0 hidden md:block">
      <PaginatedTable
        data={searchResults}
        columns={columns}
        enableSelection={!isArchived}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => item.isActive !== false}
        onBulkArchiveClick={onBulkArchiveClick}
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
};
export default DesktopManageUserTable;
