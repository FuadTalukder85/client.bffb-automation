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
import { Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function CreateVersionModal({
    open,
    onOpenChange,
    onConfirm,
    className,
    isLoading = false,
}) {
    const [error, setError] = useState(null);

    const handleClose = (isOpen) => {
        if (!isLoading) {
            onOpenChange(isOpen);
            setError(null);
        }
    };

    const handleConfirm = async () => {
        setError(null);
        try {
            await onConfirm();
            handleClose(false);
        } catch (err) {
            setError(err.message || "An error occurred while creating a new version");
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[400px] lg:max-w-[320px] xl:max-w-[425px] 2xl:max-w-[480px] 3xl:max-w-[600px] gap-0 px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-4 lg:py-4.5 xl:py-5.5 2xl:py-6.5 3xl:py-8 rounded-xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl",
                    className
                )}
            >
                <ModalHeader className="pb-3 lg:pb-3 xl:pb-4 2xl:pb-5 3xl:pb-6">
                    <ModalTitle className="text-xs lg:text-xs xl:text-sm 2xl:text-lg 3xl:text-xl font-bold text-center text-base-color">
                        Create New Version
                    </ModalTitle>
                </ModalHeader>

                <div className="flex flex-col items-center space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        className="flex items-center justify-center w-16 lg:w-10.5 xl:w-14 2xl:w-16 3xl:w-20 h-16 lg:h-10.5 xl:h-14 2xl:h-16 3xl:h-20 text-white rounded-full bg-primary"
                    >
                        <Save className="w-6 lg:w-5.5 xl:w-7 2xl:w-8 3xl:w-10 h-6 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10" />
                    </motion.div>

                    <div className="flex flex-col items-center gap-3 text-center">
                        <p className="px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-base-color">
                            Are you sure you want to create a new version of the recipe?
                        </p>
                        <div className="flex flex-col gap-1 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 px-2">
                           <p className="text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-xs text-lighter-text leading-relaxed">
                                Your current recipe will remain unchanged.
                                <br />
                                A new version will be created using the content of the latest version.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full p-3 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50 text-center">
                            {error}
                        </div>
                    )}
                </div>

                <ModalFooter className="flex flex-row justify-center gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 mt-4 lg:mt-5 xl:mt-6 2xl:mt-7 3xl:mt-8">
                    <Button
                        intent="outline"
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="flex-1 h-9 lg:h-6 xl:h-7.5 2xl:h-9 3xl:h-11 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold rounded-xl border-nav-highlight/20 text-nav-highlight hover:bg-primary-shade-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="primary"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 h-9 lg:h-6 xl:h-7.5 2xl:h-9 3xl:h-11 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-3 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 h-3 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 mr-2 animate-spin" />
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
