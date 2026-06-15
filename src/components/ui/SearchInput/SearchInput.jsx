import * as React from "react";
import { cn } from "@/lib/utils";
import SearchIcon from "@/assets/components/search.svg?react";

const SearchInput = React.forwardRef(
  ({ className, iconClassName, showFocusRing = false, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type="search"
          className={cn(
            "font-medium text-foreground placeholder:text-lighter-text flex lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 h-9 w-full items-center rounded-lg lg:rounded-sm xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg border border-table-stroke px-3 3xl:py-2 2xl:py-1.5 xl:py-1.5 lg:py-0.5 py-2 3xl:text-xs 2xl:text-[10px] xl:text-[9px] lg:text-[8px] text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:outline-none disabled:cursor-not-allowed transition-all duration-200 pr-6",
            showFocusRing &&
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            className
          )}
          ref={ref}
          placeholder={props.placeholder || "Search..."}
          {...props}
        />

        <SearchIcon
          className={cn(
            "absolute w-3 3xl:w-3.5 3xl:h-3.5 2xl:w-3 2xl:h-3 xl:w-2.5 xl:h-2.5 lg:w-2 lg:h-2 -translate-y-1/2 pointer-events-none right-3 lg:right-1.5 xl:right-2 2xl:right-2.5 3xl:right-3 top-1/2 text-nav-highlight",
            iconClassName
          )}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
