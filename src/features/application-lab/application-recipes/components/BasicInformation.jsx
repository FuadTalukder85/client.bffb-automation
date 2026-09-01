import React from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export default function BasicInformation({
  project,
  recipe,
  formatDate,
  isEditMode = false,
  handleRecipeChange
}) {
  // Common styles to match the "perfect" pattern previously confirmed
  const inputWrapperClass = "space-y-1 lg:space-y-0.5 xl:space-y-0.5 2xl:space-y-1.5 3xl:space-y-1.5";
  const labelClass = "block text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-nav-highlight md:text-gray-700 md:dark:text-gray-300 px-0.5";
  const inputContainerClass = cn(
    "h-5 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 border rounded-md lg:rounded-sm xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg focus:ring-1 focus:ring-primary transition-all",
    isEditMode
      ? "bg-white dark:bg-gray-800 border-primary shadow-sm"
      : "bg-primary-shade-2 border-nav-highlight/30 shadow-none"
  );
  const inputClass = "text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-900 dark:text-white font-medium bg-transparent";

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

  const recipeType = String(recipe?.recipeType || "").toLowerCase();
  const showServingSize = ["beverage", "beverage psd"].includes(recipeType);

  const fallbackProjectCode =
    mergedProject?.projectCode ||
    mergedMasterProject?.code ||
    recipe?.project?.masterProject?.code ||
    "N/A";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-1 lg:gap-y-1 xl:gap-y-2 2xl:gap-y-3 3xl:gap-y-4 gap-x-6 py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 my-1 lg:my-1 xl:my-2 2xl:my-3 3xl:my-4 overflow-x-hidden">
      {/* <div className="col-span-full mb-2 p-2 bg-red-100 text-red-800 font-bold">
        DEBUG: isIndependent={String(isIndependent)} | isEditMode={String(isEditMode)} | recipe.isIndependentRecipe={String(recipe?.isIndependentRecipe)}
      </div> */}

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
          value={recipe?.potentiality || "N/A"}
          readOnly={!isEditMode}
          rightIcon={<span className="">%</span>}
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
