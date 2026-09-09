import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Download, CheckCircle, Eye, ChevronDown, Plus, ClipboardList, Check, Trash2 } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { cn } from "@/lib/utils";
import DeleteIngredientModal from "./DeleteIngredientModal";

// ================= 4 HIDDEN COLUMNS DEFINITIONS =================
const HIDDEN_COLUMNS = [
  {
    id: "bffRate",
    label: "BFF Rate (৳)",
    getValue: (vIng, item) => {
      const val = vIng?.bffRate ?? item?.bffRate ?? vIng?.bffRateAtCreation ?? item?.bffRateAtCreation;
      if (val !== undefined && val !== null && val !== "") {
        const num = Number(val);
        return Number.isFinite(num) ? num.toFixed(2) : String(val);
      }
      return "-";
    },
    getTotal: () => "-",
  },
  {
    id: "clientRate",
    label: "Client Rate (৳)",
    getValue: (vIng, item) => {
      const val = vIng?.clientRate ?? item?.clientRate ?? vIng?.clientRateAtCreation ?? item?.clientRateAtCreation;
      if (val !== undefined && val !== null && val !== "") {
        const num = Number(val);
        return Number.isFinite(num) ? num.toFixed(2) : String(val);
      }
      return "-";
    },
    getTotal: () => "-",
  },
  {
    id: "bffCost",
    label: "BFF Cost (৳/kg)",
    getValue: (vIng, item) => {
      const val = vIng?.bffCost ?? item?.bffCost;
      if (val !== undefined && val !== null && val !== "") {
        const num = Number(val);
        return Number.isFinite(num) ? num.toFixed(2) : String(val);
      }
      return "-";
    },
    getTotal: (vTotals) => {
      if (vTotals?.bffCost !== undefined && vTotals?.bffCost !== null && vTotals?.bffCost !== "") {
        const num = Number(vTotals.bffCost);
        return Number.isFinite(num) ? num.toFixed(2) : String(vTotals.bffCost);
      }
      return "-";
    },
  },
  {
    id: "clientCost",
    label: "Client Cost (৳/kg)",
    getValue: (vIng, item) => {
      const val = vIng?.clientCost ?? item?.clientCost;
      if (val !== undefined && val !== null && val !== "") {
        const num = Number(val);
        return Number.isFinite(num) ? num.toFixed(2) : String(val);
      }
      return "-";
    },
    getTotal: (vTotals) => {
      if (vTotals?.clientCost !== undefined && vTotals?.clientCost !== null && vTotals?.clientCost !== "") {
        const num = Number(vTotals.clientCost);
        return Number.isFinite(num) ? num.toFixed(2) : String(vTotals.clientCost);
      }
      return "-";
    },
  },
];

// ================= INGREDIENT TABLE VERSION COLUMN =================
export default function IngredientTable({
  vItem,
  data,
  versionNumStr,
  vIsFinalized,
  onFinalizeVersion,
  onFullDownload,
  onClientDownload,
  showSolidLiquidColumn = true,
  ingredientGroups = [],
  vTotals = {},
  onPrepareSample,
  onSample,
  onEditRow,
  formatDate = (d) => d || "-",
  isSelectingForCompare = false,
  isSelectedForCompare = false,
  onToggleSelectCompare,
  selectedColumns: externalSelectedColumns,
  onSelectedColumnsChange,
}) {
  const navigate = useNavigate();

  const versionId =
    vItem?._id ||
    (data?._id && versionNumStr ? `${data._id}_v${versionNumStr}` : null) ||
    (versionNumStr ? `v_${versionNumStr}` : "default");

  const storageKey = `ingredient_table_cols_${versionId}`;

  // Hidden Columns State (persisted in localStorage)
  const [internalSelectedColumns, setInternalSelectedColumns] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load selected columns from localStorage", e);
    }
    return [];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedColumns =
    externalSelectedColumns !== undefined ? externalSelectedColumns : internalSelectedColumns;

  const handleToggleColumn = (colId) => {
    const next = selectedColumns.includes(colId)
      ? selectedColumns.filter((id) => id !== colId)
      : [...selectedColumns, colId];

    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save selected columns to localStorage", e);
    }

    if (onSelectedColumnsChange) {
      onSelectedColumnsChange(next);
    } else {
      setInternalSelectedColumns(next);
    }
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Selected columns to display after S/L (%) in canonical order
  const activeColumns = useMemo(
    () => HIDDEN_COLUMNS.filter((col) => selectedColumns.includes(col.id)),
    [selectedColumns]
  );

  const hiddenCount = HIDDEN_COLUMNS.length - activeColumns.length;

  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

  const handleSampleClick = () => {
    const versionIngredients =
      Array.isArray(vItem?.ingredients) && vItem.ingredients.length > 0
        ? vItem.ingredients
        : Array.isArray(data?.ingredients) && data.ingredients.length > 0
          ? data.ingredients
          : [];

    const enrichedVItem = {
      ...vItem,
      ingredients: versionIngredients,
    };

    if (onSample) {
      onSample(enrichedVItem, data);
    } else {
      const targetId = vItem?._id || data?._id;
      const targetVersion = vItem?.version ?? 0;
      navigate(`/application-lab/application-recipes/sample/${targetId}/${targetVersion}`, {
        state: { recipe: data, vItem: enrichedVItem, version: targetVersion },
      });
    }
  };

  return (
    <div className="flex flex-col border-b border-[#EEEBF4] dark:border-primary/40">
      {/* Version Header Card (Image 4 & Compare Selection) */}
      <div className="p-3 flex flex-col gap-2 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]">
        <div
          onClick={isSelectingForCompare ? onToggleSelectCompare : undefined}
          className={cn(
            "flex flex-col justify-between p-3 rounded-2xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 transition-all",
            isSelectingForCompare && "cursor-pointer"
          )}
        >
          {/* Top Row: VERSION XX Badge + Finalize/Approved / Checkbox */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl bg-[#4B208B] text-white font-extrabold text-xs tracking-wider uppercase">
              VERSION {versionNumStr}
            </span>

            {isSelectingForCompare ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelectCompare?.();
                }}
                className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all",
                  isSelectedForCompare
                    ? "bg-[#4B208B] text-white shadow-xs"
                    : "border-2 border-gray-400 dark:border-gray-500 bg-white/80 dark:bg-black/40 hover:border-[#4B208B]"
                )}
              >
                {isSelectedForCompare && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            ) : vIsFinalized ? (
              <span className="px-3 py-1 rounded-xl bg-white border border-purple-200 dark:bg-primary/30 text-[#4B208B] dark:text-purple-300 font-bold text-xs">
                Approved
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onFinalizeVersion?.(vItem)}
                className="px-3 py-1 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Finalize
              </button>
            )}
          </div>

          {/* Middle: Dates and Code */}
          <div className="text-[11px] leading-tight space-y-0.5 mt-2">
            <p className="text-gray-500 font-medium">
              Recipe Creation Date:{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {formatDate(vItem?.createdAt || data?.createdAt) || "-"}
              </span>
            </p>
            <p className="text-gray-500 font-medium">
              Recipe Code:{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {vItem?.recipeCode || data?.recipeCode || "-"}
              </span>
            </p>
          </div>
        </div>

        {/* Download Buttons - Outside the version card (hidden during compare selection) */}
        {!isSelectingForCompare && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFullDownload?.(vItem)}
              className="flex-1 py-1.5 px-2 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Full Download
            </button>
            <button
              type="button"
              onClick={() => onClientDownload?.(vItem)}
              className="flex-1 py-1.5 px-2 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Client Download
            </button>
          </div>
        )}
      </div>

      {/* Version Table Columns Header */}
      <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
        <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 whitespace-nowrap px-1">
          Qty (g)
        </div>
        <div
          className={cn(
            "flex-1 h-full flex items-center justify-center whitespace-nowrap px-1",
            (showSolidLiquidColumn || activeColumns.length > 0) &&
            "border-r border-[#EEEBF4] dark:border-primary/30"
          )}
        >
          Cmp (%)
        </div>
        {activeColumns.map((col, idx) => (
          <div
            key={col.id}
            className={cn(
              "flex-1 h-full flex items-center justify-center px-1 text-center whitespace-nowrap",
              (idx < activeColumns.length - 1 || showSolidLiquidColumn) &&
              "border-r border-[#EEEBF4] dark:border-primary/30"
            )}
          >
            {col.label}
          </div>
        ))}
        {showSolidLiquidColumn && (
          <div className="flex-1 h-full flex items-center justify-center whitespace-nowrap px-1">
            S/L (%)
          </div>
        )}
      </div>

      {/* Version Table Data Rows */}
      <div className="flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30">
        {ingredientGroups.map((group, gIdx) => (
          <div
            key={gIdx}
            className={cn(
              "flex",
              group.isSeparator && "border-b-2 border-[#4B208B]"
            )}
          >
            {/* Left columns: Qty (g) and Cmp (%) */}
            <div
              className={cn(
                "flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30",
                showSolidLiquidColumn || activeColumns.length > 0
                  ? "flex-[2] border-r border-[#EEEBF4] dark:border-primary/30"
                  : "flex-1"
              )}
            >
              {group.items.map(({ vIng, index }) => {
                const isEditable = !vIsFinalized && !isSelectingForCompare;
                const isHovered = hoveredRowIndex === index;
                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredRowIndex(index)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                    onClick={() => {
                      if (isEditable) {
                        onEditRow?.(vIng, index, vItem);
                      }
                    }}
                    className={cn(
                      "group/row flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-colors",
                      isHovered && "bg-[#F7F5FA] dark:bg-primary/10",
                      isEditable && "cursor-pointer"
                    )}
                  >
                    <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
                      {vIng.quantity ?? "-"}
                    </div>
                    <div className="flex-1 h-full flex items-center justify-center gap-1">
                      <span>{vIng.composition ?? "-"}</span>
                      {isEditable && activeColumns.length === 0 && (
                        <span
                          title="Edit Ingredient"
                          className={cn(
                            "text-[#4B208B] hover:text-[#3E1B77] ml-0.5 transition-opacity",
                            isHovered ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
                          )}
                        >
                          <FaEdit className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unhidden columns: Selected columns displayed before S/L (%) */}
            {activeColumns.length > 0 && (
              <div
                className={cn(
                  "flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30",
                  showSolidLiquidColumn && "border-r border-[#EEEBF4] dark:border-primary/30"
                )}
                style={{ flex: activeColumns.length }}
              >
                {group.items.map(({ item, vIng, index }) => {
                  const isEditable = !vIsFinalized && !isSelectingForCompare;
                  const isHovered = hoveredRowIndex === index;
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      onClick={() => {
                        if (isEditable) {
                          onEditRow?.(vIng, index, vItem);
                        }
                      }}
                      className={cn(
                        "group/row flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-colors",
                        isHovered && "bg-[#F7F5FA] dark:bg-primary/10",
                        isEditable && "cursor-pointer"
                      )}
                    >
                      {activeColumns.map((col, colIdx) => {
                        const isLastColumnBeforeSL = colIdx === activeColumns.length - 1;
                        return (
                          <div
                            key={col.id}
                            className={cn(
                              "flex-1 h-full flex items-center justify-center px-1 text-center font-medium gap-1",
                              colIdx < activeColumns.length - 1 &&
                              "border-r border-[#EEEBF4] dark:border-primary/30"
                            )}
                          >
                            <span>{col.getValue(vIng, item)}</span>
                            {isEditable && isLastColumnBeforeSL && (
                              <span
                                title="Edit Ingredient"
                                className={cn(
                                  "text-[#4B208B] hover:text-[#3E1B77] ml-0.5 transition-opacity",
                                  isHovered ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
                                )}
                              >
                                <FaEdit className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column: S/L (%) spanning the entire group with NO inner dividers (placed AFTER unhidden columns) */}
            {showSolidLiquidColumn && (
              <div className="flex-1 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
                <span>{group.solidLiquidValue || ""}</span>
              </div>
            )}
          </div>
        ))}

        {/* Dynamic Total Row */}
        <div className="flex items-center h-12 font-bold text-xs text-[#4B208B] dark:text-purple-300 border-t-2 border-[#4B208B]/40 bg-[#FCFBFD] dark:bg-[#121019]">
          <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
            {vTotals?.quantity}
          </div>
          <div
            className={cn(
              "flex-1 h-full flex items-center justify-center",
              (showSolidLiquidColumn || activeColumns.length > 0) &&
              "border-r border-[#EEEBF4] dark:border-primary/30"
            )}
          >
            {vTotals?.composition}
          </div>
          {activeColumns.map((col, idx) => (
            <div
              key={col.id}
              className={cn(
                "flex-1 h-full flex items-center justify-center px-1 text-center",
                (idx < activeColumns.length - 1 || showSolidLiquidColumn) &&
                "border-r border-[#EEEBF4] dark:border-primary/30"
              )}
            >
              {col.getTotal(vTotals)}
            </div>
          ))}
          {showSolidLiquidColumn && (
            <div className="flex-1 h-full flex items-center justify-center">
              {vTotals?.solidLiquid}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row (hidden during compare selection) */}
      {!isSelectingForCompare && (
        <div className="flex flex-col gap-2 p-4.5 bg-white dark:bg-[#0D0B14]">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onPrepareSample}
              className="px-2.5 py-2 rounded-[6px] border border-[#4B208B] text-[#4B208B] dark:text-purple-300 text-xs font-semibold bg-[#F9FAFB] hover:bg-[#EFEAF9] dark:hover:bg-primary/25 flex items-center gap-1 transition-all cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Prepare Sample
            </button>
            <button
              type="button"
              onClick={handleSampleClick}
              className="px-2.5 py-2 rounded-[6px] bg-primary text-white text-xs font-semibold hover:bg-[#3E1B77] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Sample
            </button>
          </div>
          <div className="flex justify-end relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="px-2 py-2 rounded-[6px] border border-gray-200 dark:border-primary/30 bg-white dark:bg-[#121019] text-gray-600 dark:text-gray-300 text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-[#F7F5FA] dark:hover:bg-primary/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Hidden ({hiddenCount})
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Hidden Columns Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#121019] shadow-xl z-40 py-1.5 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-primary/20">
                  Hidden Columns
                </div>
                <div className="py-1 flex flex-col">
                  {HIDDEN_COLUMNS.map((col) => {
                    const isSelected = selectedColumns.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleToggleColumn(col.id)}
                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#F7F5FA] dark:hover:bg-primary/15 transition-colors cursor-pointer text-gray-700 dark:text-gray-200"
                      >
                        <span className="font-medium text-xs">{col.label}</span>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-[4px] flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-[#4B208B] text-white"
                              : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-black/40"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= INGREDIENT TABLE LEFT COLUMN =================
export function IngredientTableLeftHeader({
  globalIngredients = [],
  isConfectionary = false,
  onOpenBFFModal,
  onOpenStandardIngredientModal,
  isSelectingForCompare = false,
  onDeleteIngredient,
  onDeleteRow,
  isFinalized = false,
  isLoading = false,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = !isFinalized && !isSelectingForCompare;

  const handleDeleteClick = (e, item, index) => {
    e.stopPropagation();
    setIngredientToDelete({ ...item, index: item.originalIndex ?? index });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (item) => {
    const target = item || ingredientToDelete;
    if (!target) return;
    setIsDeleting(true);
    try {
      if (onDeleteIngredient) {
        await onDeleteIngredient(target);
      } else if (onDeleteRow) {
        await onDeleteRow(target);
      }
      setIsDeleteModalOpen(false);
      setIngredientToDelete(null);
    } catch (err) {
      console.error("Failed to delete ingredient:", err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col border-b border-[#EEEBF4] dark:border-primary/40">
      <div className="h-[150px] p-6 flex items-end border-b border-[#EEEBF4] dark:border-primary/40">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Ingredient Table
        </h2>
      </div>

      {/* Table Column Headers */}
      <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-semibold text-[#0D111A] dark:text-white bg-white dark:bg-[#0D0B14]">
        <div className="w-14 text-center border-r border-[#EEEBF4] dark:border-primary/30">SL</div>
        <div className="w-20 text-center border-r border-[#EEEBF4] dark:border-primary/30">Role</div>
        <div className="flex-1 pl-4 text-left">Ingredients</div>
        {isConfectionary && (
          <div className="w-20 text-center border-l border-[#EEEBF4] dark:border-primary/30">
            Process
          </div>
        )}
      </div>

      {/* Left Ingredient Rows */}
      <div className="flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30">
        {globalIngredients.map((item, index) => (
          <div
            key={index}
            className={cn(
              "group/leftrow flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-colors",
              item.isSeparator && "border-b-2 border-[#4B208B]"
            )}
          >
            <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
              <span className="inline-flex items-center justify-center px-2 py-0.5 min-w-[32px] rounded-full bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold text-xs">
                {index + 1}
              </span>
            </div>
            <div className="w-20 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 text-gray-600 dark:text-gray-400 text-center truncate px-1 font-medium">
              {item.role || "-"}
            </div>
            <div className="flex-1 pl-4 pr-3 h-full flex items-center justify-between min-w-0">
              <span className="font-bold text-gray-900 dark:text-white truncate pr-2">
                {item.name}
              </span>
              {canDelete && (
                <button
                  type="button"
                  title={`Delete ${item.name}`}
                  onClick={(e) => handleDeleteClick(e, item, index)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-all opacity-0 group-hover/leftrow:opacity-100 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {isConfectionary && (
              <div className="w-20 h-full flex items-center justify-center border-l border-[#EEEBF4] dark:border-primary/30 text-gray-800 dark:text-gray-200 font-semibold text-center">
                {item.process || "-"}
              </div>
            )}
          </div>
        ))}

        {/* Total Row */}
        <div className="flex items-center h-12 font-bold text-xs text-[#4B208B] dark:text-purple-300 border-t-2 border-[#4B208B]/40 bg-[#FCFBFD] dark:bg-[#121019]">
          <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
          <div className="w-20 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
          <div className="flex-1 text-center pr-6">Total</div>
          {isConfectionary && (
            <div className="w-20 h-full flex items-center justify-center border-l border-[#EEEBF4] dark:border-primary/30">
              -
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row - matches right side's 2-row layout (hidden during compare selection) */}
      {!isSelectingForCompare && (
        <div>
          <div className="">
            <h2 className="pt-2 px-4 text-[18px] font-semibold text-[#0D111A] dark:text-white tracking-tight">
              Add Ingredient
            </h2>
          </div>
          <div className="flex flex-col gap-2 pt-2 px-4 bg-white dark:bg-[#0D0B14]">

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenBFFModal}
                className="px-4 py-2 rounded-[6px] border border-[#4B208B] text-primary dark:text-purple-300 font-semibold text-xs bg-[#EEEBF4] hover:bg-[#EFEAF9] dark:hover:bg-primary/25 transition-all shadow-sm cursor-pointer"
              >
                BFF Product
              </button>
              <button
                type="button"
                onClick={onOpenStandardIngredientModal}
                className="px-4 py-2 rounded-[6px] border border-[#4B208B] text-primary dark:text-purple-300 font-semibold text-xs bg-[#EEEBF4] hover:bg-[#EFEAF9] dark:hover:bg-primary/25 transition-all shadow-sm cursor-pointer"
              >
                Standard Ingredient
              </button>
            </div>
            {/* Spacer row to match right side's Hidden (4) button row */}
            <div className="h-9" />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteIngredientModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setIngredientToDelete(null);
        }}
        ingredient={ingredientToDelete}
        ingredientName={ingredientToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading || isDeleting}
      />
    </div>
  );
}
