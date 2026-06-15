import React, { useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "Complete", value: "cleaned" },
  { label: "Incomplete", value: "failed" },
  { label: "Other", value: "pending" },
];

export function ViewCleaningStatusEntryModal({
  open,
  onOpenChange,
  itemName,
  day,
  year,
  month,
  entry = {},
}) {
  const formattedDate = useMemo(() => {
    if (!year || !month || !day) return "";
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    const dayOfMonth = date.getDate().toString().padStart(2, "0");
    const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
    const yearNum = date.getFullYear();
    const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    
    return `${dayOfMonth} ${monthName} ${yearNum}, ${dayOfWeek}`;
  }, [day, year, month]);

  const status = entry.status || "";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[95%] max-w-[380px] lg:max-w-[309px] xl:max-w-[413px] 2xl:max-w-[464px]3xl:max-w-[580px] rounded-[24px]! p-6 sm:p-10 border-none">
        <ModalHeader className="flex flex-col items-center justify-center space-y-2 mb-2 text-center">
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold text-[#1A1A1A] dark:text-white">
            Cleaning Status Details
          </ModalTitle>
          <ModalDescription className="text-[12px] sm:text-[14px] font-semibold text-[#A0A0A1]">
            {itemName && <span>{itemName} — </span>}{formattedDate}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-6">
          {/* Status Selection (Read-only) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 py-2">
            {STATUS_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-2"
              >
                <span className={cn(
                  "text-[13px] sm:text-[14px] font-medium transition-colors",
                  status === option.value ? "text-[#1A1A1A]" : "text-[#999999]"
                )}>
                  {option.label}
                </span>
                <div 
                   className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-lg border transition-all flex items-center justify-center",
                    status === option.value 
                      ? "bg-[#5D3294] dark:bg-primary/30 border-[#5D3294]" 
                      : "bg-white dark:bg-primary/30 border-[#E0E0E0] dark:border-white/30"
                  )}
                >
                  {status === option.value && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={4} />}
                </div>
              </div>
            ))}
          </div>

          {/* Comment/Note (Read-only) */}
          <div>
            <textarea
              value={entry.comment || ""}
              readOnly
              className="w-full rounded-[10px] border-none bg-[#F1EEF9] dark:bg-primary/30 px-4 sm:px-6 py-3 text-[13px] sm:text-[14px] text-[#1A1A1A] placeholder:text-gray-400 font-semibold resize-none min-h-[90px] focus:outline-none"
              placeholder="No comment provided."
            />
          </div>

          {/* Metadata Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:px-6 gap-2 text-[#A0A0A1] text-[11px] sm:text-[12px] font-semibold text-center">
             <span>Submitted by: <span className="text-[#1A1A1A] font-medium">{entry.submittedBy ?? "—"}</span></span>
             <span>at {entry.submittedAt ? new Date(entry.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</span>
          </div>
        </div>

        <ModalFooter className="flex-row justify-center mt-8">
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-[240px] h-12 sm:h-13 rounded-[8px] bg-[#5D3294] text-white hover:bg-[#4B287A] text-[13px] sm:text-[14px] font-bold shadow-lg shadow-[#5D3294]/20 border-none cursor-pointer"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
