import React, { useState, useMemo, useEffect } from "react";
import { EditableField } from "@/components/editable-field";
import { EditableFieldGroup } from "@/components/editable-field-group";
import { getAppDevStatusOptions } from "../../constants/projectOptions";
import { useActiveCategories, useSubCategoriesByCategory, useSubSubCategoriesBySubCategory, useTagsBySubCategory, useActiveRecipes, useActivePackagingTypes } from "@/hooks/useAsyncSelectData";

const getNestedValue = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";
};

const getBffProductDisplayValue = (item) => {
  if (!item || typeof item !== "object") return String(item || "");

  const name = item.name || item.label || item.title;
  const code = item.displayProductCode || item.commercializedProductCode || item.productCode || item.code;

  if (name && code) return `${name} (${code})`;
  if (name) return name;
  if (code) return code;

  return item._id || item.id || String(item);
};

export const DetailsFieldGroups = ({
  fieldGroups,
  projectResponseData,
  updatingFields,
  selectedFieldsForHistory,
  setSelectedFieldsForHistory,
  handleSave,
  getUserDisplayName,
  canReadField,
  canUpdateField,
  permissionWarnings,
  categoryId,
  subCategoryId,
  subSubCategoryId,
  onCategoryChange,
  onSubCategoryChange,
  onSubSubCategoryChange,
  handleClearChildFields,
  registerField, // NEW: Add registerField prop
}) => {
  const [localValues, setLocalValues] = useState({
    category: null,
    subcategory: null,
    subsubcategory: null,
    tags: [],
  });

  const [searchTerms, setSearchTerms] = useState({
    recipe: "",
    category: "",
    subcategory: "",
    subsubcategory: "",
    tags: "",
    packagingType: "",
  });

  const [currentlyEditingField, setCurrentlyEditingField] = useState(null);

  
  const { options: recipeOptions, isLoading: recipesLoading } = useActiveRecipes(searchTerms.recipe);
  const { options: categoryOptions, isLoading: categoriesLoading } = useActiveCategories(searchTerms.category);
  const { options: subCategoryOptions, isLoading: subCategoriesLoading } = useSubCategoriesByCategory(categoryId || localValues.category, searchTerms.subcategory);
  const { options: subSubCategoryOptions, isLoading: subSubCategoriesLoading } = useSubSubCategoriesBySubCategory(subCategoryId || localValues.subcategory, searchTerms.subsubcategory);
  const { options: tagOptions, isLoading: tagsLoading } = useTagsBySubCategory(localValues.subcategory, searchTerms.tags);
  const { options: packagingTypeOptions, isLoading: packagingTypesLoading } = useActivePackagingTypes(searchTerms.packagingType);

  useEffect(() => {
    if (projectResponseData?.applicationLab) {
      const appLab = projectResponseData.applicationLab;
      setLocalValues(prev => ({
        ...prev,
        category: appLab.category?._id || appLab.category || null,
        subcategory: appLab.subcategory?._id || appLab.subcategory || null,
        subsubcategory: appLab.subSubcategory?._id || appLab.subSubcategory || null,
        tags: Array.isArray(appLab.tags) ? appLab.tags.map(t => t._id || t.id || t) : [],
      }));
    }
  }, [projectResponseData]);

  const getRecipeById = (recipeId) => {
    if (!recipeId) {
      console.log('getRecipeById: no recipeId provided');
      return null;
    }
    console.log('getRecipeById: looking for', recipeId, 'in recipeOptions:', recipeOptions?.length, 'items');
    const found = recipeOptions.find(r => r.value === recipeId);
    if (found) {
      console.log('getRecipeById: found in recipeOptions:', found.recipeData);
      return found.recipeData || found;
    }
    const currentRecipeRef = projectResponseData?.applicationLab?.recipeRef;
    const currentRecipeName = projectResponseData?.applicationLab?.recipeName;
    const currentRecipeCode = projectResponseData?.applicationLab?.recipeCode;
    console.log('getRecipeById: checking current project data:', { currentRecipeRef, currentRecipeName, currentRecipeCode });
    if (currentRecipeRef === recipeId || currentRecipeName || currentRecipeCode) {
      const fallback = { _id: currentRecipeRef, name: currentRecipeName, recipeCode: currentRecipeCode };
      console.log('getRecipeById: using fallback from project data:', fallback);
      return fallback;
    }
    console.log('getRecipeById: not found');
    return null;
  };

  const toggleFieldSelection = (fieldPath) => {
    setSelectedFieldsForHistory(prev => {
      const currentArray = Array.isArray(prev) ? prev : [];
      const newArray = currentArray.includes(fieldPath)
        ? currentArray.filter(path => path !== fieldPath)
        : [...currentArray, fieldPath];
      return newArray;
    });
  };

  const isSelected = (fieldPath) => {
    return Array.isArray(selectedFieldsForHistory) && selectedFieldsForHistory.includes(fieldPath);
  };

  const getAsyncOptions = (config) => {
    switch (config.asyncType) {
      case "recipe":
        return recipeOptions;
      case "category":
        return categoryOptions;
      case "subcategory":
        return subCategoryOptions;
      case "subsubcategory":
        return subSubCategoryOptions;
      case "tags":
        return tagOptions;
      case "packagingType":
        return packagingTypeOptions;
      case "dynamicAppDevStatus":
        return getAppDevStatusOptions(projectResponseData);
      default:
        return config.options || [];
    }
  };

  const isAsyncLoading = (config) => {
    switch (config.asyncType) {
      case "recipe":
        return recipesLoading;
      case "category":
        return categoriesLoading;
      case "subcategory":
        return subCategoriesLoading;
      case "subsubcategory":
        return subSubCategoriesLoading;
      case "tags":
        return tagsLoading;
      case "packagingType":
        return packagingTypesLoading;
      default:
        return false;
    }
  };

  const handleCategoryChangeLocal = (value) => {
    setLocalValues(prev => ({
      ...prev,
      category: value,
      subcategory: null,
      subsubcategory: null,
      tags: [],
    }));
    if (onCategoryChange) onCategoryChange(value);
  };

  const handleSubCategoryChangeLocal = (value) => {
    setLocalValues(prev => ({
      ...prev,
      subcategory: value,
      subsubcategory: null,
      tags: [],
    }));
    if (onSubCategoryChange) onSubCategoryChange(value);
  };

  const handleSubSubCategoryChangeLocal = (value) => {
    setLocalValues(prev => ({
      ...prev,
      subsubcategory: value,
      tags: [],
    }));
    if (onSubSubCategoryChange) onSubSubCategoryChange(value);
  };

  const handleAsyncSelectChange = (config, value) => {
    if (config.asyncType === "category") {
      handleCategoryChangeLocal(value);
      handleClearChildFields("subcategory", "subSubcategory", "tags");
    } else if (config.asyncType === "subcategory") {
      handleSubCategoryChangeLocal(value);
      handleClearChildFields("subSubcategory", "tags");
    } else if (config.asyncType === "subsubcategory") {
      handleSubSubCategoryChangeLocal(value);
      handleClearChildFields("tags");
    }
    handleSave(config.path)(value);
  };

  const handleSearchChange = (config, searchTerm) => {
    setSearchTerms(prev => ({
      ...prev,
      [config.asyncType || "default"]: searchTerm,
    }));
  };

  const renderField = (config) => {
    if (!config || !config.path) {
      return null;
    }

    let canRead = true;
    try {
      canRead = canReadField ? canReadField(config.path) : true;
    } catch (error) {
      canRead = true;
    }

    let value = getNestedValue(projectResponseData, config.path);

    if (!canRead) {
      value = null;
    } else if (config.type === "userselect") {
      value = getUserDisplayName(value);
    } else if (config.path === "common.productsUsed") {
      if (Array.isArray(value)) {
        value = value
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              return getBffProductDisplayValue(item);
            }
            return String(item);
          })
          .join(", ");
      } else if (value) {
        value = String(value);
      }
    } else if (config.path === "applicationLab.tags") {
      if (Array.isArray(value)) {
        const tagIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        const tagObjects = value.filter((item) => typeof item === "object" && item !== null);
        // Prefer full tag objects for display so labels render without
        // depending on the currently search-scoped async options list.
        value = tagObjects.length > 0 ? tagObjects : tagIds;
      } else if (value) {
        value = String(value);
      }
    } else if (config.path === "applicationLab.category") {
      // Use local value if set, otherwise use server value
      value = localValues.category !== null && localValues.category !== undefined 
        ? localValues.category 
        : (value && typeof value === "object" ? value._id || value.id || value : value);
    } else if (config.path === "applicationLab.subcategory") {
      // Use local value if set, otherwise use server value
      value = localValues.subcategory !== null && localValues.subcategory !== undefined 
        ? localValues.subcategory 
        : (value && typeof value === "object" ? value._id || value.id || value : value);
    } else if (config.path === "applicationLab.subSubcategory") {
      // Use local value if set, otherwise use server value
      value = localValues.subsubcategory !== null && localValues.subsubcategory !== undefined 
        ? localValues.subsubcategory 
        : (value && typeof value === "object" ? value._id || value.id || value : value);
    }

    let canEdit = false;
    if (canRead) {
      try {
        canEdit = config.canEdit && (canUpdateField ? canUpdateField(config.path) : false);
      } catch (error) {
        canEdit = false;
      }
    }

    const options = getAsyncOptions(config);
    const isLoading = isAsyncLoading(config);

    const handleFieldSave = (val) => {
      if (config.type === "number") {
        const numValue = val === "" ? null : Number(val);
        handleSave(config.path)(numValue);
      } else if (config.asyncType === "recipe") {
        const recipe = getRecipeById(val);
        if (recipe) {
          console.log('Recipe selected from dropdown:', recipe);
          handleSave("applicationLab.recipeName")(recipe.name || recipe.recipeName);
          handleSave("applicationLab.recipeCode")(recipe.recipeCode);
          handleSave("applicationLab.recipeRef")(recipe._id || recipe.id);
        } else {
          console.log('No recipe found for value:', val);
          handleSave(config.path)(val);
        }
      } else if (config.asyncType) {
        handleAsyncSelectChange(config, val);
      } else {
        handleSave(config.path)(val);
      }
    };

    return (
      <EditableField
        key={config.id}
        id={config.id}
        label={config.label}
        value={!canRead ? undefined : value}
        canEdit={canEdit}
        type={config.type}
        options={options}
        rows={config.rows}
        onSave={handleFieldSave}
        onFieldClick={() => canRead && toggleFieldSelection(config.path)}
        isLoading={updatingFields.has(config.path) || isLoading}
        placeholder={config.placeholder}
        isSelected={isSelected(config.path)}
        isNotAvailable={!canRead}
        warningText={
          permissionWarnings.length > 0
            ? permissionWarnings.join("\n")
            : undefined
        }
        onSearchChange={config.asyncType ? (searchTerm) => handleSearchChange(config, searchTerm) : undefined}
        containerClassName={config.path === "applicationLab.tags" ? "truncate" : undefined}
        ref={(el) => registerField && registerField(config.id, el)}
        isEditing={currentlyEditingField === config.id}
        onEditChange={(editing) => setCurrentlyEditingField(editing ? config.id : null)}
      />
    );
  };

  const renderGroup = (group, index) => {
    const fullWidthField = group.find(f => f.fullWidth);
    const regularFields = group.filter(f => !f.fullWidth);

    return (
      <div key={group[0]?.id || index} className="px-4 py-2 md:py-1.5">
        {fullWidthField && <div className="">{renderField(fullWidthField)}</div>}
        {regularFields.length > 0 && (
          <EditableFieldGroup>
            {regularFields.map(renderField)}
          </EditableFieldGroup>
        )}
      </div>
    );
  };

  return (
    <div className="flex-grow overflow-y-auto custom-scrollbar max-h-[90dvh] 3xl:max-h-[90dvh] ms-0 lg:ms-5 bg-background rounded-2xl md:px-6 md:pb-12">
      {fieldGroups.map(renderGroup)}
    </div>
  );
};