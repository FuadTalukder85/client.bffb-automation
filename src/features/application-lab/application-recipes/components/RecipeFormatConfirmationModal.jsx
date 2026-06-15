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
import { FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RecipeFormatConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  formatName,
  className
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onClose();
      setError(null);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      handleClose(false);
    } catch (err) {
      let errorMessage = "An error occurred while creating the recipe";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "sm:max-w-[400px] md:max-w-[600px] gap-0 px-5 py-5 md:px-12 md:py-10 rounded-2xl md:rounded-3xl",
          className
        )}
      >
        <ModalHeader className="pb-4 md:pb-6">
          <ModalTitle className="text-lg font-semibold text-center md:text-2xl">
            Create Recipe
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex items-center justify-center w-16 h-16 text-white rounded-full bg-primary md:w-17 md:h-17"
          >
            <FileText className="w-6 h-6 md:w-7 md:h-7" />
          </motion.div>

          <div className="px-4 text-sm text-center text-base-color md:text-base md:px-8 space-y-3">
            <p className="font-semibold">
              Are you sure you want to select the {formatName} format?
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              You will not be allowed to change the format later.
            </p>
            <p className="text-sm italic text-gray-600 dark:text-gray-400">
              Make sure to only perform this function with proper authorization.
            </p>
          </div>

          {error && (
            <div className="w-full p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}
        </div>

        <ModalFooter className="flex flex-row justify-center gap-3 mt-6 md:mt-8 md:gap-6">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[200px] md:h-12 md:text-base border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50 cursor-pointer"
          >
            Back
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[200px] md:h-12 md:text-base bg-primary hover:bg-primary/90 text-white disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
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
