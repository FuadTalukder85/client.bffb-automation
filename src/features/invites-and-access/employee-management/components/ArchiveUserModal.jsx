import React, { useState } from "react";
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
import { FaUserMinus } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useArchiveUser } from "@/hooks/mutations";

export function ArchiveUserModal({ open, onOpenChange, user, onSuccess, className }) {
  const [error, setError] = useState(null);
  const { mutateAsync: archiveUser, isPending: isLoading } = useArchiveUser();

  const handleConfirm = async () => {
    if (!user?._id && !user?.id) return;
    
    const userId = user._id || user.id;
    setError(null);

    try {
      await archiveUser(userId);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to archive user. Please try again.";
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onOpenChange(false);
    }
  };

  const userName = user?.name || user?.email || "this user";

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className
        )}
      >
        <ModalHeader className="flex flex-col items-center justify-center pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6! space-y-4 text-center">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            Archive User
          </ModalTitle>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center"
          >
            <FaUserMinus className="w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-nav-highlight" />
          </motion.div>

          <ModalDescription className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-base-color">
            Do you want to archive <span className="font-medium text-base-color">{userName}</span>? 
            If you change your mind you can always restore them later. Proceed?
          </ModalDescription>
        </ModalHeader>

        {error && (
          <div className="w-full p-3 text-sm lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-center text-red-600 border border-red-200 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 lg:w-2.5! xl:w-3! 2xl:w-3.5! 3xl:w-4! h-4 lg:h-2.5! xl:h-3! 2xl:h-3.5! 3xl:h-4! mr-2 animate-spin" />
                Archiving...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
