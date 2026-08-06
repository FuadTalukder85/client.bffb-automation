import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const AccordionSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder,
  className,
  id,
  maxHeight = "max-h-[200px]",
  searchable = true,
  multiple = false,
  onSearchChange,
  disabled = false,
  creatable = false,
  onAddCustomOption,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef(null);

  const isCreatable = Boolean(creatable || onAddCustomOption);
  const effectiveSearchPlaceholder =
    searchPlaceholder || (isCreatable ? "Search or type new..." : "Search...");

  // Combine passed options with any custom values currently selected in form state
  const effectiveOptions = React.useMemo(() => {
    const list = [...options];
    const existingValues = new Set(options.map((opt) => opt.value));

    const selectedVals = multiple
      ? Array.isArray(value)
        ? value
        : []
      : value
      ? [value]
      : [];

    selectedVals.forEach((val) => {
      if (val && !existingValues.has(val)) {
        list.push({ value: val, label: String(val) });
        existingValues.add(val);
      }
    });

    return list;
  }, [options, value, multiple]);

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const getSelectedLabel = () => {
    if (multiple) {
      if (!Array.isArray(value) || value.length === 0) {
        return null;
      }
      const selectedOptions = effectiveOptions.filter((opt) =>
        value.includes(opt.value)
      );
      const labels = selectedOptions.map((opt) => opt.label);
      if (labels.length === 0) return null;
      if (labels.length === 1) return labels[0];
      if (labels.length === 2) return labels.join(", ");
      return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
    }
    const selectedOption = effectiveOptions.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : value || null;
  };

  const filteredOptions = effectiveOptions.filter((option) => {
    // Handle both string labels and React element labels
    const labelText =
      typeof option.label === "string"
        ? option.label
        : option.searchText || ""; // Fallback to searchText if provided, or empty string
    return labelText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const trimmedSearch = searchTerm.trim();
  const hasExactMatch = React.useMemo(() => {
    if (!trimmedSearch) return true;
    return effectiveOptions.some((opt) => {
      const labelText =
        typeof opt.label === "string" ? opt.label : opt.searchText || "";
      return labelText.toLowerCase() === trimmedSearch.toLowerCase();
    });
  }, [effectiveOptions, trimmedSearch]);

  const showCreateOption = Boolean(
    (creatable || onAddCustomOption) && trimmedSearch && !hasExactMatch
  );

  const handleAddCustom = (newVal) => {
    const customValue = newVal || trimmedSearch;
    if (!customValue) return;

    if (onAddCustomOption) {
      onAddCustomOption(customValue);
    } else if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      if (!newValue.includes(customValue)) {
        newValue.push(customValue);
        onChange?.({ target: { id, value: newValue } });
      }
    } else {
      onChange?.({ target: { id, value: customValue } });
    }

    setSearchTerm("");
    onSearchChange?.("");
    if (!multiple) {
      setIsOpen(false);
    }
  };

  const handleSelect = (optionValue) => {
    if (multiple) {
      let newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== optionValue);
      } else {
        newValue.push(optionValue);
      }
      onChange({ target: { id, value: newValue } });
      // Keep open for multiple select
    } else {
      onChange({ target: { id, value: optionValue } });
      setIsOpen(false);
      setSearchTerm(""); // Reset search on select
      onSearchChange?.(""); // Reset search callback
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm(""); // Reset search on close
        onSearchChange?.(""); // Reset search callback
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayLabel = getSelectedLabel();

  return (
    <div className="w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 w-full items-center bg-primary-shade-2 justify-between border-nav-highlight/30 rounded-md border px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span
          className={cn(
            "text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs truncate mr-2",
            !displayLabel && "text-muted-foreground"
          )}
        >
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-1 w-full rounded-md border border-nav-highlight/30 bg-primary-shade-2 text-gray-700 shadow-sm"
              )}
            >
              {searchable && (
                <div className="p-2 border-b border-nav-highlight/30">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const newSearchTerm = e.target.value;
                      setSearchTerm(newSearchTerm);
                      onSearchChange?.(newSearchTerm);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && showCreateOption) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddCustom(trimmedSearch);
                      }
                    }}
                    placeholder={effectiveSearchPlaceholder}
                    className="w-full px-2 py-1 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs border rounded-sm outline-none border-nav-highlight/20 focus:border-primary placeholder:text-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <div
                className={cn(
                  "overflow-y-auto p-1 custom-scrollbar",
                  maxHeight
                )}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const selected = isSelected(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs outline-none hover:bg-purple-100",
                          selected &&
                            !multiple &&
                            "bg-nav-highlight font-medium",
                          selected &&
                            multiple &&
                            "bg-primary-shade-2 font-medium"
                        )}
                      >
                        {multiple && (
                          <div
                            className={cn(
                              "w-4 h-4 border rounded mr-2 flex items-center justify-center shrink-0",
                              selected
                                ? "border-primary bg-primary"
                                : "border-gray-400"
                            )}
                          >
                            {selected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                        <span
                          className={cn(
                            "flex-1 text-base-color truncate",
                            selected && !multiple && "text-white"
                          )}
                        >
                          {option.label}
                        </span>
                        {selected && !multiple && (
                          <Check className="w-4 h-4 ml-2 text-white" />
                        )}
                      </div>
                    );
                  })
                ) : !showCreateOption ? (
                  <div className="px-2 py-2 text-xs text-center text-gray-400">
                    No results found
                  </div>
                ) : null}

                {showCreateOption && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCustom(trimmedSearch);
                    }}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs text-primary font-medium hover:bg-purple-100 dark:hover:bg-purple-950/40 border-t border-dashed border-nav-highlight/30 mt-1"
                  >
                    <span className="truncate">+ Add "{trimmedSearch}"</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};