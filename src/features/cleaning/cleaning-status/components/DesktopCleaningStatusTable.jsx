import React, { useEffect, useMemo, useRef, useState } from "react";
import { getDaysInMonth } from "date-fns";
import {
  AlertTriangle,
  Trash2,
  X,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { IoMdArrowDropdown, IoMdCheckmark } from "react-icons/io";
import { IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import { useAvailableCleaningStatusItems } from "@/hooks/useCleaning";
import { AnimatePresence, motion } from "framer-motion";
import { AiFillThunderbolt } from "react-icons/ai";

// Custom Status Icon Components
const StatusIcon = ({ type }) => {
  switch (type) {
    case "cleaned":
      return (
        <div className="flex items-center justify-center">
          <IoCheckmarkOutline
            className="w-7 h-7 text-[#00CF5D] bg-[#00CF5D]/17 p-1 rounded-full"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center justify-center">
          <IoCloseOutline
            className="w-7 h-7 text-[#FF0C0C] bg-[#FF0C0C]/17 p-1 rounded-full"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center justify-center">
          <AlertTriangle
            className="w-7 h-7 text-[#FF9D00]/70"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </div>
      );
    default:
      return <div className="w-5 h-5" />;
  }
};

const InlineEditSelect = ({ options, onSelect, onCancel, currentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.cleaningItemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 h-10 lg:h-5 xl:h-6 2xl:h-8 3xl:h-10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-full flex-1 flex items-center justify-between bg-white dark:bg-white rounded-md px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-[#1A1A1A] dark:text-primary transition-all cursor-pointer"
        >
          <span className="truncate leading-none">{currentName || "Cleanliness Item"}</span>
          <IoMdArrowDropdown className={cn("action-button-icon text-primary transition-transform", isOpen && "rotate-180")} />
        </button>
        <div className="flex items-center h-full">
          <button
            onClick={onCancel}
            className="flex items-center justify-center p-1.5 lg:p-[1px] xl:p-0.5 2xl:p-1 3xl:p-1.5 h-full aspect-square bg-white dark:bg-transparent text-[#EF4444] border border-[#EF4444]/20 rounded-lg lg:rounded-sm xl:rounded-md 3xl:rounded-lg hover:bg-[#EF4444]/10 transition-all cursor-pointer"
          >
            <X className="action-button-icon" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] top-full left-0 mt-1 w-full bg-white dark:bg-[#1A1125] border border-primary/20 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-[#F1EEF9] dark:bg-[#2D213D] border-b border-primary/10">
              <div className="relative flex items-center">
                <Search className="absolute left-3 lg:left-1 xl:left-1.5 2xl:left-2 3xl:left-3 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-[#A0A0A1]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 lg:h-5 xl:h-6 2xl:h-8 3xl:h-10 bg-white/50 dark:bg-[#1A1125]/50 pl-10 lg:pl-5 xl:pl-6.5 2xl:pl-8 3xl:pl-10 pr-4 rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border-none focus:ring-1 focus:ring-primary/30 outline-none placeholder:text-[#A0A0A1] leading-none"
                />
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt._id}
                    onClick={() => {
                      onSelect(opt._id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-medium text-[#374151] dark:text-[#E2E8F0] hover:bg-primary/10 transition-all rounded-lg cursor-pointer"
                  >
                    {opt.cleaningItemName}
                  </button>
                ))
              ) : (
                <div className="p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 text-center text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#A0A0A1]">No items found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DesktopCleaningStatusTable({
  data,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  year = 2026,
  month = 1,
  editableDay,
  onToggleEditableDay,
  onCellClick,
  onEditMonthItem,
  onRemoveItem,
  isAddingNewRow,
  onConfirmAddRow,
  onCancelAddRow,
  editingMonthItemId,
  onCancelEditMonthItem,
  onUpdateMonthItem,
  selectedState = "active",
  onRestoreItem,
  emptyState,
}) {
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;
  const currentDay = now.getDate();

  const tableScrollRef = useRef(null);
  const hasScrolledRef = useRef(false);

  const [selectedNewItemId, setSelectedNewItemId] = useState("");
  const { data: availableItems } = useAvailableCleaningStatusItems(
    { year, month, searchTerm: "" },
    isAddingNewRow || !!editingMonthItemId
  );

  const options = useMemo(() => {
    const list = Array.isArray(availableItems)
      ? availableItems
      : availableItems?.data ?? [];
    return list;
  }, [availableItems]);

  useEffect(() => {
    if (!isCurrentMonth || !data.length) return;

    // Use multiple frames to ensure DOM is stabilized
    const scrollTask = () => {
      const container = tableScrollRef.current;
      if (!container) return;

      const target = container.querySelector(`[data-day="${currentDay}"]`);
      if (!target) return;

      // Calculate sticky column offset (min-w-[223px] from the th class)
      const stickyOffset = 223;
      container.scrollLeft = target.offsetLeft - stickyOffset;
      
      hasScrolledRef.current = true;
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(scrollTask);
    }, 200);

    return () => clearTimeout(timer);
  }, [isCurrentMonth, currentDay, data, month, year]);

  useEffect(() => {
    if (!isAddingNewRow) {
      setSelectedNewItemId("");
    }
  }, [isAddingNewRow]);

  const serialOffset = (currentPage - 1) * itemsPerPage;

  // Calculate days in the selected month/year
  const daysCount = useMemo(() => {
    return getDaysInMonth(new Date(year, month - 1));
  }, [year, month]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [daysCount]);

  // Get status from real data
  const getDayStatus = (item, day) => {
    return item.dayStatuses?.[day]?.status || "none";
  };

  const handleConfirmAdd = () => {
    if (!selectedNewItemId) return;
    onConfirmAddRow(selectedNewItemId);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full group/table">
      <div className="bg-background dark:bg-[#1A1125] rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl border border-border dark:border-nav-highlight/15 overflow-hidden flex flex-col flex-1 min-h-0 max-h-full transition-colors">
        <div ref={tableScrollRef} className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="border-separate border-spacing-0 min-w-max w-full">
            <thead className="sticky top-0 z-40 bg-white/80 dark:bg-[#1A1125]/80 backdrop-blur-md">
              <tr>
                <th
                  rowSpan={3}
                  className="sticky left-0 z-50 border-b border-r border-[#E5E7EB] dark:border-nav-highlight/15 py-4 px-6 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6  text-[18px] lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] 3xl:text-[18px] font-semibold bg-white dark:bg-[#1A1125] text-[#0D111A] dark:text-nav-highlight dark:text-nav-highlight text-center min-w-[100px] lg:min-w-[112px] xl:min-w-[149px] 2xl:min-w-[168px] 3xl:min-w-[210px]"
                >
                  Cleanliness Item
                </th>
                <th
                  colSpan={daysCount}
                  className="bg-[#EEEBF4] dark:bg-[#2D213D]/40 border-b border-[#E5E7EB] dark:border-nav-highlight/15 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 text-[16px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] font-semibold text-black dark:text-[#A0A0A1] text-center"
                >
                  Day
                </th>
              </tr>
              <tr className="bg-white dark:bg-[#1A1125]">
                {daysArray.map((day) => (
                  <th
                    key={day}
                    data-day={day}
                    className={cn(
                      "bg-white dark:bg-[#1A1125] border-r border-[#E5E7EB] dark:border-nav-highlight/15 pt-1 px-1 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-[#0D111A] dark:text-[#E2E8F0] text-center min-w-[42px] lg:min-w-[33px] xl:min-w-[44px] 2xl:min-w-[49px] 3xl:min-w-[62px]",
                      isCurrentMonth && day === currentDay
                        ? "bg-indigo-50 dark:bg-indigo-900/30"
                        : ""
                    )}
                  >
                    {day.toString().padStart(2, "0")}
                  </th>
                ))}
              </tr>
              <tr className="bg-white dark:bg-[#1A1125]">
                {daysArray.map((day) => (
                  <th
                    key={day}
                    className="bg-white dark:bg-[#1A1125] border-b border-r border-[#E5E7EB] dark:border-nav-highlight/15 py-0 px-1 text-center"
                  >
                    <button
                      type="button"
                      className={
                        "p-1 rounded transition-all cursor-pointer " +
                        (editableDay === day
                          ? "bg-primary/20 dark:bg-primary/20"
                          : "hover:bg-primary/10 dark:hover:bg-primary/20")
                      }
                      onClick={() => onToggleEditableDay?.(day)}
                    >
                          <svg
                           className="action-button-icon"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.5504 2.86382L4.01777 9.77842C3.7711 10.041 3.53239 10.5582 3.48465 10.9163L3.19025 13.4943C3.08681 14.4253 3.75519 15.0618 4.6782 14.9027L7.24034 14.4651C7.5984 14.4014 8.09969 14.1388 8.34635 13.8683L14.879 6.9537C16.0089 5.76015 16.5181 4.39951 14.7597 2.73651C13.0091 1.08942 11.6803 1.67028 10.5504 2.86382Z"
                              stroke="#552E8E"
                              strokeWidth="0.954835"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.46094 4.01953C9.80309 6.21565 11.5854 7.89457 13.7975 8.11736"
                              stroke="#552E8E"
                              strokeWidth="0.954835"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2.38672 17.5039H16.7092"
                              stroke="#552E8E"
                              strokeWidth="0.954835"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1A1125]">
              {data.map((item, index) => (
                <tr
                  key={item._id}
                  className={cn(
                    "group transition-all",
                    editingMonthItemId === item.monthItemId 
                      ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary" 
                      : "hover:bg-muted/10 dark:hover:bg-[#2D213D]/20"
                  )}
                >
                  <td className={cn(
                    "sticky left-0 transition-all border-b border-r border-[#E5E7EB] dark:border-nav-highlight/15 px-6 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10",
                    editingMonthItemId === item.monthItemId 
                      ? "bg-[#F1EEF9] dark:bg-[#2D213D] z-50" 
                      : "bg-white dark:bg-[#1A1125] group-hover:bg-[#F9FAFB] dark:group-hover:bg-[#2D213D]/30 z-30"
                  )}>
                    {editingMonthItemId === item.monthItemId ? (
                      <InlineEditSelect
                        options={options}
                        currentName={item.itemName}
                        onSelect={(id) => onUpdateMonthItem(id)}
                        onCancel={onCancelEditMonthItem}
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-[#374151] dark:text-[#E2E8F0] line-clamp-1">
                          {item.itemName}
                        </span>
                        <div className="flex items-center">
                          {selectedState !== "archived" && item.isActive !== false ? (
                            <>
                              <button
                                className="action-button p-1 lg:p-0 flex items-center justify-center gap-1.5 rounded-l-md rounded-r-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                                onClick={() => onEditMonthItem?.(item)}
                              >
                                <svg
                                  className="action-button-icon"
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
                                className="action-button p-1 lg:p-0 flex items-center justify-center gap-1.5 rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke border-l-0 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
                                onClick={() => onRemoveItem?.(item)}
                              >
                                 <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                              </button>
                            </>
                          ) : (
                            <button
                              className="action-button flex items-center justify-center gap-1.5 rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer p-1.5 px-2"
                              onClick={() => onRestoreItem?.(item)}
                            >
                              <AiFillThunderbolt className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  {daysArray.map((day) => (
                    <td
                      key={day}
                      data-day={day}
                      className={cn(
                        "border-b border-r border-[#E5E7EB] dark:border-nav-highlight/15 py-2 px-1 h-12 cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 font-bold",
                        isCurrentMonth && day === currentDay
                          ? "bg-indigo-50 dark:bg-indigo-900/25"
                          : ""
                      )}
                      onClick={() =>
                        onCellClick?.(item, day, item.dayStatuses?.[day] || {})
                      }
                    >
                      <StatusIcon type={getDayStatus(item, day)} />
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Inline Adding Row */}
              {isAddingNewRow && (
                <tr className="bg-primary/5 dark:bg-primary/10 border-l-2 border-primary animate-in fade-in slide-in-from-left-4 duration-300">
                  <td className="sticky left-0 z-50 bg-[#F1EEF9] dark:bg-[#2D213D] border-b border-r border-primary/20 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 px-6 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6  h-14 shadow-sm">
                    <InlineEditSelect 
                      options={options}
                      onSelect={(id) => onConfirmAddRow(id)}
                      onCancel={onCancelAddRow}
                    />
                  </td>
                  {daysArray.map((day) => (
                    <td
                      key={day}
                      className="border-b border-r border-[#E5E7EB] dark:border-nav-highlight/15 py-2 px-1 h-14 bg-gray-50/30 dark:bg-[#1A1125]/30 opacity-50"
                    />
                  ))}
                </tr>
              )}

              {data.length === 0 && !isAddingNewRow && (
                <tr>
                  <td
                    colSpan={daysCount + 1}
                    className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm lg:py-16 xl:py-20 3xl:py-24 text-center text-gray-400 dark:text-gray-500 font-medium bg-background dark:bg-[#1A1125]"
                  >
                    {emptyState || "No cleaning status data available for this month"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination Footer */}
        <div className="px-10 py-4 flex items-center justify-between border-t border-border dark:border-nav-highlight/15 bg-white dark:bg-[#1A1125]">
          <div className="flex-1">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              staticPosition={true}
              className="justify-start p-0 w-auto text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


