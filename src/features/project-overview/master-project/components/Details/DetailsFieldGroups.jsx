import React, { useState, useEffect, useCallback, useMemo } from "react";
import { EditableField } from "@/components/editable-field";
import { EditableFieldGroup } from "@/components/editable-field-group";
import { Button } from "@/components/ui/Button";
import { Save, X, Loader2, SquarePen } from "lucide-react";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftValues, setDraftValues] = useState({});
  const [isSavingAll, setIsSavingAll] = useState(false);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setDraftValues(prev => ({
      ...prev,
      "applicationLab.category": value,
      "applicationLab.subcategory": null,
      "applicationLab.subSubcategory": [],
      "applicationLab.tags": [],
    }));
  }, []);

  const handleSubCategoryChange = useCallback((value) => {
    setLocalValues(prev => ({
      ...prev,
      subcategory: value,
      subsubcategory: [],
      tags: [],
    }));
    setDraftValues(prev => ({
      ...prev,
      "applicationLab.subcategory": value,
      "applicationLab.subSubcategory": [],
      "applicationLab.tags": [],
    }));
  }, []);

  const handleSubSubCategoryChange = useCallback((value) => {
    const sscVal = Array.isArray(value) ? value : [value];
    setLocalValues(prev => ({
      ...prev,
      subsubcategory: sscVal,
    }));
    setDraftValues(prev => ({
      ...prev,
      "applicationLab.subSubcategory": sscVal,
    }));
  }, []);

  const handleAsyncSelectChange = useCallback((config, value) => {
    if (config.asyncType === "category") {
      handleCategoryChange(value);
    } else if (config.asyncType === "subcategory") {
      handleSubCategoryChange(value);
    } else if (config.asyncType === "subsubcategory") {
      handleSubSubCategoryChange(value);
    } else if (config.asyncType === "tags") {
      const tagVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        tags: tagVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: tagVal,
      }));
    } else if (config.asyncType === "bffFlavor") {
      const fVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        bffFlavors: fVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: fVal,
      }));
    } else if (config.asyncType === "bffColor") {
      const cVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        bffColors: cVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: cVal,
      }));
    } else if (config.asyncType === "bffIngredient") {
      const iVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        bffIngredients: iVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: iVal,
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.productsUsed") {
      const pVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        bffProductsUsed: pVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: pVal,
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.flavorProfile") {
      const fVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        bffFlavors: fVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: fVal,
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.coatingUpperLayer") {
      const cVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        coatingUpperLayer: cVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: cVal,
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.filling") {
      const fVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        filling: fVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: fVal,
      }));
    } else if (config.asyncType === "bffAllProductCodes" && config.path === "common.ingredients") {
      const iVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        bffIngredients: iVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        [config.path]: iVal,
      }));
    } else {
      setDraftValues(prev => ({
        ...prev,
        [config.path]: value,
      }));
    }
  }, [handleCategoryChange, handleSubCategoryChange, handleSubSubCategoryChange]);

  const handleFieldDraftChange = (config, val) => {
    if (config.type === "number") {
      const numValue = val === "" ? null : Number(val);
      setDraftValues(prev => ({ ...prev, [config.path]: numValue }));
    } else if (config.asyncType) {
      handleAsyncSelectChange(config, val);
    } else {
      setDraftValues(prev => ({ ...prev, [config.path]: val }));
    }
  };

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
      setDraftValues(d => ({ ...d, [config.path]: next }));
      return {
        ...prev,
        [localKey]: next,
      };
    });
  }, [createBFFProductCode, getLocalStateKeyFromAsyncType, getSegmentFromAsyncType]);

  const handleEnterEditMode = () => {
    setDraftValues({});
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setDraftValues({});
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
    setIsEditMode(false);
  };

  const handleSaveAll = async () => {
    if (Object.keys(draftValues).length === 0) {
      setIsEditMode(false);
      return;
    }
    setIsSavingAll(true);
    try {
      if (handleSave) {
        await handleSave(draftValues)();
      }
      setDraftValues({});
      setIsEditMode(false);
    } catch (err) {
      console.error("Failed to save changes:", err);
    } finally {
      setIsSavingAll(false);
    }
  };

  const hasEditableFields = useMemo(() => {
    return fieldGroups.flat().some(f => {
      let canRead = true;
      try {
        canRead = canReadField ? canReadField(f.path) : true;
      } catch {
        canRead = true;
      }
      if (!canRead) return false;
      return f.canEdit && (canUpdateField ? canUpdateField(f.path) : false);
    });
  }, [fieldGroups, canReadField, canUpdateField]);

  const renderField = (config) => {
    if (!config || !config.path) {
      return null;
    }

    let canRead = true;
    try {
      canRead = canReadField ? canReadField(config.path) : true;
    } catch {
      canRead = true;
    }

    let value = draftValues[config.path] !== undefined 
      ? draftValues[config.path] 
      : getNestedValue(projectResponseData, config.path);

    if (!canRead) {
      value = null;
    } else if (config.type === "userselect") {
      value = getUserDisplayName(value);
    } else if (config.path === "applicationLab.category") {
      value = draftValues[config.path] !== undefined 
        ? draftValues[config.path] 
        : (localValues.category !== null && localValues.category !== undefined 
            ? localValues.category 
            : (value && typeof value === "object" ? value._id || value.id || value : value));
    } else if (config.path === "applicationLab.subcategory") {
      value = draftValues[config.path] !== undefined 
        ? draftValues[config.path] 
        : (localValues.subcategory !== null && localValues.subcategory !== undefined 
            ? localValues.subcategory 
            : (value && typeof value === "object" ? value._id || value.id || value : value));
    } else if (config.path === "applicationLab.subSubcategory") {
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
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
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
        const tagIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        const tagObjects = value.filter((item) => typeof item === "object" && item !== null);
        value = tagObjects.length > 0 ? tagObjects : tagIds;
      }
    } else if (config.path === "common.productsUsed") {
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
        const productIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.bffProductsUsed) ? localValues.bffProductsUsed : productIds;
      } else if (typeof value === "string") {
        const productValues = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        value = Array.isArray(localValues.bffProductsUsed) ? localValues.bffProductsUsed : productValues;
      } else {
        value = Array.isArray(localValues.bffProductsUsed) ? localValues.bffProductsUsed : [];
      }
    } else if (config.path === "common.flavorProfile") {
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
        const flavorIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.bffFlavors) ? localValues.bffFlavors : flavorIds;
      } else if (typeof value === "string") {
        const flavorValues = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        value = Array.isArray(localValues.bffFlavors) ? localValues.bffFlavors : flavorValues;
      } else {
        value = Array.isArray(localValues.bffFlavors) ? localValues.bffFlavors : [];
      }
    } else if (config.path === "common.coatingUpperLayer") {
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
        const coatingIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = Array.isArray(localValues.coatingUpperLayer) ? localValues.coatingUpperLayer : coatingIds;
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
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
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

    if (config.type === "select" && config.options && config.options.some(opt => typeof opt.value === "boolean")) {
      if (value === "true") value = true;
      else if (value === "false") value = false;
      if (value === null || value === undefined || value === "") {
        value = false;
      }
    }

    let canEdit = false;
    if (canRead) {
      try {
        canEdit = config.canEdit && (canUpdateField ? canUpdateField(config.path) : false);
      } catch {
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
        onChange={(val) => handleFieldDraftChange(config, val)}
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
        isEditing={Boolean(isEditMode && canEdit)}
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
      {/* Top Action Bar with Single Edit / Save / Cancel Button */}
      {hasEditableFields && (
        <div className="flex items-center justify-end px-4 py-2 sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border/40 mb-2">
          {!isEditMode ? (
            <div className="desktop-page-btn-wrapper flex items-center gap-0 rounded-full overflow-hidden shadow-sm border border-border">
              <Button
                type="button"
                onClick={handleEnterEditMode}
                title="Edit"
                className="flex items-center gap-2 px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm cursor-pointer"
              >
                <SquarePen className="desktop-page-btn m-0!" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="desktop-page-btn-wrapper flex items-center gap-0 rounded-full overflow-hidden shadow-sm border border-border">
              <Button
                type="button"
                onClick={handleSaveAll}
                disabled={isSavingAll}
                title="Save"
                className="flex items-center gap-2 px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors disabled:opacity-50 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm cursor-pointer"
              >
                {isSavingAll ? (
                  <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                ) : (
                  <Save className="desktop-page-btn m-0!" />
                )}
                {isSavingAll ? "Saving..." : "Save"}
              </Button>

              <div className="w-px h-4 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-border" />

              <Button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSavingAll}
                title="Cancel"
                className="flex items-center gap-2 px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm cursor-pointer"
              >
                <X className="desktop-page-btn m-0!" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
      {fieldGroups.map(renderGroup)}
    </div>
  );
};