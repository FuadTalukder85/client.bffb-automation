import React from "react";
import { X } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function MonitoringEvaluationCommentModal({
  open,
  onOpenChange,
  comment,
  title = "Comment",
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-900 rounded-2xl py-6">
        <ModalHeader className="px-4 pb-4 relative block text-center sm:text-center border-b border-gray-100 dark:border-gray-800">
          <ModalTitle className="text-[22px] font-bold text-[#0D111A] dark:text-white leading-tight">
            {title}
          </ModalTitle>
        </ModalHeader>

        <div className="px-8 space-y-4">
          <div className="">
            <label className="text-[13px] font-semibold text-[#A0A0A1] dark:text-gray-400">
              Comment
            </label>
            <div className="w-full min-h-[120px] p-4 rounded-xl bg-[#F3F0FA] dark:bg-gray-800 border border-transparent dark:border-gray-700">
              <p className="text-[14px] font-medium text-[#4B5563] dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {comment || "No comment available."}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-28 h-10 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-lg shadow-primary/20 transition-all border-none"
            >
              Close
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
