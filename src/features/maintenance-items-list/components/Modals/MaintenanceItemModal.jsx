import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";

export function MaintenanceItemModal({
    open,
    onOpenChange,
    item,
    onConfirm,
    mode = "create",
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const departmentValue = watch("department");

    useEffect(() => {
        if (item && mode === "update") {
            reset({
                maintenanceItemName: item.maintenanceItemName || item.name || "",
                department: item.department || "",
            });
        } else {
            reset({
                maintenanceItemName: "",
                department: "",
            });
        }
        setError(null);
    }, [item, mode, reset, open]);

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
            setError(err.message || "An error occurred while saving the item");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className="max-w-[500px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 rounded-2xl">
                <ModalHeader className="mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
                    <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
                        {mode === "create" ? "Add Maintenance Item" : "Edit Maintenance Item"}
                    </ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4 py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4">
                    <div className="space-y-2">
                        <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium leading-none">
                            <p className="mt-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Item Name
                            </p>
                        </label>
                        <Input
                            {...register("maintenanceItemName", { required: "Item name is required" })}
                            placeholder="Enter item name"
                            className="w-full text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
                            error={errors.maintenanceItemName?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium leading-none">
                            <p className="mt-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Department (Optional)</p>
                        </label>
                        <Input
                            {...register("department")}
                            placeholder="Enter department name"
                            className="w-full text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
                            error={errors.department?.message}
                        />
                    </div>

                    {error && (
                        <div className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500 bg-red-50 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 rounded border border-red-200">
                            {error}
                        </div>
                    )}

                    <ModalFooter className="flex-row gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 pt-4 sm:justify-between text-foreground">
                        <Button
                            type="button"
                            intent="outline"
                            variant="ghost"
                            onClick={() => handleClose(false)}
                            disabled={isLoading}
                            className="w-full sm:w-1/2"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-1/2">
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : mode === "create" ? (
                                "Add Item"
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
