import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { hasColorMetadata, getOptionColorStyle } from "@/utils/enrichOptionsWithColors";

/**
 * Select Component
 *
 * A robust wrapper around the native <select> element, or a custom dropdown if options are provided.
 *
 * Features:
 * - Native mode: Pass `children` (options).
 * - Custom mode: Pass `options` array [{label, value}]. Supports `position="top"`.
 * - Consistent styling.
 * - Color support: Options with bgColor and textColor will be rendered with custom colors.
 */
const Select = React.forwardRef(
  (
    {
      className,
      children,
      icon,
      options,
      value,
      onChange,
      placeholder,
      position = "bottom",
      disabled,
      searchable = false,
      onSearchChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const containerRef = React.useRef(null);

    const selectedOption = options
      ? options.find((o) => o.value === value)
      : null;
    
    const selectedHasColors = selectedOption && hasColorMetadata(selectedOption);

    const filteredOptions = React.useMemo(() => {
      if (!options) return [];
      if (!searchable || !searchTerm) return options;
      return options.filter((option) => {
        // Handle both string labels and React element labels
        const labelText = typeof option.label === "string" 
          ? option.label 
          : option.searchText || "";
        return labelText.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }, [options, searchTerm, searchable]);

    const handleToggle = () => {
      if (!disabled) setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue) => {
      if (onChange) {
        // Mimic event object for compatibility
        onChange({ target: { value: optionValue } });
      }
      setIsOpen(false);
      setSearchTerm("");
      onSearchChange?.(""); // Reset search when selecting
    };

    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          onSearchChange?.(""); // Reset search when closing
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onSearchChange]);

    // Custom Dropdown Mode
    if (options) {
      return (
        <div
          className={cn("relative w-full h-full", className)}
          ref={containerRef}
        >
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={cn(
              "flex h-full w-full text-base-color bg-primary-shade-2 rounded-lg items-center justify-between text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              selectedHasColors ? "px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 rounded font-medium" : "px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2"
              // Inherit styling from parent or use defaults if needed.
              // The parent in DesktopCreateTeamModal passes specific classes.
              // We keep base styles minimal here to allow overrides.
            )}
            style={selectedHasColors ? getOptionColorStyle(selectedOption) : {}}
            {...props}
          >
            <span
              className={cn(
                "truncate",
                !selectedOption && "text-muted-foreground"
              )}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder || "Select..."}
            </span>
            <div className="flex items-center pointer-events-none text-muted-foreground">
              {icon || (
                <ChevronDown
                  className={cn(
                    "w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 opacity-50 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              )}
            </div>
          </button>

          {isOpen && (
            <div
              className={cn(
                "absolute z-50 w-full overflow-hidden border rounded-xl lg:rounded-md xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl bg-primary-shade-2 border-gray-200 dark:border-white/10 shadow-lg flex flex-col",
                position === "top" ? "bottom-full mb-2" : "top-full mt-2"
              )}
            >
              {searchable && position === "bottom" && (
                <div className="p-2 border-b border-gray-100 dark:border-white/10 shrink-0">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const newSearchTerm = e.target.value;
                      setSearchTerm(newSearchTerm);
                      onSearchChange?.(newSearchTerm);
                    }}
                    placeholder="Search..."
                    className="w-full px-2 py-[2px] lg:py-1 xl:py-[3px] 2xl:py-1 3xl:py-1.5 placeholder:text-sm lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-sm text-xs bg-transparent border rounded-md outline-none border-gray-200 dark:border-white/10 focus:border-primary placeholder:text-muted-foreground text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              )}
              <div className="py-1 lg:py-[1px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 overflow-auto max-h-[180px] lg:max-h-[96px] xl:max-h-[128px] 2xl:max-h-[144px] 3xl:max-h-[180px] custom-scrollbar grow">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const optionHasColors = hasColorMetadata(option);
                    const isSelected = option.value === value;
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "relative flex w-full items-center px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-left transition-colors",
                          optionHasColors
                            ? `${isSelected ? 'font-semibold' : 'font-medium'} hover:opacity-80`
                            : cn(
                                "hover:bg-gray-100 dark:hover:bg-white/5",
                                isSelected
                                  ? "text-nav-highlight font-medium bg-primary/5"
                                  : "text-foreground"
                              )
                        )}
                        style={optionHasColors ? getOptionColorStyle(option) : {}}
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected && !optionHasColors && (
                          <Check className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 ml-2 text-nav-highlight" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 lg:px-1 xl:px-2 2xl:px-3 3xl:px-4 py-3 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs text-center text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
              {searchable && position === "top" && (
                <div className="p-2 border-t border-gray-100 dark:border-white/10 shrink-0">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const newSearchTerm = e.target.value;
                      setSearchTerm(newSearchTerm);
                      onSearchChange?.(newSearchTerm);
                    }}
                    placeholder="Search..."
                    className="w-full px-2 py-[2px] lg:py-1 xl:py-[3px] 2xl:py-1 3xl:py-1.5 placeholder:text-sm lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-sm text-xs bg-transparent border rounded-md outline-none border-gray-200 dark:border-white/10 focus:border-primary placeholder:text-muted-foreground text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Native Mode
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-table-stroke bg-background px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            className
          )}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
          {icon || <ChevronDown className="w-4 h-4 opacity-50" />}
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
