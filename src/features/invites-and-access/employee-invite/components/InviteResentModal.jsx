import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FaCheck } from "react-icons/fa6";
import { motion } from "framer-motion";

export function InviteResentModal({ open, onOpenChange, email, className }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn("sm:max-w-[400px] gap-0 py-8 rounded-2xl", className)}
      >
        <ModalHeader className="flex flex-col items-center justify-center mb-4 space-y-4 text-center">
          <ModalTitle className="text-lg font-semibold">
            Invite Resent
          </ModalTitle>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-background"
          >
             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#8B5CF6] text-white">
                <FaCheck className="w-6 h-6" />
             </div>
          </motion.div>

          <ModalDescription className="text-sm font-medium text-center text-lighter-text px-4">
            Congratulations ! Successfully re-sent invite to <br />
            <span className="font-semibold text-base-color text-base">
              {email}
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalFooter className="flex-row justify-center mt-4 px-6">
          <Button
            intent="primary"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-2/3 text-white bg-primary hover:bg-primary/90"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
