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
import { FaTimes } from "react-icons/fa";
import { motion as Motion } from "framer-motion";

export function RemoveRoleModal({ open, onOpenChange, onConfirm, role, className }) {
  const isBulk = Array.isArray(role);
  const title = isBulk ? "Remove Roles" : "Remove Role";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "max-w-150 sm:max-w-100 lg:max-w-[320px]! xl:max-w-106.25! 2xl:max-w-120! 3xl:max-w-150! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className
        )}
      >
        <ModalHeader className="flex flex-col items-center justify-center pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6! space-y-4 text-center">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            {title}
          </ModalTitle>

          <Motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! rounded-full bg-[#693895] text-white">
              <FaTimes className="w-7 md:w-4 lg:w-5! xl:w-6! 2xl:w-7! 3xl:w-8! h-7 md:h-4 lg:h-5! xl:h-6! 2xl:h-7! 3xl:h-8!" />
            </div>
          </Motion.div>

          <ModalDescription className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-lighter-text flex flex-col gap-2">
            <span className="font-medium text-lighter-text">
              {isBulk
                ? `Are you sure you want to remove these ${role.length} roles?`
                : <>Are you sure you want to remove the role <span className="font-bold">"{role?.name}"</span>?</>}
            </span>
            <span className="font-medium text-lighter-text">
              Removing {isBulk ? "these roles" : "this role"} means {isBulk ? "they" : "it"} will no longer be usable within the
              organization. Users assigned to {isBulk ? "these roles" : "this role"} will have their
              permissions revoked. Proceed?
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-35 md:max-w-35 lg:max-w-26.5! xl:max-w-35.5! 2xl:max-w-40! 3xl:max-w-50! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-base-color"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={onConfirm}
            className="flex-1 max-w-35 md:max-w-35 lg:max-w-26.5! xl:max-w-35.5! 2xl:max-w-40! 3xl:max-w-50! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-white bg-primary hover:bg-primary/90"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
