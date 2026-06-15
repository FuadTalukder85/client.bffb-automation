import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export function UploadSuccessModal({ open, onOpenChange, className }) {
  const handleClose = (isOpen) => {
    onOpenChange(isOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "sm:max-w-[400px] gap-0 px-5 py-5 rounded-2xl",
          className
        )}
      >
        <ModalHeader className="pb-4">
          <ModalTitle className="text-lg font-semibold text-center">
            Upload CSV
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Success Icon Area */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#8B5CF6]">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </motion.div>
          
          <p className="px-4 text-sm text-center text-lighter-text">
            Upload Complete
          </p>
        </div>

        <ModalFooter className="flex flex-row justify-center w-full mt-6">
          <Button
            intent="primary"
            onClick={() => handleClose(false)}
            className="w-full max-w-[200px] bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
