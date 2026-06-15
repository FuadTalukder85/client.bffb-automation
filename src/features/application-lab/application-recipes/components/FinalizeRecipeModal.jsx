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
import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function FinalizeRecipeModal({
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
            setError(err.message || "An error occurred while finalizing the recipe");
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "sm:max-w-[400px] md:max-w-[500px] gap-0 px-5 py-5 rounded-2xl",
                    className
                )}
            >
                <ModalHeader className="">
                    <ModalTitle className="text-lg font-semibold text-center text-base-color">
                        Finalize Recipe
                    </ModalTitle>
                </ModalHeader>

                <div className="flex flex-col items-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        className="flex items-center justify-center w-20 h-20 text-white rounded-full bg-primary"
                    >
                        <CheckCircle className="w-10 h-10" />
                    </motion.div>

                    <div className="flex flex-col items-center gap-3">
                        <p className="px-4 text-sm font-semibold text-center text-base-color">
                            Are you sure you want to finalize this recipe?
                        </p>
                        <div className="flex flex-col gap-2">
                           <p className="px-6 text-xs text-center text-lighter-text leading-relaxed">
                                Once you have finalized the recipe, you will no longer be able to make changes to this version of the recipe.
                            </p>
                            <p className="px-6 text-[10px] italic text-center text-lighter-text/60">
                                Make sure to only perform this function with proper authorization.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="w-full p-3 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}
                </div>

                <ModalFooter className="flex flex-row gap-5 mt-4 text-xs sm:justify-between h-9">
                    <Button
                        intent="outline"
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="w-full sm:w-1/2 border-table-stroke text-base-color"
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="primary"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Finalizing...
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
