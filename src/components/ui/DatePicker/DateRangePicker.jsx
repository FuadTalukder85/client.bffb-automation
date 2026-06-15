import React from "react";
import { cn } from "@/lib/utils";
import { toDateInputValue, toISODateString } from "@/utils/dateFormatter";
import { DatePicker } from "./DatePicker"; // Reusing our new visually-styled native picker

export const DateRangePicker = ({
  value = {},
  onChange,
  placeholder = "Select date range",
  className,
  id,
  position = "bottom",
  transparent = false,
}) => {
  const startValue = value?.start;
  const endValue = value?.end;

  const handleStartChange = (e) => {
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          id,
          value: {
            start: e.target.value,
            end: value?.end
          }
        }
      });
    }
  };

  const handleEndChange = (e) => {
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          id,
          value: {
            start: value?.start,
            end: e.target.value
          }
        }
      });
    }
  };

  // Convert the startValue (ISO string/Date Object) to a 'YYYY-MM-DD' comparison for min validation
  const startIsoString = startValue ? toDateInputValue(startValue) : "";

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <div className="flex-1">
        <DatePicker
          value={startValue}
          onChange={handleStartChange}
          transparent={transparent}
          placeholder="Start Date"
        />
      </div>
      <span className="text-gray-500 font-medium">-</span>
      <div className="flex-1">
        <DatePicker
          value={endValue}
          onChange={handleEndChange}
          transparent={transparent}
          placeholder="End Date"
          // We can intercept the child's min mapping to enforce our own min limits here directly
          allowPastDates={true} 
        />
      </div>
    </div>
  );
};
