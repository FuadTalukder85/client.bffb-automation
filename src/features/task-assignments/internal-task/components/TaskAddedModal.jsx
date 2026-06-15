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

export function TaskAddedModal({
  open,
  onOpenChange,
  taskName,
  className,
}) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "sm:max-w-[400px] md:max-w-[500px] gap-0 px-5 py-5 md:px-6 md:py-6 rounded-2xl",
          className
        )}
      >
        <ModalHeader className="pb-4">
          <ModalTitle className="text-lg font-semibold text-center">
            New Task Added
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-16 h-16 text-white rounded-full bg-primary">
              <Check className="w-8 h-8" />
            </div>
          </motion.div>

          {/* Description */}
          <div className="px-4 text-sm md:text-base text-center">
            <p className="font-medium text-base-color">
              The {taskName || "task"}
            </p>
            <p className="text-lighter-text">
              has been added successfully.
            </p>
          </div>
        </div>

        <ModalFooter className="flex flex-row justify-center gap-3 mt-6 md:gap-4 md:mt-8">
          <Button
            intent="primary"
            onClick={handleClose}
            className="flex-1 max-w-[200px] bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
