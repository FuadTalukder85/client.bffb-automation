import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils";

function DateRangePicker({ value = {}, onChange, id, className, position = "bottom" }) {
    const dateRange = {
        start: value?.start || null,
        end: value?.end || null,
    };

    const normalizeRange = React.useCallback((start, end) => {
        if (start && end && new Date(start) > new Date(end)) {
            return { start: end, end: start };
        }
        return { start, end };
    }, []);

    const emitRangeChange = React.useCallback(
        (nextRange) => {
            onChange?.({ target: { id, value: nextRange } });
        },
        [id, onChange]
    );

    const handleFromDateChange = (event) => {
        const nextStart = event?.target?.value || null;
        emitRangeChange(normalizeRange(nextStart, dateRange.end));
    };

    const handleToDateChange = (event) => {
        const nextEnd = event?.target?.value || null;
        emitRangeChange(normalizeRange(dateRange.start, nextEnd));
    };

    return (
        <div
            className={cn(
                "relative z-20 3xl:h-[35px] 2xl:h-[30px] xl:h-[25px] lg:h-5 w-fit items-center gap-[4.9px] rounded-[4.9px] border-[0.61px] border-[#E5D3FF] dark:border-nav-highlight/20 bg-[#F8F4FF] dark:bg-primary-shade-2 3xl:p-2 2xl:p-1.5 xl:p-1 lg:p-0.5 p-1.5 flex",
                className
            )}
        >
            <div className="flex h-full min-w-[280px] 3xl:min-w-[175px] 2xl:min-w-[140px] xl:min-w-[125px] lg:min-w-[94px] flex-1 items-center gap-1 md:gap-[9.8px] rounded-[4.9px] bg-white dark:bg-[#1A1125] 3xl:p-3 2xl:p-2 xl:p-1 lg:p-0.5 [&_button_svg.lucide-calendar]:hidden">
                {/* <CalendarIcon className="h-3 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5 shrink-0 text-primary dark:text-[#A88CD5]" /> */}

                <div className="flex-1">
                    <DatePicker
                        value={dateRange.start || ""}
                        onChange={handleFromDateChange}
                        placeholder="Start date"
                        className="py-0 text-[12px] md:text-[14px] font-semibold leading-[18px] text-base-color dark:text-gray-300 [&_span]:text-center! [&_span]:text-[12px] 3xl:[&_span]:text-[14px] 2xl:[&_span]:text-[12px] xl:[&_span]:text-[10px] lg:[&_span]:text-[8px] [&_span]:font-semibold [&_span]:leading-[18px] dark:[&_span]:text-gray-300"
                        transparent={true}
                        align="left"
                    />
                </div>

                <span className="shrink-0 text-[12px] md:text-[14px] font-semibold leading-[18px] text-base-color/80 dark:text-gray-500">-</span>

                <div className="flex-1">
                    <DatePicker
                        value={dateRange.end || ""}
                        onChange={handleToDateChange}
                        placeholder="End date"
                        className="py-0 text-[12px] md:text-[14px] font-semibold leading-[18px] text-base-color dark:text-gray-300 [&_span]:text-center! [&_span]:text-[12px] 3xl:[&_span]:text-[14px] 2xl:[&_span]:text-[12px] xl:[&_span]:text-[10px] lg:[&_span]:text-[8px] [&_span]:font-semibold [&_span]:leading-[18px] dark:[&_span]:text-gray-300"
                        transparent={true}
                        align="left"
                    />
                </div>
            </div>
        </div>
    );
}

export default DateRangePicker;