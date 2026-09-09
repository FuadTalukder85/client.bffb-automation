import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DeleteIngredientModal({
    open,
    onOpenChange,
    ingredient,
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
            await onConfirm?.(ingredient);
            handleClose(false);
        } catch (err) {
            setError(err?.message || "An error occurred while deleting the ingredient");
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[480px] p-8 rounded-[28px] bg-white dark:bg-[#121019] shadow-2xl border border-border/50",
                    className
                )}
            >
                <div className="flex flex-col gap-4 text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Are you sure?
                    </h2>

                    <div className="space-y-3 pt-1">
                        <p className="text-base text-gray-800 dark:text-gray-200 font-medium leading-snug">
                            Upon confirmation, the ingredient will be removed from the table. This action is irreversible.
                        </p>
                        <p className="text-xs text-gray-400 font-normal">
                            Make sure to only perform this function with proper authorization <span className="text-red-500">*</span>
                        </p>
                    </div>

                    {error && (
                        <div className="w-full p-3 text-xs text-red-600 border border-red-200 rounded-xl bg-red-50">
                            {error}
                        </div>
                    )}
                </div>

                <ModalFooter className="flex flex-row justify-between gap-4 mt-8 pt-0">
                    <Button
                        type="button"
                        intent="outline"
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="flex-1 h-12 text-sm font-bold rounded-xl border-[#D7CEF0] dark:border-primary/40 text-primary dark:text-purple-300 hover:bg-primary-shade-2 bg-transparent cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        intent="primary"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 h-12 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
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
