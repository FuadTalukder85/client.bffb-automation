import React, { useState, useEffect } from "react";
import { 
  Modal, 
  ModalContent, 
} from "@/components/ui/Modal";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MultiDatePicker } from "@/components/ui/DatePicker/MultiDatePicker";
import { 
  isSameDay, 
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  getDay,
} from "date-fns";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Custom", value: "Custom" },
];

export default function EditScheduleModal({ isOpen, onClose, item, onSave, isSaving }) {
  const [frequency, setFrequency] = useState("Weekly");
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: addYears(new Date(), 1)
  });
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const [selectedMonthDay, setSelectedMonthDay] = useState(1);

  const toUtcMidnightIso = (date) => {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    ).toISOString();
  };

  // Reset state when modal opens with a new item
  useEffect(() => {
    if (isOpen && item) {
      setFrequency(item.frequency || "Weekly");
      setSelectedDates([]); 
    }
  }, [isOpen, item]);

  const handleDateClick = (date) => {
    if (frequency === "Monthly") {
      const clickedDayOfMonth = date.getDate();
      setSelectedMonthDay(clickedDayOfMonth);
      setSelectedDates(generateDatesFromFilters({
        nextFrequency: "Monthly",
        nextSelectedMonthDay: clickedDayOfMonth,
      }));
      return;
    }

    const dateStr = toUtcMidnightIso(date);
    setSelectedDates(prev => {
      if (prev.some(d => isSameDay(new Date(d), date))) {
        return prev.filter(d => !isSameDay(new Date(d), date));
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

    let dates = [];
    if (nextFrequency === "Daily") {
      dates = eachDayOfInterval({ start, end });
    } else if (nextFrequency === "Weekly") {
      const allDays = eachDayOfInterval({ start, end });
      dates = allDays.filter(day => getDay(day) === nextSelectedWeekday);
    } else if (nextFrequency === "Monthly") {
      const months = eachMonthOfInterval({ start, end });
      months.forEach(mStart => {
        const targetDate = new Date(mStart.getFullYear(), mStart.getMonth(), nextSelectedMonthDay);
        if (isWithinInterval(targetDate, { start, end })) {
          dates.push(targetDate);
        }
      });
    }

    return dates.map(toUtcMidnightIso);
  };

  const handleSave = () => {
    onSave({
      itemId: item.id,
      frequency,
      scheduledDates: selectedDates
    });
  };


  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-[400px] lg:max-w-[430px] xl:max-w-[570px] 2xl:max-w-[640px] 3xl:max-w-[800px] p-0 overflow-hidden rounded-2xl rounded-[32px]! border-none bg-white dark:bg-slate-900 shadow-2xl">
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-4 lg:p-4.5 xl:p-5.5 2xl:p-6.5 3xl:p-8 max-h-[72vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-[18px] lg:text-[11px] xl:text-[15px] 2xl:text-[17px] 3xl:text-[22px] font-semibold text-base-color dark:text-white mb-2 tracking-tight text-center">Edit Schedule</h2>

          <div className="space-y-3 mb-4 lg:mb-4.5 xl:mb-5.5 2xl:mb-6.5 3xl:mb-8 max-w-full max-w-[200px] lg:max-w-[225px] xl:max-w-[300px] 2xl:max-w-[336px] 3xl:max-w-[420px] mx-auto">
            <label className="text-[18px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] font-semibold text-base-color dark:text-slate-200 block text-center">Machinery</label>
            <div className="bg-white dark:bg-[#0B0B0F] border border-[#E5E2EC] dark:border-white/10 rounded-md overflow-hidden flex">
              <div className="flex-1 px-3 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-5 py-0.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 text-center text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-base-color dark:text-white border-r border-[#E5E2EC] dark:border-white/10">
                {item?.machinery || "N/A"}
              </div>
              <div className="flex-1 px-3 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-5 py-0.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 text-center text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-base-color dark:text-white whitespace-nowrap">
                <span>Current Frequency : </span>
                <span className="text-primary">{item?.frequency || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-5 xl:space-y-6 2xl:space-y-7 3xl:space-y-8">
             <h3 className="text-[10px] lg:text-[11px] xl:text-[15px] 2xl:text-[17px] 3xl:text-[22px] font-semibold text-black dark:text-white tracking-tight text-center md:text-left">Reschedule Date</h3>

             <div className="space-y-1 lg:space-y-1 xl:space-y-2 2xl:space-y-3 3xl:space-y-4">
                <div className="bg-white dark:bg-[#0B0B0F] border border-[#E5E2EC] dark:border-white/10 rounded-full flex items-stretch overflow-hidden w-full max-w-full mx-auto">
                  {FREQUENCY_OPTIONS.map((opt, index) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFrequencyChange(opt.value)}
                      className={cn(
                        "flex-1 py-2.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[8px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] leading-none font-medium transition-colors duration-200",
                        index !== 0 && "border-l border-[#E5E2EC] dark:border-white/10",
                        frequency === opt.value
                          ? "bg-[#E8E5EF] dark:bg-[#2A2238] text-[#1F1B2A] dark:text-white"
                          : "bg-transparent hover:bg-[#F5F3FA] dark:hover:bg-white/5 text-[#23242B] dark:text-white/75"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
             </div>

             {frequency !== "Custom" && (
                <div>
                  <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 justify-between">
                    <div className="flex items-center justify-between gap-2 lg:gap-2 xl:gap-2 2xl:gap-3 3xl:gap-4 border border-[#EEEBF4] dark:border-white/10 w-full max-w-[398px] lg:max-w-[212px] xl:max-w-[283px] 2xl:max-w-[318px] 3xl:max-w-[398px] py-1 lg:py-[1px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 px-2 rounded-md shrink-0">
                      <div className="flex items-center justify-between gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
                        <span className="text-[12px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-[15px] font-medium text-[#A0A0A1] w-full">From :</span>
                        <DatePicker
                          value={dateRange.start}
                          onChange={(val) => {
                            const nextStart = new Date(val.target.value);
                            setDateRange((prev) => {
                              const nextRange = {
                                ...prev,
                                start: nextStart,
                                end: addYears(nextStart, 1),
                              };
                              if (frequency !== "Custom") {
                                setSelectedDates(generateDatesFromFilters({ nextDateRange: nextRange }));
                              }
                              return nextRange;
                            });
                          }}
                          transparent={true}
                          align="left"
                          allowPastDates={false}
                          className="bg-[#F3F0FA] dark:bg-slate-800 px-2 lg:px-2 xl:px-2.5 2xl:px-3 py-1 rounded-md text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-slate-700 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
                        <span className="text-[12px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-[15px] font-semibold text-slate-400 w-full">To :</span>
                        <DatePicker
                          value={dateRange.end}
                          onChange={(val) => {
                            const nextEnd = new Date(val.target.value);
                            setDateRange((prev) => {
                              const nextRange = { ...prev, end: nextEnd };
                              if (frequency !== "Custom") {
                                setSelectedDates(generateDatesFromFilters({ nextDateRange: nextRange }));
                              }
                              return nextRange;
                            });
                          }}
                          transparent={true}
                          align="right"
                          allowPastDates={false}
                          className="bg-[#F3F0FA] dark:bg-slate-800 px-2 lg:px-2 xl:px-2.5 2xl:px-3 py-1 rounded-md text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <span className="hidden md:inline-flex text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-semibold text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                      {selectedDates.length} Days Selected
                    </span>
                  </div>
                </div>
              )}

             <div className="space-y-1 lg:space-y-1 xl:space-y-2 2xl:space-y-3 3xl:space-y-4">
                <div className="max-h-[430px] md:max-h-[500px] overflow-y-auto custom-scrollbar flex justify-center">
                  <MultiDatePicker
                    selectedDates={selectedDates}
                    onDateClick={handleDateClick}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="border-none shadow-none bg-transparent scale-100 max-w-none"
                    readOnly={false}
                    allowPastDates={false}
                    design="schedule"
                    frequency={frequency}
                    highlightedWeekday={selectedWeekday}
                    onWeekdaySelect={(day) => {
                      setSelectedWeekday(day);
                      setSelectedDates(generateDatesFromFilters({
                        nextFrequency: "Weekly",
                        nextSelectedWeekday: day,
                      }));
                    }}
                  />
                </div>
             </div>
          </div>
        </div>

        <div className="px-4 md:px-16 lg:px-20 xl:px-28 2xl:px-32 3xl:px-40 p-4 lg:p-4.5 xl:p-5.5 2xl:p-6.5 3xl:p-8 pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 bg-[#F8F9FB]/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/30 flex gap-3 md:gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-9 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 rounded-xl bg-white  text-primary border border-primary/70 dark:border-slate-600 font-semibold hover:bg-primary hover:text-white dark:hover:bg-slate-600 transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex-1 h-9 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 rounded-xl bg-primary text-white border border-primary font-semibold hover:bg-primary-shade-1 dark:hover:bg-primary transition-all cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : "Confirm"}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
