import React, { useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDate,
  toISODateString,
  toDateInputValue,
} from "@/utils/dateFormatter";

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  id,
  position = "bottom", // ignored for native
  align = "left", // ignored for native
  addProject = false,
  transparent = false,
  allowPastDates = true,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  // Value formatting for the visual display
  const displayValue = value ? formatDate(value) : placeholder;

  // Value formatting for the hidden native input
  const inputValue = value ? toDateInputValue(value) : "";
  const todayISO = toDateInputValue(new Date());

  const handleChange = (e) => {
    if (!onChange) return;

    if (!e.target.value) {
      onChange({ target: { id, value: null } });
      return;
    }

    const [year, month, day] = e.target.value.split('-');
    const localDate = new Date(year, month - 1, day);
    const isoValue = toISODateString(localDate);

    onChange({
      ...e,
      target: { ...e.target, id, value: isoValue },
    });
  };

  const openNativePicker = () => {
    if (disabled || !inputRef.current) return;

    if (typeof inputRef.current.showPicker === "function") {
      inputRef.current.showPicker();
      return;
    }

    inputRef.current.focus();
    inputRef.current.click();
  };

  return (
    <div
      className={cn(
        "relative w-full group",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
      onClick={disabled ? undefined : openNativePicker}
    >
      {/* 
        Native Input hidden visually but functional logic. 
        Because it's opacity-0, the user thinks they are clicking 
        the visually styled button below, but actually triggers this native input.
      */}
      <input
        type="date"
        id={id}
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        onFocus={openNativePicker}
        min={!allowPastDates ? todayISO : undefined}
        disabled={disabled}
        className={cn(
          "absolute inset-0 w-full h-full opacity-0 pointer-events-none z-10",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      />

      {/* Visual Presentation identically copying your custom button implementation */}
      <div
        className={cn(
          "flex items-center justify-between w-full text-left transition-colors",
          addProject ? "h-8 lg:h-6 xl:h-7.5 2xl:h-8.5 3xl:h-11" : "",
          transparent
            ? "bg-transparent border-0 text-sm md:text-body px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3"
            : cn(
              "h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-md text-xs md:text-body border px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3",
              disabled
                ? "bg-gray-100 dark:bg-gray-800/20 border-nav-highlight/10 text-gray-400"
                : "bg-primary-shade-2 border border-nav-highlight/30 group-hover:border-nav-highlight/50 group-focus-within:ring-2 group-focus-within:ring-primary/20"
            ),
          !value && "text-gray-400",
          value && "text-foreground"
        )}
      >
        <span className="flex-1 text-left text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm truncate">
          {displayValue}
        </span>
        <CalendarIcon className="w-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 ml-2 text-gray-400 shrink-0" />
      </div>
    </div>
  );
};
