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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select/Select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import FieldError from "@/components/Error/field-error";
import { usePackagingTypes } from "@/hooks/usePackagingTypes";
import { useRecipes } from "@/hooks/useRecipes";

const packagingStatusOptions = [
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Paused", value: "Paused" },
    { label: "Cancelled", value: "Cancelled" },
];

export function SampleModal({
    open,
    onOpenChange,
    sample,
    onConfirm,
    mode = "create",
    projectId,
    className,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch packaging types and recipes (restrict recipes to current project so options don't include unrelated items)
    const { data: packagingTypesData, isLoading: packagingTypesLoading } = usePackagingTypes({ status: "active" });
    const { data: recipesData, isLoading: recipesLoading } = useRecipes({ isActive: "true", project: projectId });

    const packagingTypeOptions = (packagingTypesData?.data || []).map(pt => ({
        label: pt.name,
        value: pt.id
    }));

    const recipeOptions = (recipesData?.data || []).map(recipe => ({
        label: `${recipe.recipeCode} ${recipe.name}`,
        value: recipe._id
    }));

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const watchPackagingStatus = watch("packagingStatus");
    const watchPackagingType = watch("packageType");
    const watchRecipe = watch("recipe");
    const watchBatchSize = watch("batchSize");

    // find selected recipe object for yield display
    const selectedRecipe = recipesData?.data?.find(r => r._id === watchRecipe);

    useEffect(() => {
        if (sample) {
            reset({
                recipe: sample.recipe?._id || sample.recipe || "",
                batchSize: sample.batchSize || "",
                output: sample.output || "",
                packagingStatus: sample.packagingStatus || "",
                packageType: sample.packageType?._id || sample.packageType || "",
                perPackQuantity: sample.perPackQuantity || "",
            });
        } else {
            reset({
                recipe: "",
                batchSize: "",
                output: "",
                packagingStatus: "",
                packageType: "",
                perPackQuantity: "",
            });
        }
        setError(null);
    }, [sample, mode, reset, open]);

    const handleClose = (isOpen) => {
        if (!isLoading) {
            onOpenChange(isOpen);
            reset();
            setError(null);
        }
    };

    // calculate output automatically when recipe or batchSize changes
    useEffect(() => {
        const batch = parseFloat(watchBatchSize);
        if (!watchRecipe || isNaN(batch) || !recipesData?.data) return;
        const rec = recipesData.data.find(r => r._id === watchRecipe);
        if (rec && rec.outputYield != null) {
            const yieldPct = parseFloat(rec.outputYield);
            if (!isNaN(yieldPct)) {
                const computed = (batch * yieldPct) / 100;
                // only update if differs to avoid infinite loop
                setValue("output", computed ? computed.toFixed(2) : "");
            }
        }
    }, [watchRecipe, watchBatchSize, recipesData, setValue]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            // Transform form data to match API expectations
            const transformedData = {
                project: projectId,
                packageType: data.packageType,
                recipe: data.recipe,
                batchSize: parseFloat(data.batchSize),
                output: parseFloat(data.output),
                perPackQuantity: parseFloat(data.perPackQuantity),
                ...(data.packagingStatus && { packagingStatus: data.packagingStatus }),
            };

            await onConfirm(transformedData);
            handleClose(false);
        } catch (err) {
            setError(err.message || `An error occurred while ${mode === "create" ? "adding" : "updating"} the sample`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[400px] lg:max-w-[215px] xl:max-w-[285px] 2xl:max-w-[320px] 3xl:max-w-[400px] gap-0 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 py-6 lg:py-2 xl:py-3 2xl:py-4 3xl:py-6  rounded-2xl",
                    className
                )}
            >
                <ModalHeader className="mb-4 lg:mb-1 xl:mb-2 2xl:mb-3 3xl:mb-4">
                    <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center text-nav-highlight">
                        {mode === "create" ? "Add Sample" : "Edit Sample"}
                    </ModalTitle>
                </ModalHeader>

                <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-0 xl:space-y-2 2xl:space-y-3 3xl:space-y-4">
                        {error && (
                            <div className="p-3 lgp-1 xl:p-1.5 2xl:p-2 3xl:p-3 lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                                {error}
                            </div>
                        )}

                        {/* Recipe Select */}
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-nav-highlight"><p className="my-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Recipe</p></label>
                            <Controller
                                name="recipe"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={recipeOptions}
                                        searchable={true}
                                        placeholder={recipesLoading ? "Loading recipes..." : "Select Recipe"}
                                        disabled={recipesLoading}
                                        className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs"
                                    />
                                )}
                            />
                            {errors.recipe && <FieldError error="Recipe is required" />}
                        </div>

                        {/* Batch Size Input */}
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-nav-highlight"><p className="my-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Batch Size</p></label>
                            <Input
                                {...register("batchSize", { required: true })}
                                type="number"
                                placeholder="0"
                                rightIcon={<span className="flex items-center text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-bold text-nav-highlight pr-2">g</span>}
                                className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary"
                                inputClassName="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
                                disabled={!watchRecipe}
                            />
                            {errors.batchSize && <FieldError error="Batch Size is required" />}
                        </div>
                        {selectedRecipe && selectedRecipe.outputYield != null && (
                          <p className="text-xs text-muted-foreground ml-1">
                            Yield: {selectedRecipe.outputYield}%
                          </p>
                        )}

                        {/* Output Input */}
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-nav-highlight"><p className="my-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Output</p></label>
                            <Input
                                {...register("output", { required: true })}
                                type="number"
                                placeholder="0"
                                rightIcon={<span className="flex items-center text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-bold text-nav-highlight pr-2">g</span>}
                                className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary"
                                inputClassName="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
                                disabled={!watchRecipe}
                                readOnly={!!selectedRecipe?.outputYield}
                            />
                            {errors.output && <FieldError error="Output is required" />}
                        </div>

                        {/* Packaging Status Select */}
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-nav-highlight"><p className="my-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Packaging Status</p></label>
                            <Controller
                                name="packagingStatus"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={packagingStatusOptions}
                                        placeholder="Select Status"
                                        className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
                                        disabled={!watchRecipe}
                                    />
                                )}
                            />
                        </div>

                        {/* Packaging Type Select */}
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-nav-highlight"><p className="my-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Packaging Type</p></label>
                            <Controller
                                name="packageType"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={packagingTypeOptions}
                                        searchable={true}
                                        placeholder={packagingTypesLoading ? "Loading packaging types..." : "Select Type"}
                                        disabled={packagingTypesLoading || !watchRecipe}
                                        className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
                                    />
                                )}
                            />
                            {errors.packageType && <FieldError error="Packaging Type is required" />}
                        </div>

                        {/* Per Pack Quantity Input */}
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-nav-highlight"><p className="my-1 lg:my-[2px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Per Pack Quantity</p></label>
                            <Input
                                {...register("perPackQuantity")}
                                type="number"
                                placeholder="-"
                                rightIcon={<span className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-bold text-nav-highlight pr-2">g</span>}
                                className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
                                inputClassName="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
                                disabled={!watchRecipe}
                            />
                        </div>
                    </form>
                </div>

                <ModalFooter className="flex flex-row justify-center gap-4 mt-6 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
                    <Button
                        type="button"
                        intent="outline"
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="flex-1 max-w-[140px] lg:max-w-[75px] xl:max-w-[100px] 2xl:max-w-[112px] 3xl:max-w-[140px] text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs border-table-stroke text-nav-highlight hover:bg-primary-shade-2 rounded-md font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        intent="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="flex-1 max-w-[140px] lg:max-w-[75px] xl:max-w-[100px] 2xl:max-w-[112px] 3xl:max-w-[140px] text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs bg-primary hover:bg-primary/90 text-white rounded-md font-medium"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin font-medium" />
                        ) : mode === "create" ? (
                            "Add"
                        ) : (
                            "Confirm"
                        )}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
