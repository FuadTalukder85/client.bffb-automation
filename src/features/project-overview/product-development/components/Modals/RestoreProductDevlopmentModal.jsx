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

export function RestoreProductDevelopmentModal({
    open,
    onOpenChange,
    project,
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
        if (!project) return;

        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(project);
            handleClose(false);
        } catch (err) {
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.errors) {
                    const fieldErrors = Object.values(errorData.errors);
                    setError(fieldErrors[0] || errorData.message || "An error occurred while restoring the product development");
                } else if (errorData.message) {
                    setError(errorData.message);
                } else {
                    setError("An error occurred while restoring the product development");
                }
            } else {
                setError(err.message || "An error occurred while restoring the product development");
            }
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
                        Restore Product Development
                    </ModalTitle>
                </ModalHeader>

                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="flex items-center justify-center"
                    >
                        <div className="flex items-center justify-center text-white rounded-full shadow-lg bg-invite-status-text shadow-purple-900/20 w-16 md:w-11 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-11 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24!">
                            <AiFillThunderbolt className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
                        </div>
                    </motion.div>

                    <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">
                            Are you sure you want to restore this product development?
                        </span>
                        <br />
                        Make sure to only perform this function with proper authorization.
                    </p>

                    {error && (
                        <div className="w-full p-3 text-sm lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}
                </div>

                <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
                    <Button
                        intent="outline"
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-foreground rounded-xl disabled:opacity-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="primary"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-white bg-invite-status-text hover:bg-[#452278] border border-invite-status-text rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Restoring...
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