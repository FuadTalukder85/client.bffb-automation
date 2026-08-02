import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination Component
 *
 * A reusable pagination component that displays page numbers with navigation arrows.
 * Supports ellipsis for large page counts and items per page selection.
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes (receives new page number)
 * @param {number} props.itemsPerPage - Current items per page
 * @param {Function} props.onItemsPerPageChange - Callback when items per page changes
 * @param {number} props.totalItems - Total number of items
 * @param {string} props.className - Additional CSS classes
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 20,
  onItemsPerPageChange,
  itemsPerPageOptions,
  className,
  staticPosition = false,
  disabled = false,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render if there's no pages
  if (totalPages < 1) {
    return null;
  }

  const handlePageChange = (newPage) => {
    if (disabled) return;
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange?.(newPage);
    }
  };

  const handlePrevious = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    handlePageChange(currentPage + 1);
  };

  const resolveItemsPerPageValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue !== "" && !Number.isNaN(Number(trimmedValue))) {
        return Number(trimmedValue);
      }
    }
    return value;
  };

  const handleItemsPerPageSelect = (value) => {
    onItemsPerPageChange?.(resolveItemsPerPageValue(value));
    setIsDropdownOpen(false);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        pages.push(2);
        pages.push(3);
        pages.push(4);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("ellipsis");
        pages.push(totalPages - 3);
        pages.push(totalPages - 2);
        pages.push(totalPages - 1);
        pages.push(totalPages);
      } else {
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const normalizedItemsPerPageOptions = (itemsPerPageOptions?.length
    ? itemsPerPageOptions
    : [20, 50, 100]
  ).map((option) =>
    typeof option === "object" ? option : { label: String(option), value: option }
  );
  const selectedItemsPerPageLabel =
    normalizedItemsPerPageOptions.find((option) => option.value === itemsPerPage)?.label ??
    String(itemsPerPage);

  return (
    <div
      className={cn(
        "flex items-center w-full justify-center",
        !staticPosition && "lg:absolute! lg:right-20! bottom-5!lg:bottom-6! 2xl:bottom-6! 3xl:bottom-12! lg:justify-end! lg:mt-0!",
        className
      )}
    >
      {/* Items Per Page Selector */}
      {onItemsPerPageChange && (
        <div className="relative mr-0.5 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "h-4 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 flex items-center gap-[1px] lg:gap-0.5 xl:gap-0.5 2xl:gap-[3px] 3xl:gap-1 rounded-xs lg:rounded-sm 2xl:rounded-md text-[7.5px] lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base font-medium",
              "bg-background border border-table-stroke text-foreground dark:text-white",
              "hover:bg-primary-shade-2"
            )}
          >
            {selectedItemsPerPageLabel}
            <ChevronUp
              className={cn(
                "h-[7px] w-[7px] lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 z-50 mb-[1px] lg:mb-0.5 xl:mb-0.5 2xl:mb-[3px] 3xl:mb-1 overflow-hidden border rounded-md shadow-lg bottom-full bg-background border-table-stroke">
              {normalizedItemsPerPageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleItemsPerPageSelect(option.value)}
                  className={cn(
                    "w-full px-3 py-1.5 2xl:px-4 2xl:py-2 text-[7.5px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-left text-foreground dark:text-white hover:bg-primary-shade-2",
                    itemsPerPage === option.value &&
                    "bg-primary-shade-2 text-nav-highlight dark:bg-primary dark:text-white font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={disabled || currentPage === 1}
        className={cn(
          "h-4 w-4 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 lg:w-5 xl:w-6 2xl:w-7 3xl:w-9 flex items-center justify-center rounded-xs lg:rounded-sm 2xl:rounded-md mr-[2px] lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2",
          "bg-background border border-table-stroke",
          "hover:bg-primary-shade-2 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-2 h-2 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 text-foreground" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-4 h-6 font-bold lg:h-7 lg:w-4 2xl:h-9 2xl:w-5 text-primary"
              >
                •
              </span>
            );
          }

          const isActive = page === currentPage;
          const showMarginLeft =
            index > 0 &&
            pageNumbers[index - 1] !== "ellipsis" &&
            page !== "ellipsis";

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              className={cn(
                "h-4 w-4 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 lg:w-5 xl:w-6 2xl:w-7 3xl:w-9 flex items-center justify-center rounded-xs lg:rounded-sm 2xl:rounded-md text-[7.5px] lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base font-medium",
                isActive
                  ? "bg-primary text-white"
                  : "bg-background border border-table-stroke text-foreground hover:bg-primary-shade-2",
                disabled && "opacity-50 cursor-not-allowed",
                showMarginLeft && "ml-[2px] lg:ml-0.5 xl:ml-1 2xl:ml-1.5 3xl:ml-2"
              )}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={disabled || currentPage === totalPages}
        className={cn(
          "h-4 w-4 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 lg:w-5 xl:w-6 2xl:w-7 3xl:w-9 flex items-center justify-center rounded-xs lg:rounded-sm 2xl:rounded-md ml-[2px] lg:ml-0.5 xl:ml-1 2xl:ml-1.5 3xl:ml-2",
          "bg-background border border-table-stroke",
          "hover:bg-primary-shade-2 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="w-2 h-2 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 text-foreground" />
      </button>
    </div>
  );
}
