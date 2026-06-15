import React, { useState, useMemo } from "react";
import { Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import AddBFFProductModal from "./AddBFFProductModal";
import AddStandardIngredientModal from "./AddStandardIngredientModal";
import EditIngredientModal from "./EditIngredientModal";
import { buildIngredientsDisplayData, isConfectionaryRecipe } from "../data/ingredientsCalculations";

export default function MobileIngredientsTable({ data, isEditMode = false, onIngredientsChange }) {
  const { ingredients, totals, batchSummary } = useMemo(() => buildIngredientsDisplayData(data), [data]);
  const [isBFFModalOpen, setIsBFFModalOpen] = useState(false);
  const [isStandardIngredientModalOpen, setIsStandardIngredientModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  const HIDDEN_TYPE_SOLID_LIQUID_RECIPES = ["beverage", "beverage psd"];
  const recipeTypeLower = data?.recipeType?.toLowerCase() || "";
  const isHiddenTypeAndSolidLiquid = HIDDEN_TYPE_SOLID_LIQUID_RECIPES.includes(recipeTypeLower);
  const isConfectionary = isConfectionaryRecipe(data?.recipeType);
  const showSolidLiquidColumn = !isHiddenTypeAndSolidLiquid && !isConfectionary;
  const isBakery = recipeTypeLower === "bakery";
  const doughCostLabel = !isBakery ? "Cost/Kg without loss" : "Dough Cost per kg";
  const showTypeColumn = !isConfectionary && !isHiddenTypeAndSolidLiquid;

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
    setEditingIngredient({ ...ingredient, index: ingredient.originalIndex });
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = (updatedData) => {
    const currentIngredients = Array.isArray(data?.ingredients) ? [...data.ingredients] : [];
    const updateIndex = Number(updatedData?.index);

    if (Number.isInteger(updateIndex) && updateIndex >= 0 && updateIndex < currentIngredients.length) {
      currentIngredients[updateIndex] = {
        ...currentIngredients[updateIndex],
        ...updatedData,
      };
      onIngredientsChange?.(currentIngredients);
    }

    setIsEditModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-6 py-4 overflow-x-hidden">
      
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Ingredients Table</h2>
        
        {/* Table Container - Using bg-background and border-border for project theme sync */}
        <div className="relative overflow-hidden border shadow-sm border-border rounded-2xl bg-white dark:bg-background">
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <table className="w-full text-[10px] border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-white dark:bg-background">
                <tr className="border-b border-border h-12">
                  <th className="px-3 font-bold text-left text-base-color h-12">SL</th>
                  <th className="px-3 font-bold text-left text-base-color border-l border-border h-12">Role</th>
                  {showTypeColumn && <th className="px-3 font-bold text-left text-base-color border-l border-border h-12">Type</th>}
                  <th className="px-3 font-bold text-left text-base-color border-l border-border h-12">Ingredients</th>
                  {isConfectionary && <th className="px-3 font-bold text-left text-base-color border-l border-border h-12">Process</th>}
                  <th className="px-4 font-bold text-left text-base-color border-l border-border h-12">BFF Rate (৳)</th>
                  <th className="px-4 font-bold text-left text-base-color border-l border-border h-12">Client Rate (৳)</th>
                  <th className="px-4 font-bold text-left text-base-color border-l border-border h-12">Quantity (g)</th>
                  <th className="px-4 font-bold text-left text-base-color border-l border-border h-12">Composition (%)</th>
                  <th className="px-4 font-bold text-left text-base-color border-l border-border h-12">BFF Cost (৳/kg)</th>
                  <th className="px-4 font-bold text-left text-base-color border-l border-border h-12">Client Cost (৳/kg)</th>
                  {showSolidLiquidColumn && <th className="px-4 font-bold text-center text-base-color border-l border-border h-12">Solid:Liquid (%)</th>}
                  {isEditMode && (
                    <th className="px-3 font-bold text-left text-base-color border-l border-border h-12">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableRows.map((ingredient, index) => (
                  <tr 
                    key={index} 
                    className={cn(
                      "hover:bg-primary-shade-2/30 dark:hover:bg-primary-shade-2/5 transition-colors h-12",
                      ingredient.isSeparator && "border-b-2 border-nav-highlight"
                    )}
                  >
                    <td className="px-3 bg-white dark:bg-background h-12">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-primary-shade-2 text-nav-highlight font-bold">
                        {ingredient.sl}
                      </span>
                    </td>
                    <td className="px-3 font-medium bg-white border-l text-lighter-text whitespace-nowrap border-border dark:bg-background h-12">{ingredient.role}</td>
                    {showTypeColumn && <td className="px-3 font-medium bg-white border-l text-lighter-text whitespace-nowrap border-border dark:bg-background h-12">{ingredient.type}</td>}
                    <td className="px-3 font-bold bg-white border-l text-base-color whitespace-nowrap border-border dark:bg-background h-12">{ingredient.name}</td>
                    {isConfectionary && <td className="px-3 font-medium bg-white border-l text-base-color whitespace-nowrap border-border dark:bg-background h-12">{ingredient.process || "-"}</td>}
                    <td className="px-4 font-bold bg-white border-l text-base-color border-border dark:bg-background h-12">{ingredient.bffRate}</td>
                    <td className="px-4 font-bold bg-white border-l text-base-color border-border dark:bg-background h-12">{ingredient.clientRate}</td>
                    <td className="px-4 font-bold bg-white border-l text-nav-highlight border-border dark:bg-background h-12">{ingredient.quantity}</td>
                    <td className="px-4 font-bold bg-white border-l text-base-color border-border dark:bg-background h-12">{ingredient.composition}</td>
                    <td className="px-4 font-bold bg-white border-l text-base-color border-border dark:bg-background h-12">{ingredient.bffCost}</td>
                    <td className="px-4 font-bold bg-white border-l text-base-color border-border dark:bg-background h-12">{ingredient.clientCost}</td>
                    
                    {/* Merged Solid:Liquid Cell */}
                    {showSolidLiquidColumn && ingredient.isFirstInSegment ? (
                      <td 
                        rowSpan={ingredient.segmentLength} 
                        className={cn(
                          "px-4 text-center text-base-color font-bold border-l border-border align-middle bg-white dark:bg-background",
                          ingredient.segmentHasSeparator && "border-b-2 border-b-nav-highlight"
                        )}
                      >
                        {ingredient.consolidatedSolidLiquid}
                      </td>
                    ) : null}

                    {/* Conditional Actions Cell */}
                    {isEditMode ? (
                      <td className="px-3 bg-white border-l border-border dark:bg-background h-12">
                        <div className="flex justify-center items-center h-full">
                          <button 
                            onClick={() => handleEditRow(ingredient)}
                            className="p-1 rounded-md text-nav-highlight hover:bg-primary-shade-2 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="font-bold border-t bg-white dark:bg-background border-border">
                  <td className="px-3 py-4 text-base-color" colSpan={showTypeColumn || isConfectionary ? 7 : 6}>Total</td>
                  <td className="px-4 py-4 border-l text-nav-highlight border-border">{totals.quantity}</td>
                  <td className="px-4 py-4 border-l text-base-color border-border">{totals.composition}</td>
                  <td className="px-4 py-4 border-l text-base-color border-border">{totals.bffCost}</td>
                  <td className="px-4 py-4 border-l text-base-color border-border">{totals.clientCost}</td>
                  {showSolidLiquidColumn && <td className="px-4 py-4 border-l border-border"></td>}
                  {isEditMode && <td className="px-3 py-4 border-l border-border"></td>}
                </tr>
              </tbody>
            </table>
          </div>
         
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button 
            disabled={!isEditMode}
            onClick={() => isEditMode && setIsBFFModalOpen(true)}
            className="flex items-center justify-center h-12 gap-2 text-xs font-bold text-white transition-transform rounded-full shadow-md bg-primary shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            BFF Product
          </button>
          <button 
            disabled={!isEditMode}
            onClick={() => isEditMode && setIsStandardIngredientModalOpen(true)}
            className="flex items-center justify-center h-12 gap-2 text-xs font-bold text-white transition-transform rounded-full shadow-md bg-primary shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Standard Ingredient
          </button>
        </div>
      </div>

      {/* Batch Summary */}
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Batch Summary</h2>

        {/* Cost Calculation Section */}
        <h3 className="text-xs font-bold text-lighter-text px-0.5 uppercase tracking-wider">Cost Calculation</h3>
        <SummaryTable 
          title="BFF" 
          rows={[
            { label: doughCostLabel, value: batchSummary.costCalculation.doughCostPerKg.bff, unit: "৳/kg" },
            { label: "Cost per kg (with Loss)", value: batchSummary.costCalculation.costPerKgWithLoss.bff, unit: "৳/kg" },
            { label: recipeTypeLower === "beverage psd" ? "Cost per Sachet" : "Cost per Piece", value: batchSummary.costCalculation.costPerPiece.bff, unit: recipeTypeLower === "beverage psd" ? "৳/sachet" : "৳/pcs" },
          ]} 
        />
        <SummaryTable 
          title="Client" 
          rows={[
            { label: doughCostLabel, value: batchSummary.costCalculation.doughCostPerKg.client, unit: "৳/kg" },
            { label: "Cost per kg (with Loss)", value: batchSummary.costCalculation.costPerKgWithLoss.client, unit: "৳/kg" },
            { label: recipeTypeLower === "beverage psd" ? "Cost per Sachet" : "Cost per Piece", value: batchSummary.costCalculation.costPerPiece.client, unit: recipeTypeLower === "beverage psd" ? "৳/sachet" : "৳/pcs" },
          ]} 
        />

        {/* Output Section */}
        <SummaryTable 
          title="Output" 
          rows={[
            { label: "Yield", value: batchSummary.output.yield, unit: "%" },
            { label: "Serving Size", value: batchSummary.output.servingSize, unit: "g" },
            { label: "Output Pieces", value: batchSummary.output.outputPieces, unit: "pcs" },
            { label: "Output", value: batchSummary.output.output, unit: "g" },
          ]} 
        />
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
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditConfirm}
        initialData={editingIngredient}
        isConfectionary={isConfectionary}
      />
    </div>
  );
}

function SummaryTable({ title, rows }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold text-lighter-text px-0.5 uppercase tracking-wider">
        {title}
      </h3>
      <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, idx) => (
              <tr 
                key={idx} 
                className={cn(
                  "border-border", 
                  idx < rows.length - 1 && "border-b"
                )}
              >
                <td className="w-[45%] px-4 py-3 text-[13px] text-lighter-text font-medium bg-white dark:bg-background leading-none">
                  {row.label}
                </td>
                <td className="w-[55%] px-4 py-3 text-[13px] text-base-color font-bold border-l border-border bg-white dark:bg-background leading-none">
                  <div className="flex items-center justify-between gap-2">
                    <span>{row.value}</span>
                    <span className="text-[11px] text-lighter-text font-bold">
                      {row.unit}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
