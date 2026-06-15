"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { IoSaveOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import UserSelect from "@/components/ui/UserSelect/UserSelect";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { MultiSelect } from "@/components/ui/Select/MultiSelect";
import { MultiSelectWithSearch } from "@/components/ui/Select/MultiSelectWithSearch";
import { hasColorMetadata, getOptionColorStyle } from "@/utils/enrichOptionsWithColors";

const looksLikeObjectId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export const CustomSelect = ({ value, onChange, options, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue =
    selectedOption?.label || (looksLikeObjectId(value) ? "" : value) || placeholder || "Select...";
  const selectedHasColors = selectedOption && hasColorMetadata(selectedOption);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full border-0 text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body text-left flex items-center justify-between focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} px-3 py-2 lg:py-[2.5px] xl:py-[4px] 2xl:py-[4.5px] 3xl:py-1.5 ${selectedHasColors ? "rounded-lg font-medium" : "bg-transparent text-foreground"}`}
        style={selectedHasColors ? getOptionColorStyle(selectedOption) : {}}
      >
        <span className={!selectedOption && placeholder ? "text-gray-400" : ""}>
          {displayValue}
        </span>
        {!disabled &&
          (isOpen ? <ChevronUp className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" /> : <ChevronDown className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />)}
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-y-auto border rounded-lg shadow-lg bg-background border-nav-highlight/30 max-h-[180px] custom-scrollbar">
          {options.map((option, index) => {
            const optionHasColors = hasColorMetadata(option);
            const isSelected = option.value === value;
            const isLast = index === options.length - 1;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left transition-all duration-150 border-b last:border-b-0 ${
                  optionHasColors 
                    ? `font-medium ${isSelected ? 'font-semibold' : ''} hover:opacity-80` 
                    : `hover:bg-primary/5 ${isSelected ? "bg-primary/10 text-primary" : "text-foreground"}`
                }`}
                style={
                  optionHasColors
                    ? {
                        ...getOptionColorStyle(option),
                        borderBottomColor: isLast ? 'transparent' : `${option.textColor}40`,
                      }
                    : {}
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EditableField = React.forwardRef(
  (
    {
      id,
      label,
      value: initialValue,
      canEdit,
      type = "text",
      options = [],
      onSave,
      onFieldClick,
      onSearchChange,
      inputClassName,
      labelClassName,
      containerClassName,
      isLoading = false,
      placeholder,
      rows = 4,
      isSelected = false,
      isNotAvailable = false,
      warningText,
      isEditing: externalIsEditing,
      onEditChange,
      allowCreateOption = false,
      createOptionLabel,
      onCreateOption,
      isCreatingOption = false,
    },
    ref,
  ) => {
    const [internalIsEditing, setInternalIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
    const setIsEditing = (value) => {
      if (externalIsEditing !== undefined && onEditChange) {
        onEditChange(value);
      } else {
        setInternalIsEditing(value);
      }
    };

    useEffect(() => {
      const isMultiselectType = type === "multiselect" || type === "multiselectwithsearch";
      
      // Helper to check if value is effectively empty
      const isEmpty = (val) => {
        if (val === null || val === undefined) return true;
        if (Array.isArray(val)) return val.length === 0;
        if (typeof val === "string") return val.trim() === "";
        return false;
      };
      
      const initialIsEmpty = isEmpty(initialValue);
      const currentIsEmpty = isEmpty(currentValue);
      
      if (!isMultiselectType) {
        console.log("🔄 EditableField - useEffect triggered (non-multiselect):", {
          initialValue,
          previousValue: currentValue,
          type,
          timestamp: new Date().toISOString()
        });
        setCurrentValue(initialValue);
      } else {
        // For multiselect: only reset if currentValue is also empty
        // This preserves user selections during parent re-renders
        if (currentIsEmpty) {
          console.log("🔄 EditableField - useEffect triggered for multiselect (initial load):", {
            initialValue,
            previousValue: currentValue,
            type,
            timestamp: new Date().toISOString()
          });
          setCurrentValue(initialValue);
        } else {
          console.log("🔄 EditableField - useEffect skipped for multiselect (preserving user selection):", {
            initialValue,
            currentValue,
            type,
            timestamp: new Date().toISOString()
          });
          // Don't reset - preserve the user's selection!
        }
      }
    }, [initialValue]);

    const handleEdit = () => {
      console.log("✏️ EditableField - handleEdit called:", {
        type,
        initialValue,
        timestamp: new Date().toISOString()
      });
      if (type === "multiselect" || type === "multiselectwithsearch") {
        const transformedValue = (initialValue || []).map((val) => 
          typeof val === "object" && val !== null ? val._id || val.id || val : val
        );
        console.log("✏️ EditableField - transformed value:", {
          transformedValue,
          timestamp: new Date().toISOString()
        });
        setCurrentValue(transformedValue);
      }
      setIsEditing(true);
    };

    const handleCancel = () => {
      console.log("❌ EditableField - handleCancel called:", {
        type,
        initialValue,
        currentValue,
        timestamp: new Date().toISOString()
      });
      setCurrentValue(initialValue);
      setIsEditing(false);
    };

    const handleSave = async () => {
      console.log("💾 EditableField - handleSave called:", {
        type,
        currentValue,
        timestamp: new Date().toISOString()
      });
      setIsSaving(true);
      try {
        await onSave(currentValue);
        setIsEditing(false);
      } finally {
        setIsSaving(false);
      }
    };

    const defaultInputClassName =
      "w-full bg-transparent border-0 text-[0.781rem] lg:text-[8.5px] xl:text-[9.5px] 2xl:text-[10.5px] 3xl:text-[13px] text-foreground placeholder-gray-400 focus:outline-none focus:ring-0 p-0 min-h-0";
    const defaultTextareaClassName =
      "w-full h-full bg-transparent border-0 text-[0.781rem] lg:text-[8.5px] xl:text-[9.5px] 2xl:text-[10.5px] 3xl:text-[13px] text-foreground placeholder-gray-400 focus:outline-none focus:ring-0 p-0 resize-none leading-normal";
    const defaultLabelClassName =
      "block text-[0.781rem] lg:text-[7px] xl:text-[9px] 2xl:text-[10.5px] 3xl:text-[13px] font-bold text-base-color mb-0";
    const defaultContainerClassName = "relative mb-0 lg:mb-0 xl:mb-0 2xl:mb-0 3xl:mb-0";

    const formatDateDisplay = (dateStr) => {
      if (!dateStr) return "";
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      } catch {
        return dateStr;
      }
    };

    const getDisplayValue = () => {
      // Show "Access Denied" if field is not accessible
      if (isNotAvailable) {
        return (
          <div className="italic text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle
                size={16}
                className="text-yellow-500 dark:text-yellow-400"
              />
              Access Denied
            </div>
            {warningText && (
              <div className="ml-6 text-[11px] text-yellow-600 dark:text-yellow-400">
                {warningText.split("\n").map((warning, idx) => (
                  <div key={idx} className="mb-1 text-[0.781rem]">
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Handle empty values - show empty string instead of default values
      const isEmpty =
        currentValue === null ||
        currentValue === undefined ||
        currentValue === "";

      if (type === "textarea") {
        return (
          <p className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body whitespace-pre-wrap">{isEmpty ? "" : currentValue}</p>
        );
      }
      if (type === "select") {
        if (isEmpty) return <span className="text-muted-foreground">—</span>;
        const selectedOption = options.find(
          (opt) => opt.value === currentValue,
        );
        const displayValue =
          selectedOption?.label ||
          (typeof currentValue === "object" && currentValue
            ? currentValue.name || currentValue.label || String(currentValue)
            : looksLikeObjectId(currentValue)
            ? ""
            : currentValue);
        return <span className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body">{displayValue || <span className="text-muted-foreground">—</span>}</span>;
      }
      if (type === "asyncselect") {
        if (isEmpty) return <span className="text-muted-foreground">—</span>;
        const selectedOption = options.find(
          (opt) => opt.value === currentValue,
        );
        const displayValue =
          selectedOption?.label ||
          (typeof currentValue === "object" && currentValue
            ? currentValue.name || currentValue.label || String(currentValue)
            : looksLikeObjectId(currentValue)
            ? ""
            : currentValue);
        return <span className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body">{displayValue || <span className="text-muted-foreground">—</span>}</span>;
      }
      if (type === "multiselect" || type === "multiselectwithsearch") {
        if (isEmpty || (Array.isArray(currentValue) && currentValue.length === 0)) return <span className="text-muted-foreground">—</span>;
        const selectedLabels = (Array.isArray(currentValue) ? currentValue : [currentValue])
          .map((val) => {
            if (typeof val === "object" && val !== null) {
              return val.name || val.label || val.title || String(val);
            }
            const opt = options.find((o) => o.value === val);
            return opt?.label || (looksLikeObjectId(val) ? "" : val);
          })
          .filter(Boolean)
          .join(", ");
        return (
          <span
            className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body truncate block w-full"
            title={selectedLabels}
          >
            {selectedLabels || <span className="text-muted-foreground">—</span>}
          </span>
        );
      }
      if (type === "date") {
        if (isEmpty) return <span className="text-muted-foreground">—</span>;
        return <span className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body">{formatDateDisplay(currentValue)}</span>;
      }
      if (type === "checkbox") {
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={currentValue || false}
              disabled
              className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 border-gray-300 rounded pointer-events-none text-primary"
            />
            <span className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body">{currentValue ? "Selected" : "Not Selected"}</span>
          </div>
        );
      }
      if (isEmpty) return <span className="text-muted-foreground">—</span>;
      if (typeof currentValue === "object" && currentValue !== null) {
        return <span className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body">{currentValue.name || currentValue.label || currentValue.title || String(currentValue)}</span>;
      }
      return <span className="text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body">{currentValue}</span>;
    };

    // Helper to get color style for display container
    const getDisplayContainerStyle = () => {
      if (type === "select" && currentValue) {
        const selectedOption = options.find((opt) => opt.value === currentValue);
        if (selectedOption && hasColorMetadata(selectedOption)) {
          return getOptionColorStyle(selectedOption);
        }
      }
      return {};
    };

    const hasDisplayColors = () => {
      if (type === "select" && currentValue) {
        const selectedOption = options.find((opt) => opt.value === currentValue);
        return selectedOption && hasColorMetadata(selectedOption);
      }
      return false;
    };

    return (
      <div
        className={`${containerClassName || defaultContainerClassName} p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 -m-2 lg:-m-0.5 xl:-m-1 2xl:-m-1.5 3xl:-m-2 transition-colors ${isSelected ? "dark:bg-primary/10 bg-primary/5 rounded-lg" : ""}`}
      >
        <div className="flex items-center justify-between mb-1 min-h-[26px] md:min-h-auto">
          <label
            htmlFor={id}
             ref={ref}
            className={`${defaultLabelClassName || defaultContainerClassName} transition-colors cursor-pointer ${isSelected ? "dark:bg-primary/10  rounded-lg w-full" : ""}`}
            onClick={onFieldClick}
            style={{
              cursor: isNotAvailable
                ? "not-allowed"
                : onFieldClick
              ? "pointer"
              : "default",
            }}
            title={
              isNotAvailable
                ? warningText || "You don't have access to view this field"
                : undefined
            }
          >
            {label}
          </label>

          {canEdit && (
            <div className="flex items-center gap-2 pl-6">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit} 
                  disabled={isLoading || isSaving}
                  className="p-px transition-colors border rounded text-logo hover:opacity-80 border-nav-highlight/30"
                  aria-label={`Edit ${label}`}
                >
                  <MdOutlineEdit className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="p-1 transition-colors rounded text-logo hover:opacity-80"
                    aria-label="Cancel edit"
                  >
                    <X className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-px transition-colors border rounded text-logo hover:opacity-80 border-nav-highlight/30"
                    aria-label="Save changes"
                  >
                    <IoSaveOutline className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {!isEditing ? (
          <div
            className={`px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-[2.5px] xl:py-[4px] 2xl:py-[4.5px] 3xl:py-1.5 border border-nav-highlight/30 rounded-lg lg:rounded-sm xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body ${type === "textarea" ? "min-h-[100px] lg:min-h-[53px] xl:min-h-[71px] 2xl:min-h-[80px] 3xl:min-h-[100px] py-3 overflow-y-auto" : "min-h-7 lg:min-h-5 xl:min-h-5 2xl:min-h-5.5 3xl:min-h-7 flex items-center"} ${type === "multiselect" ? "overflow-hidden" : ""} ${isNotAvailable ? "bg-muted/30" : hasDisplayColors() ? "font-medium" : "bg-primary-shade-2/20 text-foreground"}`}
            style={hasDisplayColors() ? getDisplayContainerStyle() : {}}
          >
            {getDisplayValue()}
          </div>
        ) : (
          <div className={`relative ${type === "select" || type === "asyncselect" || type === "multiselect" ? "" : "px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-[2.5px] xl:py-[4px] 2xl:py-[4.5px] 3xl:py-1.5"} bg-primary-shade-2 border border-nav-highlight/30 rounded-lg text-[0.781rem] lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-body text-foreground w-full overflow-visible ${type === "textarea" ? "min-h-[100px] md:min-h-[100px] max-h-[100px] md:max-h-[100px] py-3 overflow-y-auto" : "min-h-7 lg:min-h-5 xl:min-h-5 2xl:min-h-5.5 3xl:min-h-7 flex items-center"}`}>
            {type === "textarea" ? (
              <textarea
                id={id}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className={inputClassName || defaultTextareaClassName}
                disabled={isSaving}
              />
            ) : type === "select" ? (
              <CustomSelect
                id={id}
                value={currentValue || ""}
                onChange={(val) => setCurrentValue(val)}
                options={options}
                placeholder={placeholder}
                disabled={isSaving}
              />
            ) : type === "date" ? (
              <DatePicker
                value={currentValue}
                onChange={(eventOrValue) => {
                  let dateValue;
                  if (!eventOrValue) {
                    dateValue = "";
                  } else if (typeof eventOrValue === "string") {
                    dateValue = eventOrValue;
                  } else if (eventOrValue.target && eventOrValue.target.value) {
                    dateValue = eventOrValue.target.value;
                  } else if (eventOrValue instanceof Date) {
                    dateValue = eventOrValue.toISOString().split("T")[0];
                  } else {
                    dateValue = String(eventOrValue);
                  }
                  setCurrentValue(dateValue);
                }}
                placeholder={placeholder}
                transparent={true}
              />
             ) : type === "userselect" ? (
              <UserSelect
                value={currentValue || ""}
                onChange={(val) => setCurrentValue(val)}
                disabled={isSaving}
                placeholder={placeholder}
                transparent={true}
              />
            ) : type === "asyncselect" ? (
              <div className="w-full overflow-visible">
                <AccordionSelect
                  id={id}
                  value={currentValue || ""}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  options={options || []}
                  placeholder={placeholder || "Search and select..."}
                  disabled={isSaving}
                  searchable={true}
                  onSearchChange={onSearchChange}
                  maxHeight="max-h-[120px]"
                />
              </div>
            ) : type === "multiselect" ? (
              <div className="w-full overflow-visible">
                <MultiSelect
                  value={currentValue || []}
                  onChange={(e) => {
                    const selectedIds = e.target.value;
                    setCurrentValue(selectedIds);
                  }}
                  options={options || []}
                  placeholder={placeholder || "Search and select..."}
                  disabled={isSaving}
                  maxHeight="max-h-[120px]"
                />
              </div>
            ) : type === "multiselectwithsearch" ? (
              <div className="w-full overflow-visible">
                <MultiSelectWithSearch
                  value={currentValue || []}
                  onChange={(e) => {
                    const selectedIds = e.target.value;
                    console.log("📝 EditableField - onChange triggered:", {
                      selectedIds,
                      previousValue: currentValue,
                      type,
                      timestamp: new Date().toISOString()
                    });
                    setCurrentValue(selectedIds);
                  }}
                  options={options || []}
                  placeholder={placeholder || "Search and select..."}
                  disabled={isSaving}
                  onSearchChange={onSearchChange}
                  allowCreate={allowCreateOption}
                  createLabel={createOptionLabel}
                  onCreateOption={onCreateOption}
                  isCreating={isCreatingOption}
                />
              </div>
            ) : type === "checkbox" ? (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={id}
                  checked={currentValue || false}
                  onChange={(e) => setCurrentValue(e.target.checked)}
                  className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 border-gray-300 rounded text-primary focus:ring-primary accent-primary"
                  disabled={isSaving}
                />
                <label
                  htmlFor={id}
                  className="text-[0.781rem] cursor-pointer md:text-body text-foreground"
                >
                  {currentValue ? "Selected" : "Not Selected"}
                </label>
              </div>
            ) : (
              <input
                id={id}
                type={type}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder={placeholder}
                className={inputClassName || defaultInputClassName}
                disabled={isSaving}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

EditableField.displayName = "EditableField";

export default EditableField;
