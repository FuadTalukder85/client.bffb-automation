import React, { useMemo } from "react";
import { getDaysInMonth, isToday } from "date-fns";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";

// Custom Status Icon Components (reused from desktop for consistency)
const StatusIcon = ({ type, className }) => {
  switch (type) {
    case "cleaned":
      return (
        <IoCheckmarkOutline
          className={cn("w-6 h-6 text-[#00CF5D] bg-[#00CF5D]/10 p-1 rounded-full", className)}
          fill="currentColor"
          fillOpacity="0.1"
        />
      );
    case "failed":
      return (
        <IoCloseOutline
          className={cn("w-6 h-6 text-[#FF0C0C] bg-[#FF0C0C]/10 p-1 rounded-full", className)}
          fill="currentColor"
          fillOpacity="0.1"
        />
      );
    case "pending":
      return (
        <AlertTriangle
          className={cn("w-6 h-6 text-[#FF9D00]/70", className)}
          fill="currentColor"
          fillOpacity="0.1"
        />
      );
    default:
      return <div className={cn("w-6 h-6 border border-dashed border-gray-200 rounded-full", className)} />;
  }
};

export default function MobileCleaningStatusCard({
  data,
  year,
  month,
  onCellClick,
  onEditMonthItem,
  onRemoveItem,
}) {
  const daysCount = useMemo(() => {
    return getDaysInMonth(new Date(year, month - 1));
  }, [year, month]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [daysCount]);

  const getDayStatus = (day) => {
    return data.dayStatuses?.[day]?.status || "none";
  };

  return (
    <div className="bg-white dark:bg-[#1A1125] rounded-3xl border border-border dark:border-nav-highlight/15 shadow-sm overflow-hidden mb-4 transition-all active:scale-[0.99]">
      {/* Header Area */}
      <div className="bg-white dark:bg-[#1A1125] p-4 border-b border-gray-100 dark:border-nav-highlight/10 flex items-center justify-between gap-4">
        <h3 className="text-[15px] font-bold text-[#1A1A1A] dark:text-[#E2E8F0] line-clamp-1 flex-1">
          {data.itemName}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEditMonthItem?.(data)}
            className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all border border-primary/5 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              width="4"
              height="4"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => onRemoveItem?.(data.monthItemId)}
            className="p-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/20 transition-all border border-[#EF4444]/5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Scrolling Strip */}
      <div className="p-4 bg-[#F9FAFB] dark:bg-[#2D213D]/20">
        <label className="text-[12px] font-semibold text-[#A0A0A1] mb-3 block uppercase tracking-wider">
          Monthly Status Grid
        </label>
        <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-3">
          {daysArray.map((day) => {
            const date = new Date(year, month - 1, day);
            const status = getDayStatus(day);
            const today = isToday(date);

            return (
              <button
                key={day}
                onClick={() => onCellClick?.(data, day, data.dayStatuses?.[day] || {})}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-[48px] p-2 rounded-2xl transition-all border",
                  today 
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                    : "bg-white dark:bg-[#1A1125] border-gray-100 dark:border-nav-highlight/10 text-[#374151] dark:text-[#E2E8F0]"
                )}
              >
                <span className={cn("text-[10px] font-bold opacity-60", today && "text-white")}>
                  DAY
                </span>
                <span className="text-[16px] font-black leading-none">
                  {day.toString().padStart(2, "0")}
                </span>
                <div className="mt-1">
                  <StatusIcon 
                    type={status} 
                    className={cn(
                      "w-6 h-6",
                      today ? "bg-white/20 text-white border-none" : ""
                    )} 
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Footer */}
      <div className="px-5 py-3 flex items-center justify-between text-[13px] font-medium text-gray-500 dark:text-[#A0A0A1] border-t border-gray-50 dark:border-nav-highlight/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-[#00CF5D]" />
             <span>Done</span>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-[#FF0C0C]" />
             <span>Fail</span>
          </div>
        </div>
        <span className="italic text-[11px] opacity-70">
           Swipe for all days
        </span>
      </div>
    </div>
  );
}
