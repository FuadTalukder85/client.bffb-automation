import React from "react";
import { AlertCircle } from "lucide-react";
import { cn, getDaysSince } from "@/lib/utils";
import { getStatusColor } from "@/constants/statusColors";

/**
 * Global Status Badge Component
 * 
 * Industry-grade status badge that supports:
 * 1. Automatic coloring based on status name (via centralized palette)
 * 2. Manual color overrides
 * 3. Access denied state
 * 4. Different sizes
 */
export const StatusBadge = ({ 
  status, 
  size = "sm", 
  isNotAvailable = false, 
  statusChangedAt = null,
  bgColor,
  textColor,
  className
}) => {
  // Access denied state
  if (isNotAvailable) {
    return (
      <span
        className={cn(
          "px-2 py-0.5 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs rounded-full font-medium text-muted-foreground italic flex items-center gap-1",
          size === "lg" ? "px-3 py-1.5" : "",
          className
        )}
        title="Access Denied: You don't have permission to view this field"
      >
        <AlertCircle size={size === "lg" ? 14 : 12} className="text-yellow-500" />
        Access Denied
      </span>
    );
  }

  // Empty state
  if (!status) {
    return (
      <span className={cn("px-2 py-0.5 text-xs text-muted-foreground font-medium", className)}>
        —
      </span>
    );
  }

  // Resolve colors: Manual > Palette Lookup
  let style = {};
  if (bgColor && textColor) {
    style = { backgroundColor: bgColor, color: textColor };
  } else {
    const paletteColors = getStatusColor(status);
    style = { 
      backgroundColor: paletteColors.backgroundColor, 
      color: paletteColors.color,
      border: paletteColors.border
    };
  }

  const sizeClasses = size === "lg" ? "px-5 lg:px-3 xl:px-3.5 2xl:px-4 3xl:px-5 py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 text-sub-text" : "px-5 lg:px-3 xl:px-3.5 2xl:px-4 3xl:px-5 py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 text-sub-text";

  const daysSince = getDaysSince(statusChangedAt);

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "rounded-full font-semibold inline-flex items-center justify-center transition-all duration-200",
          sizeClasses,
          className
        )}
        style={style}
      >
        {status}
      </span>
      {statusChangedAt && (
        <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-muted-foreground opacity-70">
          {daysSince !== null ? `${daysSince} days` : '0 days'}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
