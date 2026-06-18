import React, { useState, useMemo, useEffect } from "react";
import AddBFFProductModal from "./AddBFFProductModal";
import AddStandardIngredientModal from "./AddStandardIngredientModal";
import EditIngredientModal from "./EditIngredientModal";
import ArchiveIngredientModal from "./ArchiveIngredientModal";
import { useDeleteRecipeIngredient } from "@/hooks/mutations/useRecipeMutations";
import { cn } from "@/lib/utils";
import { buildIngredientsDisplayData, isConfectionaryRecipe } from "../data/ingredientsCalculations";
import { GoPlus } from "react-icons/go";

export default function IngredientsTable({ data, isEditMode = false, onIngredientsChange }) {
  const [isBFFModalOpen, setIsBFFModalOpen] = useState(false);
  const [isStandardIngredientModalOpen, setIsStandardIngredientModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientToArchive, setIngredientToArchive] = useState(null);

  const deleteIngredientMutation = useDeleteRecipeIngredient();
  const [editedBatchSummary, setEditedBatchSummary] = useState({
    yield: data?.outputYield ?? 0,
    servingSize: data?.outputServingSize ?? 0,
  });

  const HIDDEN_TYPE_SOLID_LIQUID_RECIPES = ["beverage", "beverage psd"];
  const recipeTypeLower = data?.recipeType?.toLowerCase() || "";
  const isHiddenTypeAndSolidLiquid = HIDDEN_TYPE_SOLID_LIQUID_RECIPES.includes(recipeTypeLower);

  const isConfectionary = isConfectionaryRecipe(data?.recipeType);
  const showSolidLiquidColumn = !isHiddenTypeAndSolidLiquid && !isConfectionary;
  const showPerSachetColumn = recipeTypeLower === "beverage psd";
  const isBakery = recipeTypeLower === "bakery";
  const doughCostLabel = !isBakery ? "Cost per kg (without loss)" : "Dough Cost per kg";
  const showTypeColumn = !isConfectionary && !isHiddenTypeAndSolidLiquid;

  useEffect(() => {
    setEditedBatchSummary({
      yield: data?.outputYield ?? 0,
      servingSize: data?.outputServingSize ?? 0,
    });
  }, [data?.outputYield, data?.outputServingSize]);

  const computedData = useMemo(
    () =>
      buildIngredientsDisplayData(data, {
        outputYield: editedBatchSummary.yield,
        outputServingSize: editedBatchSummary.servingSize,
      }),
    [data, editedBatchSummary.yield, editedBatchSummary.servingSize]
  );

  const { ingredients, totals, batchSummary } = computedData;

  const handleBatchSummaryChange = (field, value) => {
    setEditedBatchSummary(prev => {
      const nextSummary = {
        ...prev,
        [field]: value,
      };

      onIngredientsChange?.({
        ingredients: Array.isArray(data?.ingredients) ? data.ingredients : [],
        outputYield: nextSummary.yield,
        outputServingSize: nextSummary.servingSize,
      });

      return nextSummary;
    });
  };

  // Group ingredients into segments for rowSpan calculation
  const segments = useMemo(() => {
    const result = [];
    let currentSegment = [];
    
    ingredients.forEach((item, index) => {
      currentSegment.push(item);
      if (item.isSeparator || index === ingredients.length - 1) {
        result.push(currentSegment);
        currentSegment = [];
      }
    });
    
    return result;
  }, [ingredients]);

  // Flatten segments back but with span info
  const tableRows = useMemo(() => {
    const rows = [];
    segments.forEach((segment) => {
      const lastItemInSegment = segment[segment.length - 1];
      segment.forEach((item, index) => {
        rows.push({
          ...item,
          isFirstInSegment: index === 0,
          segmentLength: segment.length,
          consolidatedSolidLiquid: segment.find(i => i.solidLiquid !== null)?.solidLiquid || "-",
          segmentHasSeparator: lastItemInSegment?.isSeparator || false
        });
      });
    });
    return rows;
  }, [segments]);

  const handleBFFProductConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData]);
  };

  const handleStandardIngredientConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? data.ingredients : [];
    onIngredientsChange?.([...currentIngredients, formData]);
  };

  const handleEditRow = (ingredient) => {
    setSelectedIngredient({ ...ingredient, index: ingredient.originalIndex });
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = (formData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? [...data.ingredients] : [];
    const updateIndex = Number(formData?.index);

    if (Number.isInteger(updateIndex) && updateIndex >= 0 && updateIndex < currentIngredients.length) {
      currentIngredients[updateIndex] = {
        ...currentIngredients[updateIndex],
        ...formData,
      };
      onIngredientsChange?.(currentIngredients);
    }

    setIsEditModalOpen(false);
  };

  const handleArchiveRow = (ingredient) => {
    setIngredientToArchive(ingredient);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!ingredientToArchive) return;
    const currentIngredients = Array.isArray(data?.ingredients) ? [...data.ingredients] : [];
    const deleteIndex = Number(ingredientToArchive?.originalIndex);

    if (Number.isInteger(deleteIndex) && deleteIndex >= 0 && deleteIndex < currentIngredients.length) {
      if (ingredientToArchive._id && data?._id) {
        await deleteIngredientMutation.mutateAsync({
          recipeId: data._id,
          ingredientId: ingredientToArchive._id,
        });
      }
      currentIngredients.splice(deleteIndex, 1);
      onIngredientsChange?.(currentIngredients);
    }
    setIsArchiveModalOpen(false);
    setIngredientToArchive(null);
  };

  return (
    <div className="p-6">
      {/* Ingredients Table */}
      <div>
        <h2 className="text-xs lg:text-xs xl:text-sm 2xl:text-lg 3xl:text-xl font-bold text-gray-900 dark:text-white mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4">Ingredients Table</h2>
        
        <div className="overflow-x-auto border border-border rounded-lg bg-primary-shade-2 dark:bg-primary-shade-2/10 shadow-sm">
          <table className="w-full text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border-collapse">
            <thead className="bg-white dark:bg-background border-b border-border">
              <tr>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white">SL</th>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Role</th>
                {showTypeColumn && <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Type</th>}
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Ingredients</th>
                {isConfectionary && <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Process</th>}
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">BFF Rate (৳)</th>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Client Rate (৳)</th>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Quantity (g)</th>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Composition (%)</th>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">BFF Cost (৳/kg)</th>
                <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Client Cost (৳/kg)</th>
                {showSolidLiquidColumn && <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-center font-bold text-gray-900 dark:text-white border-l border-border">Solid:Liquid (%)</th>}
                {showPerSachetColumn && <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-center font-bold text-gray-900 dark:text-white border-l border-border">Per Sachet (g/pcs)</th>}
                {isEditMode && (
                  <th className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left font-bold text-gray-900 dark:text-white border-l border-border">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tableRows.map((ingredient, index) => (
                <tr 
                  key={index} 
                  className={cn(
                    "hover:bg-primary-shade-2/30 dark:hover:bg-primary-shade-2/5 transition-colors",
                    ingredient.isSeparator && "border-b-2 border-border"
                  )}
                >
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 text-center font-medium bg-white dark:bg-background">
                    <span className="inline-flex items-center justify-center size-6 2xl:size-7 3xl:size-10 bg-primary/10 rounded-full text-nav-highlight">{index+1}</span>
                  </td>
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.role}</td>
                  {showTypeColumn && <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.type}</td>}
                  <td className={cn("px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color border-l border-border bg-white dark:bg-background font-bold", ingredient.ingredientSourceType !== "bffProductCode" ? "font-medium" : "font-bold")}>{ingredient.name}</td>
                  {isConfectionary && <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.process || "-"}</td>}
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.bffRate}</td>
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.clientRate}</td>
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-nav-highlight font-medium border-l border-border bg-white dark:bg-background">{ingredient.quantity}</td>
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.composition}</td>
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.bffCost}</td>
                  <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color font-medium border-l border-border bg-white dark:bg-background">{ingredient.clientCost}</td>
                  
                  {/* Merged Solid:Liquid Cell */}
                  {showSolidLiquidColumn && ingredient.isFirstInSegment ? (
                    <td 
                      rowSpan={ingredient.segmentLength} 
                      className={cn(
                        "px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-center text-base-color font-bold border-l border-border align-middle bg-white dark:bg-background",
                        ingredient.segmentHasSeparator && "border-b-2 border-b-nav-highlight"
                      )}
                    >
                      {ingredient.consolidatedSolidLiquid}
                    </td>
                  ) : null}

                  {showPerSachetColumn && (
                    <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-center text-base-color font-medium border-l border-border bg-white dark:bg-background">
                      {((editedBatchSummary.servingSize * Number(ingredient.composition)) / 100).toFixed(2)}
                    </td>
                  )}

                  {isEditMode && (
                    <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 border-l border-border bg-white dark:bg-background">
                      <div className="flex items-center justify-center gap-0">
                        <button
                          onClick={() => handleEditRow(ingredient)}
                          title="Edit"
                          aria-label="Edit"
                          className="action-button flex items-center justify-center gap-1.5 rounded-l-md rounded-r-none hover:bg-purple-200 bg-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                        >
                          <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                        </button>
                        <button
                          onClick={() => handleArchiveRow(ingredient)}
                          title="Archive"
                          aria-label="Archive"
                          className="action-button flex items-center justify-center gap-1.5 rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                        >
                          <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-white dark:bg-background font-bold border-t border-border">
                <td
                  colSpan={5 + (showTypeColumn ? 1 : 0) + (isConfectionary ? 1 : 0)}
                  className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color"
                >
                  Total
                </td>
                <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-nav-highlight border-l border-border">{totals.quantity}</td>
                <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color border-l border-border">{totals.composition}</td>
                <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color border-l border-border">{totals.bffCost}</td>
                <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-base-color border-l border-border">{totals.clientCost}</td>
                {showSolidLiquidColumn && <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 border-l border-border"></td>}
                {showPerSachetColumn && <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 border-l border-border text-center text-base-color">{editedBatchSummary.servingSize ? Number(editedBatchSummary.servingSize).toFixed(2) : ""}</td>}
                {isEditMode && <td className="px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 border-l border-border"></td>}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 mt-4 lg:mt-2 xl:mt-2.5 2xl:mt-3 3xl:mt-4">
          <button 
            disabled={!isEditMode}
            onClick={() => isEditMode && setIsBFFModalOpen(true)}
            className="flex items-center gap-2 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-2 px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-1 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-bold text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
           <GoPlus className="action-button-icon"  />
            BFF Product
          </button>
          <button 
            disabled={!isEditMode}
            onClick={() => isEditMode && setIsStandardIngredientModalOpen(true)}
            className="flex items-center gap-2 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-2 px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-1 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-bold text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoPlus className="action-button-icon"  />
            Standard Ingredient
          </button>
        </div>
      </div>

      {/* Batch Summary */}
      <div className="lg:mt-6.5 xl:mt-8.5 2xl:mt-9.5 3xl:mt-12">
        <h2 className="text-xs lg:text-xs xl:text-sm 2xl:text-lg 3xl:text-xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-3 xl:mb-4 2xl:mb-5 3xl:mb-6">Batch Summary</h2>
        
        <div className="space-y-4 lg:space-y-5 xl:space-y-6 2xl:space-y-7 3xl:space-y-8">
          <div className="space-y-2 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4">
            <h3 className="text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-bold text-lighter-text uppercase tracking-wider mb-2 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4">Cost Calculation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6">
              <div className="space-y-2 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4">
                <h4 className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-gray-700 dark:text-white">BFF</h4>
                <div className="grid grid-cols-1 gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
                  <SummaryField label={doughCostLabel} value={batchSummary.costCalculation.doughCostPerKg.bff} unit="৳/kg" />
                  <SummaryField label="Cost per kg (with Loss)" value={batchSummary.costCalculation.costPerKgWithLoss.bff} unit="৳/kg" />
                  <SummaryField label={showPerSachetColumn ? "Cost per Sachet" : "Cost per Piece"} value={batchSummary.costCalculation.costPerPiece.bff} unit={showPerSachetColumn ? "৳/sachet" : "৳/pcs"} />
                </div>
              </div>

              <div className="space-y-2 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4">
                <h4 className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-gray-700 dark:text-white">Client</h4>
                <div className="grid grid-cols-1 gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
                  <SummaryField label={doughCostLabel} value={batchSummary.costCalculation.doughCostPerKg.client} unit="৳/kg" />
                  <SummaryField label="Cost per kg (with Loss)" value={batchSummary.costCalculation.costPerKgWithLoss.client} unit="৳/kg" />
                  <SummaryField label={showPerSachetColumn ? "Cost per Sachet" : "Cost per Piece"} value={batchSummary.costCalculation.costPerPiece.client} unit={showPerSachetColumn ? "৳/sachet" : "৳/pcs"} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4">
            <h3 className="text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-bold text-lighter-text uppercase tracking-wider mb-2 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4">Output</h3>
            <div className="grid grid-cols-1 gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
              <SummaryField 
                label="Yield" 
                value={editedBatchSummary.yield} 
                unit="%" 
                isEditMode={isEditMode}
                onChange={(value) => handleBatchSummaryChange('yield', value)}
              />
              <SummaryField 
                label="Serving Size" 
                value={editedBatchSummary.servingSize} 
                unit="g" 
                isEditMode={isEditMode}
                onChange={(value) => handleBatchSummaryChange('servingSize', value)}
              />
              <SummaryField label="Output Pieces" value={batchSummary.output.outputPieces} unit="pcs" />
              <SummaryField label="Output" value={batchSummary.output.output} unit="g" />
            </div>
          </div>
        </div>
      </div>

      {/* Add BFF Product Modal */}
      <AddBFFProductModal
        isOpen={isBFFModalOpen}
        onClose={() => setIsBFFModalOpen(false)}
        onConfirm={handleBFFProductConfirm}
        isConfectionary={isConfectionary}
      />

      {/* Add Standard Ingredient Modal */}
      <AddStandardIngredientModal
        isOpen={isStandardIngredientModalOpen}
        onClose={() => setIsStandardIngredientModalOpen(false)}
        onConfirm={handleStandardIngredientConfirm}
        isConfectionary={isConfectionary}
      />

      {/* Edit Ingredient Modal */}
      <EditIngredientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditConfirm}
        initialData={selectedIngredient}
        isConfectionary={isConfectionary}
      />

      {/* Archive Ingredient Modal */}
      <ArchiveIngredientModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        ingredientName={ingredientToArchive?.name}
        onConfirm={handleArchiveConfirm}
        isLoading={deleteIngredientMutation.isPending}
      />
    </div>
  );
}

function SummaryField({ label, value, unit, isEditMode = false, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-gray-700 dark:text-gray-300 px-0.5">{label}</label>
      <div className={cn(
        "flex items-center h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 border rounded-sm lg:rounded-sm xl:rounded-sm 2xl:rounded-lg 3xl:rounded-xl overflow-hidden shadow-sm shadow-black/5 transition-all",
        isEditMode && onChange 
          ? "bg-white dark:bg-background border-primary/30 dark:border-primary focus-within:border-primary" 
          : "bg-white dark:bg-background border-border"
      )}>
        <div className="flex-1 px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-700 dark:text-white">
          {isEditMode && onChange ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-700 focus:outline-none"
            />
          ) : (
            value
          )}
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="w-16 flex justify-center text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-lighter-text">
          {unit}
        </div>
      </div>
    </div>
  );
}



