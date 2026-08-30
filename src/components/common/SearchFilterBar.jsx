import React, { useState, useEffect, useRef } from "react";
import { FilterInput } from "@/components/ui/FilterInput/FilterInput";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { cn } from "@/lib/utils";

export const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  // Single filter props (backward compatible)
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "Select filter...",
  // Multiple filters prop (new)
  filters,
  hideOnDesktop = false,
  className,
  // Width customization
  searchWidth,
  filterWidths = {},
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [openFilterId, setOpenFilterId] = useState(null);
  const sentinelRef = useRef(null);

  // Determine if using single filter or multiple filters
  const isSingleFilter = !filters && filterOptions;
  const hasMultipleFilters = filters && filters.length > 0;

  // Calculate equal width distribution accounting for gap-3 (0.75rem = 12px)
  const totalItems = 1 + (isSingleFilter ? 1 : hasMultipleFilters ? filters.length : 0);
  const gapSize = 12; // gap-3 = 0.75rem = 12px
  const totalGapWidth = (totalItems - 1) * gapSize;
  const equalWidthPercent = (100 / totalItems).toFixed(2);
  const equalWidth = `calc(${equalWidthPercent}% - ${(totalGapWidth / totalItems).toFixed(2)}px)`;
  
  // Get search width (custom or equal)
  const searchBarWidth = searchWidth || equalWidth;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggle sticky state when the sentinel leaves the top of the viewport
        // Use intersectionRatio and boundingClientRect.top for better precision on different mobile screens
        const shouldBeSticky = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
        setIsSticky(shouldBeSticky);
      },
      { 
        threshold: [0],
        // rootMargin slightly negative helps trigger exactly when crossing the top
        rootMargin: "-1px 0px 0px 0px" 
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, []);

  // Handle filter toggle for mutual exclusion
  const handleFilterToggle = (filterId, shouldOpen) => {
    if (shouldOpen) {
      setOpenFilterId(filterId);
    } else {
      setOpenFilterId(null);
    }
  };

  return (
    <>
      <div ref={sentinelRef} className="invisible w-full h-px" />
      <div
        className={cn(
          "flex flex-col gap-3 bg-background transition-all duration-300 ease-in-out md:static md:bg-transparent md:py-0 md:shadow-none",
          "sticky z-40",
          isSticky
            ? "top-[-1.25rem] px-5 py-4 bg-background -mx-5 shadow-none"
            : "top-0 px-0 py-0 bg-transparent",
          hideOnDesktop && "md:hidden",
          className
        )}
      >
        {/* Search row - Full width */}
        <div className="w-full">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>

        {/* Filters row - Grid of filters */}
        {(isSingleFilter || hasMultipleFilters) && (
          <div className="flex gap-3 w-full">
            {isSingleFilter && (
              <div className="flex-1 min-w-0">
                <FilterInput
                  config={{
                    options: filterOptions,
                    value: filterValue,
                    onValueChange: onFilterChange,
                    placeholder: filterPlaceholder,
                    defaultValue: "all",
                  }}
                />
              </div>
            )}

            {hasMultipleFilters && (
              <>
                {filters.map((filter) => {
                  const filterId = filter.id || filter.key;
                  return (
                    <div
                      key={filterId}
                      className="flex-1 min-w-0"
                    >
                      <FilterInput
                        id={filterId}
                        isOpen={openFilterId === filterId}
                        onToggle={handleFilterToggle}
                        config={{
                          options: filter.options,
                          value: filter.value,
                          onValueChange: filter.onChange,
                          placeholder: filter.placeholder || filter.label || "Select...",
                          defaultValue: filter.defaultValue,
                        }}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
