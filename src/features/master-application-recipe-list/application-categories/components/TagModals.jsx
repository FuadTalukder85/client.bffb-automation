import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input.jsx";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/utils/apiError";
import { Plus, Loader2 } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { motion } from "framer-motion";

export function TagModal({
    open,
    onOpenChange,
    tag,
    onConfirm,
    mode = "create",
    className,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (tag && mode === "update") {
            reset({
                name: tag.name,
            });
        } else {
            reset({
                name: "",
            });
        }
        setError(null);
    }, [tag, mode, reset, open]);

    const handleClose = (isOpen) => {
        if (!isLoading) {
            onOpenChange(isOpen);
            setError(null);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(data);
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while saving the tag"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[500px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 rounded-2xl",
                    className
                )}
            >
                <ModalHeader className="mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
                    <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
                        {mode === "create" ? "Create Tag" : "Update Tag"}
                    </ModalTitle>
                    <ModalDescription className="sr-only">
                        {mode === "create" ? "Create a new tag" : "Update an existing tag"}
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4">
                    {/* Tag Name Input */}
                    <div className="space-y-1">
                        <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color leading-none">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Tag Name <span className="text-red-500">*</span>
                            </p>
                        </label>
                        <Input
                            {...register("name", { required: "Name is required" })}
                            placeholder="Enter tag name"
                            className="w-full text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border rounded-lg border-table-stroke focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            error={errors.name?.message}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    {/* Form validation errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            Please fill in all required fields.
                        </div>
                    )}

                    <ModalFooter className="flex-row gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 mt-6 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
                        <Button
                            type="button"
                            intent="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full border-table-stroke sm:w-1/2 text-base-color "
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            intent="primary"
                            disabled={isLoading}
                            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {mode === "create" ? "Creating..." : "Saving..."}
                                </>
                            ) : (
                                mode === "create" ? "Create Tag" : "Save Changes"
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export function ArchiveTagModal({
    open,
    onOpenChange,
    tag,
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
        if (!tag) return;

        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(tag);
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while archiving the tag"));
        } finally {
            setIsLoading(false);
        }
    };

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
                        Archive Tag
                    </ModalTitle>
                </ModalHeader>

                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                        className="flex items-center justify-center w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-white rounded-full bg-primary"
                    >
                        <svg className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                    </motion.div>

                    {/* Description */}
                    <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-base-color">
                        Archiving this tag will remove it from the system. This action cannot be undone.
                    </p>

                    {/* Error message */}
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
                        className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-base-color hover:bg-primary-shade-2 disabled:opacity-50"
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
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

export function RestoreTagModal({
    open,
    onOpenChange,
    tag,
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
        if (!tag) return;

        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(tag);
            handleClose(false);
        } catch (err) {
            // Handle structured API errors
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.errors) {
                    // Field-specific errors (e.g., duplicate entry)
                    const fieldErrors = Object.values(errorData.errors);
                    setError(fieldErrors[0] || errorData.message || "An error occurred while restoring the tag");
                } else if (errorData.message) {
                    setError(errorData.message);
                } else {
                    setError("An error occurred while restoring the tag");
                }
            } else {
                setError(err.message || "An error occurred while restoring the tag");
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
                        Restore Tag
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
                            Are you sure you want to restore this tag?
                        </span>
                        <br />
                        Make sure to only perform this function with proper authorization.
                    </p>

                    {/* Error message */}
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


