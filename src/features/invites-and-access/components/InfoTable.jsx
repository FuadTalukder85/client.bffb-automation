import React from "react";
import { cn } from "../../../lib/utils";

/**
 * InfoTable - A table component for displaying key-value pairs
 *
 * Use this component inside ExpandableCard.Content or anywhere else.
 * Features:
 * - First row has border-top
 * - Last row has border-bottom
 * - All rows have horizontal borders
 *
 * Structure:
 * - InfoTable (wrapper)
 *   - InfoTable.Row (individual row with label/value)
 */

const InfoTable = ({ children, className }) => {
  return (
    <div
      className={cn(
        "divide-y divide-table-stroke border-y border-table-stroke",
        className
      )}
    >
      {children}
    </div>
  );
};

// Row Component
const Row = ({
  label,
  value,
  children,
  className,
  labelClassName,
  valueClassName,
}) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center min-h-[44px]",
        className
      )}
    >
      <span className={cn("text-xs text-lighter-text", labelClassName)}>
        {label}
      </span>
      <div className={cn("text-right text-sm text-base-color", valueClassName)}>
        {value}
        {children}
      </div>
    </div>
  );
};

// Attach compound components
InfoTable.Row = Row;

export { InfoTable };
