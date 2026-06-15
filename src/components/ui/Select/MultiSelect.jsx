import React, { useState, useRef, useEffect } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export const MultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select options...",
  className,
  disabled = false,
  maxHeight = "max-h-[200px]",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [portalNode, setPortalNode] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const dialogElement = document.querySelector('[role="dialog"]');
      const target = dialogElement?.parentElement || document.body;
      setPortalNode(target);
    } else {
      setPortalNode(null);
    }
  }, [isOpen]);

  console.log("MultiSelect render:", {
    value,
    optionsLength: options?.length,
    options: options?.slice(0, 5), // First 5 options for debugging
    searchTerm,
    isOpen
  });

  // Ensure value is always an array
  const selectedValues = Array.isArray(value) ? value : [];
  console.log("selectedValues:", selectedValues);

  const selectedOptions = options.filter(option =>
    selectedValues.includes(option.value)
  );
  console.log("selectedOptions:", selectedOptions);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option.value)
  );
  console.log("filteredOptions:", filteredOptions);

  const updateDropdownPosition = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = Math.min(filteredOptions.length * 40 + 8, 200); // Estimate height
      
      let top = rect.bottom;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below and more space above, position above
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        top = rect.top - dropdownHeight;
      }
      
      setDropdownPos({
        top: top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [filteredOptions.length]);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // Update position on scroll/resize
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside both container and dropdown
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
      const clickedOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(event.target);
      
      console.log("Click outside check:", {
        clickedOutsideContainer,
        clickedOutsideDropdown,
        target: event.target,
        containerContains: containerRef.current?.contains(event.target),
        dropdownContains: dropdownRef.current?.contains(event.target)
      });
      
      if (clickedOutsideContainer && clickedOutsideDropdown) {
        console.log("Closing dropdown");
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    console.log("handleSelect called with:", optionValue);
    const newValue = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    console.log("newValue:", newValue);
    console.log("calling onChange with:", { target: { value: newValue } });
    onChange({ target: { value: newValue } });
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    const newValue = selectedValues.filter(v => v !== optionValue);
    onChange({ target: { value: newValue } });
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const displayValue = selectedOptions.length > 0
    ? `${selectedOptions.length} selected`
    : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={cn(
          "min-h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 flex-wrap cursor-text",
          className
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selectedOptions.map(option => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/15 text-primary rounded-md whitespace-nowrap"
          >
            {option.label}
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="hover:bg-primary/30 rounded-sm p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground min-w-0"
          disabled={disabled}
        />
        <ChevronDown
          size={16}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </div>

      {isOpen && portalNode && createPortal(
        <div
          ref={dropdownRef}
          className={cn(
            "fixed z-9999 pointer-events-auto bg-background text-foreground border border-border rounded-md shadow-lg overflow-hidden",
            maxHeight
          )}
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          {console.log("Portal dropdown rendered at:", dropdownPos)}
          <div className="overflow-y-auto">
            {console.log("Rendering dropdown, isOpen:", isOpen, "filteredOptions length:", filteredOptions.length)}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(e) => {
                    console.log("Option clicked (mousedown):", option.value, option.label, "index:", index);
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {console.log("Rendering option button:", option.label)}
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>,
        portalNode
      )}
    </div>
  );
};