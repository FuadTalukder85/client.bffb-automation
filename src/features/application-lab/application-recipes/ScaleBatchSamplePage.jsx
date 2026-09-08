import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Modal, ModalContent } from "@/components/ui/Modal";
import BasicInformation from "./components/BasicInformation";
import BenchmarkCard from "./components/BenchmarkCard";
import { PrepareSampleModal } from "./components/PrepareSampleModal";
import { useRecipeById } from "@/hooks/useRecipes";
import { useApplicationLabProjectDetails } from "@/hooks/useMasterProject";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { buildIngredientsDisplayData } from "./data/ingredientsCalculations";

export default function ScaleBatchSamplePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipeId, version, projectId: routeProjectId } = useParams();

  // Navigation state passed when clicking "Sample"
  const stateRecipe = location.state?.recipe;
  const stateVItem = location.state?.vItem;
  const stateVersion = location.state?.version;
  const stateProject = location.state?.project;

  const targetRecipeId = recipeId || stateVItem?._id || stateRecipe?._id;

  // Fetch recipe if not passed via state or to hydrate missing fields
  const { data: fetchedRecipe, isLoading: isRecipeLoading } = useRecipeById(targetRecipeId, {
    enabled: !!targetRecipeId,
  });

  const recipe = fetchedRecipe || stateRecipe;
  const targetProjectId =
    routeProjectId ||
    stateProject?._id ||
    recipe?.project?._id ||
    (typeof recipe?.project === "string" ? recipe.project : null);

  const { data: fetchedProject } = useApplicationLabProjectDetails(targetProjectId, {
    enabled: !!targetProjectId,
  });
  const project = stateProject || fetchedProject?.data?.data || fetchedProject?.data || fetchedProject || recipe?.project;

  const { data: projectMembers = [] } = useProjectMembers(targetProjectId);

  // Target version data
  const targetVersionNum = version !== undefined ? Number(version) : (stateVersion ?? stateVItem?.version ?? recipe?.version ?? 0);
  const versionNumStr = String(targetVersionNum + 1).padStart(2, "0");

  // Dynamically resolve ingredients from any available source
  const versionIngredients = useMemo(() => {
    if (Array.isArray(stateVItem?.ingredients) && stateVItem.ingredients.length > 0) {
      return stateVItem.ingredients;
    }
    if (Array.isArray(fetchedRecipe?.ingredients) && fetchedRecipe.ingredients.length > 0) {
      return fetchedRecipe.ingredients;
    }
    if (Array.isArray(stateRecipe?.ingredients) && stateRecipe.ingredients.length > 0) {
      return stateRecipe.ingredients;
    }
    if (Array.isArray(recipe?.versions)) {
      const found = recipe.versions.find(
        (v) => (v._id && v._id === targetRecipeId) || Number(v.version) === targetVersionNum
      );
      if (Array.isArray(found?.ingredients) && found.ingredients.length > 0) {
        return found.ingredients;
      }
    }
    if (Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0) {
      return recipe.ingredients;
    }
    return [];
  }, [stateVItem, fetchedRecipe, stateRecipe, recipe, targetRecipeId, targetVersionNum]);

  const effectiveVersionData = useMemo(() => {
    const base = fetchedRecipe || stateVItem || stateRecipe || recipe || {};
    return {
      ...base,
      recipeCode: stateVItem?.recipeCode || fetchedRecipe?.recipeCode || recipe?.recipeCode || base?.recipeCode || "-",
      createdAt: stateVItem?.createdAt || fetchedRecipe?.createdAt || recipe?.createdAt || base?.createdAt,
      outputYield: stateVItem?.outputYield ?? fetchedRecipe?.outputYield ?? recipe?.outputYield ?? 0,
      outputServingSize: stateVItem?.outputServingSize ?? fetchedRecipe?.outputServingSize ?? recipe?.outputServingSize ?? 0,
      ingredients: versionIngredients,
    };
  }, [fetchedRecipe, stateVItem, stateRecipe, recipe, versionIngredients]);

  // Calculations for ingredients - completely dynamic
  const computedData = useMemo(() => {
    return buildIngredientsDisplayData(effectiveVersionData, {
      outputYield: effectiveVersionData?.outputYield,
      outputServingSize: effectiveVersionData?.outputServingSize,
    });
  }, [effectiveVersionData]);

  const { ingredients: baseIngredients = [], totals: baseTotals = {}, batchSummary: vBatchSummary = {} } = computedData;

  // Selected checkboxes for ingredients
  const [selectedIngredientIndexes, setSelectedIngredientIndexes] = useState([]);

  // Toggle single ingredient selection
  const handleToggleSelect = (index) => {
    setSelectedIngredientIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Toggle select all
  const allIngredientsSelected =
    baseIngredients.length > 0 && selectedIngredientIndexes.length === baseIngredients.length;

  const handleToggleSelectAll = () => {
    if (allIngredientsSelected) {
      setSelectedIngredientIndexes([]);
    } else {
      setSelectedIngredientIndexes(baseIngredients.map((_, i) => i));
    }
  };

  // Dynamic sample batch size state and preview scaling
  const defaultTotalQuantity = useMemo(() => {
    const sum = baseIngredients.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    return sum > 0 ? sum : (Number(baseTotals?.quantity) || 0);
  }, [baseIngredients, baseTotals?.quantity]);

  const [sampleBatchSize, setSampleBatchSize] = useState("");

  useEffect(() => {
    if (defaultTotalQuantity > 0 && (!sampleBatchSize || Number(sampleBatchSize) === 0)) {
      setSampleBatchSize(defaultTotalQuantity);
    }
  }, [defaultTotalQuantity]);

  const currentBatchSize = Number(sampleBatchSize) || defaultTotalQuantity || 0;
  const scaleFactor = defaultTotalQuantity > 0 && currentBatchSize > 0 ? currentBatchSize / defaultTotalQuantity : 1;

  const displayIngredients = useMemo(() => {
    return baseIngredients.map((item) => {
      const originalQty = Number(item.quantity) || 0;
      const scaledQty = originalQty * scaleFactor;
      return {
        ...item,
        displayQuantity: scaledQty % 1 === 0 ? String(scaledQty) : scaledQty.toFixed(2),
      };
    });
  }, [baseIngredients, scaleFactor]);

  const totalQuantityDisplay = defaultTotalQuantity > 0 && currentBatchSize > 0
    ? (currentBatchSize % 1 === 0 ? String(currentBatchSize) : currentBatchSize.toFixed(2))
    : (baseTotals?.quantity || "0");

  // Group ingredients by segment (e.g. liquid group, solid group) matching RecipeDetailsTable
  const ingredientGroups = useMemo(() => {
    if (!displayIngredients || displayIngredients.length === 0) return [];

    const groups = [];
    let currentGroup = null;

    displayIngredients.forEach((item, index) => {
      const typeKey = String(item.typeKey || item.type || "").toLowerCase();

      const prevItem = index > 0 ? displayIngredients[index - 1] : null;
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
          solidLiquidValue: item.solidLiquid || "",
        };
      }

      if (item.solidLiquid && !currentGroup.solidLiquidValue) {
        currentGroup.solidLiquidValue = item.solidLiquid;
      }
      if (item.isSeparator) {
        currentGroup.isSeparator = true;
      }

      currentGroup.items.push({ item, index });
    });

    if (currentGroup && currentGroup.items.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [displayIngredients]);

  // Others / Comments section
  const [comments, setComments] = useState([
    {
      id: "01",
      initials: "SO",
      name: "Syeda Oyshee",
      role: "Application Recipe",
      date: "02 Apr 2026 - 11:53 AM",
      text: "Ensure precise measurement of cocoa powder to prevent moisture level fluctuation. The current target ratio is optimal for the requested mouthfeel.",
    },
    {
      id: "02",
      initials: "MA",
      name: "Mithila Ahmed",
      role: "Prepare Samples",
      date: "03 Apr 2026 - 11:53 AM",
      text: "Slight browning variation was observed on the trailing edge of the baking trays during the second batch. Suggest adjusting belt speed or repositioning trays for the next trial.",
    },
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " - " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    const newComment = {
      id: String(comments.length + 1).padStart(2, "0"),
      initials: creatorName ? creatorName.slice(0, 2).toUpperCase() : "SC",
      name: creatorName || "Sadman Chowdhury",
      role: "Application Recipe",
      date: formattedDate,
      text: newCommentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setNewCommentText("");
  };

  // Modals state
  const [isAddSampleModalOpen, setIsAddSampleModalOpen] = useState(false);
  const [isTaskAssignModalOpen, setIsTaskAssignModalOpen] = useState(false);

  // Dynamic header values
  const recipeName =
    effectiveVersionData?.recipeName ||
    effectiveVersionData?.name ||
    recipe?.recipeName ||
    recipe?.name ||
    "-";
  const recipeCode =
    effectiveVersionData?.recipeCode ||
    recipe?.recipeCode ||
    "-";
  const refCode =
    recipe?.copiedFromRecipe?.recipeCode ||
    project?.projectCode ||
    project?.masterProject?.code ||
    recipe?.project?.projectCode ||
    "-";
  const formatLabel = (
    effectiveVersionData?.recipeFormat ||
    effectiveVersionData?.recipeType ||
    recipe?.recipeFormat ||
    recipe?.recipeType ||
    "bakery"
  ).toLowerCase();
  const creatorName =
    recipe?.createdBy?.name ||
    recipe?.creator?.name ||
    (typeof recipe?.createdBy === "string" ? recipe.createdBy : null) ||
    project?.raisedBy ||
    "-";

  const creationDate = effectiveVersionData?.createdAt
    ? new Date(effectiveVersionData.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  // Dynamic Add Sample form fields
  const [addSampleForm, setAddSampleForm] = useState({
    batchSize: "1000",
    perPiece: "12",
    packetQuantity: "100",
    labOutput: "1200",
    wastage: "200",
  });

  useEffect(() => {
    const batchSizeVal = currentBatchSize || 1000;
    const perPieceVal =
      vBatchSummary?.confectionery?.perPiece ||
      effectiveVersionData?.outputServingSize ||
      12;
    const packetQuantityVal =
      vBatchSummary?.confectionery?.packetQuantity ||
      (perPieceVal > 0 ? Math.floor(batchSizeVal / perPieceVal) : 100);
    const labOutputVal =
      vBatchSummary?.confectionery?.labOutput ||
      (effectiveVersionData?.outputYield
        ? ((batchSizeVal * Number(effectiveVersionData.outputYield)) / 100).toFixed(0)
        : batchSizeVal);
    const wastageVal =
      vBatchSummary?.confectionery?.wastage ||
      (Number(batchSizeVal) > Number(labOutputVal)
        ? Number(batchSizeVal) - Number(labOutputVal)
        : 0);

    setAddSampleForm({
      batchSize: String(batchSizeVal),
      perPiece: String(perPieceVal),
      packetQuantity: String(packetQuantityVal),
      labOutput: String(labOutputVal),
      wastage: String(wastageVal),
    });
  }, [currentBatchSize, vBatchSummary, effectiveVersionData]);

  const handleAddSampleNext = (e) => {
    e.preventDefault();
    setIsAddSampleModalOpen(false);
    setIsTaskAssignModalOpen(true);
  };

  return (
    <section className="flex flex-col bg-transparent page-section-spacing md:px-0 md:flex-1 md:min-h-0">
      <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton onClick={() => navigate(-1)} />

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {recipeName}
              </h1>

              {recipeCode !== "-" && (
                <span className="px-3 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs">
                  {recipeCode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <SearchInput placeholder="Search..." />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
              <span>Ref:</span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold">
                {refCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
              <span>Format:</span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold">
                {formatLabel}
              </span>
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              Created By <span className="font-bold text-gray-900 dark:text-white">{creatorName}</span>
            </div>
          </div>
        </div>

        {/* Expandable Basic Information & Benchmark Cards */}
        <div className="flex flex-col bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <BasicInformation
              project={project}
              recipe={recipe}
              formatDate={(d) => d || "-"}
              isFinalized={true}
            />

            <BenchmarkCard
              sopData={{}}
              recipe={recipe}
              isFinalized={true}
            />
          </div>

          {/* Scale Batch Container */}
          <div className="flex flex-col pt-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Scale Batch
            </h2>

            {/* Version Info Card */}
            <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex items-center gap-6 mb-6">
              <span className="px-3.5 py-1.5 rounded-xl bg-[#4B208B] text-white font-extrabold text-xs tracking-wider uppercase">
                VERSION {versionNumStr}
              </span>
              <div className="text-[11px] leading-tight space-y-0.5">
                <p className="text-gray-500 font-medium">
                  Recipe Creation Date:{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {creationDate}
                  </span>
                </p>
                <p className="text-gray-500 font-medium">
                  Recipe Code:{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {recipeCode}
                  </span>
                </p>
              </div>
            </div>

            {/* Ingredients Table */}
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Ingredients Table
            </h3>

            <div className="border border-[#EEEBF4] dark:border-primary/40 rounded-2xl overflow-hidden bg-white dark:bg-[#0D0B14]">
              {/* Table Column Headers */}
              <div className="flex items-center h-11 border-b border-[#EEEBF4] dark:border-primary/40 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
                <div
                  onClick={handleToggleSelectAll}
                  title="Select / Deselect all"
                  className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 cursor-pointer"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-md flex items-center justify-center transition-all",
                      allIngredientsSelected
                        ? "bg-[#4B208B] text-white"
                        : "border-2 border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {allIngredientsSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="w-14 text-center border-r border-[#EEEBF4] dark:border-primary/30">SL</div>
                <div className="w-20 text-center border-r border-[#EEEBF4] dark:border-primary/30">Role</div>
                <div className="flex-1 pl-4 text-left border-r border-[#EEEBF4] dark:border-primary/30">Ingredients</div>
                <div className="w-24 text-center border-r border-[#EEEBF4] dark:border-primary/30">Qty (g)</div>
                <div className="w-24 text-center border-r border-[#EEEBF4] dark:border-primary/30">Cmp (%)</div>
                <div className="w-28 text-center">S/L (%)</div>
              </div>

              {/* Table Body Rows - Grouped with group separators and merged S/L (%) matching IngredientTable */}
              <div className="flex flex-col">
                {displayIngredients.length > 0 ? (
                  ingredientGroups.map((group, gIdx) => (
                    <div
                      key={gIdx}
                      className={cn(
                        "flex",
                        group.isSeparator
                          ? "border-b-2 border-[#4B208B]"
                          : "border-b border-[#EEEBF4] dark:border-primary/30"
                      )}
                    >
                      {/* Left columns: Checkbox, SL, Role, Ingredients, Qty, Cmp */}
                      <div className="flex-1 flex flex-col divide-y divide-[#EEEBF4] dark:divide-primary/30 border-r border-[#EEEBF4] dark:border-primary/30">
                        {group.items.map(({ item, index }) => {
                          const isChecked = selectedIngredientIndexes.includes(index);
                          return (
                            <div
                              key={item._id || item.id || index}
                              className={cn(
                                "flex items-center h-12 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-colors",
                                isChecked && "bg-purple-50/30 dark:bg-primary/5"
                              )}
                            >
                              {/* Checkbox */}
                              <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelect(index)}
                                  className={cn(
                                    "w-4 h-4 rounded-md flex items-center justify-center cursor-pointer transition-all",
                                    isChecked
                                      ? "bg-[#4B208B] text-white"
                                      : "border-2 border-[#A294BD] dark:border-gray-600 bg-white dark:bg-[#121019] hover:border-[#4B208B]"
                                  )}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              </div>

                              {/* SL */}
                              <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">
                                <span className="inline-flex items-center justify-center px-2 py-0.5 min-w-[28px] rounded-full bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold text-xs">
                                  {index + 1}
                                </span>
                              </div>

                              {/* Role */}
                              <div className="w-20 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 text-gray-600 dark:text-gray-400 text-center truncate px-1 font-medium">
                                {item.role || "-"}
                              </div>

                              {/* Ingredients */}
                              <div className="flex-1 h-full flex items-center pl-4 border-r border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white truncate">
                                {item.name || item.ingredientName || item.sourceName || "-"}
                              </div>

                              {/* Quantity */}
                              <div className="w-24 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 font-medium">
                                {item.displayQuantity ?? item.quantity ?? "-"}
                              </div>

                              {/* Composition */}
                              <div className="w-24 h-full flex items-center justify-center font-medium">
                                {item.composition ?? "-"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right column: S/L (%) spanning the entire group with NO inner dividers */}
                      <div className="w-28 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-[#0D0B14]">
                        <span>{group.solidLiquidValue || ""}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-24 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                    {isRecipeLoading ? "Loading ingredients..." : "No ingredients available for this recipe."}
                  </div>
                )}
              </div>

              {/* Dynamic Total Row */}
              <div className="flex items-center h-12 font-bold text-xs text-[#4B208B] dark:text-purple-300 border-t-2 border-[#4B208B]/40 bg-[#FCFBFD] dark:bg-[#121019]">
                <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                <div className="w-14 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                <div className="w-20 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30">-</div>
                <div className="flex-1 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 font-bold">
                  Total
                </div>
                <div className="w-24 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 font-bold">
                  {totalQuantityDisplay}
                </div>
                <div className="w-24 h-full flex items-center justify-center border-r border-[#EEEBF4] dark:border-primary/30 font-bold">
                  {baseTotals?.composition ?? "-"}
                </div>
                <div className="w-28 h-full flex items-center justify-center font-bold">
                  {baseTotals?.solidLiquid ?? "-"}
                </div>
              </div>
            </div>

            {/* Sample Batch Size Section */}
            <div className="mt-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                Sample Batch Size
              </h3>
              <div className="w-full max-w-[320px] sm:max-w-[360px] h-11 px-4 rounded-2xl border-2 border-[#8B5CF6] focus-within:border-[#4B208B] flex items-center justify-between bg-white dark:bg-[#121019] shadow-xs transition-colors">
                <input
                  type="number"
                  value={sampleBatchSize}
                  onChange={(e) => setSampleBatchSize(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-none outline-none font-bold text-sm text-gray-900 dark:text-white"
                />
                <span className="text-sm font-semibold text-gray-500 ml-2">g</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                Adjust the sample batch size to preview updated quantities.
              </p>
            </div>

            {/* Others Section */}
            <div className="mt-8">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Others
              </h3>

              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl p-4 bg-[#FCFBFD] dark:bg-[#121019] shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4B208B] text-white flex items-center justify-center font-bold text-xs uppercase">
                          {c.initials}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white">
                            {c.name}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#F0EBF8] dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 text-[10px] font-semibold">
                            {c.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[11px] text-gray-400">{c.date}</span>
                        <span className="font-bold text-[#4B208B] dark:text-purple-300">
                          {c.id}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 pl-12">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Comment Input Box */}
              <div className="mt-4 flex flex-col">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Type additional comments or batch requirements here"
                  className="w-full rounded-2xl border-2 border-[#A882DD] dark:border-primary/50 focus:border-[#4B208B] p-4 text-xs resize-none h-24 placeholder:text-gray-400 bg-white dark:bg-[#151221] outline-none transition-colors"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSendComment}
                    className="px-6 py-2 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="flex items-center justify-between pt-8 mt-6 border-t border-[#EEEBF4] dark:border-primary/40">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-2.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 text-xs font-bold hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!allIngredientsSelected}
                onClick={() => setIsAddSampleModalOpen(true)}
                title={
                  !allIngredientsSelected
                    ? "Please select all ingredients checkboxes to proceed"
                    : "Proceed to Add Sample"
                }
                className="px-8 py-2.5 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Sample Modal */}
      <Modal open={isAddSampleModalOpen} onOpenChange={setIsAddSampleModalOpen}>
        <ModalContent className="max-w-[440px] p-6 rounded-3xl bg-white dark:bg-[#121019] border border-gray-200 dark:border-primary/40 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add Sample
            </h2>
            <button
              type="button"
              onClick={() => setIsAddSampleModalOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddSampleNext} className="space-y-4">
            {/* Application Recipe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Application Recipe
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-[#F0EDF5] dark:bg-[#1D1829] text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{recipeName}</span>
                {recipeCode !== "-" && (
                  <span className="text-gray-400 font-medium">{recipeCode}</span>
                )}
              </div>
            </div>

            {/* Batch Size */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Batch Size
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-[#F0EDF5] dark:bg-[#1D1829] flex items-center justify-between">
                <input
                  type="text"
                  value={addSampleForm.batchSize}
                  onChange={(e) => setAddSampleForm({ ...addSampleForm, batchSize: e.target.value })}
                  className="w-full bg-transparent outline-none font-bold text-xs text-gray-900 dark:text-white"
                />
                <span className="text-xs font-medium text-gray-500 ml-2">g</span>
              </div>
            </div>

            {/* Per Piece */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Per Piece
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-[#F0EDF5] dark:bg-[#1D1829] flex items-center justify-between">
                <input
                  type="text"
                  value={addSampleForm.perPiece}
                  onChange={(e) => setAddSampleForm({ ...addSampleForm, perPiece: e.target.value })}
                  className="w-full bg-transparent outline-none font-bold text-xs text-gray-900 dark:text-white"
                />
                <span className="text-xs font-medium text-gray-500 ml-2">g</span>
              </div>
            </div>

            {/* Packet Quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Packet Quantity
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-[#F0EDF5] dark:bg-[#1D1829] flex items-center justify-between">
                <input
                  type="text"
                  value={addSampleForm.packetQuantity}
                  onChange={(e) => setAddSampleForm({ ...addSampleForm, packetQuantity: e.target.value })}
                  className="w-full bg-transparent outline-none font-bold text-xs text-gray-900 dark:text-white"
                />
                <span className="text-xs font-medium text-gray-500 ml-2">pcs</span>
              </div>
            </div>

            {/* Lab Output */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Lab Output
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-[#F0EDF5] dark:bg-[#1D1829] flex items-center justify-between">
                <input
                  type="text"
                  value={addSampleForm.labOutput}
                  onChange={(e) => setAddSampleForm({ ...addSampleForm, labOutput: e.target.value })}
                  className="w-full bg-transparent outline-none font-bold text-xs text-gray-900 dark:text-white"
                />
                <span className="text-xs font-medium text-gray-500 ml-2">g</span>
              </div>
            </div>

            {/* Wastage */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Wastage
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-[#F0EDF5] dark:bg-[#1D1829] flex items-center justify-between">
                <input
                  type="text"
                  value={addSampleForm.wastage}
                  onChange={(e) => setAddSampleForm({ ...addSampleForm, wastage: e.target.value })}
                  className="w-full bg-transparent outline-none font-bold text-xs text-gray-900 dark:text-white"
                />
                <span className="text-xs font-medium text-gray-500 ml-2">g</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsAddSampleModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs hover:bg-[#F7F5FA] dark:hover:bg-primary/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Task Assign Modal (PrepareSampleModal) */}
      <PrepareSampleModal
        open={isTaskAssignModalOpen}
        onOpenChange={setIsTaskAssignModalOpen}
        projectId={targetProjectId}
        recipeId={targetRecipeId}
        recipeCode={recipeCode}
        projectMembers={projectMembers}
      />
    </section>
  );
}
