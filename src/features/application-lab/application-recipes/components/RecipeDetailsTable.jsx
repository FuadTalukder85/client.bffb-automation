import React, { useState, useMemo, useEffect, useRef } from "react";
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

  const normalizedVItem = useMemo(
    () => ({
      ...vItem,
      recipeType: vItem?.recipeType || data?.recipeType,
      ingredients: versionIngredients,
    }),
    [data, vItem, versionIngredients]
  );

  // Batch Summary Independent Edit Mode states for THIS version
  const [isBatchSummaryEditing, setIsBatchSummaryEditing] = useState(false);
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

  return (
    <div className="w-[300px] flex-none border-r border-[#EEEBF4] dark:border-primary/40 flex flex-col">
      {/* 1. INGREDIENT TABLE SECTION */}
      <IngredientTable
        vItem={vItem}
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
        onEditRow={onEditRow}
        formatDate={formatDate}
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
        isBatchSummaryEditing={isBatchSummaryEditing}
        setIsBatchSummaryEditing={setIsBatchSummaryEditing}
        onSaveSpecificFields={onSaveSpecificFields}
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
  const isConfectionary = isConfectionaryRecipe(data?.recipeType) || isConfectionaryRecipe(recipeFormat);
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
