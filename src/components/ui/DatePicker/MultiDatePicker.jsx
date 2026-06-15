import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWeekend,
  getDaysInMonth,
  setMonth,
  setYear,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const MultiDatePicker = ({
  selectedDates = [],
  onDateClick,
  currentMonth,
  onMonthChange,
  className,
  readOnly = false,
  allowPastDates = false,
  design = "default",
  frequency = "Custom",
  highlightedWeekday = null,
  onWeekdaySelect,
}) => {
  const [isSelectingMonth, setIsSelectingMonth] = useState(false);
  const isScheduleDesign = design === "schedule";
  const weekStartsOn = isScheduleDesign ? 0 : 1;

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn });

  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const rows = [];
  let weekDays = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      weekDays.push(day);
      day = addDays(day, 1);
    }
    rows.push(weekDays);
    weekDays = [];
  }

  const nextMonth = () => onMonthChange(addMonths(currentMonth, 1));
  const prevMonth = () => onMonthChange(subMonths(currentMonth, 1));

  const selectMonth = (year, monthIndex) => {
    let newDate = setYear(currentMonth, year);
    newDate = setMonth(newDate, monthIndex);
    onMonthChange(newDate);
    setIsSelectingMonth(false);
  };

  const weekDayLabels = isScheduleDesign
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const allMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Generate next 10 years including current year
  const currentYear = currentMonth.getFullYear();
  const [expandedYear, setExpandedYear] = useState(currentYear);
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  const toggleYear = (year) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  if (isScheduleDesign) {
    return (
      <div className={cn("w-full select-none ", className)}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[18px] font-semibold leading-none text-foreground tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 flex items-center justify-center rounded-md text-[#7F7F85] hover:bg-[#EFECF6] transition-colors"
            >
              <ChevronLeft className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 flex items-center justify-center rounded-md text-primary hover:bg-[#EFECF6] transition-colors"
            >
              <ChevronRight className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md md:rounded-2xl border border-[#E5E2EC] dark:border-white/10 bg-white dark:bg-[#0B0B0F]">
          <div className="grid grid-cols-7">
            {weekDayLabels.map((label, index) => {
              const isWeeklyHighlight = frequency === "Weekly" && highlightedWeekday === index;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => frequency === "Weekly" && onWeekdaySelect?.(index)}
                  className={cn(
                    "h-10 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 flex items-center justify-center text-xs lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[18px] font-normal border-r border-b border-[#E5E2EC] dark:border-white/10 bg-[#F6F3FD] dark:bg-primary/20 text-[#9B98A4] transition-colors",
                    index === 6 && "border-r-0",
                    isWeeklyHighlight && "bg-primary dark:bg-primary text-white",
                    frequency === "Weekly" && "cursor-pointer hover:bg-[#E3DEED]",
                    frequency !== "Weekly" && "cursor-default"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            {rows.flatMap((week) =>
              week.map((dateObj, dayIndex) => {
                const isSelected = selectedDates.some((d) => isSameDay(new Date(d), dateObj));
                const isCurrentMonth = isSameMonth(dateObj, firstDayOfMonth);
                const isPast = dateObj < realToday;
                const isWeeklyHighlight = frequency === "Weekly" && highlightedWeekday === dayIndex;

                return (
                  <button
                    key={dateObj.toISOString()}
                    type="button"
                    onClick={() => !readOnly && (!isPast || allowPastDates) && onDateClick(dateObj)}
                    className={cn(
                      "h-10 lg:h-10.5 xl:h-14 2xl:h-16 3xl:h-20 border-r border-b border-[#E5E2EC] dark:border-white/10 flex items-center justify-center text-xs lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[18px] font-normal transition-colors",
                      dayIndex === 6 && "border-r-0",
                      isWeeklyHighlight && "bg-[#D8D8DB] dark:bg-[#20222A]",
                      !isCurrentMonth && "text-[#A9A9AE]",
                      isPast && !allowPastDates && "text-[#BFBFC5]",
                      !readOnly && (!isPast || allowPastDates) && "hover:bg-[#F5F2FA] text-foreground",
                      isSelected && "text-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "w-8 h-8 lg:w-6.5 xl:w-8.5 2xl:w-9.5 3xl:w-12 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 rounded-full flex items-center justify-center",
                        isSelected && "bg-[#EEEBF4]"
                      )}
                    >
                      {format(dateObj, "d")}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-background border border-border shadow-sm rounded-2xl w-full max-w-sm select-none min-h-[380px] flex flex-col", className)}>
      <div className="flex items-center justify-between mb-6 px-2 shrink-0">
        <h3 
          onClick={() => setIsSelectingMonth(!isSelectingMonth)}
          className={cn(
            "text-lg font-bold tracking-tight text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2",
            isSelectingMonth && "text-primary"
          )}
        >
          {format(currentMonth, "MMMM yyyy")}
          <ChevronRight className={cn("w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 transition-transform", isSelectingMonth ? "rotate-90" : "rotate-0")} />
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isSelectingMonth ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-3">
            {years.map(year => {
              const isExpanded = expandedYear === year;
              return (
                <div key={year} className="space-y-3">
                  <button 
                    onClick={() => toggleYear(year)}
                    className="w-full flex items-center gap-3 group"
                  >
                    <span className={cn(
                      "text-sm font-black transition-colors",
                      isExpanded ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary"
                    )}>
                      {year}
                    </span>
                    <div className={cn(
                      "flex-1 h-px transition-colors",
                      isExpanded ? "bg-primary/20" : "bg-primary/5 group-hover:bg-primary/20"
                    )} />
                    <ChevronRight className={cn(
                      "w-3 h-3 text-muted-foreground/40 transition-transform duration-300",
                      isExpanded ? "rotate-90 text-primary" : "rotate-0"
                    )} />
                  </button>
                  
                  {isExpanded && (
                    <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      {allMonths.map((month, index) => {
                        const isSelected = currentMonth.getFullYear() === year && currentMonth.getMonth() === index;
                        return (
                          <button
                            key={`${year}-${month}`}
                            onClick={() => selectMonth(year, index)}
                            className={cn(
                              "h-10 rounded-lg text-[12px] font-bold transition-all",
                              isSelected
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-muted/30 text-foreground/70 hover:bg-primary/10 hover:text-primary"
                            )}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDayLabels.map((weekday) => (
              <div
                key={weekday}
                className="h-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            {rows.map((week) => (
              <div key={week[0]?.toISOString()} className="grid grid-cols-7 gap-1">
                {week.map((dateObj) => {
                  const isSelected = selectedDates.some((d) => isSameDay(new Date(d), dateObj));
                  const isCurrentMonth = isSameMonth(dateObj, firstDayOfMonth);
                  const isPast = dateObj < realToday;

                  return (
                    <button
                      key={dateObj.toISOString()}
                      type="button"
                      onClick={() => !readOnly && (!isPast || allowPastDates) && onDateClick(dateObj)}
                      className={cn(
                        "h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all duration-200",
                        isPast && !allowPastDates && "text-muted-foreground/30 bg-muted/20 pointer-events-none",
                        !isCurrentMonth && (!isPast || allowPastDates) && "text-muted-foreground/30",
                        (!isPast || allowPastDates) && !readOnly && "hover:bg-primary/10 cursor-pointer",
                        (!isPast || allowPastDates) && readOnly && "cursor-default",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md",
                        isCurrentMonth && !isPast && !isSelected && isWeekend(dateObj) && "text-destructive/70"
                      )}
                    >
                      {format(dateObj, "d")}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
