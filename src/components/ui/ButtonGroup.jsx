import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * ButtonGroup - A flexible and customizable button group component
 *
 * @param {Object} props
 * @param {Array} props.buttons - Array of button configurations
 * @param {string} props.className - Additional classes for the group container
 * @param {string} props.buttonClassName - Default classes applied to all buttons
 * @param {string} props.gap - Gap between buttons (e.g., "gap-2", "gap-4")
 * @param {boolean} props.fullWidth - Whether buttons should take full width
 * @param {string} props.orientation - "horizontal" or "vertical"
 * @param {Object} props.groupStyle - Inline styles for the group
 * @param {Object} props.defaultButtonProps - Default props for all buttons
 *
 * Button configuration object:
 * {
 *   icon: Component,           // Icon component (required)
 *   onClick: Function,         // Click handler (required)
 *   label: String,            // Optional text label
 *   className: String,        // Custom classes for this button
 *   style: Object,           // Inline styles for this button
 *   variant: String,         // Button variant
 *   size: String,            // Button size
 *   disabled: Boolean,       // Disable state
 *   title: String,           // Tooltip text
 *   ariaLabel: String,       // Accessibility label
 *   iconClassName: String,   // Classes for the icon
 *   iconSize: String,        // Icon size class (e.g., "w-4 h-4")
 *   ...rest                  // Any other button props
 * }
 */
export function ButtonGroup({
  buttons = [],
  className,
  buttonClassName,
  gap = "gap-5",
  fullWidth = false,
  orientation = "horizontal",
  groupStyle,
  defaultButtonProps = {},
  ...rest
}) {
  if (!buttons.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center",
        orientation === "vertical" ? "flex-col" : "flex-row",
        gap,
        className
      )}
      style={groupStyle}
      {...rest}
    >
      {buttons.map((button, index) => {
        const {
          key: buttonKey,
          icon: Icon,
          onClick,
          label,
          className: btnClassName,
          style: btnStyle,
          variant = "ghost",
          size = "sm",
          disabled = false,
          title,
          ariaLabel,
          iconClassName,
          iconSize = "w-4 h-4",
          ...buttonProps
        } = { ...defaultButtonProps, ...button };

        // Ensure we have required props
        if (!Icon || !onClick) {
          console.warn(
            `ButtonGroup: Button at index ${index} missing required props (icon or onClick)`
          );
          return null;
        }

        return (
          <Button
            key={buttonKey || index}
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={ariaLabel || label || title}
            className={cn(
              "flex items-center justify-center gap-2 h-9 px-3 text-sm font-semibold rounded-md",
              fullWidth && "flex-1",
              buttonClassName,
              btnClassName
            )}
            style={btnStyle}
            {...buttonProps}
          >
            <Icon className={cn(iconSize, iconClassName)} />
            {label && <span>{label}</span>}
          </Button>
        );
      })}
    </div>
  );
}

export default ButtonGroup;
