import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const MultiSelectWithSearch = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Search and select...",
  className,
  disabled = false,
  searchPlaceholder = "Search...",
  onSearchChange,
  allowCreate = false,
  createLabel = "Create",
  onCreateOption,
  isCreating = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Accumulates option labels across search terms so a previously selected
  // option doesn't disappear from the display just because a later search
  // no longer includes it in `options`.
  const [labelCache, setLabelCache] = useState(() => new Map());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabelCache(prev => {
      let changed = false;
      const next = new Map(prev);
      options.forEach(option => {
        if (option && option.value !== undefined && option.value !== null) {
          const key = String(option.value);
          if (next.get(key) !== option) {
            next.set(key, option);
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [options]);

  const selectedValues = useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((v) => {
        if (typeof v === "object" && v !== null) {
          return String(v._id || v.id || v.value || "");
        }
        return String(v ?? "");
      })
      .filter(Boolean);
  }, [value]);

  // Create a Map for faster option lookup by value
  const optionsMap = useMemo(() => {
    const map = new Map();
    options.forEach((option) => {
      if (option && option.value !== undefined && option.value !== null) {
        if (typeof option.value === "object") {
          const id = String(option.value._id || option.value.id || "");
          if (id) map.set(id, option);
        } else {
          map.set(String(option.value), option);
        }
      }
    });
    return map;
  }, [options]);

  const selectedOptions = useMemo(() => {
    const rawList = Array.isArray(value) ? value : [];
    return rawList
      .map((val) => {
        const isObj = typeof val === "object" && val !== null;
        const key = isObj ? String(val._id || val.id || val.value || "") : String(val ?? "");
        const matched = (key && optionsMap.get(key)) || (key && labelCache.get(key));
        if (matched) return matched;
        if (isObj) {
          const objLabel = val.name || val.label || val.title || "";
          if (objLabel) return { value: key || val, label: objLabel };
        }
        const looksLikeId = typeof key === "string" && /^[0-9a-fA-F]{24}$/.test(key);
        return { value: val, label: looksLikeId ? "" : key };
      })
      .filter((opt) => opt && opt.label);
  }, [value, optionsMap, labelCache]);

  const filteredOptions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    const result = !searchLower
      ? options
      : options.filter((option) =>
          String(option.label || "").toLowerCase().includes(searchLower) ||
          String(option.searchText || "").toLowerCase().includes(searchLower)
        );
    return result;
  }, [options, searchTerm]);

  const canCreateOption = useMemo(() => {
    const normalizedSearch = searchTerm.trim();
    if (!allowCreate || !normalizedSearch || disabled || isCreating) return false;

    const exists = options.some((option) =>
      String(option.label || "").toLowerCase() === normalizedSearch.toLowerCase()
    );

    return !exists;
  }, [allowCreate, searchTerm, options, disabled, isCreating]);

  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return "";
    return selectedOptions
      .map((opt) => (typeof opt.label === "object" ? opt.label?.name || opt.label?.label || "" : String(opt.label || "")))
      .filter(Boolean)
      .join(", ");
  }, [selectedOptions]);

  const handleSearchChange = useCallback((term) => {
    if (onSearchChange) {
      onSearchChange(term);
    }
  }, [onSearchChange]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex];
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((optionValue) => {
    const optionValueStr = String(optionValue);
    const isSelected = selectedValues.some(v => String(v) === optionValueStr);

    const newValue = isSelected
      ? selectedValues.filter(v => String(v) !== optionValueStr)
      : [...selectedValues, optionValue];

    if (onChange) {
      onChange({ target: { value: newValue } });
    }
    setHighlightedIndex(-1);
  }, [selectedValues, onChange]);

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex].value);
    } else if (e.key === "Enter" && canCreateOption && onCreateOption) {
      e.preventDefault();
      onCreateOption(searchTerm.trim());
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  const handleContainerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  };

  const isCreatable = Boolean(allowCreate || onCreateOption);
  const effectiveSearchPlaceholder =
    searchPlaceholder || (isCreatable ? "Search or type new..." : "Search...");

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={cn(
          "w-full flex items-center gap-2 cursor-pointer rounded-md overflow-hidden",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        onClick={handleContainerClick}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {selectedOptions.length > 0 ? (
            <span className="text-xs lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm truncate flex-1 text-foreground" title={displayValue}>
              {displayValue}
            </span>
          ) : (
            <span className="text-xs lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm text-muted-foreground truncate flex-1">
              {placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedValues.length > 0 && (
            <span className="text-[10px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
              {selectedValues.length}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden flex flex-col"
        >
          <div className="border-b border-gray-100 dark:border-white/10 p-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearchChange(e.target.value);
                }}
                placeholder={effectiveSearchPlaceholder}
                className="w-full pl-8 pr-2.5 py-1 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-muted/40 border border-gray-200 dark:border-white/10 rounded-md outline-none placeholder:text-muted-foreground text-foreground"
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleInputKeyDown}
              />
            </div>
          </div>
          <div 
            ref={listRef}
            className="overflow-y-auto max-h-[180px] lg:max-h-[120px] xl:max-h-[140px] 2xl:max-h-[160px] 3xl:max-h-[200px] py-1 custom-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground text-center">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValueStr = String(option.value);
                const isSelected = selectedValues.some(v => String(v) === optionValueStr);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                    className={cn(
                      "w-full px-3 py-1.5 lg:py-1 xl:py-1.5 text-left text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors flex items-center gap-2.5",
                      index === highlightedIndex && "bg-accent text-foreground",
                      isSelected && "bg-primary/10 text-primary font-medium"
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className={cn(
                      "w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                      isSelected 
                        ? "bg-primary border-primary text-white" 
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="truncate flex-1" title={option.label}>
                      {option.label}
                    </span>
                  </button>
                );
              })
            )}
            {canCreateOption && (
              <button
                type="button"
                onClick={() => onCreateOption && onCreateOption(searchTerm.trim())}
                disabled={isCreating}
                className="w-full px-3 py-2 text-left text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border-t border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : `${createLabel} "${searchTerm.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectWithSearch;
