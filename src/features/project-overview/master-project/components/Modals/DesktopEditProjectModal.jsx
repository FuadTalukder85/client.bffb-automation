import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input.jsx";
import { Select } from "@/components/ui/Select/Select";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { purposeOptions, objectiveOptions } from "../../shared/constants/projectOptions";

function DesktopProjectDetailsStep({ register, errors, raisedDate, setRaisedDate, control }) {
    const inputClass = "placeholder:text-sm text-sm h-11";
    const wrapperClass = "rounded-lg bg-primary-shade-2/10 border-0";

    return (
        <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                <div className="flex flex-col gap-0">
                    <label className="text-base font-normal text-lighter-text">Raised Date <span className="text-red-500">*</span></label>
                    <Controller
                        name="raisedDate"
                        control={control}
                        rules={{ required: "Raised date is required" }}
                        render={({ field }) => (
                            <DatePicker
                                id="raisedDate"
                                value={field.value || ""}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setRaisedDate(e.target.value);
                                }}
                                placeholder="Select date"
                                className={`${wrapperClass} w-full h-11 bg-primary-shade-2`}
                                inputClassName={inputClass}
                            />
                        )}
                    />
                    {errors.raisedDate && (
                        <span className="text-red-500 font-medium text-sm mt-0.5">
                            {errors.raisedDate.message}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-lighter-text">Purpose Name</label>
                    <Input
                        {...register("purposeDetails")}
                        placeholder="Cake Promo V1 2025"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-lighter-text">
                        Raised By <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...register("raisedBy", { required: "Raised by is required" })}
                        placeholder="Sensory"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                    {errors.raisedBy && (
                        <span className="text-red-500 font-medium text-sm mt-0.5">
                            {errors.raisedBy.message}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-0">
                    <label className="text-base font-normal text-lighter-text">Objective</label>
                    <Select
                        name="objective"
                        options={objectiveOptions}
                        placeholder="Select Objective"
                        className={`${wrapperClass} w-full h-11 bg-primary-shade-2`}
                        {...register("objective")}
                        inputClassName={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-lighter-text">
                        Project Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...register("projectTitle", { required: "Title is required" })}
                        placeholder="Peanut Butter Cake Bar"
                        className={wrapperClass}
                        inputClassName={inputClass}
                        error={errors.projectTitle?.message}
                    />
                    {errors.projectTitle && (
                        <span className="text-red-500 font-medium text-sm mt-0.5">
                            {errors.projectTitle.message}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-lighter-text">Objective Details</label>
                    <Input
                        {...register("objectiveDetails")}
                        placeholder="Peanut Butter Cake Bar"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-0">
                    <label className="text-base font-normal text-lighter-text">Purpose</label>
                    <Select
                        name="purpose"
                        options={purposeOptions}
                        placeholder="Select Purpose"
                        className={`${wrapperClass} w-full h-11 bg-primary-shade-2`}
                        {...register("purpose")}
                        inputClassName={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-lighter-text">Target Cost</label>
                    <Input
                        {...register("targetCost")}
                        placeholder="৳ 9,99,99,99,999.99"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-base font-normal text-lighter-text">Brief</label>
                <Input
                    type="textarea"
                    {...register("projectBrief")}
                    placeholder="Make low cost Peanut Butter Cake Bar. Lorem Ipsum is simply dummy text..."
                    className={wrapperClass}
                    inputClassName={`${inputClass} min-h-[120px]`}
                />
            </div>
        </div>
    );
}

export function DesktopEditProjectModal({
    open,
    onOpenChange,
    project,
    onConfirm,
    className
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [raisedDate, setRaisedDate] = useState("");
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (project && open) {
            const projectData = {
                projectTitle: project.masterProject?.title || "",
                projectBrief: project.masterProject?.brief || "",
                purpose: project.masterProject?.purpose || "",
                purposeDetails: project.masterProject?.purposeDetails || "",
                objective: project.masterProject?.objective || "",
                objectiveDetails: project.masterProject?.objectiveDetails || "",
                raisedBy: project.masterProject?.raisedBy || "",
                targetCost: project.masterProject?.targetCost || "",
                raisedDate: project.masterProject?.raisedDate || "",
            };
            reset(projectData);
            setRaisedDate(project.masterProject?.raisedDate || "");
        }
        setError(null);
    }, [project, open, reset]);

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
            const formData = {
                ...data,
                raisedDate: data.raisedDate
            };
            await onConfirm(formData);
            handleClose(false);
        } catch (err) {
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.errors) {
                    const fieldErrors = Object.values(errorData.errors);
                    setError(fieldErrors[0] || errorData.message || "An error occurred while saving the project");
                } else if (errorData.message) {
                    setError(errorData.message);
                } else {
                    setError("An error occurred while saving the project");
                }
            } else {
                setError(err.message || "An error occurred while saving the project");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "sm:max-w-[1000px] p-0 overflow-hidden gap-0 rounded-2xl",
                    className
                )}
            >
                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <ModalHeader className="mb-6 p-0">
                        <ModalTitle className="text-2xl font-bold text-center">
                            Update Project
                        </ModalTitle>
                    </ModalHeader>

                    {error && (
                        <div className="p-2.5 mb-3 text-xs text-red-600 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DesktopProjectDetailsStep
                            register={register}
                            errors={errors}
                            raisedDate={raisedDate}
                            setRaisedDate={setRaisedDate}
                            control={control}
                        />

                        <ModalFooter className="flex justify-end gap-3 mt-7 p-0">
                            <Button
                                type="button"
                                intent="outline"
                                onClick={() => handleClose(false)}
                                disabled={isLoading}
                                className="px-7 h-10 border-primary/20 text-primary  dark:hover:bg-purple-900/20 rounded-lg text-base font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-9 h-10 bg-[#482D79] hover:bg-[#3b2366] text-white rounded-lg text-base font-medium flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </form>
                </div>
            </ModalContent>
        </Modal>
    );
}
