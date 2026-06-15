import React, { useEffect, useMemo, useState } from "react";
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

export function EditCleaningStatusEntryModal({
  open,
  onOpenChange,
  year,
  month,
  day,
  itemName,
  existingEntry = {},
  onSave,
}) {
  const [status, setStatus] = useState(existingEntry.status || "");
  const [comment, setComment] = useState(existingEntry.comment || "");

  useEffect(() => {
    if (!open) return;
    setStatus(existingEntry.status || "");
    setComment(existingEntry.comment || "");
  }, [open, existingEntry]);

  const formattedDate = useMemo(() => {
    if (!year || !month || !day) return "";
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    
    const dayOfMonth = date.getDate().toString().padStart(2, "0");
    const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
    const yearNum = date.getFullYear();
    const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    
    return `${dayOfMonth} ${monthName} ${yearNum}, ${dayOfWeek}`;
  }, [year, month, day]);

  const canSave = Boolean(status);

  const handleSave = async () => {
    if (!canSave) return;
    await onSave({ status, comment });
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[95%] max-w-[380px] lg:max-w-[309px] xl:max-w-[413px] 2xl:max-w-[464px]3xl:max-w-[580px] rounded-[24px]! p-6 sm:p-10 border-none">
        <ModalHeader className="flex flex-col items-center justify-center space-y-2 mb-2 text-center">
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold text-[#1A1A1A] dark:text-white">
            Update Cleaning Status
          </ModalTitle>
          <ModalDescription className="text-[12px] sm:text-[14px] font-semibold text-[#A0A0A1]">
             {itemName && <span>{itemName} — </span>}{formattedDate}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 py-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <span className={cn(
                  "text-[13px] sm:text-[14px] transition-colors font-medium",
                  status === option.value ? "text-[#1A1A1A] dark:text-white" : "text-[#999999]"
                )}>
                  {option.label}
                </span>
                <div 
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-lg border transition-all flex items-center justify-center",
                    status === option.value 
                      ? "bg-[#5D3294] border-[#5D3294]" 
                      : "bg-white dark:bg-primary/30 border-[#E0E0E0] dark:border-white/30 group-hover:border-[#5D3294]"
                  )}
                >
                  {status === option.value && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={4} />}
                </div>
              </button>
            ))}
          </div>

          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Path blocked. Need help."
              className="w-full rounded-[10px] border-none bg-[#F1EEF9] dark:bg-primary/30 px-4 sm:px-6 py-3 text-[14px] text-[#1A1A1A] dark:text-white font-semibold placeholder:text-[#000000]/80 dark:placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-[#5D3294]/20 resize-none min-h-[90px]"
            />
          </div>
        </div>

        <ModalFooter className="flex-row justify-center gap-3 sm:gap-6 mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 sm:h-13 rounded-[8px] border border-primary bg-[#F1EEF9] text-primary hover:bg-[#E5DFEF] text-[13px] sm:text-[14px] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 h-12 sm:h-13 rounded-[8px] bg-[#5D3294] text-white hover:bg-[#4B287A] text-[13px] sm:text-[14px] font-bold shadow-lg shadow-[#5D3294]/20 cursor-pointer"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
