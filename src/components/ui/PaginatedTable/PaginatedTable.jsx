/* eslint-disable react-hooks/incompatible-library */
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Eye,
  EyeOff,
  Pin,
  PinOff,
  GripVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

import { Pagination } from "@/components/ui/Pagination";
import { NoData } from "@/components/ui/NoData";

const DEFAULT_DESKTOP_BREAKPOINTS = {
  lg: 1010,
  xl: 1270,
  '2xl': 1530,
  '3xl': 1910,
};

const RESPONSIVE_SIZE_KEY = "__responsiveSize";

function resolveResponsiveSize(windowWidth, sizes, breakpoints = DEFAULT_DESKTOP_BREAKPOINTS) {
  if (!sizes || typeof sizes !== 'object') {
    return undefined;
  }

  if (windowWidth >= breakpoints['3xl']) return sizes['3xl'] ?? sizes['2xl'] ?? sizes.xl ?? sizes.lg ?? sizes.normal;
  if (windowWidth >= breakpoints['2xl']) return sizes['2xl'] ?? sizes.xl ?? sizes.lg ?? sizes.normal;
  if (windowWidth >= breakpoints.xl) return sizes.xl ?? sizes.lg ?? sizes.normal;
  if (windowWidth >= breakpoints.lg) return sizes.lg ?? sizes.normal;
  return sizes.normal ?? sizes.lg;
}

function isResponsiveSizeObject(value) {
  return !!(value && typeof value === "object" && value[RESPONSIVE_SIZE_KEY]);
}

function resolveResponsiveColumns(columns, windowWidth) {
  return columns.map((column) => {
    const resolvedColumn = { ...column };

    if (isResponsiveSizeObject(column.size)) {
      const { sizes, breakpoints } = column.size[RESPONSIVE_SIZE_KEY];
      resolvedColumn.size = resolveResponsiveSize(windowWidth, sizes, breakpoints);
    }

    if (Array.isArray(column.columns)) {
      resolvedColumn.columns = resolveResponsiveColumns(column.columns, windowWidth);
    }

    return resolvedColumn;
  });
}

export function getResponsiveSize(windowWidthOrSizes, maybeSizes, breakpoints = DEFAULT_DESKTOP_BREAKPOINTS) {
  const isSizesOnlyCall =
    typeof maybeSizes === 'undefined' &&
    windowWidthOrSizes &&
    typeof windowWidthOrSizes === 'object';

  if (isSizesOnlyCall) {
    return {
      [RESPONSIVE_SIZE_KEY]: {
        sizes: windowWidthOrSizes,
        breakpoints,
      },
    };
  }

  const isSizesFirstArg = typeof maybeSizes === 'undefined';
  const sizes = isSizesFirstArg ? windowWidthOrSizes : maybeSizes;
  const width = typeof windowWidthOrSizes === 'number'
    ? windowWidthOrSizes
    : typeof window !== 'undefined'
      ? window.innerWidth
      : 0;

  return resolveResponsiveSize(width, sizes, breakpoints);
}

export function useWindowWidth(initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1010) {
  const [windowWidth, setWindowWidth] = React.useState(initialWidth);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
}

export function useResponsiveSize(sizes, breakpoints = DEFAULT_DESKTOP_BREAKPOINTS) {
  const windowWidth = useWindowWidth();
  return getResponsiveSize(windowWidth, sizes, breakpoints);
}

export function PaginatedTable({
  data,
  columns,
  className,
  columnResizeMode = "onChange",
  enableColumnResizing = true,
  enableSorting = true,
  enablePinning = true,
  enableHiding = true,
  onSortingChange,
  sorting: controlledSorting,
  onColumnVisibilityChange,
  columnVisibility: controlledVisibility,
  onColumnPinningChange,
  columnPinning: controlledPinning,
  defaultColumnPinning,
  onColumnSizingChange,
  columnSizing: controlledSizing,
  // Pagination props
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  // Custom styling classNames
  tableClassName,
  tableStyle,
  rowGap,
  theadClassName,
  tbodyClassName,
  headerRowClassName,
  headerCellClassName,
  bodyRowClassName,
  bodyCellClassName,
  // NoData props
  noDataMessage,
  noDataDescription,
  emptyState,
  // Selection & Bulk Action Props
  enableSelection = false,
  selectedRowIds = [],
  onSelectionChange,
  canSelectRow,
  onBulkArchiveClick,
}) {
  const windowWidth = useWindowWidth();
  const [internalSorting, setInternalSorting] = React.useState([]);
  const [internalVisibility, setInternalVisibility] = React.useState({});
  const [internalPinning, setInternalPinning] = React.useState(defaultColumnPinning ?? {});
  const [internalSizing, setInternalSizing] = React.useState({});

  const resolvedRowGap = React.useMemo(() => {
    if (rowGap && typeof rowGap === "object") {
      return resolveResponsiveSize(windowWidth, rowGap);
    }
    return rowGap;
  }, [rowGap, windowWidth]);

  const resolvedColumns = React.useMemo(
    () => resolveResponsiveColumns(columns, windowWidth),
    [columns, windowWidth]
  );

  const finalColumns = React.useMemo(() => {
    let cols = resolvedColumns;

    if (enableSelection && cols.length > 0) {
      const originalColumn = cols[0];
      const newColumn = {
        ...originalColumn,
        cell: (cellContext) => {
          const row = cellContext.row;
          const record = row.original;
          const isSelectable = canSelectRow ? canSelectRow(record) : true;
          const isSelected = selectedRowIds.includes(record._id || record.id);
          const isSelectionMode = selectedRowIds.length > 0;

          const originalContent = originalColumn.cell
            ? originalColumn.cell(cellContext)
            : (currentPage && itemsPerPage
              ? (currentPage - 1) * itemsPerPage + row.index + 1
              : row.index + 1);

          if (!isSelectable) {
            return (
              <div className="flex items-center justify-start pr-2">
                {originalContent}
              </div>
            );
          }

          return (
            <div className="flex items-center justify-start pr-2">
              {isSelectionMode || isSelected ? (
                <div className="relative">
                  <div className="invisible">
                    {originalContent}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        const recordId = record._id || record.id;
                        onSelectionChange?.(prev =>
                          isSelected
                            ? prev.filter(id => id !== recordId)
                            : [...prev, recordId]
                        );
                      }}
                      className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const recordId = record._id || record.id;
                    onSelectionChange?.(prev => [...prev, recordId]);
                  }}
                  className="group relative cursor-pointer transition-all"
                >
                  <div className="group-hover:invisible">
                    {originalContent}
                  </div>
                  <div className="hidden group-hover:flex absolute inset-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={false}
                      readOnly
                      className="w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        }
      };
      cols = [newColumn, ...cols.slice(1)];
    }

    return cols;
  }, [resolvedColumns, enableSelection, selectedRowIds, onSelectionChange, canSelectRow, currentPage, itemsPerPage]);

  const sorting = controlledSorting ?? internalSorting;
  const columnVisibility = controlledVisibility ?? internalVisibility;
  const columnPinning = controlledPinning ?? internalPinning;
  const columnSizing = controlledSizing ?? internalSizing;

  const handleSortingChange = (updater) => {
    const newSorting =
      typeof updater === "function" ? updater(sorting) : updater;

    if (onSortingChange) {
      onSortingChange(newSorting);
    }

    if (!controlledSorting) {
      setInternalSorting(newSorting);
    }
  };

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode,
    enableColumnResizing,
    enableSorting,
    manualSorting: !!onSortingChange,
    defaultColumn: { size: 200, minSize: 50 },
    state: {
      sorting,
      columnVisibility,
      columnPinning,
      columnSizing,
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalVisibility,
    onColumnPinningChange: onColumnPinningChange ?? setInternalPinning,
    onColumnSizingChange: onColumnSizingChange ?? setInternalSizing,
  });

  const headerRef = React.useRef(null);
  const bodyRef = React.useRef(null);

  // Sync horizontal scroll between header and body
  const onBodyScroll = (e) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-4", className)}>
      <div className="bg-background rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl border border-border overflow-hidden flex flex-col flex-1 min-h-0 max-h-full">
        {/* Table Container */}
        <div className="flex flex-col w-full overflow-hidden flex-1 min-h-0 max-h-full">
          {/* Header Area */}
          <div
            ref={headerRef}
            className="overflow-hidden shrink-0 border-0 border-border"
            style={{ width: "100%" }}
          >
            <table
              className={cn(
                resolvedRowGap ? "border-separate" : "border-collapse",
                "table-fixed",
                "w-full"
              )}
              style={{
                minWidth: table.getTotalSize(),
                ...(resolvedRowGap && {
                  borderSpacing: `0 ${resolvedRowGap}`,
                }),
                ...tableStyle,
              }}
            >
              <thead className={cn("", theadClassName)}>
                {table.getHeaderGroups().map((headerGroup) => {
                  const sortedHeaders = [...headerGroup.headers].sort((a, b) => {
                    const aPinned = a.column.getIsPinned();
                    const bPinned = b.column.getIsPinned();
                    if (aPinned === "left" && bPinned !== "left") return -1;
                    if (aPinned !== "left" && bPinned === "left") return 1;
                    if (aPinned === "right" && bPinned !== "right") return 1;
                    if (aPinned !== "right" && bPinned === "right") return -1;
                    return 0;
                  });
                  return (
                    <tr key={headerGroup.id} className={headerRowClassName}>
                      {sortedHeaders.map((header) => {
                        const isPinned = header.column.getIsPinned();
                        const canPin =
                          enablePinning &&
                          !isPinned &&
                          header.column.columnDef.enablePinning !== false;
                        const canUnpin =
                          enablePinning &&
                          isPinned &&
                          header.column.columnDef.enablePinning !== false;
                        const canHide =
                          enableHiding &&
                          header.column.columnDef.enableHiding !== false;

                        const headerContent = (
                          <div className="flex-1 line-clamp-2">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </div>
                        );

                        return (
                          <th
                            key={header.id}
                            className={cn(
                              "relative p-0.5 lg:p-1 xl:p-1.5 2xl:p-2 3xl:p-3 text-center text-base lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-bold text-foreground transition-all duration-200",
                              isPinned &&
                              "sticky z-30 bg-background",
                              headerCellClassName,
                              header.column.columnDef.headerClassName,
                              "text-sub-heading"
                            )}
                            style={{
                              width: header.getSize(),
                              minWidth: header.getSize(),
                              maxWidth: header.getSize(),
                              left:
                                isPinned === "left"
                                  ? `${header.column.getStart("left")}px`
                                  : undefined,
                              right:
                                isPinned === "right"
                                  ? `${header.column.getAfter("right")}px`
                                  : undefined,
                            }}
                          >
                            <div className="flex items-center justify-between gap-0.5 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                              {canPin || canUnpin || canHide ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <div className="flex-1 cursor-pointer hover:bg-muted/50 rounded p-0.5 lg:p-0.5 xl:p-[2.5px] 2xl:p-[3px] 3xl:p-1">
                                      {headerContent}
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className={"bg-background text-foreground"}
                                    align="end"
                                  >
                                    {canPin && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => header.column.pin("left")}
                                        >
                                          <Pin className="w-4 h-4 mr-2" />
                                          Pin Left
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => header.column.pin("right")}
                                        >
                                          <Pin className="w-4 h-4 mr-2" />
                                          Pin Right
                                        </DropdownMenuItem>
                                      </>
                                    )}

                                    {canUnpin && (
                                      <DropdownMenuItem
                                        onClick={() => header.column.pin(false)}
                                      >
                                        <PinOff className="w-4 h-4 mr-2" />
                                        Unpin
                                      </DropdownMenuItem>
                                    )}

                                    {(canPin || canUnpin) && canHide && (
                                      <DropdownMenuSeparator />
                                    )}

                                    {canHide && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          header.column.toggleVisibility(false)
                                        }
                                      >
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Hide Column
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                headerContent
                              )}

                              {enableColumnResizing &&
                                header.column.getCanResize() && (
                                  <GripVertical
                                    className="w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 cursor-col-resize shrink-0 transition-opacity"
                                    onMouseDown={header.getResizeHandler()}
                                    onTouchStart={header.getResizeHandler()}
                                  />
                                )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
            </table>
          </div>

          {/* Body Area */}
          <div
            ref={bodyRef}
            onScroll={onBodyScroll}
            className={`flex-1 overflow-auto custom-scrollbar border-b border-border max-h-full ${tableClassName}`}
            style={{ width: "100%" }}
          >
            {table.getRowModel().rows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-full">
                {emptyState ?? (
                  <NoData
                    message={noDataMessage}
                    description={noDataDescription}
                  />
                )}
              </div>
            ) : (
              <table
                className={cn(
                  resolvedRowGap ? "border-separate" : "border-collapse",
                  "table-fixed",
                  "w-full",
                  tableClassName
                )}
                style={{
                  minWidth: table.getTotalSize(),
                  ...(resolvedRowGap && {
                    borderSpacing: `0 ${resolvedRowGap}`,
                  }),
                  ...tableStyle,
                }}
              >
                <tbody className={tbodyClassName}>
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn(
                        !resolvedRowGap && "",
                        "transition-colors hover:bg-muted/30",
                        {
                          "": index % 2 === 0,     // suggestion of zebra striping opted out
                        },
                        bodyRowClassName
                      )}
                    >
                      {[...row.getVisibleCells()]
                        .sort((a, b) => {
                          const aPinned = a.column.getIsPinned();
                          const bPinned = b.column.getIsPinned();
                          if (aPinned === "left" && bPinned !== "left") return -1;
                          if (aPinned !== "left" && bPinned === "left") return 1;
                          if (aPinned === "right" && bPinned !== "right") return 1;
                          if (aPinned !== "right" && bPinned === "right") return -1;
                          return 0;
                        })
                        .map((cell) => {
                          const isPinned = cell.column.getIsPinned();

                          return (
                            <td
                              key={cell.id}
                              className={cn(
                                " font-medium text-center text-foreground/80 text-body",
                                isPinned && "sticky z-10 bg-background",
                                bodyCellClassName,
                                cell.column.columnDef.className
                              )}
                              style={{
                                width: cell.column.getSize(),
                                minWidth: cell.column.getSize(),
                                maxWidth: cell.column.getSize(),
                                left:
                                  isPinned === "left"
                                    ? `${cell.column.getStart("left")}px`
                                    : undefined,
                                right:
                                  isPinned === "right"
                                    ? `${cell.column.getAfter("right")}px`
                                    : undefined,
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="px-10 lg:px-5 xl:px-7 2xl:px-8 3xl:px-10 lg:py-0.5 xl:py-1 2xl:py-1 3xl:py-1.5 flex flex-wrap items-center justify-between gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-4">
          {/* Pagination */}
          <div className="flex-1 min-w-fit">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              staticPosition={true}
              className="justify-start p-0 w-auto text-body"
            />
          </div>

          {/* Table Controls */}
          <div className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
            {enableHiding && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center gap-1.5 2xl:gap-2 h-6 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-[12px] font-semibold rounded-md 2xl:rounded-lg text-primary hover:bg-primary-shade-2 bg-primary-shade-2/50 border border-primary-shade-2/30 transition-all">
                    <Eye className="w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4" />
                    Hidden Columns ({
                      table.getAllColumns().filter((col) => !col.getIsVisible()).length
                    })
                    <ChevronDown className="w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 lg:w-29 xl:w-39 2xl:w-44 3xl:w-56 border bg-background border-border p-2"
                >
                  <DropdownMenuItem
                    className="rounded-lg mb-1 text-foreground"
                    onClick={() => {
                      const allVisible = {};
                      table
                        .getAllColumns()
                        .forEach((col) => (allVisible[col.id] = true));
                      if (onColumnVisibilityChange) {
                        onColumnVisibilityChange(allVisible);
                      } else {
                        setInternalVisibility(allVisible);
                      }
                    }}
                  >
                    <Eye className="mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                    Show All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="max-h-60 lg:max-h-32 xl:max-h-42 2xl:max-h-48 3xl:max-h-60 overflow-y-auto custom-scrollbar text-foreground">
                    {table.getAllColumns().map((column) => (
                      <DropdownMenuItem
                        key={column.id}
                        className="rounded-lg"
                        onClick={() => column.toggleVisibility(!column.getIsVisible())}
                      >
                        {column.getIsVisible() ? (
                          <Eye className="mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 opacity-50" />
                        ) : (
                          <EyeOff className="mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                        )}
                        <span className={!column.getIsVisible() ? "font-semibold" : ""}>
                          {typeof column.columnDef.header === "string"
                            ? column.columnDef.header
                            : column.id}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button
              onClick={() => {
                if (onSortingChange) onSortingChange([]);
                else setInternalSorting([]);

                if (onColumnVisibilityChange) onColumnVisibilityChange({});
                else setInternalVisibility({});

                if (onColumnPinningChange) onColumnPinningChange({});
                else setInternalPinning({});

                if (onColumnSizingChange) onColumnSizingChange({});
                else setInternalSizing({});
              }}
              className="flex items-center justify-center gap-1.5 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 h-6 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-[12px] font-semibold rounded-md 2xl:rounded-lg text-primary hover:bg-primary-shade-2 bg-primary-shade-2/50 border border-primary-shade-2/30 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {selectedRowIds.length > 0 && onBulkArchiveClick && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col md:flex-row items-center gap-2.5 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 px-5 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 rounded-2xl md:rounded-full bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl animate-in slide-in-from-bottom duration-300 w-[90%] max-w-[340px] md:w-auto md:max-w-none">
          <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground text-center">
            {selectedRowIds.length} item(s) selected
          </span>
          <div className="hidden md:block w-px h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 bg-border" />
          <div className="flex items-center justify-center gap-2 w-full md:w-auto">
            <button
              className="rounded-full text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border border-border text-foreground hover:bg-muted bg-transparent transition-all flex-1 md:flex-none cursor-pointer"
              onClick={() => onSelectionChange?.([])}
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all flex-1 md:flex-none"
              onClick={onBulkArchiveClick}
            >
              <Trash2 className="w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5" />
              Archive <span className="hidden md:block">Selected</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// Editable Cell
export function EditableCell({
  value: initialValue,
  onSave,
  className,
  inputClassName,
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setValue(initialValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        autoFocus
        className={cn("p-1", inputClassName)}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer rounded px-2 py-1 hover:bg-muted",
        className
      )}
    >
      {value || (
        <span className="italic text-muted-foreground">Click to edit</span>
      )}
    </div>
  );
}
