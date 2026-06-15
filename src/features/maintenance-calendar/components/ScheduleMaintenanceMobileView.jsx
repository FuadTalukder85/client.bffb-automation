import React, { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { MultiDatePicker } from "@/components/ui/DatePicker/MultiDatePicker";
import { Button } from "@/components/ui/Button";

const TAB_OPTIONS = [
  { label: "Select Machinery", value: "machinery" },
  { label: "Schedule Date", value: "schedule" },
];

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Custom", value: "Custom" },
];

export default function ScheduleMaintenanceMobileView({
  searchTerm,
  onSearchTermChange,
  filteredGroups,
  selectedItemSet,
  scheduledItemIds,
  onToggleItem,
  frequency,
  onFrequencyChange,
  dateRange,
  onStartDateChange,
  onEndDateChange,
  selectedDates,
  currentMonth,
  onMonthChange,
  onDateClick,
  selectedWeekday,
  onWeekdaySelect,
  onCreateSchedule,
  isCreateDisabled,
  isCreating,
}) {
  const [activeTab, setActiveTab] = useState("machinery");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4">
      <div className="sticky top-0 z-30 bg-background dark:bg-[#0B0B0F] pb-3 space-y-3">
        {activeTab === "machinery" && (
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        )}

        <div className="bg-white dark:bg-[#0B0B0F] border border-[#E5E2EC] dark:border-white/10 rounded-md flex items-stretch overflow-hidden">
          {TAB_OPTIONS.map((tab, index) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 py-2.5 px-3 text-[14px] leading-none font-medium transition-colors duration-200",
                index !== 0 && "border-l border-[#E5E2EC] dark:border-white/10",
                activeTab === tab.value
                  ? "bg-[#E8E5EF] dark:bg-[#2A2238] text-[#1F1B2A] dark:text-white"
                  : "bg-transparent text-[#23242B] dark:text-white/75",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "machinery" ? (
        <div className="px-2">
          <div className="pt-1 space-y-3">
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground italic opacity-60">
                No machinery found matching your search.
              </div>
            ) : (
              Object.entries(filteredGroups).map(([dept, items]) => (
                <section key={dept} className="space-y-2">
                  <h3 className="text-[12px] tracking-widest text-muted-foreground/60 font-semibold px-1 capitalize">
                    {dept}
                  </h3>
                  <div className="grid gap-2">
                    {items.map((item, idx) => {
                      const isSelected = selectedItemSet.has(item._id);
                      const isAlreadyScheduled = scheduledItemIds.has(item._id);

                      return (
                        <button
                          key={item._id}
                          onClick={() => onToggleItem(item._id)}
                          disabled={isAlreadyScheduled}
                          className={cn(
                            "flex items-center justify-between h-8 px-3 rounded-md border transition-all duration-300 group",
                            isAlreadyScheduled
                              ? "bg-[#F7F2FF] dark:bg-[#1A1426] border-[#C8B2F4] dark:border-[#9A7BE3]/40 cursor-not-allowed"
                              : isSelected
                                ? "bg-[#F7F2FF] dark:bg-[#1A1426] border-[#A98AEF] dark:border-[#9A7BE3]/60"
                                : "bg-background dark:bg-[#0F0F13] border-[#C8B2F4]/80 dark:border-[#9A7BE3]/35 hover:bg-[#FBF9FF] dark:hover:bg-[#151520]",
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={cn(
                                "w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full border transition-colors shrink-0",
                                isAlreadyScheduled
                                  ? "bg-[#EEE8FB] dark:bg-[#2A1D3F] text-[#5F3FAF] dark:text-[#C6B2F2] border-[#C8B2F4]/80 dark:border-[#9A7BE3]/40"
                                  : isSelected
                                    ? "bg-primary text-white border-primary"
                                    : "bg-background dark:bg-transparent text-primary/70 border-[#C8B2F4]/70 dark:border-[#9A7BE3]/35",
                              )}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-[14px] leading-none font-semibold text-base-color dark:text-white/90 truncate">
                              {item.maintenanceItemName}
                            </span>
                          </div>

                          {isAlreadyScheduled ? (
                            <span className="px-3 py-0.5 rounded-full border border-amber-200 text-[11px] font-semibold text-amber-700 bg-amber-50 shrink-0">
                              Scheduled
                            </span>
                          ) : (
                            <div
                              className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shrink-0",
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "bg-transparent border-primary/50",
                              )}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white stroke-[3px]" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="pt-1 space-y-5 px-2">
          <h2 className="text-[12px] font-medium text-foreground text-center leading-none">
            Schedule Date
          </h2>

          <div className="bg-white dark:bg-[#0B0B0F] border border-[#E5E2EC] dark:border-white/10 rounded-full flex items-stretch overflow-hidden">
            {FREQUENCY_OPTIONS.map((opt, index) => (
              <button
                key={opt.value}
                onClick={() => onFrequencyChange(opt.value)}
                className={cn(
                  "flex-1 py-2 px-2 text-[13px] leading-none font-medium transition-colors duration-200",
                  index !== 0 &&
                    "border-l border-[#E5E2EC] dark:border-white/10",
                  frequency === opt.value
                    ? "bg-[#E8E5EF] dark:bg-[#2A2238] text-[#1F1B2A] dark:text-white"
                    : "bg-transparent text-[#23242B] dark:text-white/75",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {frequency !== "Custom" && (
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center justify-between gap-4 border border-[#EEEBF4] dark:border-white/10 max-w-[398px] py-1 px-2 rounded-md w-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-[#A0A0A1] w-full">
                    From :
                  </span>
                  <DatePicker
                    value={dateRange.start}
                    onChange={onStartDateChange}
                    transparent={true}
                    align="left"
                    className="bg-[#F3F0FA] dark:bg-slate-800 px-2 py-1 rounded-md text-[12px] font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-slate-400 w-full">
                    To :
                  </span>
                  <DatePicker
                    value={dateRange.end}
                    onChange={onEndDateChange}
                    transparent={true}
                    align="right"
                    className="bg-[#F3F0FA] dark:bg-slate-800 px-2 py-1 rounded-md text-[12px] font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* <span className="text-[12px] font-semibold text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                {selectedDates.length} Days Selected
              </span> */}
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar flex justify-center">
            <MultiDatePicker
              selectedDates={selectedDates}
              onDateClick={onDateClick}
              currentMonth={currentMonth}
              onMonthChange={onMonthChange}
              className="border-none shadow-none bg-transparent scale-100 max-w-none"
              readOnly={frequency !== "Custom" && frequency !== "Monthly"}
              allowPastDates={true}
              design="schedule"
              frequency={frequency}
              highlightedWeekday={selectedWeekday}
              onWeekdaySelect={onWeekdaySelect}
            />
          </div>

          <Button
            onClick={onCreateSchedule}
            disabled={isCreateDisabled}
            className="float-end h-10 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Check className="w-5 h-5 mr-2" />
            )}
            Create Schedule
          </Button>
        </div>
      )}
    </div>
  );
}
