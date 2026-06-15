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
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function UploadRawMaterialsSuccessModal({ open, onOpenChange, className }) {
  const handleClose = (isOpen) => {
    onOpenChange(isOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
            "sm:max-w-[400px] md:max-w-[600px] gap-0 px-5 py-5 md:px-12 md:py-10 rounded-2xl md:rounded-3xl",
          className
        )}
      >
        <ModalHeader className="pb-4 md:pb-6">
          <ModalTitle className="text-lg font-semibold text-center md:text-2xl">
            Success
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          {/* Success Icon Area */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full md:w-24 md:h-24 bg-primary">
              <CheckCircle2 className="w-8 h-8 text-white md:w-10 md:h-10" />
            </div>
          </motion.div>
          
          <p className="px-4 text-sm text-center text-lighter-text md:text-base md:px-8">
            Upload Complete
          </p>
        </div>

        <ModalFooter className="flex flex-row justify-center w-full mt-6 md:mt-8 md:gap-6">
          <Button
            intent="primary"
            onClick={() => handleClose(false)}
            className="w-full max-w-[140px] md:max-w-[200px] md:h-12 md:text-base bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
