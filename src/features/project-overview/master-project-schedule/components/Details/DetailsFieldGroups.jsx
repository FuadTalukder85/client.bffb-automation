import React, { useState, useEffect } from "react";
import { EditableField } from "@/components/editable-field";
import { EditableFieldGroup } from "@/components/editable-field-group";
import { useActiveCategories, useSubCategoriesByCategory, useSubSubCategoriesBySubCategory, useTagsBySubCategory } from "@/hooks/useAsyncSelectData";

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
    tags: [],
  });

  const [searchTerms, setSearchTerms] = useState({
    category: "",
    subcategory: "",
    subsubcategory: "",
    tags: "",
  });

  const [currentlyEditingField, setCurrentlyEditingField] = useState(null);


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
      setLocalValues(prev => ({
        ...prev,
        category: appLab.category?._id || appLab.category || null,
        subcategory: appLab.subcategory?._id || appLab.subcategory || null,
        subsubcategory: appLab.subSubcategory?._id || appLab.subSubcategory || null,
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
        subsubcategory: null,
        tags: [],
      }));
      handleSave("applicationLab.category")(value);
      handleSave("applicationLab.subcategory")(null);
      handleSave("applicationLab.subSubcategory")(null);
      handleSave("applicationLab.tags")([]);
    } else if (config.asyncType === "subcategory") {
      setLocalValues(prev => ({
        ...prev,
        subcategory: value,
        subsubcategory: null,
        tags: [],
      }));
      handleSave("applicationLab.subcategory")(value);
      handleSave("applicationLab.subSubcategory")(null);
      handleSave("applicationLab.tags")([]);
    } else if (config.asyncType === "subsubcategory") {
      setLocalValues(prev => ({
        ...prev,
        subsubcategory: value,
      }));
      handleSave("applicationLab.subSubcategory")(value);
    } else if (config.asyncType === "tags") {
      setLocalValues(prev => ({
        ...prev,
        tags: Array.isArray(value) ? value : [value],
      }));
      handleSave(config.path)(value);
    }
  };

  const handleSearchChange = (asyncType, searchTerm) => {
    setSearchTerms(prev => ({
      ...prev,
      [asyncType]: searchTerm,
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
              return item.name || item.code || item._id || String(item);
            }
            return String(item);
          })
          .join(", ");
      } else if (value) {
        value = String(value);
      }
    } else if (config.path === "applicationLab.category") {
      value = localValues.category !== null && localValues.category !== undefined
        ? localValues.category
        : (value && typeof value === "object" ? value._id || value.id || value : value);
    } else if (config.path === "applicationLab.subcategory") {
      value = localValues.subcategory !== null && localValues.subcategory !== undefined
        ? localValues.subcategory
        : (value && typeof value === "object" ? value._id || value.id || value : value);
    } else if (config.path === "applicationLab.subSubcategory") {
      value = localValues.subsubcategory !== null && localValues.subsubcategory !== undefined
        ? localValues.subsubcategory
        : (value && typeof value === "object" ? value._id || value.id || value : value);
    } else if (config.path === "applicationLab.tags") {
      if (Array.isArray(value)) {
        const tagIds = value.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item._id || item.id || item;
          }
          return item;
        });
        value = localValues.tags.length > 0 ? localValues.tags : tagIds;
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
        options={options}
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
        onSearchChange={config.asyncType ? (searchTerm) => handleSearchChange(config.asyncType, searchTerm) : undefined}
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