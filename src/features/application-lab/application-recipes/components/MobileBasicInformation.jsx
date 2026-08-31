import React from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export default function MobileBasicInformation({ 
  project, 
  recipe, 
  formatDate, 
  isEditMode = false,
  handleRecipeChange
}) {
  const inputWrapperClass = "space-y-1";
  const labelClass = "block text-[11px] font-bold text-base-color px-0.5 uppercase tracking-tight";
  const inputContainerClass = cn(
    "h-10 rounded-lg transition-all border",
    isEditMode
      ? "bg-white dark:bg-gray-800 border-primary shadow-sm"
      : "bg-primary-shade-2/20 border-nav-highlight/20 focus-within:border-nav-highlight/50 focus-within:ring-0"
  );
  const inputClass = "text-[12px] text-foreground font-medium bg-transparent";

  const pickFirst = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

  const isIndependent = recipe?.isIndependentRecipe;

  const renderField = (label, fieldName, projectValue, placeholder = "N/A", rightIcon = null) => {
    const isIndField = isIndependent && isEditMode;
    const value = isIndependent
      ? (recipe?.[fieldName] || "")
      : (projectValue || placeholder);

    return (
      <div className={inputWrapperClass}>
        <label className={labelClass}>{label}</label>
        <Input
          value={value}
          readOnly={!isIndField}
          placeholder={isIndField ? `Enter ${label.toLowerCase()}` : undefined}
          rightIcon={rightIcon}
          className={cn(inputContainerClass, !isIndField && "bg-gray-100 opacity-70 dark:bg-primary/10")}
          inputClassName={inputClass}
          onChange={(e) => handleRecipeChange(fieldName, e.target.value)}
        />
      </div>
    );
  };

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
    objectiveDetails: pickFirst(project?.objectiveDetails, recipeProject?.objectiveDetails),
    benchmark: pickFirst(project?.benchmark, recipeProject?.benchmark),
    link: pickFirst(project?.link, recipeProject?.link),
    targetCost: pickFirst(project?.targetCost, recipeProject?.targetCost),
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
    "N/A";

  const fallbackProjectCode =
    mergedProject?.projectCode ||
    mergedMasterProject?.code ||
    recipe?.project?.masterProject?.code ||
    "N/A";

  const recipeType = String(recipe?.recipeType || "").toLowerCase();
  const showServingSize = ["beverage", "beverage psd"].includes(recipeType);

  return (
    <div className="flex flex-col gap-5 py-6 overflow-x-hidden">
      
      {/* Recipe Creation Date */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Recipe Creation Date</label>
        <Input
          value={formatDate(recipe.createdAt)}
          readOnly={true}
          className={cn(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary/10")}
          inputClassName={inputClass}
        />
      </div>

      {/* Raised By */}
      {renderField("Raised By", "independentRecipeRaisedBy", mergedProject?.raisedBy || mergedMasterProject?.raisedBy || "Business Development")}

      {/* Purpose */}
      {renderField("Purpose", "independentRecipePurpose", pickFirst(mergedProject?.purpose, mergedMasterProject?.purpose, "N/A"))}

      {/* Purpose Name */}
      {renderField("Purpose Name", "independentRecipePurposeName", fallbackProjectName)}

      {/* Objective */}
      {renderField("Objective", "independentRecipeObjective", pickFirst(mergedProject?.objective, mergedMasterProject?.objective, "N/A"))}

      {/* Objective Details */}
      {renderField("Objective Details", "independentRecipeObjectiveDetails", recipe?.project?.objectiveDetails || "")}

      {/* Project Code */}
      {renderField("Project Code", "independentRecipeProjectCode", fallbackProjectCode)}

      {/* Project Name */}
      {renderField("Project Name", "independentRecipeProjectName", fallbackProjectName)}

      {/* Raised Date */}
      {renderField("Raised Date", "independentRecipeRaisedDate", formatDate(mergedProject?.raisedDate || mergedMasterProject?.raisedDate))}

      {/* Recipe Code */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Recipe Code</label>
        <Input
          value={recipe.recipeCode || "N/A"}
          readOnly={true}
          className={cn(inputContainerClass, "bg-gray-100 opacity-70 dark:bg-primary/10")}
          inputClassName={inputClass}
        />
      </div>

      {/* Application Recipe Name */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Application Recipe Name</label>
        <Input
          value={recipe.recipeName || recipe.name || "N/A"}
          readOnly={!isEditMode}
          className={inputContainerClass}
          inputClassName={inputClass}
          onChange={(e) => handleRecipeChange("recipeName", e.target.value)}
        />
      </div>

      {/* Application Category */}
      {renderField("Application Category", "independentRecipeApplicationCategory", typeof recipe?.project?.category === 'object' && recipe?.project?.category !== null ? recipe?.project?.category?.name || "N/A" : recipe?.project?.category || "N/A")}

      {/* Application Subcategory */}
      {renderField("Application Subcategory", "independentRecipeApplicationSubcategory", typeof recipe?.project?.subCategory === 'object' && recipe?.project?.subCategory !== null ? recipe?.project?.subCategory?.name || "N/A" : recipe?.project?.subCategory || "N/A")}

      {/* Application Sub-subcategory */}
      {renderField(
        "Application Sub-subcategory",
        "independentRecipeApplicationSubSubcategory",
        Array.isArray(recipe?.project?.subSubCategory)
          ? recipe?.project?.subSubCategory.map(s => (typeof s === 'object' && s !== null ? s?.name : s)).filter(Boolean).join(", ") || "N/A"
          : typeof recipe?.project?.subSubCategory === 'object' && recipe?.project?.subSubCategory !== null
          ? recipe?.project?.subSubCategory?.name || "N/A"
          : recipe?.project?.subSubCategory || "N/A"
      )}

      {/* Application Tags */}
      {renderField("Application Tags", "independentRecipeTags", Array.isArray(recipe?.project?.tags) ? recipe.project.tags.map(tag => typeof tag === 'object' && tag !== null ? tag.name : tag).filter(Boolean).join(', ') || "N/A" : "N/A")}

      {/* Target Cost */}
      {renderField("Target Cost", "independentRecipeTargetCost", recipe?.project?.targetCost || "N/A")}

      {/* Potentiality */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Potentiality</label>
        <Input
          value={recipe?.potentiality || ""}
          readOnly={!isEditMode}
          rightIcon={<span className="text-[10px] text-nav-highlight font-bold pr-2">%</span>}
          className={inputContainerClass}
          inputClassName={inputClass}
          onChange={(e) => handleRecipeChange("potentiality", e.target.value)}
        />
      </div>

      {/* Benchmark */}
      {renderField("Benchmark", "independentRecipeBenchmark", recipe?.project?.benchmark || "N/A")}

      {/* Link */}
      {renderField("Link", "independentRecipeLink", recipe?.project?.link || "N/A")}

      {showServingSize && (
        <div className={inputWrapperClass}>
          <label className={labelClass}>Serving Size</label>
          <Input
            value={recipe?.servingSizeText ?? ""}
            placeholder="gm/ml"
            readOnly={!isEditMode}
            className={inputContainerClass}
            inputClassName={inputClass}
            onChange={(e) => handleRecipeChange("servingSizeText", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
