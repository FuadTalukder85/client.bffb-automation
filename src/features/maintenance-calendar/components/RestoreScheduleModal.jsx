import React from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AiFillThunderbolt } from "react-icons/ai";
import { Loader2 } from "lucide-react";

export default function RestoreScheduleModal({
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

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="sm:max-w-100 md:max-w-150 gap-0 px-5 py-5 md:py-10 rounded-2xl md:rounded-3xl">
        <ModalHeader className="pb-4 md:pb-6">
          <ModalTitle className="text-lg font-semibold text-center md:text-2xl">
            Restore Maintenance Schedule
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          <div className="flex items-center justify-center w-16 h-16 text-white rounded-full bg-primary md:w-24 md:h-24 shadow-lg shadow-primary/20">
            <AiFillThunderbolt className="w-8 h-8 md:w-10 md:h-10" />
          </div>

          <div className="text-center px-4 md:px-8">
            <p className="text-sm font-medium text-base-color md:text-base">
              Are you sure you want to restore schedule for <span className="font-bold">"{item?.machinery || "this item"}"</span>?
            </p>
            <p className="mt-2 text-xs text-lighter-text md:text-sm">
              Make sure to only perform this function with proper authorization
            </p>
          </div>
        </div>

        <ModalFooter className="flex flex-row justify-center gap-3 mt-6 md:mt-8 md:gap-6">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="px-8 py-2 md:px-12 md:py-3"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-2 md:px-12 md:py-3 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
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
