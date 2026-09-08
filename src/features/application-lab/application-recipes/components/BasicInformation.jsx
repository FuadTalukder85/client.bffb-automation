import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Calendar, Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { cn } from "@/lib/utils";

export default function BasicInformation({
  project,
  recipe,
  formatDate,
  onSaveSpecificFields,
  handleRecipeChange,
  isFinalized = false,
}) {
  // Initial state is COLLAPSED (Image 1)
  const [isExpanded, setIsExpanded] = useState(false);
  // Completely INDEPENDENT edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [draftRecipeName, setDraftRecipeName] = useState(recipe?.recipeName || recipe?.name || "");
  const [draftPotentiality, setDraftPotentiality] = useState(recipe?.potentiality ?? "");

  useEffect(() => {
    setDraftRecipeName(recipe?.recipeName || recipe?.name || "");
    setDraftPotentiality(recipe?.potentiality ?? "");
  }, [recipe?.recipeName, recipe?.name, recipe?.potentiality]);

  const handleStartEdit = () => {
    setDraftRecipeName(recipe?.recipeName || recipe?.name || "");
    setDraftPotentiality(recipe?.potentiality ?? "");
    setIsExpanded(true); // Automatically expand so fields can be edited immediately
    setIsEditing(true);
  };

  const handleSaveLocal = async () => {
    try {
      setIsSaving(true);
      if (onSaveSpecificFields) {
        await onSaveSpecificFields({
          name: draftRecipeName,
          recipeName: draftRecipeName,
          potentiality: draftPotentiality ? Number(draftPotentiality) : undefined,
        });
      }
      handleRecipeChange?.("recipeName", draftRecipeName);
      handleRecipeChange?.("potentiality", draftPotentiality);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save Basic Information:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelLocal = () => {
    setDraftRecipeName(recipe?.recipeName || recipe?.name || "");
    setDraftPotentiality(recipe?.potentiality ?? "60");
    setIsEditing(false);
  };

  const pickFirst = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

  const recipeProject = recipe?.project || {};
  const mergedProject = {
    ...recipeProject,
    ...project,
    purpose: pickFirst(project?.purpose, recipeProject?.purpose),
    objective: pickFirst(project?.objective, recipeProject?.objective),
    raisedBy: pickFirst(project?.raisedBy, recipeProject?.raisedBy),
    raisedDate: pickFirst(project?.raisedDate, recipeProject?.raisedDate),
    projectCode: pickFirst(project?.projectCode, recipeProject?.projectCode),
    projectName: pickFirst(project?.projectName, recipeProject?.projectName),
  };

  const mergedMasterProject = {
    ...(recipeProject?.masterProject || {}),
    ...(project?.masterProject || {}),
    purpose: pickFirst(project?.masterProject?.purpose, recipeProject?.masterProject?.purpose),
    objective: pickFirst(project?.masterProject?.objective, recipeProject?.masterProject?.objective),
    raisedBy: pickFirst(project?.masterProject?.raisedBy, recipeProject?.masterProject?.raisedBy),
    raisedDate: pickFirst(project?.masterProject?.raisedDate, recipeProject?.masterProject?.raisedDate),
    code: pickFirst(project?.masterProject?.code, recipeProject?.masterProject?.code),
    title: pickFirst(project?.masterProject?.title, recipeProject?.masterProject?.title),
  };

  const fallbackProjectName =
    mergedProject?.projectName ||
    mergedMasterProject?.title ||
    recipe?.project?.masterProject?.title ||
    mergedMasterProject?.code ||
    recipe?.project?.masterProject?.code ||
    "-";

  const fallbackProjectCode =
    mergedProject?.projectCode ||
    mergedMasterProject?.code ||
    recipe?.project?.masterProject?.code ||
    "-";

  const raisedByValue =
    mergedProject?.raisedBy ||
    mergedMasterProject?.raisedBy ||
    recipe?.independentRecipeRaisedBy ||
    "-";

  const purposeValue = pickFirst(
    mergedProject?.purpose,
    mergedMasterProject?.purpose,
    recipe?.independentRecipePurpose,
    "-"
  );

  const objectiveValue = pickFirst(
    mergedProject?.objective,
    mergedMasterProject?.objective,
    recipe?.independentRecipeObjective,
    "-"
  );

  const objectiveDetailsValue =
    recipe?.project?.objectiveDetails ||
    recipe?.independentRecipeObjectiveDetails ||
    "-";

  const categoryName =
    typeof recipe?.project?.category === "object" && recipe?.project?.category !== null
      ? recipe?.project?.category?.name || "-"
      : recipe?.project?.category || recipe?.independentRecipeApplicationCategory || "-";

  const subcategoryName =
    typeof recipe?.project?.subCategory === "object" && recipe?.project?.subCategory !== null
      ? recipe?.project?.subCategory?.name || "-"
      : recipe?.project?.subCategory || recipe?.independentRecipeApplicationSubcategory || "-";

  const subSubcategoryName = Array.isArray(recipe?.project?.subSubCategory)
    ? recipe?.project?.subSubCategory.map((s) => (typeof s === "object" && s !== null ? s?.name : s)).filter(Boolean).join(", ") || "-"
    : typeof recipe?.project?.subSubCategory === "object" && recipe?.project?.subSubCategory !== null
      ? recipe?.project?.subSubCategory?.name || "-"
      : recipe?.project?.subSubCategory || recipe?.independentRecipeApplicationSubSubcategory || "-";

  const tagsList = Array.isArray(recipe?.project?.tags)
    ? recipe.project.tags.map((tag) => (typeof tag === "object" && tag !== null ? tag.name : tag)).filter(Boolean)
    : typeof recipe?.independentRecipeTags === "string" && recipe.independentRecipeTags
      ? recipe.independentRecipeTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  const targetCostValue = recipe?.project?.targetCost || recipe?.independentRecipeTargetCost || "-";
  const benchmarkValue = recipe?.project?.benchmark || recipe?.independentRecipeBenchmark || "-";
  const linkValue = recipe?.project?.link || recipe?.independentRecipeLink || "-";

  const raisedDateValue = mergedProject?.raisedDate || mergedMasterProject?.raisedDate || recipe?.independentRecipeRaisedDate;

  return (
    <div className="flex flex-col bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 rounded-[20px] px-6 py-4 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-semibold text-[#0D111A] dark:text-white tracking-tight">
          Basic Information
        </h2>

        <div className="flex items-center gap-3">
          {/* Edit / Save / Cancel Controls (visible only when expanded) */}
          {isExpanded && (
            isEditing ? (
              <div className="flex items-center overflow-hidden rounded-xl bg-[#4B208B] text-white shadow-sm">
                <button
                  type="button"
                  onClick={handleSaveLocal}
                  disabled={isSaving}
                  title="Save Changes"
                  className="flex items-center justify-center w-9 h-9 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/30" />
                <button
                  type="button"
                  onClick={handleCancelLocal}
                  disabled={isSaving}
                  title="Cancel Changes"
                  className="flex items-center justify-center w-9 h-9 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                disabled={isFinalized}
                title="Edit Basic Information"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            )
          )}

          {/* Chevron expand/collapse toggle */}
          <button
            type="button"
            onClick={() => {
              if (isExpanded && isEditing) {
                handleCancelLocal();
              }
              setIsExpanded((prev) => !prev);
            }}
            title={isExpanded ? "Collapse" : "Expand"}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content (Image 2 & 3) */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pt-6 border-t border-[#EEEBF4] dark:border-primary/40 mt-4">
          {/* Row 1 */}
          {/* Raised Date * */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Raised Date <span className="text-red-500">*</span>
            </label>
            <div className="h-11 px-3.5 flex items-center justify-start gap-2.5 border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{formatDate(raisedDateValue) || "31 Dec 2024"}</span>
            </div>
          </div>

          {/* Raised By */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Raised By
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200 truncate">
              {raisedByValue}
            </div>
          </div>

          {/* Project Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Project Code
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              {fallbackProjectCode}
            </div>
          </div>

          {/* Row 2 */}
          {/* Project Name * */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Project Name <span className="text-red-500">*</span>
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200 truncate">
              {fallbackProjectName}
            </div>
          </div>

          {/* Purpose */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Purpose
            </label>
            <div className="h-11 px-3.5 flex items-center justify-between border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              <span>{purposeValue}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Purpose Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Purpose Name
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              {fallbackProjectName === "N/A" ? "N/A" : fallbackProjectName}
            </div>
          </div>

          {/* Row 3 */}
          {/* Objective */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Objective
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              {objectiveValue}
            </div>
          </div>

          {/* Objective Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Objective Details
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200 truncate">
              {objectiveDetailsValue}
            </div>
          </div>

          {/* Application Recipe Name (EDITABLE in Edit Mode) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Application Recipe Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={draftRecipeName}
                onChange={(e) => setDraftRecipeName(e.target.value)}
                placeholder="Application Recipe Name"
                className="h-11 px-3.5 border-2 border-[#4B208B] rounded-xl text-xs font-medium bg-white dark:bg-[#151221] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4B208B]/20 shadow-sm"
              />
            ) : (
              <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200 truncate">
                {recipe?.recipeName || recipe?.name || "Application Recipe Name"}
              </div>
            )}
          </div>

          {/* Row 4 */}
          {/* Application Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Application Category
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200 truncate">
              {categoryName}
            </div>
          </div>

          {/* Application Subcategory */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Application Subcategory
            </label>
            <div className="h-11 px-3.5 flex items-center justify-between border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              <span className="truncate">{subcategoryName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </div>

          {/* Application Sub-subcategory */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Application Sub-subcategory
            </label>
            <div className="h-11 px-3.5 flex items-center justify-between border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              <span className="truncate">{subSubcategoryName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </div>

          {/* Row 5 */}
          {/* Application Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Application Tags
            </label>
            <div className="h-11 px-3.5 flex items-center justify-between border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              <div className="flex items-center gap-1.5 overflow-hidden">
                {tagsList.length > 0 ? (
                  tagsList.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 text-[11px] font-semibold truncate"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </div>

          {/* Target Cost */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Target Cost
            </label>
            <div className="h-11 px-3.5 flex items-center justify-between border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
              <span>{targetCostValue}</span>
              <span className="text-xs font-semibold text-gray-400">BDT/kg</span>
            </div>
          </div>

          {/* Potentiality (EDITABLE in Edit Mode) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Potentiality
            </label>
            {isEditing ? (
              <div className="h-11 px-3.5 flex items-center justify-between border-2 border-[#4B208B] rounded-xl bg-white dark:bg-[#151221] shadow-sm">
                <input
                  type="text"
                  value={draftPotentiality}
                  onChange={(e) => setDraftPotentiality(e.target.value)}
                  placeholder="60"
                  className="w-full text-xs font-medium text-gray-900 dark:text-white bg-transparent focus:outline-none"
                />
                <span className="text-xs font-semibold text-gray-400">%</span>
              </div>
            ) : (
              <div className="h-11 px-3.5 flex items-center justify-between border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200">
                <span>{recipe?.potentiality ?? "60"}</span>
                <span className="text-xs font-semibold text-gray-400">%</span>
              </div>
            )}
          </div>

          {/* Row 6 */}
          {/* Benchmark */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Benchmark
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-medium bg-[#FCFBFD] dark:bg-[#121019] text-gray-800 dark:text-gray-200 truncate">
              {benchmarkValue}
            </div>
          </div>

          {/* Link */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Link
            </label>
            <div className="h-11 px-3.5 flex items-center border border-[#EEEBF4] dark:border-primary/40 rounded-xl text-xs font-semibold text-[#4B208B] dark:text-purple-300 bg-[#FCFBFD] dark:bg-[#121019] truncate">
              {linkValue}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
