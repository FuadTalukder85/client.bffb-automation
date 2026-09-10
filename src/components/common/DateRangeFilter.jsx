import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/DatePicker";

export function DateRangeFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange, className }) {
  const handleChange = (e) => {
    const { start = "", end = "" } = e.target.value || {};
    onDateFromChange(start ?? "");
    onDateToChange(end ?? "");
  };

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <DateRangePicker
        value={{ start: dateFrom || "", end: dateTo || "" }}
        onChange={handleChange}
      />
    </div>
  );
}