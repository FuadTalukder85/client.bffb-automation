import React, { useState, useEffect, useMemo } from "react";
import { EditableField } from "@/components/editable-field";
import { EditableFieldGroup } from "@/components/editable-field-group";
import { Button } from "@/components/ui/Button";
import { Save, X, Loader2, SquarePen } from "lucide-react";
import { useActiveCategories, useSubCategoriesByCategory, useSubSubCategoriesBySubCategory, useTagsBySubCategory } from "@/hooks/useAsyncSelectData";

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
  registerField,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftValues, setDraftValues] = useState({});
  const [isSavingAll, setIsSavingAll] = useState(false);

  const [localValues, setLocalValues] = useState({
    category: null,
    subcategory: null,
    subsubcategory: null,
    tags: [],
  });

  const [searchTerms, setSearchTerms] = useState({
    category: "",
    subcategory: "",
    subsubcategory: "",
    tags: "",
  });

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
  }, [projectResponseData]);

  const toggleFieldSelection = (fieldPath) => {
    setSelectedFieldsForHistory(prev => {
      const currentArray = Array.isArray(prev) ? prev : [];
      return currentArray.includes(fieldPath)
        ? currentArray.filter(path => path !== fieldPath)
        : [...currentArray, fieldPath];
    });
  };

  const isSelected = (fieldPath) => {
    return Array.isArray(selectedFieldsForHistory) && selectedFieldsForHistory.includes(fieldPath);
  };

  const getAsyncOptions = (asyncType) => {
    switch (asyncType) {
      case "category":
        return categoryOptions;
      case "subcategory":
        return subCategoryOptions;
      case "subsubcategory":
        return subSubCategoryOptions;
      case "tags":
        return tagOptions;
      default:
        return [];
    }
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
      default:
        return false;
    }
  };

  const handleAsyncSelectChange = (config, value) => {
    if (config.asyncType === "category") {
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
    } else if (config.asyncType === "subcategory") {
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
    } else if (config.asyncType === "subsubcategory") {
      const sscVal = Array.isArray(value) ? value : [value];
      setLocalValues(prev => ({
        ...prev,
        subsubcategory: sscVal,
      }));
      setDraftValues(prev => ({
        ...prev,
        "applicationLab.subSubcategory": sscVal,
      }));
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
    } else {
      setDraftValues(prev => ({
        ...prev,
        [config.path]: value,
      }));
    }
  };

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

  const handleSearchChange = (asyncType, searchTerm) => {
    setSearchTerms(prev => ({
      ...prev,
      [asyncType]: searchTerm,
    }));
  };

  const handleEnterEditMode = () => {
    setDraftValues({});
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setDraftValues({});
    if (projectResponseData?.applicationLab) {
      const appLab = projectResponseData.applicationLab;
      setLocalValues({
        category: appLab.category?._id || appLab.category || null,
        subcategory: appLab.subcategory?._id || appLab.subcategory || null,
        subsubcategory: Array.isArray(appLab.subSubcategory)
          ? appLab.subSubcategory.map(t => t._id || t.id || t)
          : (appLab.subSubcategory ? [appLab.subSubcategory._id || appLab.subSubcategory] : []),
        tags: Array.isArray(appLab.tags) ? appLab.tags.map(t => t._id || t.id || t) : [],
      });
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
    } else if (config.path === "sensoryLab.tags") {
      if (Array.isArray(value)) {
        value = value
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              return item.name || item.title || item._id || String(item);
            }
            return String(item);
          })
          .join(", ");
      } else if (value) {
        value = String(value);
      }
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
        value = value.map((item) => (typeof item === "object" && item !== null ? item._id || item.id || item : item));
      } else if (typeof value === "object" && value !== null) {
        value = [value._id || value.id || value];
      }
    } else if (config.path === "applicationLab.tags") {
      if (draftValues[config.path] !== undefined) {
        value = draftValues[config.path];
      } else if (Array.isArray(value)) {
        value = value.map((item) => (typeof item === "object" && item !== null ? item._id || item.id || item : item));
      } else if (typeof value === "object" && value !== null) {
        value = [value._id || value.id || value];
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
    const isLoading = updatingFields.has(config.path) || (config.asyncType ? isAsyncLoading(config.asyncType) : false);

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
        onSearchChange={config.asyncType ? (searchTerm) => handleSearchChange(config.asyncType, searchTerm) : undefined}
        ref={(el) => registerField && registerField(config.id, el)}
        isEditing={Boolean(isEditMode && canEdit)}
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