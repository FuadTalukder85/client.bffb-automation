import React, { useState, useMemo, useEffect, useRef } from "react";
import AddBFFProductModal from "./AddBFFProductModal";
import AddStandardIngredientModal from "./AddStandardIngredientModal";
import EditIngredientModal from "./EditIngredientModal";
import ArchiveIngredientModal from "./ArchiveIngredientModal";
import { useDeleteRecipeIngredient } from "@/hooks/mutations/useRecipeMutations";
import { cn } from "@/lib/utils";
import { buildIngredientsDisplayData, isConfectionaryRecipe } from "../data/ingredientsCalculations";
import { Download, CheckCircle, Eye, ChevronDown, Plus, ClipboardList, Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { mapUIParamsToBackend, buildSOPDataFromRecipe } from "../data/sopDataByFormat";

// ================= INDEPENDENT VERSION COLUMN COMPONENT =================
// Each VersionColumn maintains its OWN independent edit states, drafts, and save/cancel logic.
// ANY version can be edited without needing to select it first!
function VersionColumn({
  vItem,
  data,
  isFirstVersion = false,
  batchRef,
  sopRef,
  globalIngredients = [],
  showSolidLiquidColumn = true,
  formatDate,
  onFinalizeVersion,
  onFullDownload,
  onClientDownload,
  onPrepareSample,
  onEditRow,
  onSaveSpecificFields,
  recipeFormat = "bakery",
  isFinalized = false,
}) {
  const versionNumStr = String(Number(vItem?.version ?? 0) + 1).padStart(2, "0");
  const vIsFinalized = vItem?.recipeStatus === "final" || isFinalized;

  // Ensure version ingredients are sourced properly from vItem or fallback to data
  const versionIngredients = useMemo(() => {
    if (Array.isArray(vItem?.ingredients) && vItem.ingredients.length > 0) {
      return vItem.ingredients;
    }
    if (Array.isArray(data?.ingredients) && data.ingredients.length > 0) {
      return data.ingredients;
    }
    return [];
  }, [vItem?.ingredients, data?.ingredients]);

  const normalizedVItem = useMemo(() => ({
    ...vItem,
    recipeType: vItem?.recipeType || data?.recipeType,
    ingredients: versionIngredients,
  }), [data, vItem, versionIngredients]);

  // 1. Batch Summary Independent Edit Mode for THIS version
  const [isBatchSummaryEditing, setIsBatchSummaryEditing] = useState(false);
  const [isSavingBatchSummary, setIsSavingBatchSummary] = useState(false);
  const [draftYield, setDraftYield] = useState(vItem?.outputYield ?? data?.outputYield ?? 0);
  const [draftServingSize, setDraftServingSize] = useState(vItem?.outputServingSize ?? data?.outputServingSize ?? 0);

  useEffect(() => {
    setDraftYield(vItem?.outputYield ?? data?.outputYield ?? 0);
    setDraftServingSize(vItem?.outputServingSize ?? data?.outputServingSize ?? 0);
  }, [vItem?.outputYield, data?.outputYield, vItem?.outputServingSize, data?.outputServingSize]);

  // Compute calculated metrics dynamically for this specific version
  const vComputedData = useMemo(
    () =>
      buildIngredientsDisplayData(normalizedVItem, {
        outputYield: draftYield,
        outputServingSize: draftServingSize,
      }),
    [normalizedVItem, draftYield, draftServingSize]
  );

  const { ingredients: vIngredients, totals: vTotals, batchSummary: vBatchSummary } = vComputedData;

  // Group ingredients by segment (e.g. liquid group, solid group) so S/L (%) renders as a single merged cell
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

  // 2. Standard Operating Independent Edit Mode for THIS version
  const [isSOPEditing, setIsSOPEditing] = useState(false);
  const [isSavingSOP, setIsSavingSOP] = useState(false);

  const initialSOP = useMemo(
    () => buildSOPDataFromRecipe(normalizedVItem, recipeFormat),
    [normalizedVItem, recipeFormat]
  );

  const [draftProcedure, setDraftProcedure] = useState(
    initialSOP?.procedure?.raw || (initialSOP?.procedure?.steps || []).join("\n") || ""
  );

  const defaultParams = [
    { label: "Dough Temperature", value: "", unit: "°C" },
    { label: "SG", value: "", unit: "" },
    { label: "pH", value: "", unit: "" },
  ];
  const [draftParams, setDraftParams] = useState(
    initialSOP?.procedureParameters?.analyticalReport?.length > 0
      ? initialSOP.procedureParameters.analyticalReport
      : defaultParams
  );

  const defaultTunnelZones = [
    { label: "Top Temperature", zone1: "", zone2: "", zone3: "", unit: "°C" },
    { label: "Bottom Temperature", zone1: "", zone2: "", zone3: "", unit: "°C" },
  ];
  const [draftTunnelZones, setDraftTunnelZones] = useState(
    initialSOP?.ovenTemperature?.tunnelBaking?.zones?.length > 0
      ? initialSOP.ovenTemperature.tunnelBaking.zones
      : defaultTunnelZones
  );
  const [draftBakingTime, setDraftBakingTime] = useState(
    initialSOP?.ovenTemperature?.tunnelBaking?.bakingTime?.value || ""
  );
  const [draftBeltSpeed, setDraftBeltSpeed] = useState(
    initialSOP?.ovenTemperature?.tunnelBaking?.beltSpeed?.value || ""
  );

  const defaultRotaryBakings = [
    { label: "Oven Temperature", baking1: "", baking2: "", unit: "°C" },
    { label: "Oven Time", baking1: "", baking2: "", unit: "min" },
    { label: "Steam", baking1: "", baking2: "", unit: "unit" },
  ];
  const [draftRotaryBakings, setDraftRotaryBakings] = useState(
    initialSOP?.ovenTemperature?.normalBaking?.bakings?.length > 0
      ? initialSOP.ovenTemperature.normalBaking.bakings
      : defaultRotaryBakings
  );

  const defaultAfterBake = [
    { label: "Weight", value: "", unit: "g" },
    { label: "Size", value: "", unit: "" },
    { label: "Aeration", value: "", unit: "" },
    { label: "aw", value: "", unit: "" },
    { label: "Moisture", value: "", unit: "" },
  ];
  const [draftAfterBake, setDraftAfterBake] = useState(
    initialSOP?.afterBake?.analyticalReport?.length > 0
      ? initialSOP.afterBake.analyticalReport
      : defaultAfterBake
  );

  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    const updatedSop = buildSOPDataFromRecipe(normalizedVItem, recipeFormat);
    setDraftProcedure(
      updatedSop?.procedure?.raw || (updatedSop?.procedure?.steps || []).join("\n") || ""
    );
    setDraftParams(
      updatedSop?.procedureParameters?.analyticalReport?.length > 0
        ? updatedSop.procedureParameters.analyticalReport
        : defaultParams
    );
    setDraftTunnelZones(
      updatedSop?.ovenTemperature?.tunnelBaking?.zones?.length > 0
        ? updatedSop.ovenTemperature.tunnelBaking.zones
        : defaultTunnelZones
    );
    setDraftBakingTime(updatedSop?.ovenTemperature?.tunnelBaking?.bakingTime?.value || "");
    setDraftBeltSpeed(updatedSop?.ovenTemperature?.tunnelBaking?.beltSpeed?.value || "");
    setDraftRotaryBakings(
      updatedSop?.ovenTemperature?.normalBaking?.bakings?.length > 0
        ? updatedSop.ovenTemperature.normalBaking.bakings
        : defaultRotaryBakings
    );
    setDraftAfterBake(
      updatedSop?.afterBake?.analyticalReport?.length > 0
        ? updatedSop.afterBake.analyticalReport
        : defaultAfterBake
    );
  }, [normalizedVItem, recipeFormat]);

  // Save Batch Summary for THIS version
  const handleSaveBatchSummary = async () => {
    try {
      setIsSavingBatchSummary(true);
      if (onSaveSpecificFields) {
        await onSaveSpecificFields(
          {
            outputYield: Number(draftYield),
            outputServingSize: Number(draftServingSize),
          },
          vItem?._id || data?._id
        );
      }
      setIsBatchSummaryEditing(false);
    } catch (err) {
      console.error("Failed to save Batch Summary for version:", err);
    } finally {
      setIsSavingBatchSummary(false);
    }
  };

  const handleCancelBatchSummary = () => {
    setDraftYield(vItem?.outputYield ?? data?.outputYield ?? 0);
    setDraftServingSize(vItem?.outputServingSize ?? data?.outputServingSize ?? 0);
    setIsBatchSummaryEditing(false);
  };

  // Save Standard Operating for THIS version
  const handleSaveSOP = async () => {
    try {
      setIsSavingSOP(true);
      const topZone = draftTunnelZones.find((z) => z.label === "Top Temperature");
      const bottomZone = draftTunnelZones.find((z) => z.label === "Bottom Temperature");
      const tunnelData = {
        topTemperature: [topZone?.zone1, topZone?.zone2, topZone?.zone3].map(Number).filter(Number.isFinite),
        bottomTemperature: [bottomZone?.zone1, bottomZone?.zone2, bottomZone?.zone3].map(Number).filter(Number.isFinite),
        bakingTime: Number(draftBakingTime) || undefined,
        beltSpeed: Number(draftBeltSpeed) || undefined,
      };

      const ovenTempBaking = draftRotaryBakings.find((b) => b.label === "Oven Temperature");
      const ovenTimeBaking = draftRotaryBakings.find((b) => b.label === "Oven Time");
      const steamBaking = draftRotaryBakings.find((b) => b.label === "Steam");
      const normalData = {
        ovenTemperature: [ovenTempBaking?.baking1, ovenTempBaking?.baking2].map(Number).filter(Number.isFinite),
        ovenTime: [ovenTimeBaking?.baking1, ovenTimeBaking?.baking2].map(Number).filter(Number.isFinite),
        steam: Number(steamBaking?.baking1) || undefined,
      };

      const findVal = (label) => {
        const item = draftAfterBake.find((r) => r.label === label);
        return item?.value ? Number(item.value) : undefined;
      };
      const abData = {
        weight: findVal("Weight"),
        size: findVal("Size"),
        aeration: findVal("Aeration"),
        aW: findVal("aw"),
        moisture: findVal("Moisture"),
      };

      if (onSaveSpecificFields) {
        await onSaveSpecificFields(
          {
            procedureSOP: draftProcedure,
            procedureParameters: mapUIParamsToBackend(draftParams),
            ovenTemperatureTunnelBaking: tunnelData,
            normalBaking: normalData,
            afterBake: abData,
          },
          vItem?._id || data?._id
        );
      }

      setIsSOPEditing(false);
    } catch (err) {
      console.error("Failed to save Standard Operating for version:", err);
    } finally {
      setIsSavingSOP(false);
    }
  };

  const handleCancelSOP = () => {
    const updatedSop = buildSOPDataFromRecipe(normalizedVItem, recipeFormat);
    setDraftProcedure(
      updatedSop?.procedure?.raw || (updatedSop?.procedure?.steps || []).join("\n") || ""
    );
    setDraftParams(
      updatedSop?.procedureParameters?.analyticalReport?.length > 0
        ? updatedSop.procedureParameters.analyticalReport
        : defaultParams
    );
    setDraftTunnelZones(
      updatedSop?.ovenTemperature?.tunnelBaking?.zones?.length > 0
        ? updatedSop.ovenTemperature.tunnelBaking.zones
        : defaultTunnelZones
    );
    setDraftBakingTime(updatedSop?.ovenTemperature?.tunnelBaking?.bakingTime?.value || "");
    setDraftBeltSpeed(updatedSop?.ovenTemperature?.tunnelBaking?.beltSpeed?.value || "");
    setDraftRotaryBakings(
      updatedSop?.ovenTemperature?.normalBaking?.bakings?.length > 0
        ? updatedSop.ovenTemperature.normalBaking.bakings
        : defaultRotaryBakings
    );
    setDraftAfterBake(
      updatedSop?.afterBake?.analyticalReport?.length > 0
        ? updatedSop.afterBake.analyticalReport
        : defaultAfterBake
    );
    setIsSOPEditing(false);
  };

  const topZone = draftTunnelZones.find((z) => z.label === "Top Temperature") || { zone1: "", zone2: "", zone3: "" };
  const bottomZone = draftTunnelZones.find((z) => z.label === "Bottom Temperature") || { zone1: "", zone2: "", zone3: "" };
  const ovenTempRow = draftRotaryBakings.find((b) => b.label === "Oven Temperature") || { baking1: "", baking2: "" };
  const ovenTimeRow = draftRotaryBakings.find((b) => b.label === "Oven Time") || { baking1: "", baking2: "" };
  const steamRow = draftRotaryBakings.find((b) => b.label === "Steam") || { baking1: "", baking2: "" };

  return (
    <div className="w-[300px] flex-none border-r border-[#EEEBF4] dark:border-primary/40 flex flex-col">
      {/* 1. INGREDIENT TABLE SECTION */}
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
              {vTotals.quantity}
            </div>
            <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
              {vTotals.composition}
            </div>
            {showSolidLiquidColumn && (
              <div className="flex-1 h-full flex items-center justify-center">
                {vTotals.solidLiquid}
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

      {/* 2. BATCH SUMMARY SECTION (Image 1) */}
      <div
        ref={isFirstVersion ? batchRef : undefined}
        className="p-4 space-y-6 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]"
      >
        {/* Output Block */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Output
            </span>

            {isBatchSummaryEditing ? (
              <div className="flex items-center overflow-hidden rounded-xl bg-[#4B208B] text-white shadow-sm">
                <button
                  type="button"
                  onClick={handleSaveBatchSummary}
                  disabled={isSavingBatchSummary}
                  title="Save Batch Summary"
                  className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/30" />
                <button
                  type="button"
                  onClick={handleCancelBatchSummary}
                  disabled={isSavingBatchSummary}
                  title="Cancel Batch Summary"
                  className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsBatchSummaryEditing(true)}
                title="Edit Batch Summary"
                className="w-8 h-8 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-sm cursor-pointer"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2x2 Tiles Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Yield */}
            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[11px] font-medium text-gray-500">Yield</span>
              {isBatchSummaryEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={draftYield}
                    onChange={(e) => setDraftYield(e.target.value)}
                    className="w-full text-xs font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">%</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {draftYield} %
                </span>
              )}
            </div>

            {/* Serving Size */}
            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[11px] font-medium text-gray-500">Serving Size</span>
              {isBatchSummaryEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={draftServingSize}
                    onChange={(e) => setDraftServingSize(e.target.value)}
                    className="w-full text-xs font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">g</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {draftServingSize} g
                </span>
              )}
            </div>

            {/* Output Pieces */}
            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[11px] font-medium text-gray-500">Output Pieces</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.output?.outputPieces ?? "-"} pcs
              </span>
            </div>

            {/* Output */}
            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[11px] font-medium text-gray-500">Output</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.output?.output ?? "-"} g
              </span>
            </div>
          </div>
        </div>

        {/* BFF Cost Calculation Block */}
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              BFF Cost Calculation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (without loss)</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.costCalculation?.doughCostPerKg?.bff ?? "-"} %
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (with loss)</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.costCalculation?.costPerKgWithLoss?.bff ?? "-"} g
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per piece</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.costCalculation?.costPerPiece?.bff ?? "-"} pcs
              </span>
            </div>
          </div>
        </div>
        {/* Client Cost Calculation Block - part of Batch Summary */}
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Client Cost Calculation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (without loss)</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.costCalculation?.doughCostPerKg?.client ?? "-"} %
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (with loss)</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.costCalculation?.costPerKgWithLoss?.client ?? "-"} g
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
              <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per piece</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {vBatchSummary?.costCalculation?.costPerPiece?.client ?? "-"} pcs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STANDARD OPERATING PROCEDURE SECTION (Image 1, 2, 3) */}
      <div
        ref={isFirstVersion ? sopRef : undefined}
        className="p-4 space-y-6 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]"
      >
        {/* Procedure Block (Image 2) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Procedure
            </span>

            {isSOPEditing ? (
              <div className="flex items-center overflow-hidden rounded-xl bg-[#4B208B] text-white shadow-sm">
                <button
                  type="button"
                  onClick={handleSaveSOP}
                  disabled={isSavingSOP}
                  title="Save Standard Operating"
                  className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/30" />
                <button
                  type="button"
                  onClick={handleCancelSOP}
                  disabled={isSavingSOP}
                  title="Cancel Standard Operating"
                  className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSOPEditing(true)}
                title="Edit Standard Operating"
                className="w-8 h-8 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-sm cursor-pointer"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isSOPEditing ? (
            <textarea
              rows={6}
              value={draftProcedure}
              onChange={(e) => setDraftProcedure(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-900 dark:text-white resize-none focus:outline-none shadow-sm"
            />
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
              {draftProcedure || "-"}
            </div>
          )}
        </div>

        {/* Parameters Block (Image 2) */}
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Parameters
            </span>
          </div>

          <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#FCFBFD] dark:bg-[#121019] text-xs">
            {draftParams.map((param, pIdx) => (
              <div key={pIdx} className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-gray-500 font-medium">{param.label}</span>
                {isSOPEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftParams((prev) =>
                          prev.map((p) => (p.label === param.label ? { ...p, value: val } : p))
                        );
                      }}
                      className="w-16 text-right px-1.5 py-0.5 rounded border-2 border-[#4B208B] text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#151221]"
                    />
                    {param.unit && <span className="font-bold text-gray-900 dark:text-white">{param.unit}</span>}
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 dark:text-white">
                    {param.value ? `${param.value} ${param.unit || ""}`.trim() : "-"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Oven Temperature (Image 2 & 3) */}
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Oven Temperature
            </span>
          </div>

          {/* Tunnel Baking */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#4B208B] dark:text-purple-300">
              Tunnel Baking
            </span>

            <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden bg-[#FCFBFD] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30">
              <div className="flex items-center text-center font-bold text-gray-700 dark:text-gray-300 bg-[#F7F5FA] dark:bg-primary/15">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Zone</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">1</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">2</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">3</div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Top Temperature</div>
                {["zone1", "zone2", "zone3"].map((zk) => (
                  <div key={zk} className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                    {isSOPEditing ? (
                      <input
                        type="text"
                        value={topZone[zk] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftTunnelZones((prev) =>
                            prev.map((z) => (z.label === "Top Temperature" ? { ...z, [zk]: val } : z))
                          );
                        }}
                        className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                      />
                    ) : (
                      topZone[zk] ? `${topZone[zk]} °C` : "-"
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Bottom Temperature</div>
                {["zone1", "zone2", "zone3"].map((zk) => (
                  <div key={zk} className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                    {isSOPEditing ? (
                      <input
                        type="text"
                        value={bottomZone[zk] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftTunnelZones((prev) =>
                            prev.map((z) => (z.label === "Bottom Temperature" ? { ...z, [zk]: val } : z))
                          );
                        }}
                        className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                      />
                    ) : (
                      bottomZone[zk] ? `${bottomZone[zk]} °C` : "-"
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Baking Time</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={draftBakingTime}
                      onChange={(e) => setDraftBakingTime(e.target.value)}
                      className="w-16 text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    draftBakingTime ? `${draftBakingTime} min` : "-"
                  )}
                </div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Belt Speed</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={draftBeltSpeed}
                      onChange={(e) => setDraftBeltSpeed(e.target.value)}
                      className="w-16 text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    draftBeltSpeed ? `${draftBeltSpeed} min` : "-"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rotary Baking (Image 3) */}
          <div className="space-y-2 mt-4">
            <span className="text-xs font-bold text-[#4B208B] dark:text-purple-300">
              Rotary Baking
            </span>

            <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden bg-[#FCFBFD] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30">
              <div className="flex items-center text-center font-bold text-gray-700 dark:text-gray-300 bg-[#F7F5FA] dark:bg-primary/15">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Baking</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">1st</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">2nd</div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Oven Temperature</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={ovenTempRow.baking1 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftRotaryBakings((prev) =>
                          prev.map((b) => (b.label === "Oven Temperature" ? { ...b, baking1: val } : b))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    ovenTempRow.baking1 ? `${ovenTempRow.baking1} °C` : "-"
                  )}
                </div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={ovenTempRow.baking2 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftRotaryBakings((prev) =>
                          prev.map((b) => (b.label === "Oven Temperature" ? { ...b, baking2: val } : b))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    ovenTempRow.baking2 ? `${ovenTempRow.baking2} °C` : "-"
                  )}
                </div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Oven Time</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={ovenTimeRow.baking1 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftRotaryBakings((prev) =>
                          prev.map((b) => (b.label === "Oven Time" ? { ...b, baking1: val } : b))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    ovenTimeRow.baking1 ? `${ovenTimeRow.baking1} min` : "-"
                  )}
                </div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={ovenTimeRow.baking2 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftRotaryBakings((prev) =>
                          prev.map((b) => (b.label === "Oven Time" ? { ...b, baking2: val } : b))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    ovenTimeRow.baking2 ? `${ovenTimeRow.baking2} min` : "-"
                  )}
                </div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Steam</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={steamRow.baking1 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftRotaryBakings((prev) =>
                          prev.map((b) => (b.label === "Steam" ? { ...b, baking1: val } : b))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    steamRow.baking1 || "-"
                  )}
                </div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={steamRow.baking2 || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftRotaryBakings((prev) =>
                          prev.map((b) => (b.label === "Steam" ? { ...b, baking2: val } : b))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    steamRow.baking2 || "-"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* After Bake: Analytical Report (Image 3) */}
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              After Bake: Analytical Report
            </span>
          </div>

          <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#FCFBFD] dark:bg-[#121019] text-xs">
            {draftAfterBake.map((param, pIdx) => (
              <div key={pIdx} className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-gray-500 font-medium">{param.label}</span>
                {isSOPEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftAfterBake((prev) =>
                          prev.map((p) => (p.label === param.label ? { ...p, value: val } : p))
                        );
                      }}
                      className="w-16 text-right px-1.5 py-0.5 rounded border-2 border-[#4B208B] text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#151221]"
                    />
                    {param.unit && <span className="font-bold text-gray-900 dark:text-white">{param.unit}</span>}
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 dark:text-white">
                    {param.value ? `${param.value} ${param.unit || ""}`.trim() : "-"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. SENSORY FEEDBACK SECTION (Image 4 & 5) */}
      <div className="p-4 space-y-6 bg-white dark:bg-[#0D0B14]">
        {/* Others Block (Image 4) */}
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Others
            </span>
          </div>

          <div className="space-y-3">
            {Array.isArray(vItem?.activities) && vItem.activities.length > 0 ? (
              vItem.activities.map((act, actIdx) => (
                <div key={actIdx} className="p-3.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#4B208B] text-white font-bold text-[10px] flex items-center justify-center">
                      {(act.userName || act.user || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                      <span className="font-bold text-gray-900 dark:text-white truncate">{act.userName || act.user || "User"}</span>
                      {act.tag && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 text-[10px] font-semibold whitespace-nowrap">
                          {act.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(act.createdAt) || "-"}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[11px]">
                    {act.text || act.comment || ""}
                  </p>
                </div>
              ))
            ) : null}

            {/* Comment Input Box */}
            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder="Enter Comment"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#EEEBF4] dark:border-primary/30 text-xs leading-relaxed bg-[#FCFBFD] dark:bg-[#121019] text-gray-900 dark:text-white resize-none focus:outline-none shadow-sm"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setNewCommentText("")}
                  className="px-4 py-1.5 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sensory Feedback Cards (Image 5) */}
        {Array.isArray(vItem?.sensoryFeedbacks) && vItem.sensoryFeedbacks.length > 0 && (
          <div className="space-y-4 pt-2">
            {vItem.sensoryFeedbacks.map((fb, fbIdx) => (
              <div key={fbIdx} className="p-4 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full font-bold text-xs",
                    fb.status === "Approved" ? "bg-[#E8F8F0] text-[#1B805A] border border-green-200" : "bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300"
                  )}>
                    {fb.status || "Feedback"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold">
                    {String(fbIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-gray-500 font-medium text-[11px]">
                    {formatDate(fb.createdAt) || "-"}
                  </span>
                </div>

                {fb.comment && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Comment</span>
                    <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                      {fb.comment}
                    </p>
                  </div>
                )}

                {fb.remark && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Remark</span>
                    <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                      {fb.remark}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= MAIN INGREDIENTS TABLE CONTAINER =================
export default function IngredientsTable({
  data,
  versions = [],
  currentVersion,
  onIngredientsChange,
  onRecipeChange,
  sopData,
  onSOPChange,
  onSaveSpecificFields,
  onFinalizeVersion,
  onFullDownload,
  onClientDownload,
  onPrepareSample,
  formatDate = (d) => d || "-",
  recipeFormat = "bakery",
  isFinalized = false,
}) {
  const [isBFFModalOpen, setIsBFFModalOpen] = useState(false);
  const [isStandardIngredientModalOpen, setIsStandardIngredientModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [targetVersionForIngredient, setTargetVersionForIngredient] = useState(null);
  const [ingredientToArchive, setIngredientToArchive] = useState(null);

  const deleteIngredientMutation = useDeleteRecipeIngredient();

  const HIDDEN_TYPE_SOLID_LIQUID_RECIPES = ["beverage", "beverage psd"];
  const recipeTypeLower = data?.recipeType?.toLowerCase() || recipeFormat || "";
  const isHiddenTypeAndSolidLiquid = HIDDEN_TYPE_SOLID_LIQUID_RECIPES.includes(recipeTypeLower);
  const isConfectionary = isConfectionaryRecipe(data?.recipeType);
  const showSolidLiquidColumn = !isHiddenTypeAndSolidLiquid && !isConfectionary;

  const baseComputed = useMemo(() => buildIngredientsDisplayData(data), [data]);
  const globalIngredients = baseComputed.ingredients;

  const handleBFFProductConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData]);
  };

  const handleStandardIngredientConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData]);
  };

  const handleEditRow = (ingredient, index, vItem) => {
    setSelectedIngredient({ ...ingredient, index: ingredient.originalIndex ?? index });
    setTargetVersionForIngredient(vItem || data);
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = (formData) => {
    const targetRecipe = targetVersionForIngredient || data;
    const currentIngredients = Array.isArray(targetRecipe?.ingredients) ? [...targetRecipe.ingredients] : [];
    const updateIndex = Number(formData?.index);

    if (Number.isInteger(updateIndex) && updateIndex >= 0 && updateIndex < currentIngredients.length) {
      currentIngredients[updateIndex] = {
        ...currentIngredients[updateIndex],
        ...formData,
      };
      onIngredientsChange?.(currentIngredients, targetRecipe?._id);
    }

    setIsEditModalOpen(false);
    setTargetVersionForIngredient(null);
  };

  const handleArchiveRow = (ingredient, vItem) => {
    setIngredientToArchive(ingredient);
    setTargetVersionForIngredient(vItem || data);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!ingredientToArchive) return;
    const targetRecipe = targetVersionForIngredient || data;
    const currentIngredients = Array.isArray(targetRecipe?.ingredients) ? [...targetRecipe.ingredients] : [];
    const deleteIndex = Number(ingredientToArchive?.originalIndex);

    if (Number.isInteger(deleteIndex) && deleteIndex >= 0 && deleteIndex < currentIngredients.length) {
      if (ingredientToArchive._id && targetRecipe?._id) {
        await deleteIngredientMutation.mutateAsync({
          recipeId: targetRecipe._id,
          ingredientId: ingredientToArchive._id,
        });
      }
      currentIngredients.splice(deleteIndex, 1);
      onIngredientsChange?.(currentIngredients, targetRecipe?._id);
    }
    setIsArchiveModalOpen(false);
    setIngredientToArchive(null);
    setTargetVersionForIngredient(null);
  };

  const displayVersions = useMemo(() => {
    if (Array.isArray(versions) && versions.length > 0) {
      return versions;
    }
    return [
      {
        _id: data?._id,
        version: currentVersion ?? data?.version ?? 0,
        createdAt: data?.createdAt,
        recipeCode: data?.recipeCode || "-",
        recipeStatus: data?.recipeStatus,
        ingredients: data?.ingredients,
        outputYield: data?.outputYield ?? 0,
        outputServingSize: data?.outputServingSize ?? 0,
      },
    ];
  }, [versions, data, currentVersion]);

  // Section Height Matching for perfect horizontal alignment with left column
  const firstVersionBatchRef = useRef(null);
  const firstVersionSopRef = useRef(null);
  // Force re-measure on mount — resets stale HMR state
  const [sectionHeights, setSectionHeights] = useState({ batchSummary: null, sop: null });

  useEffect(() => {
    const updateHeights = () => {
      const bsHeight = firstVersionBatchRef.current?.offsetHeight;
      const sopHeight = firstVersionSopRef.current?.offsetHeight;
      setSectionHeights((prev) => {
        const newBS = bsHeight || null;
        const newSOP = sopHeight || null;
        if (prev.batchSummary === newBS && prev.sop === newSOP) return prev;
        return { batchSummary: newBS, sop: newSOP };
      });
    };

    // ResizeObserver reacts to actual DOM size changes
    const observer = new ResizeObserver(updateHeights);
    if (firstVersionBatchRef.current) observer.observe(firstVersionBatchRef.current);
    if (firstVersionSopRef.current) observer.observe(firstVersionSopRef.current);

    // Measure immediately, then retry to catch async renders
    updateHeights();
    const t1 = setTimeout(updateHeights, 100);
    const t2 = setTimeout(updateHeights, 500);
    window.addEventListener("resize", updateHeights);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateHeights);
    };
  }, [displayVersions]);

  // Sync scroll for the static bottom scrollbar
  const tableContainerRef = useRef(null);
  const scrollbarTrackRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);

  const updateScrollDimensions = React.useCallback(() => {
    if (tableContainerRef.current) {
      setScrollWidth(tableContainerRef.current.scrollWidth);
      setClientWidth(tableContainerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    updateScrollDimensions();
    const timer = setTimeout(updateScrollDimensions, 100);
    const interval = setInterval(updateScrollDimensions, 1000);
    window.addEventListener("resize", updateScrollDimensions);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("resize", updateScrollDimensions);
    };
  }, [displayVersions, globalIngredients, updateScrollDimensions]);

  const handleTableScroll = (e) => {
    if (scrollbarTrackRef.current && e.target) {
      scrollbarTrackRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleBottomScroll = (e) => {
    if (tableContainerRef.current && e.target) {
      tableContainerRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const hasHorizontalScroll = scrollWidth > clientWidth + 10;

  return (
    <div className="flex flex-col w-full relative">
      {/* Unified Scrollable Table & Sections Container */}
      <div
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full border border-[#EEEBF4] dark:border-primary/40 rounded-3xl bg-white dark:bg-[#0D0B14]"
      >
        <div className="flex min-w-max">
          {/* ================= LEFT CONTINUOUS SOLID FIXED COLUMN ================= */}
          <div className="sticky left-0 z-20 bg-white dark:bg-[#0D0B14] border-r border-[#EEEBF4] dark:border-primary/40 flex-none w-[340px] shadow-[4px_0_10px_rgba(0,0,0,0.02)] flex flex-col">
            {/* 1. Ingredient Table Left Header & Rows */}
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
                  </div>
                ))}

                {/* Total Row */}
                <div className="flex items-center h-12 font-bold text-xs text-[#4B208B] dark:text-purple-300 border-t-2 border-[#4B208B]/40 bg-[#FCFBFD] dark:bg-[#121019]">
                  <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                  <div className="w-20 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                  <div className="flex-1 text-center pr-6">Total</div>
                </div>
              </div>

              {/* Action Buttons Row - matches right side's 2-row layout */}
              <div className="flex flex-col gap-2 p-4 bg-white dark:bg-[#0D0B14]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBFFModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs hover:bg-[#EFEAF9] dark:hover:bg-primary/25 transition-all shadow-sm cursor-pointer"
                  >
                    BFF Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStandardIngredientModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs hover:bg-[#EFEAF9] dark:hover:bg-primary/25 transition-all shadow-sm cursor-pointer"
                  >
                    Standard Ingredient
                  </button>
                </div>
                {/* Spacer row to match right side's Hidden (4) button row */}
                <div className="h-9" />
              </div>
            </div>

            {/* 2. Batch Summary Left Title */}
            <div
              style={sectionHeights.batchSummary ? { height: `${sectionHeights.batchSummary}px` } : undefined}
              className="p-6 border-b border-[#EEEBF4] dark:border-primary/40 flex flex-col justify-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Batch Summary
              </h2>
            </div>

            {/* 3. Standard Operating Procedure Left Title */}
            <div
              style={sectionHeights.sop ? { height: `${sectionHeights.sop}px` } : undefined}
              className="p-6 border-b border-[#EEEBF4] dark:border-primary/40 flex flex-col justify-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                Standard Operating<br />Procedure
              </h2>
            </div>

            {/* 4. Sensory Feedback Left Title */}
            <div className="p-6 flex-1 flex flex-col justify-start">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Sensory Feedback
              </h2>
            </div>
          </div>

          {/* ================= RIGHT SCROLLABLE VERSION COLUMNS ================= */}
          <div className="flex items-start">
            {displayVersions.map((vItem, vIndex) => (
              <VersionColumn
                key={vItem._id || vIndex}
                vItem={vItem}
                data={data}
                isFirstVersion={vIndex === 0}
                batchRef={firstVersionBatchRef}
                sopRef={firstVersionSopRef}
                globalIngredients={globalIngredients}
                showSolidLiquidColumn={showSolidLiquidColumn}
                formatDate={formatDate}
                onFinalizeVersion={onFinalizeVersion}
                onFullDownload={onFullDownload}
                onClientDownload={onClientDownload}
                onPrepareSample={onPrepareSample}
                onEditRow={handleEditRow}
                onSaveSpecificFields={onSaveSpecificFields}
                recipeFormat={recipeFormat}
                isFinalized={isFinalized}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Static / Sticky Horizontal Scrollbar Pinned at Bottom of Viewport (Matching Screenshot) */}
      {hasHorizontalScroll && (
        <div className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-[#0D0B14]/95 backdrop-blur-md border-t border-[#EEEBF4] dark:border-primary/40 py-2.5 px-4 flex items-center shadow-[0_-4px_12px_rgba(0,0,0,0.04)] rounded-b-3xl">
          {/* Left 340px fixed column offset so the scrollbar track starts after the left column */}
          <div className="w-[340px] flex-none hidden md:block" />
          <div
            ref={scrollbarTrackRef}
            onScroll={handleBottomScroll}
            className="flex-1 overflow-x-auto custom-scrollbar h-3 cursor-pointer"
          >
            <div
              style={{ width: `${Math.max(scrollWidth - 340, 100)}px` }}
              className="h-1"
            />
          </div>
        </div>
      )}

      {/* Modals for Ingredients */}
      <AddBFFProductModal
        isOpen={isBFFModalOpen}
        onClose={() => setIsBFFModalOpen(false)}
        onConfirm={handleBFFProductConfirm}
        isConfectionary={isConfectionary}
      />

      <AddStandardIngredientModal
        isOpen={isStandardIngredientModalOpen}
        onClose={() => setIsStandardIngredientModalOpen(false)}
        onConfirm={handleStandardIngredientConfirm}
        isConfectionary={isConfectionary}
      />

      <EditIngredientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTargetVersionForIngredient(null);
        }}
        onConfirm={handleEditConfirm}
        initialData={selectedIngredient}
        isConfectionary={isConfectionary}
      />

      <ArchiveIngredientModal
        open={isArchiveModalOpen}
        onOpenChange={(open) => {
          setIsArchiveModalOpen(open);
          if (!open) setTargetVersionForIngredient(null);
        }}
        ingredientName={ingredientToArchive?.name}
        onConfirm={handleArchiveConfirm}
        isLoading={deleteIngredientMutation.isPending}
      />
    </div>
  );
}
