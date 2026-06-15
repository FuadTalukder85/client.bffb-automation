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
import { Loader2 } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { motion } from "framer-motion";

export function RestoreMaintenanceItemModal({
    open,
    onOpenChange,
    item,
    onConfirm,
    className,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
            let errorMessage = "An error occurred while restoring the item";
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
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-white dark:bg-[#0B0B0F] border border-white/10",
                    className
                )}
            >
                <ModalHeader className="pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
                    <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center md:text-2xl text-foreground">
                        Restore Maintenance Item
                    </ModalTitle>
                </ModalHeader>

                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="flex items-center justify-center"
                    >
                        <div className="flex items-center justify-center text-white rounded-full bg-primary w-16 md:w-11 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-11 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24!">
                            <AiFillThunderbolt className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
                        </div>
                    </motion.div>

                    <div className="text-center px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8!">
                        <p className="text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-base-color">
                            Are you sure you want to restore <span className="font-bold">"{item?.name}"</span>?
                        </p>
                    </div>

                    {error && (
                        <div className="w-full p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}
                </div>

                <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
                    <Button
                        variant="ghost"
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="px-8 py-2 lg:px-16 md:py-3 rounded-xl bg-transparent border border-nav-highlight/15 text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-60"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-8 py-2 md:px-16 md:py-3 rounded-xl bg-primary"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Restore"
                        )}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
