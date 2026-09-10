import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus, Check, CheckCircle, Save, X, ClipboardList, Eye, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildIngredientsDisplayData, isConfectionaryRecipe } from "../data/ingredientsCalculations";
import AddBFFProductModal from "./AddBFFProductModal";
import AddStandardIngredientModal from "./AddStandardIngredientModal";
import EditIngredientModal from "./EditIngredientModal";
import ArchiveIngredientModal from "./ArchiveIngredientModal";
import DeleteIngredientModal from "./DeleteIngredientModal";
import BatchSummary, { BatchSummaryLeftHeader } from "./BatchSummary";
import StandardOperatingProcedure, { StandardOperatingProcedureLeftHeader } from "./StandardOperatingProcedure";
import SensoryFeedback, { SensoryFeedbackLeftHeader } from "./SensoryFeedback";
import ScaleBatchColumn from "./ScaleBatchColumn";
import { useDeleteRecipeIngredient } from "@/hooks/mutations/useRecipeMutations";
import { useRecipeById } from "@/hooks/useRecipes";

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

// ================= MOBILE VERSION COLUMN =================
function MobileVersionColumn({
  vItem,
  data,
  isFirstVersion = false,
  batchRef,
  sopRef,
  batchHeight,
  sopHeight,
  globalIngredients = [],
  showSolidLiquidColumn = true,
  formatDate,
  onFinalizeVersion,
  onFullDownload,
  onClientDownload,
  onPrepareSample,
  onSample,
  onEditRow,
  onSaveSpecificFields,
  recipeFormat = "bakery",
  isConfectionary = false,
  isFinalized = false,
  isSelectingForCompare = false,
  isSelectedForCompare = false,
  onToggleSelectCompare,
}) {
  const [isHiddenDropdownOpen, setIsHiddenDropdownOpen] = useState(false);
  const [selectedHiddenColumns, setSelectedHiddenColumns] = useState([]);
  const hiddenDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hiddenDropdownRef.current && !hiddenDropdownRef.current.contains(e.target)) {
        setIsHiddenDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const versionNumStr = String(Number(vItem?.version ?? 0) + 1).padStart(2, "0");
  const isCurrentData =
    vItem?._id === data?._id ||
    (vItem?.version !== undefined && data?.version !== undefined && vItem?.version === data?.version);
  const targetId = vItem?._id;

  const { data: fetchedDetail } = useRecipeById(targetId, {
    enabled: !isCurrentData && !!targetId && (!Array.isArray(vItem?.ingredients) || vItem.ingredients.length === 0),
  });

  const effectiveVersionData = useMemo(() => {
    if (isCurrentData && data) return data;
    if (fetchedDetail) return { ...vItem, ...fetchedDetail };
    return vItem || {};
  }, [isCurrentData, data, fetchedDetail, vItem]);

  const effectiveStatus = effectiveVersionData?.recipeStatus || vItem?.recipeStatus;
  const vIsFinalized =
    ["final", "approved", "finalized"].includes(String(effectiveStatus || "").toLowerCase()) ||
    Boolean(
      isCurrentData &&
        (["final", "approved", "finalized"].includes(String(data?.recipeStatus || "").toLowerCase()) || isFinalized)
    );

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

  // Batch Summary Independent Edit States
  const [isBatchSummaryEditing, setIsBatchSummaryEditing] = useState(false);
  const [draftYield, setDraftYield] = useState(
    vItem?.yield ?? vItem?.outputYield ?? data?.yield ?? data?.outputYield ?? 100
  );
  const [draftServingSize, setDraftServingSize] = useState(
    vItem?.servingSize ?? vItem?.outputServingSize ?? data?.servingSize ?? data?.outputServingSize ?? 100
  );
  const [draftPerPiece, setDraftPerPiece] = useState(
    vItem?.perPiece ?? data?.perPiece ?? 12
  );
  const [draftPacketQuantity, setDraftPacketQuantity] = useState(
    vItem?.packetQuantity ?? data?.packetQuantity ?? 4
  );

  useEffect(() => {
    setDraftYield(
      vItem?.yield ?? vItem?.outputYield ?? data?.yield ?? data?.outputYield ?? 100
    );
    setDraftServingSize(
      vItem?.servingSize ?? vItem?.outputServingSize ?? data?.servingSize ?? data?.outputServingSize ?? 100
    );
    setDraftPerPiece(
      vItem?.perPiece ?? data?.perPiece ?? 12
    );
    setDraftPacketQuantity(
      vItem?.packetQuantity ?? data?.packetQuantity ?? 4
    );
  }, [
    vItem?.yield,
    vItem?.outputYield,
    data?.yield,
    data?.outputYield,
    vItem?.servingSize,
    vItem?.outputServingSize,
    data?.servingSize,
    data?.outputServingSize,
    vItem?.perPiece,
    data?.perPiece,
    vItem?.packetQuantity,
    data?.packetQuantity,
  ]);

  const vComputedData = useMemo(
    () =>
      buildIngredientsDisplayData(normalizedVItem, {
        yield: draftYield,
        outputYield: draftYield,
        servingSize: draftServingSize,
        outputServingSize: draftServingSize,
        perPiece: draftPerPiece,
        packetQuantity: draftPacketQuantity,
      }),
    [normalizedVItem, draftYield, draftServingSize, draftPerPiece, draftPacketQuantity]
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
    }
  };

  return (
    <div
      data-version-col={String(vItem?.version ?? "")}
      data-version-num={String(Number(vItem?.version ?? 0) + 1)}
      data-version-id={String(vItem?._id ?? "")}
      id={`version-column-${vItem?.version}`}
      className={cn(
        "flex-none border-r border-[#EEEBF4] dark:border-primary/40 flex flex-col w-[235px] transition-all duration-200",
        isSelectingForCompare && !isSelectedForCompare && "opacity-40 bg-gray-100/50 dark:bg-[#151221]/80 select-none"
      )}
    >
      {/* 1. TOP VERSION CARD (Matching Video 00:00 - 00:03) */}
      <div className="h-[124px] p-2.5 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]">
        <div
          onClick={isSelectingForCompare ? onToggleSelectCompare : undefined}
          className={cn(
            "h-full flex flex-col justify-between p-2.5 rounded-2xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 transition-all",
            isSelectingForCompare && "cursor-pointer"
          )}
        >
          {/* Top Row: V03 Badge + Title + Status / Checkbox */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-[#4B208B] text-white font-extrabold text-xs tracking-wider uppercase shrink-0">
                V{versionNumStr}
              </span>
              <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                {vItem?.recipeName || vItem?.name || data?.recipeName || data?.name || "Recipe"}
              </span>
            </div>

            {isSelectingForCompare ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelectCompare?.();
                }}
                className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all shrink-0",
                  isSelectedForCompare
                    ? "bg-[#4B208B] text-white shadow-xs"
                    : "border-2 border-gray-400 dark:border-gray-500 bg-white/80 dark:bg-black/40 hover:border-[#4B208B]"
                )}
              >
                {isSelectedForCompare && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            ) : vIsFinalized ? (
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-primary/30 border border-purple-200 dark:border-primary/40 text-[#4B208B] dark:text-purple-300 font-bold text-[10px] shrink-0">
                Approved
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onFinalizeVersion?.(vItem)}
                className="px-2 py-0.5 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <CheckCircle className="w-3 h-3" />
                Finalize
              </button>
            )}
          </div>

          {/* Dates & Code */}
          <div className="text-[10px] leading-tight space-y-0.5">
            <p className="text-gray-500 dark:text-gray-400">
              Code:{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {vItem?.recipeCode || data?.recipeCode || "-"}
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Created:{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {formatDate(vItem?.createdAt || data?.createdAt)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Download Action Buttons (Matching Video 00:00 - 00:03) */}
      <div className="h-14 px-3 flex items-center justify-center gap-2.5 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]">
        {!isSelectingForCompare && (
          <>
            {/* Cloud Download */}
            <button
              type="button"
              onClick={() => onFullDownload?.(vItem)}
              title="Full Download"
              className="w-10 h-10 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m8 17 4 4 4-4" />
              </svg>
            </button>

            {/* User Download */}
            <button
              type="button"
              onClick={() => onClientDownload?.(vItem)}
              title="Client Download"
              className="w-10 h-10 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 19 14 22 11" />
                <line x1="19" y1="8" x2="19" y2="14" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Version Table Sub-Headers: Qty (g) | Cmp (%) | S/L (%) (Video 00:00 - 00:03) */}
      <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
        <div className="w-[68px] h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 whitespace-nowrap px-1 text-[11px]">
          Qty (g)
        </div>
        <div className="w-[74px] h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 whitespace-nowrap px-1 text-[11px]">
          Cmp (%)
        </div>
        <div className="flex-1 h-full flex items-center justify-center whitespace-nowrap px-1 text-[11px]">
          S/L (%)
        </div>
      </div>

      {/* Table Data Rows */}
      <div className="flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30">
        {ingredientGroups.map((group, gIdx) => (
          <div
            key={gIdx}
            className={cn("flex", group.isSeparator && "border-b-2 border-[#4B208B]")}
          >
            <div className="w-[142px] flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30 border-r border-[#EEEBF4] dark:border-primary/30">
              {group.items.map(({ vIng, index }) => (
                <div
                  key={index}
                  className="flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <div className="w-[68px] h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
                    <span className="truncate">{vIng?.quantity !== undefined && vIng?.quantity !== null ? Number(vIng.quantity).toFixed(0) : "-"}</span>
                  </div>
                  <div className="w-[74px] h-full flex items-center justify-center">
                    <span className="truncate">{vIng?.cmp !== undefined && vIng?.cmp !== null ? Number(vIng.cmp).toFixed(0) : (vIng?.quantity !== undefined ? Number(vIng.quantity).toFixed(0) : "-")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* S/L (%) merged group cell */}
            <div className="flex-1 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
              {group.solidLiquidValue !== undefined && group.solidLiquidValue !== null && group.solidLiquidValue !== "" ? (
                <span>{Number(group.solidLiquidValue).toFixed(0)}</span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
        ))}

        {/* Total Row */}
        <div className="flex items-center h-12 font-bold text-xs text-[#4B208B] dark:text-purple-300 border-t-2 border-[#4B208B]/40 bg-[#FCFBFD] dark:bg-[#121019]">
          <div className="w-[68px] h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
            {vTotals?.quantity !== undefined ? Number(vTotals.quantity).toFixed(0) : "60"}
          </div>
          <div className="w-[74px] h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
            {vTotals?.cmp !== undefined ? Number(vTotals.cmp).toFixed(0) : "72"}
          </div>
          <div className="flex-1 h-full flex items-center justify-center">
            {vTotals?.solidLiquid !== undefined ? Number(vTotals.solidLiquid).toFixed(0) : "100"}
          </div>
        </div>
      </div>

      {/* Action Buttons: Prepare Sample, + Sample & Hidden Columns Dropdown [ 👁️ ˅ ] (Matching User Screenshot) */}
      <div className="p-3 bg-white dark:bg-[#0D0B14] border-b border-[#EEEBF4] dark:border-primary/40 flex flex-col gap-2 justify-center min-h-[96px]">
        <button
          type="button"
          onClick={() => (onPrepareSample ? onPrepareSample(vItem) : onSample?.(vItem, data))}
          className="w-full py-1.5 px-2 rounded-xl border border-[#4B208B] bg-white dark:bg-[#0D0B14] hover:bg-[#F0EDF6] text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Prepare Sample</span>
        </button>

        <div className="flex items-center gap-1.5 relative" ref={hiddenDropdownRef}>
          <button
            type="button"
            onClick={handleSampleClick}
            className="flex-1 py-1.5 px-2 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Sample</span>
          </button>

          {/* Hidden Columns Dropdown Button [ 👁️ ˅ ] matching user's image */}
          <button
            type="button"
            onClick={() => setIsHiddenDropdownOpen((prev) => !prev)}
            title="Toggle Hidden Columns"
            className="px-2 py-1.5 rounded-xl border border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#121019] text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-primary/20 transition-all shadow-xs shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-gray-700 dark:text-gray-200" />
            <ChevronDown
              className={cn(
                "w-3 h-3 text-gray-500 transition-transform duration-200",
                isHiddenDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Hidden Columns Menu */}
          {isHiddenDropdownOpen && (
            <div className="absolute right-0 bottom-full mb-1.5 w-52 rounded-xl border border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#121019] shadow-xl z-50 py-1.5 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-primary/20">
                Hidden Columns
              </div>
              <div className="py-1 flex flex-col">
                {HIDDEN_COLUMNS.map((col) => {
                  const isSelected = selectedHiddenColumns.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setSelectedHiddenColumns((prev) =>
                          prev.includes(col.id) ? prev.filter((id) => id !== col.id) : [...prev, col.id]
                        );
                      }}
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

      {/* 2. BATCH SUMMARY SECTION (Desktop Component with Client Cost Calculation!) */}
      <BatchSummary
        vItem={vItem}
        data={data}
        isFirstVersion={isFirstVersion}
        batchRef={batchRef}
        minHeight={batchHeight}
        vBatchSummary={vBatchSummary}
        draftYield={draftYield}
        setDraftYield={setDraftYield}
        draftServingSize={draftServingSize}
        setDraftServingSize={setDraftServingSize}
        draftPerPiece={draftPerPiece}
        setDraftPerPiece={setDraftPerPiece}
        draftPacketQuantity={draftPacketQuantity}
        setDraftPacketQuantity={setDraftPacketQuantity}
        isBatchSummaryEditing={isBatchSummaryEditing}
        setIsBatchSummaryEditing={setIsBatchSummaryEditing}
        onSaveSpecificFields={onSaveSpecificFields}
        isConfectionary={isConfectionary}
        vIsFinalized={vIsFinalized}
        isSelectingForCompare={isSelectingForCompare}
      />

      {/* 3. STANDARD OPERATING PROCEDURE SECTION (Desktop Component!) */}
      <StandardOperatingProcedure
        vItem={vItem}
        data={data}
        normalizedVItem={normalizedVItem}
        recipeFormat={recipeFormat}
        isFirstVersion={isFirstVersion}
        sopRef={sopRef}
        minHeight={sopHeight}
        onSaveSpecificFields={onSaveSpecificFields}
        isConfectionary={isConfectionary}
        formatDate={formatDate}
        vIsFinalized={vIsFinalized}
        isSelectingForCompare={isSelectingForCompare}
      />

      {/* 4. SENSORY FEEDBACK SECTION (Desktop Component!) */}
      <SensoryFeedback
        vItem={vItem}
        formatDate={formatDate}
      />
    </div>
  );
}

// ================= MAIN MOBILE RECIPE DETAILS TABLE =================
export default function MobileRecipeDetailsTable({
  tableContainerRef: externalTableContainerRef,
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
  onSample,
  formatDate = (d) => d || "-",
  recipeFormat = "bakery",
  isFinalized = false,
  isSelectingForCompare = false,
  isCompareConfirmed = false,
  selectedCompareVersionIds = [],
  onToggleSelectCompareVersion,
  selectedScaleBatchVersionId,
  onSelectScaleBatchVersion,
}) {
  const [isBFFModalOpen, setIsBFFModalOpen] = useState(false);
  const [isStandardIngredientModalOpen, setIsStandardIngredientModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [targetVersionForIngredient, setTargetVersionForIngredient] = useState(null);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [ingredientToArchive, setIngredientToArchive] = useState(null);

  const deleteIngredientMutation = useDeleteRecipeIngredient();
  const isConfectionary = isConfectionaryRecipe(data?.recipeType) || isConfectionaryRecipe(recipeFormat);

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

  // FOLLOW DESKTOP: Renders ALL versions side-by-side!
  const visibleVersions = useMemo(() => {
    if (isCompareConfirmed) {
      return displayVersions.filter((v) =>
        selectedCompareVersionIds.includes(v._id ?? v.version)
      );
    }
    return displayVersions;
  }, [isCompareConfirmed, displayVersions, selectedCompareVersionIds]);

  const scaleBatchVersion = useMemo(() => {
    if (!isCompareConfirmed) return null;
    const found = displayVersions.find(
      (v) => (v._id ?? v.version) === selectedScaleBatchVersionId
    );
    return found || visibleVersions[0] || displayVersions[0] || null;
  }, [isCompareConfirmed, displayVersions, selectedScaleBatchVersionId, visibleVersions]);

  const activeCompareVersion = useMemo(() => {
    if (!isCompareConfirmed) return data;
    return scaleBatchVersion || visibleVersions[0] || data;
  }, [isCompareConfirmed, scaleBatchVersion, visibleVersions, data]);

  const baseComputed = useMemo(
    () => buildIngredientsDisplayData(activeCompareVersion),
    [activeCompareVersion]
  );
  const globalIngredients = baseComputed.ingredients;

  // Height synchronization for Batch Summary and SOP across all versions & left column
  const [sectionHeights, setSectionHeights] = useState({
    batchSummary: 0,
    sop: 0,
  });

  const batchElementsRef = useRef(new Map());
  const sopElementsRef = useRef(new Map());
  const batchRefCallbacksRef = useRef(new Map());
  const sopRefCallbacksRef = useRef(new Map());
  const resizeObserverRef = useRef(null);

  const updateHeights = useCallback(() => {
    let maxBatch = 0;
    batchElementsRef.current.forEach((el) => {
      if (el) {
        const h = el.getBoundingClientRect().height;
        if (h > maxBatch) maxBatch = h;
      }
    });

    let maxSop = 0;
    sopElementsRef.current.forEach((el) => {
      if (el) {
        const h = el.getBoundingClientRect().height;
        if (h > maxSop) maxSop = h;
      }
    });

    setSectionHeights((prev) => {
      if (Math.abs(prev.batchSummary - maxBatch) > 2 || Math.abs(prev.sop - maxSop) > 2) {
        return {
          batchSummary: maxBatch,
          sop: maxSop,
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateHeights();
      });
    }
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [updateHeights]);

  const getBatchRefCallback = useCallback(
    (key) => {
      if (!batchRefCallbacksRef.current.has(key)) {
        batchRefCallbacksRef.current.set(key, (node) => {
          if (node) {
            batchElementsRef.current.set(key, node);
            if (resizeObserverRef.current) {
              resizeObserverRef.current.observe(node);
            }
            updateHeights();
          } else {
            const existing = batchElementsRef.current.get(key);
            if (existing && resizeObserverRef.current) {
              resizeObserverRef.current.unobserve(existing);
            }
            batchElementsRef.current.delete(key);
            updateHeights();
          }
        });
      }
      return batchRefCallbacksRef.current.get(key);
    },
    [updateHeights]
  );

  const getSopRefCallback = useCallback(
    (key) => {
      if (!sopRefCallbacksRef.current.has(key)) {
        sopRefCallbacksRef.current.set(key, (node) => {
          if (node) {
            sopElementsRef.current.set(key, node);
            if (resizeObserverRef.current) {
              resizeObserverRef.current.observe(node);
            }
            updateHeights();
          } else {
            const existing = sopElementsRef.current.get(key);
            if (existing && resizeObserverRef.current) {
              resizeObserverRef.current.unobserve(existing);
            }
            sopElementsRef.current.delete(key);
            updateHeights();
          }
        });
      }
      return sopRefCallbacksRef.current.get(key);
    },
    [updateHeights]
  );

  const localTableContainerRef = useRef(null);
  const tableContainerRef = externalTableContainerRef || localTableContainerRef;

  // Auto-scroll selected version column smoothly into view
  useEffect(() => {
    if (currentVersion === undefined || currentVersion === null) return;
    const container = tableContainerRef.current;
    if (!container) return;

    let isCancelled = false;

    const performScroll = (behavior = "smooth") => {
      if (isCancelled) return false;
      const targetCol =
        container.querySelector(`[data-version-col="${currentVersion}"]`) ||
        container.querySelector(`[data-version-num="${Number(currentVersion) + 1}"]`) ||
        container.querySelector(`[data-version-num="${currentVersion}"]`) ||
        container.querySelector(`[data-version-id="${currentVersion}"]`) ||
        container.querySelector(`#version-column-${currentVersion}`);

      if (!targetCol) return false;

      const containerRect = container.getBoundingClientRect();
      const colRect = targetCol.getBoundingClientRect();

      if (containerRect.width === 0 || colRect.width === 0) return false;

      const isVisible = colRect.left >= containerRect.left - 4 && colRect.right <= containerRect.right + 4;
      if (isVisible) return true;

      const targetScrollLeft = Math.max(0, container.scrollLeft + (colRect.left - containerRect.left));

      if (Math.abs(container.scrollLeft - targetScrollLeft) > 4) {
        container.scrollTo({
          left: targetScrollLeft,
          behavior,
        });
      }
      return true;
    };

    const rafId = requestAnimationFrame(() => performScroll("smooth"));
    const t1 = setTimeout(() => performScroll("smooth"), 60);
    const t2 = setTimeout(() => performScroll("smooth"), 180);
    const t3 = setTimeout(() => performScroll("smooth"), 350);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentVersion, tableContainerRef, visibleVersions]);

  const handleBFFProductConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData], data?._id);
  };

  const handleStandardIngredientConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData], data?._id);
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
  };

  const handleConfirmDelete = async () => {
    if (!ingredientToDelete) return;
    try {
      if (deleteIngredientMutation.mutateAsync) {
        await deleteIngredientMutation.mutateAsync({
          recipeId: data?._id,
          ingredientId: ingredientToDelete._id || ingredientToDelete.id,
        });
      }
      setIsDeleteModalOpen(false);
      setIngredientToDelete(null);
    } catch (err) {
      console.error("Delete ingredient error:", err);
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* Unified Horizontal Scrolling Container */}
      <div
        ref={tableContainerRef}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full border border-[#EEEBF4] dark:border-primary/40 rounded-2xl bg-white dark:bg-[#0D0B14] shadow-xs touch-pan-x"
      >
        <div className="flex min-w-max">
          {/* ================= LEFT COLUMN (Scrolls with the whole table) ================= */}
          <div
            className="bg-white dark:bg-[#0D0B14] border-r border-[#EEEBF4] dark:border-primary/40 flex-none flex flex-col w-[185px]"
          >
            {/* 1. Ingredient Table Left Header (Matching Video 00:00 - 00:03) */}
            <div className="h-[124px] p-3 flex flex-col justify-between border-b border-[#EEEBF4] dark:border-primary/40">
              <h2 className="text-xl font-bold text-[#0D111A] dark:text-white tracking-tight pt-1">
                Ingredient Table
              </h2>
            </div>

            {/* Spacer matching the 56px height of the floating download buttons */}
            <div className="h-14 border-b border-[#EEEBF4] dark:border-primary/40" />

            {/* Column Sub-Headers: SL | Role | Ingredients */}
            <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-semibold text-[#0D111A] dark:text-white bg-white dark:bg-[#0D0B14]">
              <div className="w-9 text-center border-r border-[#EEEBF4] dark:border-primary/30 text-xs">
                SL
              </div>
              <div className="w-11 text-center border-r border-[#EEEBF4] dark:border-primary/30 text-xs">
                Role
              </div>
              <div className="flex-1 pl-2 text-left text-xs">
                Ingredients
              </div>
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
                  <div className="w-9 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
                    <span className="inline-flex items-center justify-center px-1 py-0.5 min-w-[26px] rounded-full bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold text-[11px]">
                      {item.sl || index + 1}
                    </span>
                  </div>
                  <div className="w-11 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 text-gray-600 dark:text-gray-400 text-center truncate px-0.5 text-xs">
                    {item.role || "-"}
                  </div>
                  <div className="flex-1 pl-2 pr-1 h-full flex items-center justify-between min-w-0">
                    <span className="font-bold text-gray-900 dark:text-white truncate text-xs">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Row */}
              <div className="flex items-center h-12 font-bold text-xs text-[#4B208B] dark:text-purple-300 border-t-2 border-[#4B208B]/40 bg-[#FCFBFD] dark:bg-[#121019]">
                <div className="w-9 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                <div className="w-11 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                <div className="flex-1 pl-2 text-left font-bold text-xs">Total</div>
              </div>
            </div>

            {/* Action Row below table: Add ingredient -> BFF Product & Standard Ingredient (Video 00:04 - 00:06) */}
            <div className="p-3 bg-white dark:bg-[#0D0B14] border-b border-[#EEEBF4] dark:border-primary/40 flex flex-col justify-center min-h-[96px]">
              {!isSelectingForCompare && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#0D111A] dark:text-white">
                    Add ingredient
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsBFFModalOpen(true)}
                      className="w-full py-1.5 px-2 rounded-xl border border-[#4B208B] text-primary dark:text-purple-300 font-bold text-xs bg-[#EEEBF4] hover:bg-[#EFEAF9] transition-all shadow-xs cursor-pointer text-center"
                    >
                      BFF Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStandardIngredientModalOpen(true)}
                      className="w-full py-1.5 px-2 rounded-xl border border-[#4B208B] text-primary dark:text-purple-300 font-bold text-xs bg-white hover:bg-[#EEEBF4] transition-all shadow-xs cursor-pointer text-center"
                    >
                      Standard Ingredient
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Batch Summary Left Header (Matching Video 00:06 - 00:09) */}
            <BatchSummaryLeftHeader height={sectionHeights.batchSummary} className="px-3.5 py-4" />

            {/* 3. Standard Operating Procedure Left Header (Matching Video 00:10 - 00:14) */}
            <StandardOperatingProcedureLeftHeader height={sectionHeights.sop} className="px-3.5 py-4" />

            {/* 4. Sensory Feedback Left Header (Matching Video 00:15 - 00:18) */}
            <SensoryFeedbackLeftHeader className="px-3.5 py-4" />
          </div>

          {/* ================= RIGHT SCROLLABLE VERSION COLUMNS ================= */}
          <div className="flex items-start">
            {visibleVersions.map((vItem, vIndex) => {
              const vKey = vItem._id || vItem.version || vIndex;
              return (
                <MobileVersionColumn
                  key={vKey}
                  vItem={vItem}
                  data={data}
                  isFirstVersion={vIndex === 0}
                  batchRef={getBatchRefCallback(vKey)}
                  sopRef={getSopRefCallback(vKey)}
                  batchHeight={sectionHeights.batchSummary}
                  sopHeight={sectionHeights.sop}
                  globalIngredients={globalIngredients}
                  formatDate={formatDate}
                  onFinalizeVersion={onFinalizeVersion}
                  onFullDownload={onFullDownload}
                  onClientDownload={onClientDownload}
                  onPrepareSample={onPrepareSample}
                  onSample={onSample}
                  onSaveSpecificFields={onSaveSpecificFields}
                  recipeFormat={recipeFormat}
                  isConfectionary={isConfectionary}
                  isFinalized={isFinalized}
                  isSelectingForCompare={isSelectingForCompare}
                  isSelectedForCompare={selectedCompareVersionIds.includes(vItem._id ?? vItem.version)}
                  onToggleSelectCompare={() => onToggleSelectCompareVersion?.(vItem)}
                />
              );
            })}

            {/* Scale Batch Column in Confirmed Comparison Mode (Desktop Feature) */}
            {isCompareConfirmed && scaleBatchVersion && (
              <ScaleBatchColumn
                scaleBatchVersion={scaleBatchVersion}
                comparedVersions={visibleVersions}
                onSelectScaleBatchVersion={onSelectScaleBatchVersion}
                data={data}
                globalIngredients={globalIngredients}
                showSolidLiquidColumn={true}
                formatDate={formatDate}
                isConfectionary={isConfectionary}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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

      <DeleteIngredientModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setIngredientToDelete(null);
        }}
        ingredient={ingredientToDelete}
        ingredientName={ingredientToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteIngredientMutation.isPending}
      />
    </div>
  );
}
