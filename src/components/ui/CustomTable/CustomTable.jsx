/* eslint-disable react-hooks/incompatible-library */
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  GripVertical,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { ChevronDownCircleIcon } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";

export function CustomTable({
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
  onColumnSizingChange,
  columnSizing: controlledSizing,
  // Custom styling classNames
  tableClassName,
  tableStyle,
  rowGap,
  controlsPosition,
  theadClassName,
  tbodyClassName,
  headerRowClassName,
  headerCellClassName,
  bodyRowClassName,
  bodyCellClassName,
}) {
  const [internalSorting, setInternalSorting] = React.useState([]);
  const [internalVisibility, setInternalVisibility] = React.useState({});
  const [internalPinning, setInternalPinning] = React.useState({});
  const [internalSizing, setInternalSizing] = React.useState({});

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
    columns,
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

  const tableLayout = (
    <div className={cn("flex flex-col w-full h-full", className)}>
      {/* Header Area */}
      <div
        ref={headerRef}
        className="overflow-hidden border-b border-border shrink-0"
        style={{ width: "100%" }}
      >
        <table
          className={cn(
            rowGap ? "border-separate" : "border-collapse",
            tableClassName
          )}
          style={{
            width: "100%",
            minWidth: table.getTotalSize(),
            ...(rowGap && {
              borderSpacing: `0 ${rowGap}`,
            }),
            ...tableStyle,
          }}
        >
          <thead className={cn("bg-background", theadClassName)}>
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
                    const canSort = enableSorting && header.column.getCanSort();

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
                          "relative px-4 py-4 lg:px-2 lg:py-2 xl:px-4 xl:py-4 text-left text-sm lg:text-xs xl:text-sm font-medium",
                          isPinned &&
                            "sticky z-30 bg-background/80 backdrop-blur-sm",
                          isPinned === "left" && "left-0",
                          isPinned === "right" && "right-0",
                          headerCellClassName,
                          header.column.columnDef.headerClassName
                        )}
                        style={{
                          width: header.getSize(),
                          transition: "width 0.1s ease",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {canSort || canPin || canUnpin || canHide ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="flex-1 cursor-pointer hover:bg-muted/50 rounded p-1 lg:p-0.5 xl:p-1">
                                  {headerContent}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className={"bg-background text-foreground"}
                                align="end"
                              >
                                {/* {canSort && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        header.column.toggleSorting(false)
                                      }
                                    >
                                      <ArrowUpDown className="w-4 h-4 mr-2" />
                                      Sort Ascending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        header.column.toggleSorting(true)
                                      }
                                    >
                                      <ArrowUpDown className="w-4 h-4 mr-2" />
                                      Sort Descending
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )} */}

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
                                className="h-3.5 w-3.5 lg:h-3 lg:w-3 xl:h-3.5 xl:w-3.5 cursor-col-resize shrink-0"
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
        className="flex-1 overflow-auto custom-scrollbar"
        style={{ width: "100%" }}
      >
        <table
          className={cn(
            rowGap ? "border-separate" : "border-collapse",
            tableClassName
          )}
          style={{
            width: "100%",
            minWidth: table.getTotalSize(),
            ...(rowGap && {
              borderSpacing: `0 ${rowGap}`,
            }),
            ...tableStyle,
          }}
        >
          <tbody className={tbodyClassName}>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  !rowGap && "border-b border-border",
                  "transition-colors hover:bg-muted",
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
                          "px-4 py-3 lg:px-2 lg:py-1.5 xl:px-4 xl:py-3 text-sm lg:text-xs xl:text-sm",
                          isPinned && "sticky z-10 bg-background",
                          isPinned === "left" && "left-0",
                          isPinned === "right" && "right-0",
                          bodyCellClassName,
                          cell.column.columnDef.className
                        )}
                        style={{
                          width: cell.column.getSize(),
                          transition: "width 0.1s ease",
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
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col",
        controlsPosition ? "relative" : ""
      )}
    >
      {tableLayout}

      <div
        className={cn(
          "mt-4 flex justify-end items-center gap-2",
          controlsPosition ? "absolute" : ""
        )}
        style={
          controlsPosition
            ? { right: controlsPosition.right, top: controlsPosition.top }
            : {}
        }
      >
        {enableHiding &&
          table.getAllColumns().some((col) => !col.getIsVisible()) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-semibold rounded-md text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2">
                  <Eye className="w-4 h-4" />
                  Hidden Columns (
                  {
                    table.getAllColumns().filter((col) => !col.getIsVisible())
                      .length
                  }
                  )
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border bg-background border-border"
              >
                <DropdownMenuItem
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
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Show All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {table.getAllColumns().map((column) =>
                  column.getIsVisible() ? null : (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => column.toggleVisibility(true)}
                    >
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        <button
          onClick={() => {
            if (onSortingChange) {
              onSortingChange([]);
            } else {
              setInternalSorting([]);
            }
            if (onColumnVisibilityChange) {
              onColumnVisibilityChange({});
            } else {
              setInternalVisibility({});
            }
            if (onColumnPinningChange) {
              onColumnPinningChange({});
            } else {
              setInternalPinning({});
            }
            if (onColumnSizingChange) {
              onColumnSizingChange({});
            } else {
              setInternalSizing({});
            }
          }}
          className="flex items-center justify-center gap-1.5 h-7 xl:h-9 px-3 text-xs xl:text-sm font-semibold rounded-md text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2"
        >
          <AiFillThunderbolt className="w-3 h-3 xl:w-4 xl:h-4" />
          Reset
        </button>
      </div>
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
