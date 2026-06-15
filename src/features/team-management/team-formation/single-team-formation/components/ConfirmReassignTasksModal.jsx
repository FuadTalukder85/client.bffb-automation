import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

export function ConfirmReassignTasksModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-white dark:bg-[#0B0B0F] border border-white/10 flex flex-col items-center text-center">
        <ModalHeader className="pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-lg lg:text-xs! xl:text-base! 2xl:text-md! 3xl:text-lg! font-semibold text-center text-foreground">
            Reassign Tasks
          </ModalTitle>
        </ModalHeader>

        <div className="flex items-center justify-center w-20 md:w-16 lg:w-20 xl:w-24 2xl:w-24 3xl:w-28 h-20 md:h-16 lg:h-20 xl:h-24 2xl:h-24 3xl:h-28 mb-6 rounded-full bg-invite-status-text">
          <Save className="w-10 md:w-5 lg:w-6 xl:w-7 2xl:w-8 3xl:w-10 h-10 md:h-5 lg:h-6 xl:h-7 2xl:h-8 3xl:h-10 text-white" />
        </div>

        <p className="mb-8 text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11px]! 2xl:text-[13px]! 3xl:text-base! text-muted-foreground">
          Are you sure you want to reassign these tasks?
        </p>

        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center sm:gap-4">
          <Button
            intent="outline"
            onClick={onCancel}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! py-2.5 text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11px]! 2xl:text-[13px]! 3xl:text-base! border border-gray-200 rounded-lg dark:border-white/20 text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={onConfirm}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! py-2.5 text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11px]! 2xl:text-[13px]! 3xl:text-base! text-white bg-invite-status-text border border-invite-status-text rounded-lg hover:bg-[#452278]"
          >
            Confirm
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
