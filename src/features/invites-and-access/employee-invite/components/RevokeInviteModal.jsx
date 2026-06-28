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
import { RiFileCloseFill } from "react-icons/ri";
import { motion as Motion } from "framer-motion";
export function RevokeInviteModal({ open, onOpenChange, onConfirm, className, invite }) {
  const isBulk = Array.isArray(invite);

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
            {isBulk ? "Revoke Invites" : "Revoke Invite"}
          </ModalTitle>

          <Motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
             <div className="flex items-center justify-center w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-white rounded-full bg-nav-highlight">
                <RiFileCloseFill className="w-8 md:w-5 lg:w-6! xl:w-8! 2xl:w-9! 3xl:w-10! h-8 md:h-5 lg:h-6! xl:h-8! 2xl:h-9! 3xl:h-10!" />
             </div>
          </Motion.div>

          <div className="flex flex-col items-center gap-2">
            <ModalDescription className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-base-color">
              {isBulk
                ? "Are you sure you want to revoke these invites?"
                : "Revoking the invite will no longer allow the person to become a member of your organization. You can always invite them again if you change your mind. Proceed?"}
            </ModalDescription>
            {invite && isBulk && (
              <p className="px-4 text-center font-medium text-foreground text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm!">
                {`${invite.length} invite(s) selected`}
              </p>
            )}
          </div>
        </ModalHeader>

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-35 md:max-w-35 lg:max-w-26.5! xl:max-w-35.5! 2xl:max-w-40! 3xl:max-w-50! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={onConfirm}
            className="flex-1 max-w-35 md:max-w-35 lg:max-w-26.5! xl:max-w-35.5! 2xl:max-w-40! 3xl:max-w-50! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
