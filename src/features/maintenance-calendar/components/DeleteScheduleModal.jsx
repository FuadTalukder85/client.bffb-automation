import React from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Archive, Loader2 } from "lucide-react";

export default function DeleteScheduleModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}) {
  const handleClose = (nextOpen) => {
    if (!isLoading) {
      onOpenChange(nextOpen);
    }
  };

  const isBulk = Array.isArray(item);

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!">
        <ModalHeader className="pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            {isBulk ? "Archive Maintenance Schedules" : "Archive Maintenance Schedule"}
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          <div className="flex items-center justify-center w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-white rounded-full bg-primary">
            <Archive className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-base-color">
              {isBulk
                ? "Are you sure you want to archive these maintenance schedules?"
                : <>Are you sure you want to archive schedule for <span className="font-bold">"{item?.machinery || "this item"}"</span>?</>
              }
            </p>
            {item && (
              <p className="px-4 text-center font-medium text-foreground text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm!">
                {isBulk
                  ? `${item.length} maintenance schedule(s) selected`
                  : ""
                }
              </p>
            )}
            <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-lighter-text">
              This action will mark the schedule as archived (isActive = false). You can still view it using the Archived or All filter.
            </p>
          </div>
        </div>

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50"
          >
            Cancel
          </Button>

          <Button
            onClick={() => onConfirm(item)}
            disabled={isLoading}
            intent="primary"
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 lg:w-2.5! xl:w-3! 2xl:w-3.5! 3xl:w-4! h-4 lg:h-2.5! xl:h-3! 2xl:h-3.5! 3xl:h-4! mr-2 animate-spin" />
                Archiving...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
