import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmCreateTeamModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[500px] p-8 rounded-3xl bg-white dark:bg-[#0B0B0F] border border-white/10 flex flex-col items-center text-center">
        <ModalHeader className="mb-6">
          <ModalTitle className="text-2xl font-semibold text-center text-foreground">
            Create Team
          </ModalTitle>
        </ModalHeader>

        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-[#552E8E]">
          <Plus className="w-10 h-10 text-white" />
        </div>

        <p className="mb-8 text-muted-foreground">
          Are you sure you want to create this team?
        </p>

        <div className="flex justify-center w-full gap-4">
          <Button
            intent="outline"
            onClick={onCancel}
            className="w-full py-2.5 border border-gray-200 rounded-lg dark:border-white/20 text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={onConfirm}
            className="w-full py-2.5 text-white bg-[#552E8E] border border-[#552E8E] rounded-lg hover:bg-[#452278]"
          >
            Confirm
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
