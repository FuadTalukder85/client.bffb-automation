import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { createPortal } from "react-dom";
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  const selectedValues = useMemo(() => {
    const values = Array.isArray(value) ? value : [];
    console.log("🔄 MultiSelectWithSearch - selectedValues updated:", {
      values,
      value,
      timestamp: new Date().toISOString()
    });
    return values;
  }, [value]);

  // Create a Map for faster option lookup by value
  const optionsMap = useMemo(() => {
    const map = new Map();
    console.log("🔄 MultiSelectWithSearch - optionsMap rebuilding:", {
      optionsCount: options.length,
      timestamp: new Date().toISOString()
    });
    options.forEach(option => {
      // Use string comparison for robust matching
      map.set(String(option.value), option);
    });
    return map;
  }, [options]);

  const selectedOptions = useMemo(() => {
    const result = selectedValues.map(val => optionsMap.get(String(val))).filter(Boolean);
    console.log("🔄 MultiSelectWithSearch - selectedOptions updated:", {
      selectedValues,
      optionsMapKeys: Array.from(optionsMap.keys()),
      result,
      timestamp: new Date().toISOString()
    });
    return result;
  }, [selectedValues, optionsMap]);

  const filteredOptions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    const result = !searchLower ? options : options.filter(option => 
      option.label?.toLowerCase().includes(searchLower) ||
      option.searchText?.toLowerCase().includes(searchLower)
    );
    console.log("🔄 MultiSelectWithSearch - filteredOptions:", {
      searchTerm,
      searchLower,
      totalOptions: options.length,
      filteredCount: result.length,
      firstFewOptions: result.slice(0, 3).map(o => ({ value: o.value, label: o.label })),
      timestamp: new Date().toISOString()
    });
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
    return selectedOptions.map(opt => opt.label).join(", ");
  }, [selectedOptions]);

  const handleSearchChange = useCallback((term) => {
    if (onSearchChange) {
      onSearchChange(term);
    }
  }, [onSearchChange]);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current || !isOpen) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(filteredOptions.length * 40 + 48, 250);
    
    let top = rect.bottom;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = rect.top - dropdownHeight;
    }
    
    setDropdownPos({
      top: top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [isOpen, filteredOptions.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();

    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updateDropdownPosition]);

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
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
      const clickedOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(event.target);
      
      if (clickedOutsideContainer && clickedOutsideDropdown) {
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
    
    console.log("🎯 MultiSelectWithSearch - handleSelect called:", {
      optionValue,
      optionValueStr,
      isSelected,
      selectedValues,
      timestamp: new Date().toISOString()
    });
    
    const newValue = isSelected
      ? selectedValues.filter(v => String(v) !== optionValueStr)
      : [...selectedValues, optionValue];
    
    console.log("🎯 MultiSelectWithSearch - newValue:", {
      newValue,
      length: newValue.length,
      timestamp: new Date().toISOString()
    });
    
    onChange({ target: { value: newValue } });
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
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={cn(
          "w-full  flex items-center gap-2 cursor-text rounded-md overflow-hidden",
          isOpen && "",
          className
        )}
        // className={cn(
        //   "min-h-10 w-full bg-background px-3 py-2 text-sm  placeholder:text-muted-foreground  flex items-center gap-2 cursor-text rounded-md overflow-hidden",
        //   isOpen && "",
        //   className
        // )}
        onClick={handleContainerClick}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {selectedOptions.length > 0 ? (
            <span className="text-sm truncate flex-1" title={displayValue}>
              {displayValue}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground truncate flex-1">
              {placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedOptions.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {selectedOptions.length}
            </span>
          )}
          {isOpen ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-9999 bg-background text-foreground border border-border rounded-md shadow-lg overflow-hidden"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          <div className="border-b border-border p-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearchChange(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border-0 rounded-md outline-none placeholder:text-muted-foreground"
                autoFocus
                onKeyDown={handleInputKeyDown}
              />
            </div>
          </div>
          <div 
            ref={listRef}
            className="overflow-y-auto max-h-[200px] py-1"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValueStr = String(option.value);
                const isSelected = selectedValues.some(v => String(v) === optionValueStr);
                
                console.log("📋 MultiSelectWithSearch - Rendering option:", {
                  index,
                  value: optionValueStr,
                  label: option.label,
                  isSelected,
                  selectedValues,
                  timestamp: new Date().toISOString()
                });
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors flex items-center gap-3",
                      index === highlightedIndex && "bg-accent text-foreground",
                      isSelected && "bg-primary/10"
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors",
                      isSelected 
                        ? "bg-primary border-primary text-white" 
                        : "border-input"
                    )}>
                      {isSelected && <Check size={12} className="text-primary-foreground" />}
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
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border-t border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : `${createLabel} \"${searchTerm.trim()}\"`}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MultiSelectWithSearch;
