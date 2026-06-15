import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * AuthInput Component
 * - Dedicated input component for auth pages
 * - Uses fixed colors instead of theme variants
 * - No dark mode support (auth pages are always light)
 */
const AuthInput = React.forwardRef(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", className)}>
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute top-0 bottom-0 flex items-center text-gray-700 pointer-events-none left-2 md:left-0 lg:left-1 xl:left-2 2xl:left-0">
            {React.cloneElement(leftIcon, {
              className: `w-4 h-4 lg:w-2.5! xl:w-3.5! 2xl:w-4! 3xl:w-5! lg:h-2.5! xl:h-3.5! 2xl:h-4! 3xl:h-5! md:w-[18px] ${leftIcon.props.className || ""}`,
            })}
          </span>
        )}

        {/* The actual input element */}
        <input
          type={type}
          className={cn(
            "flex items-center w-full h-7 h-7 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-",
            "text-sm lg:text-[7px] xl:text-[8px] 2xl:text-xs 3xl:text-sm",
            "border-b border-gray-200",
            "text-gray-900 font-medium",
            "placeholder:text-gray-400 placeholder:font-normal",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:outline-none focus:border-purple-500/50",
            "transition-colors",
            leftIcon
              ? "pl-10 lg:pl-5.5 xl:pl-7 2xl:pl-8 3xl:pl-10"
              : "pl-4 lg:pl-3 xl:pl-4 2xl:pl-4",
            rightIcon
              ? "pr-12 lg:pr-10 xl:pr-11 2xl:pr-12"
              : "pr-4 lg:pr-3 xl:pr-4 2xl:pr-4"
          )}
          ref={ref}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span className="absolute text-gray-700 -translate-y-1/2 cursor-pointer right-4 lg:right-3 xl:right-4 2xl:right-4 top-1/2">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";

export { AuthInput };
