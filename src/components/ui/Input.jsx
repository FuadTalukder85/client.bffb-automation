import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * The Input Component
 * - forwardRef: Lets us pass a ref, which is ESSENTIAL
 * for form libraries like React Hook Form.
 * - This component is a wrapper around the native <input> or <textarea>
 * that gives it consistent styling.
 */
const Input = React.forwardRef(
  ({ className, inputClassName, type, leftIcon, rightIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const isTextarea = type === "textarea";

    return (
      // --- The Wrapper ---
      // It applies variants and focus state styling
      <div
        className={cn(
          "flex w-full rounded-md text-sm text-base-color bg-primary-shade-2 border border-nav-highlight/30",
          isTextarea ? "items-start" : "items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8",
          className
        )}
      >
        {/* --- Left Icon --- */}
        {leftIcon && (
          <span className={cn("pl-3 pr-1 text-base-color", isTextarea && "mt-1")}>
            {leftIcon}
          </span>
        )}

        {/* --- The actual <input> or <textarea> element --- */}
        {isTextarea ? (
          <textarea
            className={cn(
              // --- Core Input Styles ---
              "flex-1 w-full bg-primary-shade-2 rounded-lg",
              "placeholder:text-gray-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:outline-none", // We handle focus on the parent
              "resize-none", // Default to no resize, can be overridden via inputClassName
              "p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3", // Added padding for better text spacing
              leftIcon ? "pl-0" : "", // No left padding if icon is present (handled by wrapper)
              rightIcon ? "pr-0" : "", // No right padding if icon is present (handled by wrapper)
              inputClassName
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={cn(
              // --- Core Input Styles ---
              "flex-1 w-full bg-primary-shade-2 rounded-md",
              "placeholder:text-gray-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:outline-none", // We handle focus on the parent
              leftIcon ? "pl-0" : "px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3", // Increased padding
              rightIcon ? "pr-0" : "px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3", // Increased padding
              inputClassName
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        )}

        {/* --- Right Icon --- */}
        {rightIcon && (
          // <span className={cn("text-gray-400", isTextarea && "mt-1")}>
          <span className={cn("pl-2 pr-3 lg:pr-1 xl:pr-1.5 2xl:pr-2 3xl:pr-3 text-gray-400 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-nav-highlight font-medium", isTextarea && "mt-1")}>
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
