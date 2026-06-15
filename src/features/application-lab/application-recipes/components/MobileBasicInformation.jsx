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
    "bg-primary-shade-2/20 border-nav-highlight/20 focus-within:border-nav-highlight/50 focus-within:ring-0"
  );
  const inputClass = "text-[12px] text-foreground font-medium bg-transparent";

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
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Raised By */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Raised By</label>
        <Input
          value={mergedProject?.raisedBy || mergedMasterProject?.raisedBy || "Business Development"}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Purpose */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Purpose</label>
        <Input
          value={pickFirst(mergedProject?.purpose, mergedMasterProject?.purpose, "N/A")}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Purpose Name */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Purpose Name</label>
        <Input
          value={fallbackProjectName}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Objective */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Objective</label>
        <Input
          value={pickFirst(mergedProject?.objective, mergedMasterProject?.objective, "N/A")}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Objective Details */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Objective Details</label>
        <Input
          value={pickFirst(mergedProject?.objectiveDetails, recipe?.project?.objectiveDetails, "")}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Project Code */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Project Code</label>
        <Input
          value={fallbackProjectCode}
          readOnly={true}
          className={cn(inputContainerClass, "opacity-70")}
          inputClassName={inputClass}
        />
      </div>

      {/* Project Name */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Project Name</label>
        <Input
          value={fallbackProjectName}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Raised Date */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Raised Date</label>
        <Input
          value={formatDate(mergedProject?.raisedDate || mergedMasterProject?.raisedDate)}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Recipe Code */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Recipe Code</label>
        <Input
          value={recipe.recipeCode || "N/A"}
          readOnly={true}
          className={cn(inputContainerClass, "opacity-70")}
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
      <div className={inputWrapperClass}>
        <label className={labelClass}>Application Category</label>
        <Input
          value={typeof recipe?.project?.category === 'object' ? recipe?.project?.category?.name : recipe?.project?.category || "N/A"}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Application Subcategory */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Application Subcategory</label>
        <Input
          value={typeof recipe?.project?.subCategory === 'object' ? recipe?.project?.subCategory?.name : recipe?.project?.subCategory || "N/A"}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Application Sub-subcategory */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Application Sub-subcategory</label>
        <Input
          value={typeof recipe?.project?.subSubCategory === 'object' ? recipe?.project?.subSubCategory?.name : recipe?.project?.subSubCategory || "N/A"}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Application Tags */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Application Tags</label>
        <Input
          value={recipe?.project?.tags?.map(tag => typeof tag === 'object' ? tag.name : tag).join(', ') || "N/A"}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Target Cost */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Target Cost</label>
        <Input
          value={pickFirst(recipe?.project?.targetCost, mergedProject?.targetCost, "N/A")}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Potentiality */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Potentiality</label>
        <Input
          value={recipe.potentiality || ""}
          readOnly={!isEditMode}
          rightIcon={<span className="text-[10px] text-nav-highlight font-bold pr-2">%</span>}
          className={inputContainerClass}
          inputClassName={inputClass}
          onChange={(e) => handleRecipeChange("potentiality", e.target.value)}
        />
      </div>

      {/* Benchmark */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Benchmark</label>
        <Input
          value={pickFirst(recipe?.project?.benchmark, mergedProject?.benchmark, "N/A")}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

      {/* Link */}
      <div className={inputWrapperClass}>
        <label className={labelClass}>Link</label>
        <Input
          value={pickFirst(recipe?.project?.link, mergedProject?.link, "N/A")}
          readOnly={true}
          className={inputContainerClass}
          inputClassName={inputClass}
        />
      </div>

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
