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
import { MdRestorePage } from "react-icons/md";
import { motion } from "framer-motion";

export function RestoreRoleModal({ open, onOpenChange, onConfirm, className }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn("max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!", className)}
      >
        <ModalHeader className="flex flex-col items-center justify-center mb-4 space-y-4 text-center">
          <ModalTitle className="text-lg font-semibold">
            Restore Role
          </ModalTitle>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
              <div className="flex items-center justify-center rounded-lg bg-primary text-white w-16 md:w-11 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-11 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24!">
                <MdRestorePage className="w-10 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-10 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
            </div>
          </motion.div>

            <ModalDescription className="text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-center text-lighter-text">
            <span className="font-medium text-base-color">
              Are you sure you want to restore this role?
            </span>
            <br />
            Make sure to only perform this function with proper authorization.
          </ModalDescription>
        </ModalHeader>

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-base-color"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={onConfirm}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-white bg-primary hover:bg-primary/90"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
