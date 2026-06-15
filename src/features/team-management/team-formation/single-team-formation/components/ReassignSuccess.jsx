import React from "react";
import { ModalHeader, ModalTitle } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

export function ReassignSuccess({ newMemberName, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-6 text-center">
      <ModalHeader>
        <ModalTitle className="text-lg font-semibold">
          Reassign Tasks
        </ModalTitle>
      </ModalHeader>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-[#552E8E]"
      >
        <ClipboardCheck className="w-8 h-8 text-white" strokeWidth={2} />
      </motion.div>
      <div className="space-y-2">
        <p className="text-sm text-lighter-text">
          Tasks have been assigned to{" "}
          <span className="font-semibold text-foreground">{newMemberName}</span>.
        </p>
      </div>
      <Button
        intent="primary"
        onClick={onClose}
        className="w-full max-w-[200px] bg-[#552E8E] hover:bg-[#452475] mt-4 h-10 text-white"
      >
        Close
      </Button>
    </div>
  );
}
