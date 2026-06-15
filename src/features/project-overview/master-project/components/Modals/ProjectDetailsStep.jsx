import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input.jsx";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { Select } from "@/components/ui/Select/Select";
import { purposeOptions, objectiveOptions } from "../../constants/projectOptions";
import { cn } from "@/lib/utils";

export function ProjectDetailsStep({
    register,
    errors,
    raisedDate,
    setRaisedDate,
    control,
    autoObjectiveEnabled = false,
}) {
    return (
        <div className="grid gap-2 py-1">
            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Raised Date <span className="text-red-500">*</span>
                </label>
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
                            className="w-full"
                        />
                    )}
                />
                {errors.raisedDate && (
                    <span className="text-red-500 text-xs font-medium mt-0.5 block">
                        {errors.raisedDate.message}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Raised By <span className="text-red-500">*</span>
                </label>
                <Input
                    {...register("raisedBy", { required: "Raised by is required" })}
                    placeholder="Sensory"
                    className="rounded-md"
                    inputClassName="placeholder:text-xs text-xs"
                />
                {errors.raisedBy && (
                    <span className="text-red-500 text-xs font-medium mt-0.5 block">
                        {errors.raisedBy.message}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Project Title <span className="text-red-500">*</span>
                </label>
                <Input
                    {...register("projectTitle", { required: "Title is required" })}
                    placeholder="Peanut Butter Cake Bar"
                    className="rounded-md"
                    inputClassName="placeholder:text-xs text-xs"
                    error={errors.projectTitle?.message}
                />
                {errors.projectTitle && (
                    <span className="text-red-500 text-xs font-medium mt-0.5 block">
                        {errors.projectTitle.message}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Purpose
                </label>
                <Controller
                    name="purpose"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Select
                            options={purposeOptions}
                            placeholder="Select Purpose"
                            className="w-full h-9 rounded-md"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Purpose Name
                </label>
                <Input
                    {...register("purposeDetails")}
                    placeholder="Cake Promo V1 2025"
                    className="rounded-md"
                    inputClassName="placeholder:text-xs text-xs"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Objective
                </label>
                <Controller
                    name="objective"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Select
                            options={objectiveOptions}
                            placeholder={autoObjectiveEnabled ? "Auto-selected from Purpose" : "Select Objective"}
                            className="w-full h-9 rounded-md"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={autoObjectiveEnabled}
                        />
                    )}
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Objective Details
                </label>
                <Input
                    {...register("objectiveDetails")}
                    placeholder="Peanut Butter Cake Bar"
                    className="rounded-md"
                    inputClassName="placeholder:text-xs text-xs"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Target Cost
                </label>
                <Input
                    {...register("targetCost")}
                    placeholder="৳ 9,99,99,99,999.99"
                    className="rounded-md"
                    inputClassName="placeholder:text-xs text-xs"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-normal text-lighter-text">
                    Brief
                </label>
                <Input
                    type="textarea"
                    {...register("projectBrief")}
                    placeholder="Make low cost Peanut Butter Cake Bar. Lorem Ipsum is simply dummy text of the printing and typesetting"
                    className="rounded-md"
                    inputClassName="placeholder:text-xs text-xs min-h-[80px]"
                />
            </div>
        </div>
    );
}
