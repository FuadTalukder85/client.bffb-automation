import React from "react";
import { Download, CheckCircle, Eye, ChevronDown, Plus, ClipboardList } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { cn } from "@/lib/utils";

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
  onEditRow,
  formatDate = (d) => d || "-",
}) {
  return (
    <div className="flex flex-col border-b border-[#EEEBF4] dark:border-primary/40">
      {/* Version Header Card (Image 4) */}
      <div className="p-3 flex flex-col gap-2 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]">
        <div className="flex flex-col justify-between p-3 rounded-2xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30">
          {/* Top Row: VERSION XX Badge + Finalize/Approved */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-xl bg-[#4B208B] text-white font-extrabold text-xs tracking-wider uppercase">
              VERSION {versionNumStr}
            </span>

            {vIsFinalized ? (
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

        {/* Download Buttons - Outside the version card */}
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
      </div>

      {/* Version Table Columns Header (Image 4) */}
      <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
        <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
          Qty (g)
        </div>
        <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
          Cmp (%)
        </div>
        {showSolidLiquidColumn && (
          <div className="flex-1 h-full flex items-center justify-center">
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
                showSolidLiquidColumn
                  ? "flex-[2] border-r border-[#EEEBF4] dark:border-primary/30"
                  : "flex-1"
              )}
            >
              {group.items.map(({ item, vIng, index }) => (
                <div
                  key={index}
                  className="group/row flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-colors"
                >
                  <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
                    {vIng.quantity ?? "-"}
                  </div>
                  <div className="flex-1 h-full flex items-center justify-center gap-1">
                    <span>{vIng.composition ?? "-"}</span>
                    <button
                      type="button"
                      onClick={() => onEditRow?.(vIng, index, vItem)}
                      title="Edit Ingredient"
                      className="text-[#4B208B] hover:text-[#3E1B77] ml-0.5 cursor-pointer opacity-0 group-hover/row:opacity-100 transition-opacity"
                    >
                      <FaEdit className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: S/L (%) spanning the entire group with NO inner dividers */}
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
          <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
            {vTotals?.composition}
          </div>
          {showSolidLiquidColumn && (
            <div className="flex-1 h-full flex items-center justify-center">
              {vTotals?.solidLiquid}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col gap-2 p-4.5 bg-white dark:bg-[#0D0B14]">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onPrepareSample}
            className="px-2.5 py-2 rounded-xl border border-[#4B208B] text-[#4B208B] dark:text-purple-300 text-xs font-bold hover:bg-[#EFEAF9] dark:hover:bg-primary/25 flex items-center gap-1 transition-all cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Prepare Sample
          </button>
          <button
            type="button"
            onClick={onPrepareSample}
            className="px-2.5 py-2 rounded-xl bg-[#4B208B] text-white text-xs font-bold hover:bg-[#3E1B77] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Sample
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="px-2 py-2 rounded-xl border border-gray-200 dark:border-primary/30 bg-white dark:bg-[#121019] text-gray-600 dark:text-gray-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Hidden (4)
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= INGREDIENT TABLE LEFT COLUMN =================
export function IngredientTableLeftHeader({
  globalIngredients = [],
  isConfectionary = false,
  onOpenBFFModal,
  onOpenStandardIngredientModal,
}) {
  return (
    <div className="flex flex-col border-b border-[#EEEBF4] dark:border-primary/40">
      <div className="h-[150px] p-6 flex items-end border-b border-[#EEEBF4] dark:border-primary/40">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Ingredient Table
        </h2>
      </div>

      {/* Table Column Headers */}
      <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
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
              "flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-colors",
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
            <div className="flex-1 pl-4 font-bold text-gray-900 dark:text-white truncate">
              {item.name}
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

      {/* Action Buttons Row - matches right side's 2-row layout */}
      <div className="flex flex-col gap-2 p-4 bg-white dark:bg-[#0D0B14]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenBFFModal}
            className="px-4 py-2 rounded-xl border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs hover:bg-[#EFEAF9] dark:hover:bg-primary/25 transition-all shadow-sm cursor-pointer"
          >
            BFF Product
          </button>
          <button
            type="button"
            onClick={onOpenStandardIngredientModal}
            className="px-4 py-2 rounded-xl border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs hover:bg-[#EFEAF9] dark:hover:bg-primary/25 transition-all shadow-sm cursor-pointer"
          >
            Standard Ingredient
          </button>
        </div>
        {/* Spacer row to match right side's Hidden (4) button row */}
        <div className="h-9" />
      </div>
    </div>
  );
}
