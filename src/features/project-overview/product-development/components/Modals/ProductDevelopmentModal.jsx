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
import { Loader2 } from "lucide-react";

export function ProductDevelopmentModal({
    open,
    onOpenChange,
    project,
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
        if (project && mode === "update") {
            reset({
                projectTitle: project.productDevelopment?.title || "",
                projectBrief: project.productDevelopment?.brief || "",
                purpose: project.productDevelopment?.purpose || "",
                purposeDetails: project.productDevelopment?.purposeDetails || "",
                objective: project.productDevelopment?.objective || "",
                objectiveDetails: project.productDevelopment?.objectiveDetails || "",
                raisedBy: project.productDevelopment?.raisedBy || "",
                raisedDate: project.productDevelopment?.raisedDate || "",
            });
        } else {
            reset({
                projectTitle: "",
                projectBrief: "",
                purpose: "",
                purposeDetails: "",
                objective: "",
                objectiveDetails: "",
                raisedBy: "",
                raisedDate: "",
            });
        }
        setError(null);
    }, [project, mode, reset, open]);

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
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.errors) {
                    const fieldErrors = Object.values(errorData.errors);
                    setError(fieldErrors[0] || errorData.message || "An error occurred while saving the product development");
                } else if (errorData.message) {
                    setError(errorData.message);
                } else {
                    setError("An error occurred while saving the product development");
                }
            } else {
                setError(err.message || "An error occurred while saving the product development");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "sm:max-w-[600px] gap-0 px-5 py-5 rounded-2xl max-h-[90vh] overflow-y-auto",
                    className
                )}
            >
                <ModalHeader className="mb-4">
                    <ModalTitle className="text-lg font-semibold text-center">
                        {mode === "create" ? "Create Product Development" : "Update Product Development"}
                    </ModalTitle>
                    <ModalDescription className="sr-only">
                        {mode === "create" ? "Create a new product development" : "Update an existing product development"}
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Project Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            {...register("projectTitle", { required: "Title is required" })}
                            placeholder="Enter project title"
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            error={errors.projectTitle?.message}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Brief Description
                        </label>
                        <textarea
                            {...register("projectBrief")}
                            placeholder="Enter brief description"
                            rows={3}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Purpose
                        </label>
                        <Input
                            {...register("purpose")}
                            placeholder="Enter purpose"
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Purpose Details
                        </label>
                        <textarea
                            {...register("purposeDetails")}
                            placeholder="Enter purpose details"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Objective
                        </label>
                        <Input
                            {...register("objective")}
                            placeholder="Enter objective"
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Objective Details
                        </label>
                        <textarea
                            {...register("objectiveDetails")}
                            placeholder="Enter objective details"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Raised By
                        </label>
                        <Input
                            {...register("raisedBy")}
                            placeholder="Enter name of the person who raised the product development"
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-base-color">
                            Raised Date
                        </label>
                        <Input
                            type="date"
                            {...register("raisedDate")}
                            className="w-full px-3 py-2 text-sm border rounded-lg border-table-stroke bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            Please fill in all required fields.
                        </div>
                    )}

                    <ModalFooter className="flex-row gap-4 mt-6 text-xs sm:justify-between h-9">
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
                                mode === "create" ? "Create Product Development" : "Save Changes"
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}