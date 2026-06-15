import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2 } from "lucide-react";
import {
  useBulkScheduleMaintenance,
  useMaintenanceItems,
  useMaintenanceScheduleOverview,
} from "@/hooks/useMaintenance";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MultiDatePicker } from "@/components/ui/DatePicker/MultiDatePicker";
import { cn } from "@/lib/utils";
import {
  eachDayOfInterval,
  getDay,
  isSameDay,
  eachMonthOfInterval,
  isWithinInterval,
  addMonths,
} from "date-fns";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import ScheduleMaintenancePageSkeleton from "./components/ScheduleMaintenancePageSkeleton";
import ScheduleMaintenanceMobileView from "./components/ScheduleMaintenanceMobileView";
import { useIsMobile } from "@/hooks/useIsMobile";

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Custom", value: "Custom" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function ScheduleMaintenancePage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [frequency, setFrequency] = useState("Weekly");
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: addMonths(new Date(), 12),
  });
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const [selectedMonthDay, setSelectedMonthDay] = useState(1);

  const toUtcMidnightIso = (date) => {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    ).toISOString();
  };

  const { data: itemsData, isLoading } = useMaintenanceItems({
    isActive: "true",
    limit: 100,
  });

  const maintenanceItems = useMemo(() => itemsData?.data || [], [itemsData]);
  const scheduleMutation = useBulkScheduleMaintenance();
  const scheduleYear = currentMonth.getFullYear();
  const { data: scheduleOverview, isLoading: isLoadingScheduleOverview } =
    useMaintenanceScheduleOverview(scheduleYear);

  const scheduledItemIds = useMemo(() => {
    return new Set(Object.keys(scheduleOverview?.itemScheduleMap || {}));
  }, [scheduleOverview?.itemScheduleMap]);

  const selectableSelectedItems = useMemo(
    () => selectedItems.filter((id) => !scheduledItemIds.has(id)),
    [selectedItems, scheduledItemIds],
  );

  const selectedItemSet = useMemo(
    () => new Set(selectableSelectedItems),
    [selectableSelectedItems],
  );

  const alreadyScheduledCount = useMemo(
    () =>
      maintenanceItems.filter((item) => scheduledItemIds.has(item._id)).length,
    [maintenanceItems, scheduledItemIds],
  );

  const groupedItems = useMemo(() => {
    return maintenanceItems.reduce((acc, item) => {
      const dept = item.department || "General";
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(item);
      return acc;
    }, {});
  }, [maintenanceItems]);

  const filteredGroups = useMemo(() => {
    // Start with all items grouped, but only include those that are NOT already scheduled
    const availableItemsGroups = Object.entries(groupedItems).reduce((acc, [dept, items]) => {
      const available = items.filter(item => !scheduledItemIds.has(item._id));
      if (available.length > 0) acc[dept] = available;
      return acc;
    }, {});

    if (!searchTerm) return availableItemsGroups;
    
    const lowerSearch = searchTerm.toLowerCase();
    return Object.entries(availableItemsGroups).reduce((acc, [dept, items]) => {
      const filtered = items.filter(
        (item) =>
          item.maintenanceItemName.toLowerCase().includes(lowerSearch) ||
          dept.toLowerCase().includes(lowerSearch),
      );
      if (filtered.length > 0) acc[dept] = filtered;
      return acc;
    }, {});
  }, [groupedItems, searchTerm, scheduledItemIds]);

  const handleToggleItem = (itemId) => {
    if (scheduledItemIds.has(itemId)) {
      toast.warning(
        `This machinery already has a schedule for ${scheduleYear}.`,
      );
      return;
    }

    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleDateClick = (date) => {
    if (frequency === "Monthly") {
      const clickedDayOfMonth = date.getDate();
      setSelectedMonthDay(clickedDayOfMonth);
      setSelectedDates(
        generateDatesFromFilters({
          nextFrequency: "Monthly",
          nextSelectedMonthDay: clickedDayOfMonth,
        }),
      );
      return;
    }

    const dateStr = toUtcMidnightIso(date);
    setSelectedDates((prev) => {
      if (prev.some((d) => isSameDay(new Date(d), date))) {
        return prev.filter((d) => !isSameDay(new Date(d), date));
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleFrequencyChange = (val) => {
    setFrequency(val);
    if (val === "Custom") {
      setSelectedDates([]);
      return;
    }
    setSelectedDates(generateDatesFromFilters({ nextFrequency: val }));
  };

  const generateDatesFromFilters = ({
    nextFrequency = frequency,
    nextDateRange = dateRange,
    nextSelectedWeekday = selectedWeekday,
    nextSelectedMonthDay = selectedMonthDay,
  } = {}) => {
    const { start, end } = nextDateRange;
    if (!start || !end || start > end) {
      return [];
    }

    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(23, 59, 59, 999);

    let dates = [];
    if (nextFrequency === "Daily") {
      dates = eachDayOfInterval({ start: normalizedStart, end: normalizedEnd });
    } else if (nextFrequency === "Weekly") {
      const allDays = eachDayOfInterval({ start: normalizedStart, end: normalizedEnd });
      dates = allDays.filter((day) => getDay(day) === nextSelectedWeekday);
    } else if (nextFrequency === "Monthly") {
      const months = eachMonthOfInterval({ start: normalizedStart, end: normalizedEnd });
      months.forEach((mStart) => {
        const targetDate = new Date(
          mStart.getFullYear(),
          mStart.getMonth(),
          nextSelectedMonthDay,
        );
        if (isWithinInterval(targetDate, { start: normalizedStart, end: normalizedEnd })) {
          dates.push(targetDate);
        }
      });
    }

    return dates.map(toUtcMidnightIso);
  };

  const handleCreateSchedule = async () => {
    if (selectableSelectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    try {
      const response = await scheduleMutation.mutateAsync({
        maintenanceItems: selectableSelectedItems,
        year: scheduleYear,
        frequency,
        scheduledDates: selectedDates,
        allowReschedule: false,
      });
      toast.success(
        getResponseMessage(response, "Maintenance scheduled successfully")
      );
      navigate("/maintenance/maintenance-calendar");
    } catch (err) {
      const serverWarning =
        err?.response?.data?.warning || err?.response?.data?.message;
      const conflictingItems =
        err?.response?.data?.data?.conflictingItems || [];

      if (serverWarning) {
        toast.warning(serverWarning);

        if (conflictingItems.length > 0) {
          const conflictIds = new Set(conflictingItems.map((item) => item._id));
          setSelectedItems((prev) => prev.filter((id) => !conflictIds.has(id)));

          const previewNames = conflictingItems
            .slice(0, 3)
            .map((item) => item.maintenanceItemName)
            .join(", ");
          const extraCount = conflictingItems.length - 3;

          toast.warning(
            extraCount > 0
              ? `${previewNames} and ${extraCount} more item(s) already have schedules for ${scheduleYear}.`
              : `${previewNames} already has a schedule for ${scheduleYear}.`,
          );
        }

        return;
      }
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to schedule maintenance"
      );
    }
  };

  const isPageLoading = isLoading || isLoadingScheduleOverview;

  if (isPageLoading) {
    return <ScheduleMaintenancePageSkeleton />;
  }

  const isCreateDisabled =
    selectableSelectedItems.length === 0 ||
    selectedDates.length === 0 ||
    scheduleMutation.isPending ||
    isLoadingScheduleOverview;

  return (
    <section className="flex flex-col min-h-[calc(100vh-6rem)] bg-background dark:bg-[#0B0B0F] rounded-3xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between pb-2 lg:pb-2 xl:pb-2.5 2xl:pb-3 3xl:pb-4 flex-none bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton className="" />
          <div className="flex flex-col">
            <h1 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-foreground leading-tight">
              Schedule Maintenance
            </h1>
            <div className="hidden md:flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 lg:mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
              <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
                {selectableSelectedItems.length} Items Selected
              </span>
              <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-foreground">
                {selectedDates.length} Dates Configured
              </span>
              <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 rounded-full border border-amber-200 text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-amber-700 bg-amber-50">
                {alreadyScheduledCount} Locked for {scheduleYear}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="">
            <SearchInput
              placeholder="Search machinery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ThemeToggle />
        </div>
      </div>
      <div className="md:hidden items-center gap-2 mb-2">
        <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
          {selectableSelectedItems.length} Items Selected
        </span>
        <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-foreground">
          {selectedDates.length} Dates Configured
        </span>
      </div>
      {isMobile ? (
        <div className="flex-1 min-h-0">
          <ScheduleMaintenanceMobileView
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filteredGroups={filteredGroups}
            selectedItemSet={selectedItemSet}
            scheduledItemIds={scheduledItemIds}
            onToggleItem={handleToggleItem}
            frequency={frequency}
            onFrequencyChange={handleFrequencyChange}
            dateRange={dateRange}
            onStartDateChange={(val) => {
              const nextStart = new Date(val.target.value);
              setDateRange((prev) => {
                const nextRange = { ...prev, start: nextStart };
                if (frequency !== "Custom") {
                  setSelectedDates(
                    generateDatesFromFilters({ nextDateRange: nextRange }),
                  );
                }
                return nextRange;
              });
            }}
            onEndDateChange={(val) => {
              const nextEnd = new Date(val.target.value);
              setDateRange((prev) => {
                const nextRange = { ...prev, end: nextEnd };
                if (frequency !== "Custom") {
                  setSelectedDates(
                    generateDatesFromFilters({ nextDateRange: nextRange }),
                  );
                }
                return nextRange;
              });
            }}
            selectedDates={selectedDates}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onDateClick={handleDateClick}
            selectedWeekday={selectedWeekday}
            onWeekdaySelect={(day) => {
              setSelectedWeekday(day);
              setSelectedDates(
                generateDatesFromFilters({
                  nextFrequency: "Weekly",
                  nextSelectedWeekday: day,
                }),
              );
            }}
            onCreateSchedule={handleCreateSchedule}
            isCreateDisabled={isCreateDisabled}
            isCreating={scheduleMutation.isPending}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden p-0 gap-0 rounded-3xl border border-border dark:border-white/10 dark:bg-[#0B0B0F]">
          {/* Left Side: Select Machinery */}
          <div className="w-full md:flex-1 min-w-0 flex flex-col gap-6 lg:gap-3 xl:gap-4 2xl:gap-4.5 3xl:gap-6 overflow-y-auto p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 pr-4 lg:pr-1.5 xl:pr-2 2xl:pr-3 3xl:pr-4 custom-scrollbar md:border-r border-border dark:border-white/10">
            <div className="flex-none">
              <h2 className="text-[18px] lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-foreground leading-none mb-4 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4">
                Select Machinery
              </h2>

              <div className="space-y-4.5 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3.5 3xl:space-y-4.5">
                {Object.keys(filteredGroups).length === 0 ? (
                  <div className="lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base text-center py-10 lg:py-12 xl:py-14 2xl:py-16 3xl:py-20 text-muted-foreground italic opacity-60">
                    No machinery found matching your search.
                  </div>
                ) : (
                  Object.entries(filteredGroups).map(([dept, items]) => (
                    <section key={dept} className="space-y-3 lg:space-y-1.5 xl:space-y-2 2xl:space-y-2.5 3xl:space-y-3">
                      <h3 className="text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-widest text-muted-foreground/60 capitalize! md:normal-case md:tracking-normal md:font-semibold md:text-foreground px-1">
                        {dept}
                      </h3>
                      <div className="grid gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                        {items.map((item, idx) => {
                          const isSelected = selectedItemSet.has(item._id);
                          const isAlreadyScheduled = scheduledItemIds.has(
                            item._id,
                          );

                          return (
                            <button
                              key={item._id}
                              onClick={() => handleToggleItem(item._id)}
                              disabled={isAlreadyScheduled}
                              className={cn(
                                "flex items-center justify-between h-11 lg:h-6.5 xl:h-7.5 2xl:h-8.5 3xl:h-11 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 rounded-[10px] lg:rounded-[7px] 2xl:rounded-[8px] 3xl:rounded-[10px] border transition-all duration-300 group",
                                isAlreadyScheduled
                                  ? "bg-[#F7F2FF] dark:bg-[#1A1426] border-[#C8B2F4] dark:border-[#9A7BE3]/40 cursor-not-allowed"
                                  : isSelected
                                    ? "bg-[#F7F2FF] dark:bg-[#1A1426] border-[#A98AEF] dark:border-[#9A7BE3]/60"
                                    : "bg-background dark:bg-[#0F0F13] border-[#C8B2F4]/80 dark:border-[#9A7BE3]/35 hover:bg-[#FBF9FF] dark:hover:bg-[#151520]",
                              )}
                            >
                              <div className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
                                <span
                                  className={cn(
                                    "w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 flex items-center justify-center text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-bold rounded-full border transition-colors",
                                    isAlreadyScheduled
                                      ? "bg-[#EEE8FB] dark:bg-[#2A1D3F] text-[#5F3FAF] dark:text-[#C6B2F2] border-[#C8B2F4]/80 dark:border-[#9A7BE3]/40"
                                      : isSelected
                                        ? "bg-primary text-white border-primary"
                                        : "bg-background dark:bg-transparent text-primary/70 border-[#C8B2F4]/70 dark:border-[#9A7BE3]/35",
                                  )}
                                >
                                  {idx + 1}
                                </span>
                                <span
                                  className={cn(
                                    "text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] leading-none font-semibold text-base-color dark:text-white/90 transition-colors",
                                  )}
                                >
                                  {item.maintenanceItemName}
                                </span>
                              </div>

                              {isAlreadyScheduled ? (
                                <div className="flex items-center gap-1.5 text-primary">
                                  {/* <span className="text-[12px] md:text-[14px] leading-none font-semibold">Maintenance Scheduled</span> */}
                                  <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 rounded-full border border-amber-200 text-[11px] font-semibold text-amber-700 bg-amber-50">
                                    Scheduled
                                  </span>
                                  {/* <span className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 rounded-md bg-primary text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3px]" />
                              </span> */}
                                </div>
                              ) : (
                                <div
                                  className={cn(
                                    "w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 rounded-md border flex items-center justify-center transition-all duration-300",
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "bg-transparent border-primary/50",
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 text-white stroke-[3px]" />
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
          </div>

          {/* Right Side: Schedule Date */}
          <div className="w-full lg:w-118 xl:w-157 2xl:w-177 3xl:w-222.5 md:shrink-0 bg-card flex flex-col overflow-y-auto custom-scrollbar p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6">
            <div className="w-full">
              <h2 className="text-[18px] lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-foreground text-center mb-2 leading-none">
                Schedule Date
              </h2>

              <div className="p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 space-y-6 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6">
                {/* Frequency Toggle */}
                <div>
                  <div className="bg-white dark:bg-[#0B0B0F] border border-[#E5E2EC] dark:border-white/10 rounded-full flex items-stretch overflow-hidden max-w-[760px] lg:max-w-[405px] xl:max-w-[540px] 2xl:max-w-[608px] 3xl:max-w-[760px] mx-auto">
                    {FREQUENCY_OPTIONS.map((opt, index) => (
                      <button
                        key={opt.value}
                        onClick={() => handleFrequencyChange(opt.value)}
                        className={cn(
                          "flex-1 py-3 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[16px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] leading-none font-medium transition-colors duration-200",
                          index !== 0 &&
                            "border-l border-[#E5E2EC] dark:border-white/10",
                          frequency === opt.value
                            ? "bg-[#E8E5EF] dark:bg-[#2A2238] text-[#1F1B2A] dark:text-white"
                            : "bg-transparent hover:bg-[#F5F3FA] dark:hover:bg-white/5 text-[#23242B] dark:text-white/75",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {frequency !== "Custom" && (
                  <div className="">
                    <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 justify-between">
                      <div className="flex items-center justify-between gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 border border-[#EEEBF4] dark:border-white/10 max-w-[398px] lg:max-w-[225px] xl:max-w-[291px] 2xl:max-w-[328px] 3xl:max-w-[410px] py-1 lg:py-[1px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 px-2 lg:px-0.5 xl:px-1 2xl:px-1.5 3xl:px-2 rounded-md shrink-0 w-full xl:w-auto">
                        <div className="flex items-center justify-between gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
                          <span className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-medium text-slate-400 w-full">
                            From :
                          </span>
                          <DatePicker
                            value={dateRange.start}
                            onChange={(val) => {
                              const nextStart = new Date(val.target.value);
                              setDateRange((prev) => {
                                const nextRange = { ...prev, start: nextStart };
                                if (frequency !== "Custom") {
                                  setSelectedDates(
                                    generateDatesFromFilters({
                                      nextDateRange: nextRange,
                                    }),
                                  );
                                }
                                return nextRange;
                              });
                            }}
                            transparent={true}
                            className="bg-[#F3F0FA] dark:bg-slate-800 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5  py-1 lg:py-[3px] xl:py-[3px] 2xl:py-[3px] 3xl:py-1 rounded-md text-[14px] font-bold text-slate-700 dark:text-slate-200"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
                          <span className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-medium text-slate-400 w-full">
                            To :
                          </span>
                          <DatePicker
                            value={dateRange.end}
                            onChange={(val) => {
                              const nextEnd = new Date(val.target.value);
                              setDateRange((prev) => {
                                const nextRange = { ...prev, end: nextEnd };
                                if (frequency !== "Custom") {
                                  setSelectedDates(
                                    generateDatesFromFilters({
                                      nextDateRange: nextRange,
                                    }),
                                  );
                                }
                                return nextRange;
                              });
                            }}
                            transparent={true}
                            className="bg-[#F3F0FA] dark:bg-slate-800 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5  py-1 lg:py-[3px] xl:py-[3px] 2xl:py-[3px] 3xl:py-1 rounded-md text-[14px] font-bold text-slate-700 dark:text-slate-200"
                          />
                        </div>
                      </div>
                      <span className="text-[12px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-semibold text-primary/60 bg-primary/5 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-[1px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 rounded-full border border-primary/10">
                        {selectedDates.length} Days Selected
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-6 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6">
                  <div className="max-h-[266px] lg:max-h-[290px] xl:max-h-[355px] 2xl:max-h-[400px] 3xl:max-h-[500px] overflow-y-auto custom-scrollbar flex justify-center">
                    <MultiDatePicker
                      selectedDates={selectedDates}
                      onDateClick={handleDateClick}
                      currentMonth={currentMonth}
                      onMonthChange={setCurrentMonth}
                      className="border-none shadow-none bg-transparent scale-100 max-w-none"
                      readOnly={
                        frequency !== "Custom" && frequency !== "Monthly"
                      }
                      allowPastDates={true}
                      design="schedule"
                      frequency={frequency}
                      highlightedWeekday={selectedWeekday}
                      onWeekdaySelect={(day) => {
                        setSelectedWeekday(day);
                        setSelectedDates(
                          generateDatesFromFilters({
                            nextFrequency: "Weekly",
                            nextSelectedWeekday: day,
                          }),
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sticky/Bottom Footer Button Container */}
              <div className="flex gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 justify-end my-5 lg:my-2.5 xl:my-3 2xl:my-3.5 3xl:my-5">
                <Button
                  onClick={handleCreateSchedule}
                  disabled={isCreateDisabled}
                  className="h-12 lg:h-8 xl:h-9 2xl:h-11 3xl:h-12 px-12 lg:px-6.5 xl:px-8.5 2xl:px-9.5 3xl:px-12 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/30 transition-all enabled:hover:bg-transparent enabled:hover:text-primary border border-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {scheduleMutation.isPending ? (
                    <Loader2 className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
                  )}
                  Create Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
