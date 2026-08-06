import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Archive, Loader2 } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/utils/apiError";

export function SegmentConfirmModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  mode = "archive",
  label = "Item",
  className,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isBulk = Array.isArray(item);
  const isArchive = mode === "archive";

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
    }
  };

  const handleConfirm = async () => {
    if (!item) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(item);
      handleClose(false);
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to ${mode} ${label.toLowerCase()}`));
    } finally {
      setIsLoading(false);
    }
  };

  const title = isArchive
    ? isBulk
      ? `Archive ${label}s`
      : `Archive ${label}`
    : `Restore ${label}`;

  const message = isArchive
    ? isBulk
      ? `Are you sure you want to archive these ${label.toLowerCase()} entries?`
      : `Are you sure you want to archive "${item?.name || "this entry"}"?`
    : `Are you sure you want to restore "${item?.name || "this entry"}"?`;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className
        )}
      >
        <ModalHeader className="pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            {title}
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center justify-center w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-white rounded-full bg-primary"
          >
            {isArchive ? (
              <Archive className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
            ) : (
              <AiFillThunderbolt className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
            )}
          </motion.div>

          <p className="px-4 text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-base-color">
            {message}
          </p>

          {error && (
            <div className="w-full p-3 text-sm lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}
        </div>

        <ModalFooter className="flex-row gap-4 mt-6 px-2">
          <Button
            type="button"
            intent="outline"
            onClick={() => handleClose(false)}
            className="w-full sm:w-1/2"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            intent="primary"
            onClick={handleConfirm}
            className="w-full sm:w-1/2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isArchive ? "Archiving..." : "Restoring..."}
              </>
            ) : isArchive ? (
              "Archive"
            ) : (
              "Restore"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
