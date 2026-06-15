import * as React from "react";
import { cn } from "@/lib/utils";
import BottomArrowIcon from "@/assets/components/bottom-arrow.svg?react";

const FilterInput = React.forwardRef(
  (
    {
      className,
      config = {},
      id,
      isOpen: controlledIsOpen,
      onToggle,
      ...props
    },
    ref
  ) => {
    const {
      options = [],
      value,
      onValueChange,
      placeholder = "Select...",
      defaultValue,
    } = config;

    // Determine if component is controlled
    const isControlled =
      controlledIsOpen !== undefined && onToggle !== undefined;

    const [internalIsOpen, setInternalIsOpen] = React.useState(false);
    const [internalSelectedOption, setInternalSelectedOption] = React.useState(
      options.find((option) => option.value === defaultValue) ||
        options[0] ||
        null
    );

    // Use controlled or uncontrolled state
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    // Derive selected option from props if value is provided, otherwise use internal state
    const selectedOption =
      value !== undefined
        ? options.find((o) => o.value === value) || null
        : internalSelectedOption;

    const containerRef = React.useRef(null);

    const handleSelect = (option) => {
      // Close dropdown first to prevent state conflicts
      if (isControlled) {
        onToggle?.(id, false);
      } else {
        setInternalIsOpen(false);
      }

      // Update internal state only if uncontrolled
      if (value === undefined) {
        setInternalSelectedOption(option);
      }

      // Notify parent
      if (onValueChange) {
        onValueChange(option.value);
      }
    };

    const handleToggle = () => {
      if (isControlled) {
        // Notify parent of toggle
        onToggle?.(id, !isOpen);
      } else {
        setInternalIsOpen(!isOpen);
      }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          if (isControlled) {
            onToggle?.(id, false);
          } else {
            setInternalIsOpen(false);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isControlled, id, onToggle]);

    // Merge refs
    React.useImperativeHandle(ref, () => containerRef.current);

    // Check if selected option has color metadata
    const selectedHasColors = selectedOption?.bgColor && selectedOption?.textColor;
    const selectedColorStyle = selectedHasColors 
      ? { 
          backgroundColor: selectedOption.bgColor, 
          color: selectedOption.textColor 
        }
      : {};

    return (
      <div className={cn("relative w-full", className)} ref={containerRef}>
        <button
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-transparent px-4 py-2 text-sm transition-all duration-200 focus:ring-0 focus:outline-2 focus:outline-primary/20 focus:-outline-offset-2",
            selectedHasColors 
              ? "font-medium hover:opacity-90"
              : "bg-primary-shade-2 hover:bg-primary-shade-2/80",
            selectedOption && !selectedHasColors ? "text-primary font-medium" : selectedHasColors ? "" : "text-foreground/70"
          )}
          style={selectedColorStyle}
          type="button"
          onClick={handleToggle}
          onMouseDown={(e) => e.stopPropagation()}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          {...props}
        >
          <span className={cn("truncate", selectedHasColors ? "" : "text-foreground/70")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span 
            className={cn(
              "ml-2 shrink-0 flex items-center",
              selectedHasColors ? "" : "text-nav-highlight"
            )}
            style={selectedHasColors ? { color: selectedOption.textColor } : {}}
          >
            <BottomArrowIcon
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </span>
        </button>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 overflow-hidden border bg-background border-table-stroke rounded-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="overflow-auto max-h-60 custom-scrollbar">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <OptionItem
                    key={option.value}
                    option={option}
                    isSelected={selectedOption?.value === option.value}
                    onClick={() => handleSelect(option)}
                    isLast={index === options.length - 1}
                  />
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-center text-foreground/50">
                  No options
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Component for individual option item
const OptionItem = ({ option, isSelected, onClick, isLast }) => {
  const hasCustomColors = option.bgColor && option.textColor;
  // Check if mobile colors exist
  const useMobileColors = option.mobileBgColor && option.mobileTextColor;
  
  // Custom style for options with bgColor and textColor - ALWAYS apply if available
  const customStyle = (hasCustomColors || useMobileColors)
    ? { 
        backgroundColor: useMobileColors ? option.mobileBgColor : option.bgColor, 
        color: useMobileColors ? option.mobileTextColor : option.textColor,
        borderBottom: isLast ? 'none' : `1px solid ${(useMobileColors ? option.mobileTextColor : option.textColor)}40`
      }
    : {};

  return (
    <button
      className={cn(
        "relative flex w-full items-center px-2.5 py-1.5 text-sm text-left transition-colors duration-150 border-b last:border-b-0 border-table-stroke",
        hasCustomColors ? "font-medium" : isSelected
          ? "text-nav-highlight font-semibold"
          : "text-foreground/70 hover:text-foreground",
        isSelected && hasCustomColors && "font-semibold"
      )}
      style={customStyle}
      onClick={onClick}
      type="button"
      role="option"
      aria-selected={isSelected}
    >
      {option.label}
    </button>
  );
};
FilterInput.displayName = "FilterInput";

export { FilterInput };
