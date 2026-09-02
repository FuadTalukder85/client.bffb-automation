import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildIngredientsDisplayData } from "../data/ingredientsCalculations";
import BatchSummary from "./BatchSummary";
import StandardOperatingProcedure from "./StandardOperatingProcedure";
import SensoryFeedback from "./SensoryFeedback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecipeById } from "@/hooks/useRecipes";

export default function ScaleBatchColumn({
  scaleBatchVersion,
  comparedVersions = [],
  onSelectScaleBatchVersion,
  data,
  globalIngredients = [],
  showSolidLiquidColumn = true,
  formatDate = (d) => d || "-",
  onSaveSpecificFields,
  recipeFormat = "bakery",
  isConfectionary = false,
  isFinalized = false,
  onEditRow,
}) {
  const versionNumStr = String(Number(scaleBatchVersion?.version ?? 0) + 1).padStart(2, "0");

  const isCurrentData =
    scaleBatchVersion?._id === data?._id ||
    (scaleBatchVersion?.version !== undefined && data?.version !== undefined && scaleBatchVersion?.version === data?.version);
  const targetId = scaleBatchVersion?._id;

  const { data: fetchedDetail } = useRecipeById(targetId, {
    enabled: !isCurrentData && !!targetId && (!Array.isArray(scaleBatchVersion?.ingredients) || scaleBatchVersion.ingredients.length === 0),
  });

  const effectiveVersionData = useMemo(() => {
    if (isCurrentData && data) return data;
    if (fetchedDetail) return { ...scaleBatchVersion, ...fetchedDetail };
    return scaleBatchVersion || {};
  }, [isCurrentData, data, fetchedDetail, scaleBatchVersion]);

  const versionIngredients = useMemo(() => {
    if (Array.isArray(effectiveVersionData?.ingredients) && effectiveVersionData.ingredients.length > 0) {
      return effectiveVersionData.ingredients;
    }
    if (isCurrentData && Array.isArray(data?.ingredients) && data.ingredients.length > 0) {
      return data.ingredients;
    }
    return [];
  }, [effectiveVersionData?.ingredients, isCurrentData, data?.ingredients]);

  const normalizedVItem = useMemo(
    () => ({
      ...effectiveVersionData,
      recipeType: effectiveVersionData?.recipeType || data?.recipeType,
      ingredients: versionIngredients,
    }),
    [data?.recipeType, effectiveVersionData, versionIngredients]
  );

  const [draftYield, setDraftYield] = useState(
    scaleBatchVersion?.outputYield ?? data?.outputYield ?? (isConfectionary ? 80 : 0)
  );
  const [draftServingSize, setDraftServingSize] = useState(
    scaleBatchVersion?.outputServingSize ?? data?.outputServingSize ?? (isConfectionary ? 12 : 0)
  );
  const [isBatchSummaryEditing, setIsBatchSummaryEditing] = useState(false);

  useEffect(() => {
    setDraftYield(scaleBatchVersion?.outputYield ?? data?.outputYield ?? (isConfectionary ? 80 : 0));
    setDraftServingSize(
      scaleBatchVersion?.outputServingSize ?? data?.outputServingSize ?? (isConfectionary ? 12 : 0)
    );
  }, [scaleBatchVersion?.outputYield, data?.outputYield, scaleBatchVersion?.outputServingSize, data?.outputServingSize, isConfectionary]);

  const vComputedData = useMemo(
    () =>
      buildIngredientsDisplayData(normalizedVItem, {
        outputYield: draftYield,
        outputServingSize: draftServingSize,
      }),
    [normalizedVItem, draftYield, draftServingSize]
  );

  const { ingredients: vIngredients, totals: vTotals, batchSummary: vBatchSummary } = vComputedData;

  const ingredientGroups = useMemo(() => {
    if (!globalIngredients || globalIngredients.length === 0) return [];

    const groups = [];
    let currentGroup = null;

    globalIngredients.forEach((item, index) => {
      const vIng = vIngredients[index] || item;
      const typeKey = String(item.typeKey || item.type || "").toLowerCase();

      const prevItem = index > 0 ? globalIngredients[index - 1] : null;
      const prevTypeKey = prevItem ? String(prevItem.typeKey || prevItem.type || "").toLowerCase() : "";

      const shouldStartNewGroup =
        !currentGroup ||
        prevItem?.isSeparator ||
        (typeKey !== prevTypeKey &&
          (typeKey === "liquid" ||
            typeKey === "solid" ||
            prevTypeKey === "liquid" ||
            prevTypeKey === "solid"));

      if (shouldStartNewGroup) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          items: [],
          isSeparator: false,
          solidLiquidValue: vIng.solidLiquid || item.solidLiquid || "",
        };
      }

      if ((vIng.solidLiquid || item.solidLiquid) && !currentGroup.solidLiquidValue) {
        currentGroup.solidLiquidValue = vIng.solidLiquid || item.solidLiquid;
      }
      if (item.isSeparator) {
        currentGroup.isSeparator = true;
      }

      currentGroup.items.push({ item, vIng, index });
    });

    if (currentGroup && currentGroup.items.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [globalIngredients, vIngredients]);

  return (
    <div className="w-[400px] flex-none border-r border-[#EEEBF4] dark:border-primary/40 flex flex-col bg-white dark:bg-[#0D0B14]">
      {/* 1. INGREDIENT TABLE SECTION WITH SCALE BATCH HEADER */}
      <div className="flex flex-col border-b border-[#EEEBF4] dark:border-primary/40">
        {/* Version Header Card */}
        <div className="p-3 flex flex-col gap-2 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]">
          <div className="flex flex-col justify-between p-3 rounded-2xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30">
            {/* Top Row: Dropdown selector for version */}
            <div className="flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <span>VERSION {versionNumStr}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white dark:bg-[#151221] border border-[#EEEBF4] dark:border-primary/40 shadow-lg rounded-xl p-1 min-w-[140px] z-50">
                  {comparedVersions.map((v) => {
                    const numStr = String(Number(v?.version ?? 0) + 1).padStart(2, "0");
                    const isSelected = (v._id || v.version) === (scaleBatchVersion?._id || scaleBatchVersion?.version);
                    return (
                      <DropdownMenuItem
                        key={v._id || v.version}
                        onClick={() => onSelectScaleBatchVersion?.(v)}
                        className={cn(
                          "px-3 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-purple-100 dark:bg-primary/25 text-[#4B208B] dark:text-purple-300"
                            : "text-gray-700 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10"
                        )}
                      >
                        <span>VERSION {numStr}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#4B208B] dark:text-purple-300" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Middle: Dates and Code */}
            <div className="text-[11px] leading-tight space-y-0.5 mt-2">
              <p className="text-gray-500 font-medium">
                Recipe Creation Date:{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {formatDate(scaleBatchVersion?.createdAt || data?.createdAt) || "-"}
                </span>
              </p>
              <p className="text-gray-500 font-medium">
                Recipe Code:{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {scaleBatchVersion?.recipeCode || data?.recipeCode || "-"}
                </span>
              </p>
            </div>
          </div>

          {/* Scale Batch Section Header (Image 2) */}
          <div className="flex items-center h-[34px] px-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Scale Batch
            </h3>
          </div>
        </div>

        {/* Table Columns Header */}
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

        {/* Table Data Rows */}
        <div className="flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30">
          {ingredientGroups.map((group, gIdx) => (
            <div
              key={gIdx}
              className={cn(
                "flex",
                group.isSeparator && "border-b-2 border-[#4B208B]"
              )}
            >
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
                    </div>
                  </div>
                ))}
              </div>

              {showSolidLiquidColumn && (
                <div className="flex-1 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
                  <span>{group.solidLiquidValue || ""}</span>
                </div>
              )}
            </div>
          ))}

          {/* Total Row */}
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

        {/* Action buttons spacer to align bottom with other columns */}
        <div className="flex flex-col gap-2 p-4.5 bg-white dark:bg-[#0D0B14]">
          <div className="h-8" />
          <div className="h-8" />
        </div>
      </div>

      {/* 2. BATCH SUMMARY SECTION */}
      <BatchSummary
        vItem={scaleBatchVersion}
        data={data}
        vBatchSummary={vBatchSummary}
        draftYield={draftYield}
        setDraftYield={setDraftYield}
        draftServingSize={draftServingSize}
        setDraftServingSize={setDraftServingSize}
        isBatchSummaryEditing={isBatchSummaryEditing}
        setIsBatchSummaryEditing={setIsBatchSummaryEditing}
        onSaveSpecificFields={onSaveSpecificFields}
        isConfectionary={isConfectionary}
      />

      {/* 3. STANDARD OPERATING PROCEDURE SECTION */}
      <StandardOperatingProcedure
        vItem={scaleBatchVersion}
        data={data}
        normalizedVItem={normalizedVItem}
        recipeFormat={recipeFormat}
        onSaveSpecificFields={onSaveSpecificFields}
        isConfectionary={isConfectionary}
      />

      {/* 4. SENSORY FEEDBACK SECTION */}
      <SensoryFeedback
        vItem={scaleBatchVersion}
        formatDate={formatDate}
      />
    </div>
  );
}
