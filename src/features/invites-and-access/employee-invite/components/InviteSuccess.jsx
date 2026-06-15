import React from "react";
import { ModalHeader, ModalTitle } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
export function InviteSuccess({ email, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-6 text-center">
      <ModalHeader>
        <ModalTitle className="text-lg font-semibold">
          Invite Successful !
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
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#8B5CF6]"
      >
        <Check className="w-8 text-white" strokeWidth={3} />
      </motion.div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-lighter-text">
          Congratulations ! Your invite has been sent to
        </p>
        <p className="font-semibold text-md text-base-color">{email}</p>
      </div>
      <Button
        intent="primary"
        onClick={onClose}
        className="w-full max-w-[200px] bg-[#552E8E] hover:bg-[#452475] mt-4 h-12 text-white"
      >
        Close
      </Button>
    </div>
  );
}