import React, { useState, useEffect, useCallback } from "react";
import { EditableField } from "@/components/editable-field";
import { EditableFieldGroup } from "@/components/editable-field-group";
import { useActiveCategories, useSubCategoriesByCategory, useSubSubCategoriesBySubCategory, useTagsBySubCategory, useBFFFlavors, useBFFColors, useBFFIngredients, useAllBFFProductCodes } from "@/hooks/useAsyncSelectData";
import { useCreateBFFProductCode } from "@/hooks/mutations/useBFFProductCodeMutations";
import { getDynamicMasterProjectStatusOptions } from "../../constants/projectOptions";

const getNestedValue = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";
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
  registerField,
}) => {
  const [localValues, setLocalValues] = useState({
    category: null,
    subcategory: null,
    subsubcategory: null,
    tags: null,
    bffProductsUsed: null,
    coatingUpperLayer: null,
    filling: null,
    bffFlavors: null,
    bffColors: null,
    bffIngredients: null,
  });

  const [searchTerms, setSearchTerms] = useState({
    category: "",
    subcategory: "",
    subsubcategory: "",
    tags: "",
    bffFlavor: "",
    bffColor: "",
    bffIngredient: "",
    bffAllProductCodes: "",
  });

  const [currentlyEditingField, setCurrentlyEditingField] = useState(null);
  const [createdOptions, setCreatedOptions] = useState({
    bffFlavor: [],
    bffColor: [],
    bffIngredient: [],
  });

  const { mutateAsync: createBFFProductCode, isPending: isCreatingBFFProductCode } = useCreateBFFProductCode();

  const { options: categoryOptions, isLoading: categoriesLoading } = useActiveCategories(searchTerms.category);
  const { options: subCategoryOptions, isLoading: subCategoriesLoading } = useSubCategoriesByCategory(
    localValues.category,
    searchTerms.subcategory
  );
  const { options: subSubCategoryOptions, isLoading: subSubCategoriesLoading } = useSubSubCategoriesBySubCategory(
    localValues.subcategory,
    searchTerms.subsubcategory
  );
  const { options: tagOptions, isLoading: tagsLoading } = useTagsBySubCategory(
    localValues.subcategory,
    searchTerms.tags
  );
  const { options: bffFlavorOptions, isLoading: bffFlavorsLoading } = useBFFFlavors(searchTerms.bffFlavor);
  const { options: bffColorOptions, isLoading: bffColorsLoading } = useBFFColors(searchTerms.bffColor);
  const { options: bffIngredientOptions, isLoading: bffIngredientsLoading } = useBFFIngredients(searchTerms.bffIngredient);
  const { options: bffAllProductCodeOptions, isLoading: bffAllProductCodesLoading } = useAllBFFProductCodes(searchTerms.bffAllProductCodes);

  useEffect(() => {
    if (projectResponseData?.applicationLab) {
      const appLab = projectResponseData.applicationLab;
      setLocalValues(prev => ({
        ...prev,
        category: appLab.category?._id || appLab.category || null,
        subcategory: appLab.subcategory?._id || appLab.subcategory || null,
        subsubcategory: Array.isArray(appLab.subSubcategory)
          ? appLab.subSubcategory.map(t => t._id || t.id || t)
          : (appLab.subSubcategory ? [appLab.subSubcategory._id || appLab.subSubcategory] : []),
        tags: Array.isArray(appLab.tags) ? appLab.tags.map(t => t._id || t.id || t) : [],
      }));
    }
    if (projectResponseData?.common) {
      const common = projectResponseData.common;
      const parsedCoatingValues =
        Array.isArray(common.coatingUpperLayer)
          ? common.coatingUpperLayer.map((item) =>
            typeof item === "object" && item !== null
              ? item._id || item.id || item
              : item
          )
          : common.coatingUpperLayer
            ? String(common.coatingUpperLayer)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
            : [];

      const parsedFillingValues =
        Array.isArray(common.filling)
          ? common.filling.map((item) =>
            typeof item === "object" && item !== null
              ? item._id || item.id || item
              : item
          )
          : common.filling
            ? String(common.filling)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
            : [];

      setLocalValues((prev) => ({
        ...prev,
        coatingUpperLayer: parsedCoatingValues,
        filling: parsedFillingValues,
      }));
    }
  }, [projectResponseData]);

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

  const getAsyncOptions = (asyncType) => {
    console.log("🔍 DetailsFieldGroups - getAsyncOptions called:", {
      asyncType,
      timestamp: new Date().toISOString()
    });

    let result;
    switch (asyncType) {
      case "category":
        result = categoryOptions;
        break;
      case "subcategory":
        result = subCategoryOptions;
        break;
      case "subsubcategory":
        result = subSubCategoryOptions;
        break;
      case "tags":
        result = tagOptions;
        break;
      case "bffFlavor":
        result = bffFlavorOptions;
        break;
      case "bffColor":
        result = bffColorOptions;
        break;
      case "bffIngredient":
        result = bffIngredientOptions;
        break;
      case "bffAllProductCodes":
        result = bffAllProductCodeOptions;
        break;
      case "dynamicMasterProjectStatus":
        result = getDynamicMasterProjectStatusOptions(projectResponseData);
        break;
      default:
        result = [];
    }

    console.log("🔍 DetailsFieldGroups - getAsyncOptions result:", {
      asyncType,
      optionsCount: result.length,
      firstFew: result.slice(0, 3),
      timestamp: new Date().toISOString()
    });

    const inlineCreated = createdOptions[asyncType] || [];
    if (inlineCreated.length === 0) {
      return result;
    }
    return [...inlineCreated, ...result.filter((opt) => !inlineCreated.some((created) => created.value === opt.value))];
  };

  const isAsyncLoading = (asyncType) => {
    switch (asyncType) {
      case "category":
        return categoriesLoading;
      case "subcategory":
        return subCategoriesLoading;
      case "subsubcategory":
        return subSubCategoriesLoading;
      case "tags":
        return tagsLoading;
      case "bffFlavor":
        return bffFlavorsLoading;
      case "bffColor":
        return bffColorsLoading;
      case "bffIngredient":
        return bffIngredientsLoading;
      case "bffAllProductCodes":
        return bffAllProductCodesLoading;
      default:
        return false;
    }
  };

  const handleCategoryChange = useCallback((value) => {
    setLocalValues(prev => ({
      ...prev,
      category: value,
      subcategory: null,
      subsubcategory: [],
      tags: [],
    }));
    handleSave("applicationLab.category")(value);
    handleSave("applicationLab.subcategory")(null);
    handleSave("applicationLab.subSubcategory")([]);
    handleSave("applicationLab.tags")([]);
  }, [handleSave]);

  const handleSubCategoryChange = useCallback((value) => {
    setLocalValues(prev => ({
      ...prev,
      subcategory: value,
      subsubcategory: [],
      tags: [],
    }));
    handleSave("applicationLab.subcategory")(value);
    handleSave("applicationLab.subSubcategory")([]);
    handleSave("applicationLab.tags")([]);
  }, [handleSave]);

  const handleSubSubCategoryChange = useCallback((value) => {
    setLocalValues(prev => ({
      ...prev,
      subsubcategory: Array.isArray(value) ? value : [value],
    }));
    handleSave("applicationLab.subSubcategory")(value);
  }, [handleSave]);

  const handleAsyncSelectChange = useCallback((config, value) => {
    if (config.asyncType === "category") {
      handleCategoryChange(value);
    } else if (config.asyncType === "subcategory") {
      handleSubCategoryChange(value);
    } else if (config.asyncType === "subsubcategory") {
      handleSubSubCategoryChange(value);
    } else if (config.asyncType === "tags") {
      setLocalValues(prev => ({
        ...prev,
        tags: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffFlavor") {
      setLocalValues(prev => ({
        ...prev,
        bffFlavors: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffColor") {
      setLocalValues(prev => ({
        ...prev,
        bffColors: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffIngredient") {
      setLocalValues(prev => ({
        ...prev,
        bffIngredients: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.productsUsed") {
      setLocalValues(prev => ({
        ...prev,
        bffProductsUsed: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.flavorProfile") {
      setLocalValues(prev => ({
        ...prev,
        bffFlavors: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.coatingUpperLayer") {
      setLocalValues(prev => ({
        ...prev,
        coatingUpperLayer: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.filling") {
      setLocalValues(prev => ({
        ...prev,
        filling: Array.isArray(value) ? value : [value],
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.ingredients") {
      setLocalValues(prev => ({
        ...prev,
        bffIngredients: Array.isArray(value) ? value : [value],
      }));
    }
    handleSave(config.path)(value);
  }, [handleCategoryChange, handleSubCategoryChange, handleSubSubCategoryChange, handleSave]);

  const handleSearchChange = useCallback((asyncType, searchTerm) => {
    setSearchTerms(prev => ({
      ...prev,
      [asyncType]: searchTerm,
    }));
  }, []);

  const getSegmentFromAsyncType = useCallback((asyncType) => {
    switch (asyncType) {
      case "bffFlavor":
        return "flavours";
      case "bffColor":
        return "colours";
      case "bffIngredient":
        return "ingredients";
      default:
        return null;
    }
  }, []);

  const getLocalStateKeyFromAsyncType = useCallback((asyncType) => {
    switch (asyncType) {
      case "bffFlavor":
        return "bffFlavors";
      case "bffColor":
        return "bffColors";
      case "bffIngredient":
        return "bffIngredients";
      default:
        return null;
    }
  }, []);

  const handleCreateBFFOption = useCallback(async (config, rawName) => {
    const name = String(rawName || "").trim();
    if (!name || !config?.asyncType || !config?.path) return;

    const segment = getSegmentFromAsyncType(config.asyncType);
    const localKey = getLocalStateKeyFromAsyncType(config.asyncType);
    if (!segment || !localKey) return;

    const codePrefix = segment === "flavours" ? "FLV" : segment === "colours" ? "CLR" : "ING";
    const uniqueSuffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

    const response = await createBFFProductCode({
      name,
      productCode: `AUTO-${codePrefix}-${uniqueSuffix}`,
      segment,
      type: "solid",
      cost: 0,
      isActive: true,
    });

    const created = response?.data || response;
    const createdId = created?._id || created?.id;
    if (!createdId) return;

    const createdOption = {
      value: createdId,
      label: created.name || name,
      searchText: String(created.name || name).toLowerCase(),
    };

    setCreatedOptions((prev) => ({
      ...prev,
      [config.asyncType]: [createdOption, ...(prev[config.asyncType] || []).filter((o) => o.value !== createdOption.value)],
    }));

    setLocalValues((prev) => {
      const current = Array.isArray(prev[localKey]) ? prev[localKey] : [];
      const next = current.includes(createdId) ? current : [...current, createdId];
      handleSave(config.path)(next);
      return {
        ...prev,
        [localKey]: next,
      };
    });
  }, [createBFFProductCode, getLocalStateKeyFromAsyncType, getSegmentFromAsyncType, handleSave]);

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
    } else if (config.path === "applicationLab.category") {
      value = localValues.category !== null && localValues.category !== undefined
        ? localValues.category
        : value;
      if (value && typeof value === "object") {
        value = value.name || value.label || value.title || value._id || value.id || "";
      }
    } else if (config.path === "applicationLab.subcategory") {
      value = localValues.subcategory !== null && localValues.subcategory !== undefined
        ? localValues.subcategory
        : value;
      if (value && typeof value === "object") {
        value = value.name || value.label || value.title || value._id || value.id || "";
      }
    } else if (config.path === "applicationLab.subSubcategory") {
      if (Array.isArray(value)) {
        const sscIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        const sscObjects = value.filter((item) => typeof item === "object" && item !== null);
        value = sscObjects.length > 0 ? sscObjects : sscIds;
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
      }
    } else if (config.path === "common.productsUsed") {
      if (Array.isArray(value)) {
        const productIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.bffProductsUsed) ? localValues.bffProductsUsed : productIds;
      }
    } else if (config.path === "common.flavorProfile") {
      if (Array.isArray(value)) {
        const flavorIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.bffFlavors) ? localValues.bffFlavors : flavorIds;
      }
    } else if (config.path === "common.color") {
      if (Array.isArray(value)) {
        const colorIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.bffColors) ? localValues.bffColors : colorIds;
      }
    } else if (config.path === "common.ingredients") {
      if (Array.isArray(value)) {
        const ingredientIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.bffIngredients) ? localValues.bffIngredients : ingredientIds;
      }
    } else if (config.path === "common.coatingUpperLayer") {
      if (Array.isArray(value)) {
        value = Array.isArray(localValues.coatingUpperLayer) ? localValues.coatingUpperLayer : value;
      } else if (typeof value === "string") {
        const coatingValues = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        value = Array.isArray(localValues.coatingUpperLayer) ? localValues.coatingUpperLayer : coatingValues;
      } else {
        value = Array.isArray(localValues.coatingUpperLayer) ? localValues.coatingUpperLayer : [];
      }
    } else if (config.path === "common.filling") {
      if (Array.isArray(value)) {
        const fillingIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.filling) ? localValues.filling : fillingIds;
      } else if (typeof value === "string") {
        const fillingValues = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        value = Array.isArray(localValues.filling) ? localValues.filling : fillingValues;
      } else {
        value = Array.isArray(localValues.filling) ? localValues.filling : [];
      }
    }

    // Normalize boolean values for select fields with boolean options
    if (config.type === "select" && config.options && config.options.some(opt => typeof opt.value === "boolean")) {
      if (value === "true") value = true;
      else if (value === "false") value = false;
      // If value is empty for boolean fields, default to false
      if (value === null || value === undefined || value === "") {
        value = false;
      }
    }

    let canEdit = false;
    if (canRead) {
      try {
        canEdit = config.canEdit && (canUpdateField ? canUpdateField(config.path) : false);
      } catch (error) {
        canEdit = false;
      }
    }

    const options = config.asyncType ? getAsyncOptions(config.asyncType) : config.options || [];
    const formatRate = (rate) => {
      if (rate === null || rate === undefined || rate === "") return "N/A";
      const numericRate = Number(rate);
      return Number.isFinite(numericRate) ? numericRate.toLocaleString() : String(rate);
    };

    const resolvedOptions =
      config.path === "common.productsUsed"
        ? options.map((option) => ({
          ...option,
          label: option.productCode
            ? `${option.name || option.label} (${option.productCode}, ${formatRate(option.cost)})`
            : `${option.name || option.label} (${formatRate(option.cost)})`,
        }))
        : options;
    const isLoading = updatingFields.has(config.path) || (config.asyncType ? isAsyncLoading(config.asyncType) : false);

    const handleFieldSave = (val) => {
      if (config.type === "number") {
        const numValue = val === "" ? null : Number(val);
        handleSave(config.path)(numValue);
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
        options={resolvedOptions}
        rows={config.rows}
        onSave={handleFieldSave}
        onFieldClick={() => canRead && toggleFieldSelection(config.path)}
        isLoading={isLoading}
        placeholder={config.placeholder}
        isSelected={isSelected(config.path)}
        isNotAvailable={!canRead}
        warningText={
          permissionWarnings.length > 0
            ? permissionWarnings.join("\n")
            : undefined
        }
        onSearchChange={config.asyncType ? (term) => handleSearchChange(config.asyncType, term) : undefined}
        ref={(el) => registerField && registerField(config.id, el)}
        isEditing={currentlyEditingField === config.id}
        onEditChange={(editing) => setCurrentlyEditingField(editing ? config.id : null)}
        allowCreateOption={config.type === "multiselectwithsearch" && ["bffFlavor", "bffColor", "bffIngredient"].includes(config.asyncType)}
        createOptionLabel="Create"
        onCreateOption={config.type === "multiselectwithsearch" && ["bffFlavor", "bffColor", "bffIngredient"].includes(config.asyncType)
          ? (name) => handleCreateBFFOption(config, name)
          : undefined}
        isCreatingOption={isCreatingBFFProductCode}
      />
    );
  };

  const renderGroup = (group, index) => {
    const fullWidthField = group.find(f => f.fullWidth);
    const regularFields = group.filter(f => !f.fullWidth);

    return (
      <div key={group[0]?.id || index} className="px-4 py-2 lg:py-[4.5px] xl:py-[5.5px] 2xl:py-[6.5px] 3xl:py-2 pt-2 lg:pt-[4.5px] xl:pt-[5.5px] 2xl:pt-[6.5px] 3xl:pt-2">
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
    <div className="grow overflow-y-auto custom-scrollbar max-h-[90dvh] 3xl:max-h-[90dvh] ms-0 lg:ms-2 xl:ms-3 2xl:ms-4 3xl:ms-5 bg-background pt-2 md:pt-0 rounded-2xl px-0 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 md:pb-12">
      {fieldGroups.map(renderGroup)}
    </div>
  );
};