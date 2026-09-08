import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import IngredientTable, { IngredientTableLeftHeader } from "./IngredientTable";
import BatchSummary, { BatchSummaryLeftHeader } from "./BatchSummary";
import StandardOperatingProcedure, { StandardOperatingProcedureLeftHeader } from "./StandardOperatingProcedure";
import SensoryFeedback, { SensoryFeedbackLeftHeader } from "./SensoryFeedback";
import AddBFFProductModal from "./AddBFFProductModal";
import AddStandardIngredientModal from "./AddStandardIngredientModal";
import EditIngredientModal from "./EditIngredientModal";
import ArchiveIngredientModal from "./ArchiveIngredientModal";
import { useDeleteRecipeIngredient } from "@/hooks/mutations/useRecipeMutations";
import { cn } from "@/lib/utils";
import { buildIngredientsDisplayData, isConfectionaryRecipe } from "../data/ingredientsCalculations";
import ScaleBatchColumn from "./ScaleBatchColumn";
import { useRecipeById } from "@/hooks/useRecipes";

// ================= INDEPENDENT VERSION COLUMN COMPONENT =================
// Each VersionColumn coordinates its 4 sub-sections: IngredientTable, BatchSummary, SOP, SensoryFeedback
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

  // Ensure version ingredients are sourced properly from vItem or fetched details
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

  // Batch Summary Independent Edit Mode states for THIS version
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

  // Compute calculated metrics dynamically for this specific version
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

  const versionId =
    effectiveVersionData?._id ||
    vItem?._id ||
    (data?._id && versionNumStr ? `${data._id}_v${versionNumStr}` : null) ||
    (versionNumStr ? `v_${versionNumStr}` : "default");

  const storageKey = `ingredient_table_cols_${versionId}`;

  // Hidden columns state for THIS version - automatically adjusts column width & persists across reload
  const [selectedColumns, setSelectedColumns] = useState(() => {
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

  const handleSelectedColumnsChange = useCallback(
    (newCols) => {
      setSelectedColumns(newCols);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newCols));
      } catch (e) {
        console.warn("Failed to save selected columns to localStorage", e);
      }
    },
    [storageKey]
  );

  const versionColumnWidth = 400 + selectedColumns.length * 120;

  return (
    <div
      className={cn(
        "flex-none border-r border-[#EEEBF4] dark:border-primary/40 flex flex-col transition-all duration-200",
        isSelectingForCompare && !isSelectedForCompare && "opacity-40 bg-gray-100/50 dark:bg-[#151221]/80 select-none"
      )}
      style={{ width: `${versionColumnWidth}px` }}
    >
      {/* 1. INGREDIENT TABLE SECTION */}
      <IngredientTable
        vItem={normalizedVItem}
        data={data}
        versionNumStr={versionNumStr}
        vIsFinalized={vIsFinalized}
        onFinalizeVersion={onFinalizeVersion}
        onFullDownload={onFullDownload}
        onClientDownload={onClientDownload}
        showSolidLiquidColumn={showSolidLiquidColumn}
        ingredientGroups={ingredientGroups}
        vTotals={vTotals}
        onPrepareSample={onPrepareSample}
        onSample={onSample}
        onEditRow={onEditRow}
        formatDate={formatDate}
        isSelectingForCompare={isSelectingForCompare}
        isSelectedForCompare={isSelectedForCompare}
        onToggleSelectCompare={onToggleSelectCompare}
        selectedColumns={selectedColumns}
        onSelectedColumnsChange={handleSelectedColumnsChange}
      />

      {/* 2. BATCH SUMMARY SECTION */}
      <BatchSummary
        vItem={vItem}
        data={data}
        isFirstVersion={isFirstVersion}
        batchRef={batchRef}
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
      />

      {/* 3. STANDARD OPERATING PROCEDURE SECTION */}
      <StandardOperatingProcedure
        vItem={vItem}
        data={data}
        normalizedVItem={normalizedVItem}
        recipeFormat={recipeFormat}
        isFirstVersion={isFirstVersion}
        sopRef={sopRef}
        onSaveSpecificFields={onSaveSpecificFields}
        isConfectionary={isConfectionary}
        formatDate={formatDate}
      />

      {/* 4. SENSORY FEEDBACK SECTION */}
      <SensoryFeedback
        vItem={vItem}
        formatDate={formatDate}
      />
    </div>
  );
}

// ================= MAIN RECIPE DETAILS TABLE CONTAINER =================
export default function RecipeDetailsTable({
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
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [targetVersionForIngredient, setTargetVersionForIngredient] = useState(null);
  const [ingredientToArchive, setIngredientToArchive] = useState(null);

  const deleteIngredientMutation = useDeleteRecipeIngredient();

  const HIDDEN_TYPE_SOLID_LIQUID_RECIPES = ["beverage", "beverage psd"];
  const recipeTypeLower = data?.recipeType?.toLowerCase() || recipeFormat || "";
  const effectiveRecipeFormat = (recipeFormat && recipeFormat !== "bakery") ? recipeFormat : (recipeTypeLower || recipeFormat || "bakery");
  const isHiddenTypeAndSolidLiquid = HIDDEN_TYPE_SOLID_LIQUID_RECIPES.includes(recipeTypeLower);
  const isConfectionary = isConfectionaryRecipe(data?.recipeType) || isConfectionaryRecipe(recipeFormat);
  const showSolidLiquidColumn = !isHiddenTypeAndSolidLiquid && !isConfectionary;

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

  const isCurrentDataForGlobal =
    activeCompareVersion?._id === data?._id ||
    (activeCompareVersion?.version !== undefined && data?.version !== undefined && activeCompareVersion?.version === data?.version);

  const { data: fetchedGlobalDetail } = useRecipeById(activeCompareVersion?._id, {
    enabled:
      isCompareConfirmed &&
      !isCurrentDataForGlobal &&
      !!activeCompareVersion?._id &&
      (!Array.isArray(activeCompareVersion?.ingredients) || activeCompareVersion.ingredients.length === 0),
  });

  const effectiveGlobalRecipe = useMemo(() => {
    if (!isCompareConfirmed) return data;
    if (isCurrentDataForGlobal && data) return data;
    if (fetchedGlobalDetail) return { ...activeCompareVersion, ...fetchedGlobalDetail };
    return activeCompareVersion || data;
  }, [isCompareConfirmed, isCurrentDataForGlobal, data, fetchedGlobalDetail, activeCompareVersion]);

  const baseComputed = useMemo(
    () => buildIngredientsDisplayData(effectiveGlobalRecipe),
    [effectiveGlobalRecipe]
  );
  const globalIngredients = baseComputed.ingredients;

  const handleBFFProductConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData], data?._id);
  };

  const handleStandardIngredientConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData], data?._id);
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
      currentIngredients.splice(deleteIndex, 1);
      if (ingredientToArchive._id && targetRecipe?._id) {
        await deleteIngredientMutation.mutateAsync({
          recipeId: targetRecipe._id,
          ingredientId: ingredientToArchive._id,
        });
        onIngredientsChange?.(currentIngredients, targetRecipe?._id, { skipSave: true });
      } else {
        await onIngredientsChange?.(currentIngredients, targetRecipe?._id);
      }
    }
    setIsArchiveModalOpen(false);
    setIngredientToArchive(null);
    setTargetVersionForIngredient(null);
  };

  // Section Height Matching for perfect horizontal alignment with left column
  const [firstVersionBatchEl, setFirstVersionBatchEl] = useState(null);
  const [firstVersionSopEl, setFirstVersionSopEl] = useState(null);
  const [sectionHeights, setSectionHeights] = useState({ batchSummary: null, sop: null });

  const firstVersionBatchRef = React.useCallback((node) => {
    setFirstVersionBatchEl(node);
  }, []);

  const firstVersionSopRef = React.useCallback((node) => {
    setFirstVersionSopEl(node);
  }, []);

  useEffect(() => {
    const updateHeights = () => {
      const bsHeight = firstVersionBatchEl?.offsetHeight;
      const sopHeight = firstVersionSopEl?.offsetHeight;
      setSectionHeights((prev) => {
        const newBS = bsHeight || prev.batchSummary || null;
        const newSOP = sopHeight || prev.sop || null;
        if (prev.batchSummary === newBS && prev.sop === newSOP) return prev;
        return { batchSummary: newBS, sop: newSOP };
      });
    };

    updateHeights();

    if (!firstVersionBatchEl && !firstVersionSopEl) return;

    const observer = new ResizeObserver(updateHeights);
    if (firstVersionBatchEl) observer.observe(firstVersionBatchEl);
    if (firstVersionSopEl) observer.observe(firstVersionSopEl);

    const t1 = setTimeout(updateHeights, 50);
    const t2 = setTimeout(updateHeights, 150);
    const t3 = setTimeout(updateHeights, 500);
    window.addEventListener("resize", updateHeights);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", updateHeights);
    };
  }, [firstVersionBatchEl, firstVersionSopEl, displayVersions]);

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
  const leftColWidth = isConfectionary ? 420 : 340;

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
          <div
            className={cn(
              "sticky left-0 z-20 bg-white dark:bg-[#0D0B14] border-r border-[#EEEBF4] dark:border-primary/40 flex-none shadow-[4px_0_10px_rgba(0,0,0,0.02)] flex flex-col",
              isConfectionary ? "w-[420px]" : "w-[340px]"
            )}
          >
            {/* 1. Ingredient Table Left Header & Rows */}
            <IngredientTableLeftHeader
              globalIngredients={globalIngredients}
              isConfectionary={isConfectionary}
              onOpenBFFModal={() => setIsBFFModalOpen(true)}
              onOpenStandardIngredientModal={() => setIsStandardIngredientModalOpen(true)}
            />

            {/* 2. Batch Summary Left Title */}
            <BatchSummaryLeftHeader height={sectionHeights.batchSummary} />

            {/* 3. Standard Operating Procedure Left Title */}
            <StandardOperatingProcedureLeftHeader height={sectionHeights.sop} />

            {/* 4. Sensory Feedback Left Title */}
            <SensoryFeedbackLeftHeader />
          </div>

          {/* ================= RIGHT SCROLLABLE VERSION COLUMNS ================= */}
          <div className="flex items-start">
            {visibleVersions.map((vItem, vIndex) => (
              <VersionColumn
                key={vItem._id || vItem.version || vIndex}
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
                onSample={onSample}
                onEditRow={handleEditRow}
                onSaveSpecificFields={onSaveSpecificFields}
                recipeFormat={effectiveRecipeFormat}
                isConfectionary={isConfectionary}
                isFinalized={isFinalized}
                isSelectingForCompare={isSelectingForCompare}
                isSelectedForCompare={selectedCompareVersionIds.includes(vItem._id ?? vItem.version)}
                onToggleSelectCompare={() => onToggleSelectCompareVersion?.(vItem)}
              />
            ))}

            {/* Far-Right Scale Batch Column in Confirmed Comparison Mode */}
            {isCompareConfirmed && scaleBatchVersion && (
              <ScaleBatchColumn
                scaleBatchVersion={scaleBatchVersion}
                comparedVersions={visibleVersions}
                onSelectScaleBatchVersion={onSelectScaleBatchVersion}
                data={data}
                globalIngredients={globalIngredients}
                showSolidLiquidColumn={showSolidLiquidColumn}
                formatDate={formatDate}
                onSaveSpecificFields={onSaveSpecificFields}
                recipeFormat={effectiveRecipeFormat}
                isConfectionary={isConfectionary}
                isFinalized={isFinalized}
                onEditRow={handleEditRow}
              />
            )}
          </div>
        </div>
      </div>

      {/* Static / Sticky Horizontal Scrollbar Pinned at Bottom of Viewport */}
      {hasHorizontalScroll && (
        <div className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-[#0D0B14]/95 backdrop-blur-md border-t border-[#EEEBF4] dark:border-primary/40 py-2.5 px-4 flex items-center shadow-[0_-4px_12px_rgba(0,0,0,0.04)] rounded-b-3xl">
          {/* Left fixed column offset so the scrollbar track starts after the left column */}
          <div className={cn("flex-none hidden md:block", isConfectionary ? "w-[420px]" : "w-[340px]")} />
          <div
            ref={scrollbarTrackRef}
            onScroll={handleBottomScroll}
            className="flex-1 overflow-x-auto custom-scrollbar h-3 cursor-pointer"
          >
            <div
              style={{ width: `${Math.max(scrollWidth - leftColWidth, 100)}px` }}
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
