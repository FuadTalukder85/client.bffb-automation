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
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { cn } from "@/lib/utils";
import { Archive, Loader2 } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/utils/apiError";
import { PRODUCT_SEGMENTS, PRODUCT_TYPES } from "@/hooks/useBFFProductCodes";

export function ProductCodeModal({
    open,
    onOpenChange,
    productCode,
    onConfirm,
    mode = "create", // "create" | "update"
    defaultSegment = null, // Pre-select segment when creating from a specific tab
    className,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const selectedType = watch("type");
    const isCommercialized = watch("isCommercialized");
    const isCommercializedLocked = mode === "update" && Boolean(productCode?.commercializedProductCode);

    useEffect(() => {
        if (productCode && mode === "update") {
            const commercializedValue =
                productCode.commercializedProductCode &&
                    String(productCode.commercializedProductCode).trim().toLowerCase() !== "null" &&
                    String(productCode.commercializedProductCode).trim().toLowerCase() !== "undefined"
                    ? productCode.commercializedProductCode
                    : "";

            reset({
                productCode: productCode.productCode,
                commercializedProductCode: commercializedValue,
                isCommercialized: Boolean(commercializedValue),
                name: productCode.name,
                segment: productCode.segment,
                type: productCode.type,
                cost: productCode.cost,
                remarks: productCode.remarks || "",
            });
        } else {
            reset({
                productCode: "",
                commercializedProductCode: "",
                isCommercialized: false,
                name: "",
                segment: defaultSegment || "",
                type: "",
                cost: "",
                remarks: "",
            });
        }

        setError(null);
    }, [productCode, mode, reset, open, defaultSegment]);

    const handleClose = (isOpen) => {
        if (!isLoading) {
            onOpenChange(isOpen);
            setError(null);
        }
    };

    const normalizeCommercializedProductCode = (value) => {
        const normalized = String(value || "").trim();
        if (normalized.length === 0) return null;
        const lower = normalized.toLowerCase();
        if (lower === "null" || lower === "undefined") return null;
        return normalized;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            // Convert cost to number
            const submitData = {
                ...data,
                cost: parseFloat(data.cost),
                commercializedProductCode: data.isCommercialized
                    ? normalizeCommercializedProductCode(data.commercializedProductCode)
                    : null,
            };
            await onConfirm(submitData);
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while saving the product code"));
        } finally {
            setIsLoading(false);
        }
    };

    const getUnitLabel = () => "Price per kg";

    // Helper to get segment display name
    const getSegmentLabel = (segmentValue) => {
        const entry = Object.entries(PRODUCT_SEGMENTS).find(([, value]) => value === segmentValue);
        return entry ? entry[0].charAt(0) + entry[0].slice(1).toLowerCase() : segmentValue;
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
                        {mode === "create" ? "Add Product Code" : "Edit Product Code"}
                    </ModalTitle>
                    <ModalDescription className="sr-only">
                        {mode === "create" ? "Create a new product code" : "Update an existing product code"}
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 py-1 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
                    {/* Product Code Input */}
                    <div className="space-y-1">
                        <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                Experimental Product Code {(!isCommercialized && mode === "create") && <span className="text-red-500">*</span>}
                            </p>
                        </label>
                        <Input
                            {...register("productCode", {
                                required: !isCommercialized ? "Experimental product code is required" : false,
                            })}
                            placeholder="Enter product code (e.g., FLV001)"
                            className="h-8 border-none rounded-md"
                            inputClassName="placeholder:text-xs text-xs lg:placeholder:text-[8px] lg:text-[8px] xl:placeholder:text-[10px] xl:text-[10px] 2xl:placeholder:text-xs 2xl:text-xs 3xl:placeholder:text-sm 3xl:text-sm"
                        />
                        {errors.productCode && (
                            <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500">{errors.productCode.message}</p>
                        )}
                    </div>

                    {/* Commercialized Toggle */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                                Commercialized?
                            </p>
                            <div className={cn("inline-flex items-center gap-3", isCommercializedLocked ? "opacity-50" : "")}>
                                <label className="relative inline-flex h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 items-center rounded-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register("isCommercialized")}
                                        className="sr-only peer"
                                        disabled={isCommercializedLocked}
                                        aria-label="Commercialized"
                                    />
                                    <span className="h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 w-12 lg:w-6 xl:w-8 2xl:w-10 3xl:w-12 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-primary dark:bg-slate-700" />
                                    <span className="pointer-events-none absolute left-[3px] top-1 lg:top-[3px] xl:top-[3px] 2xl:top-[3px] 3xl:top-1 h-5 lg:h-2 xl:h-3.5 2xl:h-4 3xl:h-5 w-5 lg:w-2 xl:w-3.5 2xl:w-4 3xl:w-5 rounded-full bg-white border border-border shadow-sm transition-transform duration-200 peer-checked:translate-x-5 lg:peer-checked:translate-x-2.5 xl:peer-checked:translate-x-3 2xl:peer-checked:translate-x-4 3xl:peer-checked:translate-x-5" />
                                </label>
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium leading-none text-base-color">
                                    {isCommercialized ? "Yes" : "No"}
                                </span>
                            </div>
                        </div>
                        {isCommercializedLocked && (
                            <p className="text-[11px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">
                                Commercialized status is locked for this product code.
                            </p>
                        )}
                    </div>

                    {isCommercialized && (
                        <div className="space-y-1">
                            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                    Commercialized Product Code <span className="text-red-500">*</span>
                                </p>
                            </label>
                            <Input
                                {...register("commercializedProductCode", {
                                    validate: (value) =>
                                        isCommercialized
                                            ? (value || "").trim().length > 0 || "Commercialized product code is required"
                                            : true,
                                })}
                                placeholder="Enter commercialized product code"
                                className="h-8 border-none rounded-md"
                                inputClassName="placeholder:text-xs text-xs lg:placeholder:text-[8px] lg:text-[8px] xl:placeholder:text-[10px] xl:text-[10px] 2xl:placeholder:text-xs 2xl:text-xs 3xl:placeholder:text-sm 3xl:text-sm"
                            />
                            {errors.commercializedProductCode && (
                                <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500">{errors.commercializedProductCode.message}</p>
                            )}
                        </div>
                    )}

                    {/* Product Name Input */}
                    <div className="space-y-1">
                        <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                Product Name <span className="text-red-500">*</span>
                            </p>
                        </label>
                        <Input
                            {...register("name", { required: "Product name is required" })}
                            placeholder="Enter product name"
                            className="h-8 border-none rounded-md"
                            inputClassName="placeholder:text-xs text-xs lg:placeholder:text-[8px] lg:text-[8px] xl:placeholder:text-[10px] xl:text-[10px] 2xl:placeholder:text-xs 2xl:text-xs 3xl:placeholder:text-sm 3xl:text-sm"
                        />
                        {errors.name && (
                            <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Segment Select or Display */}
                    <div className="space-y-1">
                        <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                Product Segment {mode === "create" && <span className="text-red-500">*</span>}
                            </p>
                        </label>
                        {mode === "update" ? (
                            <div className="flex items-center">
                                <span className="px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-0.5 xl:py-1 2xl:py-1 3xl:py-1.5 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-nav-highlight bg-primary-shade-2 rounded-full">
                                    {getSegmentLabel(productCode?.segment)}
                                </span>
                                <input type="hidden" {...register("segment")} />
                            </div>
                        ) : (
                            <>
                                <AccordionSelect
                                    id="segment"
                                    value={watch("segment")}
                                    onChange={(e) => {
                                        setValue("segment", e.target.value);
                                    }}
                                    options={Object.entries(PRODUCT_SEGMENTS).map(([key, value]) => ({
                                        value: value,
                                        label: key.charAt(0) + key.slice(1).toLowerCase()
                                    }))}
                                    placeholder="Select a segment"
                                    className="text-base-color"
                                />
                                <input type="hidden" {...register("segment", { required: "Segment is required" })} />
                                {errors.segment && (
                                    <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500">{errors.segment.message}</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Type Select */}
                    <div className="space-y-1">
                        <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                Type <span className="text-red-500">*</span>
                            </p>
                        </label>
                        <AccordionSelect
                            id="type"
                            value={watch("type")}
                            onChange={(e) => {
                                setValue("type", e.target.value);
                            }}
                            options={Object.entries(PRODUCT_TYPES).map(([key, value]) => ({
                                value: value,
                                label: key.charAt(0) + key.slice(1).toLowerCase()
                            }))}
                            placeholder="Select Type"
                            className="text-base-color"
                        />
                        <input type="hidden" {...register("type", { required: "Type is required" })} />
                        {errors.type && (
                            <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500">{errors.type.message}</p>
                        )}
                    </div>

                    {/* Cost Input */}
                    <div className="space-y-1">
                        <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                {getUnitLabel()} <span className="text-red-500">*</span>
                            </p>
                        </label>
                        <div className="relative">
                            <span className="absolute text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium -translate-y-1/2 left-3 lg:left-1.5 xl:left-2 2xl:left-2.5 3xl:left-3 top-1/2 text-foreground">৳</span>
                            <Input
                                {...register("cost", {
                                    required: "Cost is required",
                                    min: { value: 0, message: "Cost must be positive" },
                                    validate: (value) => !isNaN(parseFloat(value)) || "Cost must be a number"
                                })}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="9,999.99"
                                className="h-8 border-none rounded-md"
                                inputClassName="pl-6! lg:pl-3! xl:pl-4! 2xl:pl-5! 3xl:pl-6! pr-16 lg:pr-12 xl:pr-14 2xl:pr-16 3xl:pr-16 placeholder:text-xs text-xs lg:placeholder:text-[8px] lg:text-[8px] xl:placeholder:text-[10px] xl:text-[10px] 2xl:placeholder:text-xs 2xl:text-xs 3xl:placeholder:text-sm 3xl:text-sm"
                            />
                            <span className="absolute text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm -translate-y-1/2 right-3 top-1/2 text-base-color">
                                / Kg
                            </span>
                        </div>
                        {errors.cost && (
                            <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-500">{errors.cost.message}</p>
                        )}
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1">
                        <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
                            <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                                Remarks
                            </p>
                        </label>
                        <textarea
                            {...register("remarks")}
                            placeholder="Add remarks"
                            className="h-[50px] lg:h-[42px] xl:h-[55px] 2xl:h-[64px] 3xl:h-[80px] w-full px-3 py-2 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    {/* Form validation errors */}
                    {Object.keys(errors).length > 0 && !error && (
                        <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            Please fill in all required fields correctly.
                        </div>
                    )}

                    <ModalFooter className="flex-row gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 mt-6 lg:mt-3 xl:mt-4 2xl:mt-4.5 3xl:mt-6 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
                        <Button
                            type="button"
                            intent="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full border-table-stroke text-base-color "
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            intent="primary"
                            disabled={isLoading}
                            className="w-full text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2 animate-spin" />
                                    {mode === "create" ? "Creating..." : "Saving..."}
                                </>
                            ) : (
                                mode === "create" ? "Add" : "Update"
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}


export function ArchiveProductCodeModal({
    open,
    onOpenChange,
    productCode,
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
        if (!productCode) return;

        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(productCode);
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while archiving the product code"));
        } finally {
            setIsLoading(false);
        }
    };

    const isBulk = Array.isArray(productCode);

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
                        {isBulk ? "Archive Product Codes" : "Archive Product Code"}
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
                        <Archive className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
                    </motion.div>

                    {/* Description */}
                    <div className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center">
                        <p className="text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-base-color">
                            {isBulk 
                                ? "Are you sure you want to archive these product codes?" 
                                : "Are you sure you want to archive this product code?"
                            }
                        </p>
                        {productCode && (
                            <p className="mt-2 font-medium text-foreground text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm!">
                                {isBulk 
                                    ? `${productCode.length} product code(s) selected`
                                    : `${(productCode.commercializedProductCode || productCode.displayProductCode || productCode.productCode)} - ${productCode.name}`
                                }
                            </p>
                        )}
                    </div>

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
                        className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50"
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
                                <Loader2 className="w-4 lg:w-2.5! xl:w-3! 2xl:w-3.5! 3xl:w-4! h-4 lg:h-2.5! xl:h-3! 2xl:h-3.5! 3xl:h-4! mr-2 animate-spin" />
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

export function RestoreProductCodeModal({
    open,
    onOpenChange,
    productCode,
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
        if (!productCode) return;

        setIsLoading(true);
        setError(null);
        try {
            await onConfirm(productCode);
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while restoring the product code"));
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
                        Restore Product Code
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

                    <div className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center">
                        <p className="text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium leading-relaxed text-muted-foreground">
                            <span className="font-medium text-foreground">
                                Are you sure you want to restore this product code?
                            </span>
                        </p>
                        {productCode && (
                            <p className="mt-2 font-medium text-foreground">
                                {(productCode.commercializedProductCode || productCode.displayProductCode || productCode.productCode)} - {productCode.name}
                            </p>
                        )}
                    </div>

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
