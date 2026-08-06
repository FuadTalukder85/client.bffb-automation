import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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
import { MultiSelectWithSearch } from "@/components/ui/Select/MultiSelectWithSearch";
import { cn } from "@/lib/utils";
import { Archive, Loader2 } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/utils/apiError";
import { PRODUCT_TYPES } from "@/hooks/useBFFProductCodes";
import { useBFFProductSegment as useBFFProductTaxonomy } from "@/hooks/useBFFProductSegment";
import { useBFFProductCodes } from "@/hooks/useBFFProductCodes";
import { usePackagingTypes } from "@/hooks/usePackagingTypes";
import { BFF_PRODUCT_SEGMENT_KINDS as BFF_PRODUCT_TAXONOMY_KINDS } from "@/constants/bffProductSegment";
import { bffProductCodeService } from "@/services/bffProductCodeService";
import { bffProductSegmentService } from "@/services/bffProductSegmentService";
import { useCreateBFFProductSegmentItem as useCreateBFFProductTaxonomyItem } from "@/hooks/mutations/useBFFProductSegmentMutations";

const toId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return value._id || value.id || "";
    return String(value);
};

const toIdList = (value) => {
    if (!Array.isArray(value)) return [];
    return value.map(toId).filter(Boolean);
};

const toDateInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const FieldLabel = ({ children, required = false }) => (
    <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-lighter-text">
        <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
            {children} {required && <span className="text-red-500">*</span>}
        </p>
    </label>
);

const taxonomyHookArgs = { status: "active", page: 1, limit: 200 };

export function ProductCodeModal({
    open,
    onOpenChange,
    productCode,
    onConfirm,
    mode = "create",
    defaultSegment = null,
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

    const { data: bffBrandData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.BFF_BRAND_NAME, taxonomyHookArgs);
    const { data: segmentData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT, taxonomyHookArgs);
    const { data: categoryData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.CATEGORY, taxonomyHookArgs);
    const { data: marketData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.MARKET, taxonomyHookArgs);
    const { data: brandData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.BRAND, taxonomyHookArgs);
    const { data: productTypeData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.PRODUCT_TYPE, taxonomyHookArgs);
    const { data: regulatoryData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.REGULATORY_STATUS, taxonomyHookArgs);
    const { data: certificationData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.CERTIFICATION, taxonomyHookArgs);
    const { data: availableFormData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.AVAILABLE_FORM, taxonomyHookArgs);
    const { data: solubilityData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.SOLUBILITY, taxonomyHookArgs);
    const { data: performStabilityData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.PERFORM_STABILITY, taxonomyHookArgs);
    const { data: applicationAreaData } = useBFFProductTaxonomy(BFF_PRODUCT_TAXONOMY_KINDS.APPLICATION_AREA, taxonomyHookArgs);

    const { data: packagingData } = usePackagingTypes({ status: "active", page: 1, limit: 200 });
    const { data: productsData } = useBFFProductCodes({ isActive: "true", page: 1, limit: 200 });
    const { data: countriesResponse } = useQuery({
        queryKey: ["bff-product-countries"],
        queryFn: () => bffProductCodeService.getCountries(),
        staleTime: Infinity,
    });

    const createBrand = useCreateBFFProductTaxonomyItem(BFF_PRODUCT_TAXONOMY_KINDS.BFF_BRAND_NAME);
    const createRegulatory = useCreateBFFProductTaxonomyItem(BFF_PRODUCT_TAXONOMY_KINDS.REGULATORY_STATUS);
    const createCertification = useCreateBFFProductTaxonomyItem(BFF_PRODUCT_TAXONOMY_KINDS.CERTIFICATION);
    const createPerformStability = useCreateBFFProductTaxonomyItem(BFF_PRODUCT_TAXONOMY_KINDS.PERFORM_STABILITY);
    const createApplicationArea = useCreateBFFProductTaxonomyItem(BFF_PRODUCT_TAXONOMY_KINDS.APPLICATION_AREA);

    const toOptions = (payload) =>
        (payload?.data || []).map((item) => ({ value: item._id || item.id, label: item.name || item.title }));

    const countryOptions = useMemo(() => {
        const list = countriesResponse?.data || countriesResponse || [];
        return (Array.isArray(list) ? list : []).map((name) => ({ value: name, label: name }));
    }, [countriesResponse]);

    const packagingOptions = useMemo(
        () => (packagingData?.data || []).map((item) => ({ value: item.id || item._id, label: item.name || item.title })),
        [packagingData]
    );

    const alternateProductOptions = useMemo(() => {
        const currentId = toId(productCode?._id || productCode?.id);
        return (productsData?.data || [])
            .filter((item) => toId(item._id || item.id) !== currentId)
            .map((item) => ({
                value: item._id || item.id,
                label: `${item.commercialCode || item.commercializedProductCode || item.xpCode || item.productCode || "—"} - ${item.productName || item.name}`,
            }));
    }, [productsData, productCode]);

    const isCommercialized = watch("isCommercialized");
    const isCommercializedLocked =
        mode === "update" &&
        Boolean(productCode?.commercialCode || productCode?.commercializedProductCode);

    useEffect(() => {
        if (productCode && mode === "update") {
            const commercializedValue =
                (productCode.commercialCode || productCode.commercializedProductCode) &&
                String(productCode.commercialCode || productCode.commercializedProductCode)
                    .trim()
                    .toLowerCase() !== "null"
                    ? productCode.commercialCode || productCode.commercializedProductCode
                    : "";

            reset({
                name: productCode.productName || productCode.name || "",
                bffBrandNames: toIdList(productCode.bffBrandNames),
                productCode: productCode.xpCode || productCode.productCode || "",
                xpIssueDate: toDateInput(productCode.xpIssueDate),
                commercializedProductCode: commercializedValue,
                commercialCodeIssueDate: toDateInput(productCode.commercialCodeIssueDate),
                isCommercialized: Boolean(commercializedValue),
                segment: toId(productCode.segment) || defaultSegment || "",
                category: toId(productCode.category),
                market: toId(productCode.market),
                brand: toId(productCode.brand),
                productType: toId(productCode.productType),
                direction: productCode.direction || "",
                aromaTasteDescription: productCode.aromaTasteDescription || "",
                benchmark: productCode.benchmark || "",
                recommendedHeatStability: productCode.recommendedHeatStability || "",
                regulatoryStatuses: toIdList(productCode.regulatoryStatuses),
                certifications: toIdList(productCode.certifications),
                alternateProducts: toIdList(productCode.alternateProducts),
                customerLeadTime: productCode.customerLeadTime || "",
                availableForm: toId(productCode.availableForm),
                solubility: toId(productCode.solubility),
                shelfLifeValue: productCode.shelfLifeValue ?? "",
                shelfLifeUnit: productCode.shelfLifeUnit || "year",
                storageCondition: productCode.storageCondition || "",
                packagingAvailable: toIdList(productCode.packagingAvailable),
                countriesOfOrigin: Array.isArray(productCode.countriesOfOrigin)
                    ? productCode.countriesOfOrigin
                    : [],
                recommendedDosing: productCode.recommendedDosing || "",
                performStabilities: toIdList(productCode.performStabilities),
                productAdvantage: productCode.productAdvantage || "",
                applicationAreas: toIdList(productCode.applicationAreas),
                type: productCode.type || "solid",
                standardPrice: productCode.standardPrice ?? "",
                remarks: productCode.remarks || "",
            });
        } else {
            reset({
                name: "",
                bffBrandNames: [],
                productCode: "",
                xpIssueDate: "",
                commercializedProductCode: "",
                commercialCodeIssueDate: "",
                isCommercialized: false,
                segment: defaultSegment || "",
                category: "",
                market: "",
                brand: "",
                productType: "",
                direction: "",
                aromaTasteDescription: "",
                benchmark: "",
                recommendedHeatStability: "",
                regulatoryStatuses: [],
                certifications: [],
                alternateProducts: [],
                customerLeadTime: "",
                availableForm: "",
                solubility: "",
                shelfLifeValue: "",
                shelfLifeUnit: "year",
                storageCondition: "",
                packagingAvailable: [],
                countriesOfOrigin: [],
                recommendedDosing: "",
                performStabilities: [],
                productAdvantage: "",
                applicationAreas: [],
                type: "solid",
                standardPrice: "",
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

    const normalizeCode = (value) => {
        const normalized = String(value || "").trim();
        if (!normalized) return null;
        const lower = normalized.toLowerCase();
        if (lower === "null" || lower === "undefined") return null;
        return normalized;
    };

    const isValidObjectId = (val) =>
        typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val.trim());

    const createdTaxonomyCacheRef = React.useRef({});

    const resolveSingleTaxonomyId = async (kind, val) => {
        if (!val) return null;
        const strVal = String(val).trim();
        if (!strVal) return null;
        if (isValidObjectId(strVal)) return strVal;

        const cacheKey = `${kind}:${strVal.toLowerCase()}`;
        if (createdTaxonomyCacheRef.current[cacheKey]) {
            return createdTaxonomyCacheRef.current[cacheKey];
        }
        try {
            const response = await bffProductSegmentService.createItem(kind, { name: strVal });
            const newId = response?.data?._id || response?._id || response?.data?.data?._id;
            if (newId) {
                createdTaxonomyCacheRef.current[cacheKey] = newId;
                return newId;
            }
        } catch (err) {
            console.error(`Failed to create taxonomy item "${strVal}" for kind "${kind}":`, err);
        }
        return null;
    };

    const resolveMultipleTaxonomyIds = async (kind, rawValue) => {
        const arr = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
        const resolvedIds = [];
        for (const item of arr) {
            const idVal = typeof item === "object" ? item?._id || item?.id : item;
            const resolvedId = await resolveSingleTaxonomyId(kind, idVal);
            if (resolvedId && isValidObjectId(resolvedId)) {
                resolvedIds.push(resolvedId);
            }
        }
        return resolvedIds;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const commercialCode = data.isCommercialized
                ? normalizeCode(data.commercializedProductCode)
                : null;
            const xpCode = normalizeCode(data.productCode);

            const bffBrandNames = await resolveMultipleTaxonomyIds(
                BFF_PRODUCT_TAXONOMY_KINDS.BFF_BRAND_NAME,
                data.bffBrandNames
            );
            const segment = await resolveSingleTaxonomyId(
                BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT,
                data.segment
            );
            const category = await resolveSingleTaxonomyId(
                BFF_PRODUCT_TAXONOMY_KINDS.CATEGORY,
                data.category
            );
            const market = await resolveSingleTaxonomyId(
                BFF_PRODUCT_TAXONOMY_KINDS.MARKET,
                data.market
            );
            const brand = await resolveSingleTaxonomyId(
                BFF_PRODUCT_TAXONOMY_KINDS.BRAND,
                data.brand
            );
            const productType = await resolveSingleTaxonomyId(
                BFF_PRODUCT_TAXONOMY_KINDS.PRODUCT_TYPE,
                data.productType
            );
            const regulatoryStatuses = await resolveMultipleTaxonomyIds(
                BFF_PRODUCT_TAXONOMY_KINDS.REGULATORY_STATUS,
                data.regulatoryStatuses
            );
            const certifications = await resolveMultipleTaxonomyIds(
                BFF_PRODUCT_TAXONOMY_KINDS.CERTIFICATION,
                data.certifications
            );
            const solubility = await resolveSingleTaxonomyId(
                BFF_PRODUCT_TAXONOMY_KINDS.SOLUBILITY,
                data.solubility
            );
            const performStabilities = await resolveMultipleTaxonomyIds(
                BFF_PRODUCT_TAXONOMY_KINDS.PERFORM_STABILITY,
                data.performStabilities
            );
            const applicationAreas = await resolveMultipleTaxonomyIds(
                BFF_PRODUCT_TAXONOMY_KINDS.APPLICATION_AREA,
                data.applicationAreas
            );

            const submitData = {
                productName: data.name,
                name: data.name,
                bffBrandNames,
                xpCode,
                productCode: xpCode,
                xpIssueDate: data.xpIssueDate || null,
                commercialCode,
                commercializedProductCode: commercialCode,
                commercialCodeIssueDate: data.commercialCodeIssueDate || null,
                segment,
                category,
                market,
                brand,
                productType,
                direction: data.direction || "",
                aromaTasteDescription: data.aromaTasteDescription || "",
                benchmark: data.benchmark || "",
                recommendedHeatStability: data.recommendedHeatStability || "",
                regulatoryStatuses,
                certifications,
                alternateProducts: data.alternateProducts || [],
                customerLeadTime: data.customerLeadTime || "",
                availableForm: data.availableForm || null,
                solubility,
                shelfLifeValue: data.shelfLifeValue !== "" ? Number(data.shelfLifeValue) : null,
                shelfLifeUnit: data.shelfLifeUnit || null,
                storageCondition: data.storageCondition || "",
                packagingAvailable: data.packagingAvailable || [],
                countriesOfOrigin: data.countriesOfOrigin || [],
                recommendedDosing: data.recommendedDosing || "",
                performStabilities,
                productAdvantage: data.productAdvantage || "",
                applicationAreas,
                type: data.type,
                standardPrice: parseFloat(data.standardPrice),
                remarks: data.remarks || "",
            };

            await onConfirm(submitData);
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while saving the product"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTaxonomy = async (kindMutation, currentValues, fieldName, name) => {
        const created = await kindMutation.mutateAsync({ name });
        const id = created?.data?._id || created?._id || created?.data?.data?._id;
        if (id) {
            setValue(fieldName, [...(currentValues || []), id]);
        }
    };

    const singleSelect = (id, label, options, required = false) => (
        <div className="space-y-1" key={id}>
            <FieldLabel required={required}>{label}</FieldLabel>
            <AccordionSelect
                id={id}
                value={watch(id) || ""}
                onChange={(e) => setValue(id, e.target.value, { shouldValidate: true, shouldDirty: true })}
                options={options}
                placeholder={`Select ${label.toLowerCase()}`}
                creatable={true}
                className="text-base-color"
            />
            <input
                type="hidden"
                {...register(id, { required: required ? `${label} is required` : false })}
            />
            {errors[id] && (
                <p className="text-xs text-red-500">{errors[id].message}</p>
            )}
        </div>
    );

    const multiSelect = (id, label, options, { allowCreate = true, onCreate, isCreating = false } = {}) => (
        <div className="space-y-1" key={id}>
            <FieldLabel>{label}</FieldLabel>
            <MultiSelectWithSearch
                value={watch(id) || []}
                onChange={(next) => setValue(id, next, { shouldValidate: true, shouldDirty: true })}
                options={options}
                placeholder={`Select ${label.toLowerCase()}`}
                allowCreate={allowCreate}
                onCreateOption={onCreate}
                isCreating={isCreating}
            />
        </div>
    );

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[720px] lg:max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] gap-0 p-5 rounded-2xl",
                    className
                )}
            >
                <ModalHeader className="mb-4">
                    <ModalTitle className="text-lg font-semibold text-center">
                        {mode === "create" ? "Add BFF Product" : "Edit BFF Product"}
                    </ModalTitle>
                    <ModalDescription className="text-center text-xs text-muted-foreground">
                        Product profile — identification, taxonomy, specs & pricing
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 py-1">
                    <p className="text-xs font-semibold text-base-color">A. Product identification</p>

                    <div className="space-y-1">
                        <FieldLabel required>Product Name</FieldLabel>
                        <Input
                            {...register("name", { required: "Product name is required" })}
                            placeholder="e.g. Chocolate Flavour"
                            className="h-8 border-none rounded-md"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    {multiSelect("bffBrandNames", "BFF Brand Name", toOptions(bffBrandData), {
                        allowCreate: true,
                        isCreating: createBrand.isPending,
                        onCreate: (name) =>
                            handleCreateTaxonomy(createBrand, watch("bffBrandNames"), "bffBrandNames", name),
                    })}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <FieldLabel required={!isCommercialized}>XP Code</FieldLabel>
                            <Input
                                {...register("productCode", {
                                    required: !isCommercialized ? "XP code is required" : false,
                                })}
                                placeholder="e.g. XP-1234"
                                className="h-8 border-none rounded-md"
                            />
                            {errors.productCode && (
                                <p className="text-xs text-red-500">{errors.productCode.message}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <FieldLabel required={!isCommercialized}>XP Issue Date</FieldLabel>
                            <Input
                                type="date"
                                {...register("xpIssueDate", {
                                    required: !isCommercialized ? "XP issue date is required" : false,
                                })}
                                className="h-8 border-none rounded-md"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-lighter-text">Commercialized?</p>
                        <div className={cn("inline-flex items-center gap-3", isCommercializedLocked && "opacity-50")}>
                            <label className="relative inline-flex h-7 items-center rounded-full cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("isCommercialized")}
                                    className="sr-only peer"
                                    disabled={isCommercializedLocked}
                                />
                                <span className="h-7 w-12 rounded-full bg-slate-200 transition-colors peer-checked:bg-primary" />
                                <span className="pointer-events-none absolute left-[3px] top-1 h-5 w-5 rounded-full bg-white border transition-transform peer-checked:translate-x-5" />
                            </label>
                            <span className="text-xs font-medium">{isCommercialized ? "Yes" : "No"}</span>
                        </div>
                    </div>

                    {isCommercialized && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <FieldLabel required>Commercial Code</FieldLabel>
                                <Input
                                    {...register("commercializedProductCode", {
                                        validate: (value) =>
                                            isCommercialized
                                                ? (value || "").trim().length > 0 || "Commercial code is required"
                                                : true,
                                    })}
                                    placeholder="e.g. 515 015"
                                    className="h-8 border-none rounded-md"
                                />
                            </div>
                            <div className="space-y-1">
                                <FieldLabel required>Commercial Code Issue Date</FieldLabel>
                                <Input
                                    type="date"
                                    {...register("commercialCodeIssueDate", {
                                        required: isCommercialized ? "Issue date is required" : false,
                                    })}
                                    className="h-8 border-none rounded-md"
                                />
                            </div>
                        </div>
                    )}

                    {singleSelect("segment", "Segment", toOptions(segmentData), true)}
                    {singleSelect("category", "Category", toOptions(categoryData), true)}
                    {singleSelect("market", "Market", toOptions(marketData), true)}
                    {singleSelect("brand", "Brand", toOptions(brandData), true)}
                    {singleSelect("productType", "Product Type", toOptions(productTypeData), true)}

                    <div className="space-y-1">
                        <FieldLabel>Direction</FieldLabel>
                        <textarea
                            {...register("direction")}
                            placeholder="Direction / description"
                            className="h-[60px] w-full px-3 py-2 text-xs bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="space-y-1">
                        <FieldLabel>Aroma & Taste Description</FieldLabel>
                        <textarea
                            {...register("aromaTasteDescription")}
                            placeholder="Aroma & taste"
                            className="h-[60px] w-full px-3 py-2 text-xs bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <FieldLabel>Benchmark</FieldLabel>
                            <Input {...register("benchmark")} className="h-8 border-none rounded-md" />
                        </div>
                        <div className="space-y-1">
                            <FieldLabel>Recommended Heat Stability</FieldLabel>
                            <Input
                                {...register("recommendedHeatStability")}
                                placeholder="e.g. 180 Degree"
                                className="h-8 border-none rounded-md"
                            />
                        </div>
                    </div>

                    <p className="text-xs font-semibold text-base-color pt-2">B. Regulatory & related</p>
                    {multiSelect("regulatoryStatuses", "Regulatory Status", toOptions(regulatoryData), {
                        allowCreate: true,
                        isCreating: createRegulatory.isPending,
                        onCreate: (name) =>
                            handleCreateTaxonomy(
                                createRegulatory,
                                watch("regulatoryStatuses"),
                                "regulatoryStatuses",
                                name
                            ),
                    })}
                    {multiSelect("certifications", "Certifications", toOptions(certificationData), {
                        allowCreate: true,
                        isCreating: createCertification.isPending,
                        onCreate: (name) =>
                            handleCreateTaxonomy(
                                createCertification,
                                watch("certifications"),
                                "certifications",
                                name
                            ),
                    })}
                    {multiSelect("alternateProducts", "Alternate Product", alternateProductOptions)}

                    <div className="space-y-1">
                        <FieldLabel>Customer Lead Time</FieldLabel>
                        <Input
                            {...register("customerLeadTime")}
                            placeholder="e.g. 7 days"
                            className="h-8 border-none rounded-md"
                        />
                    </div>

                    <p className="text-xs font-semibold text-base-color pt-2">C. Form & specifications</p>
                    {singleSelect("availableForm", "Available Forms", toOptions(availableFormData))}
                    {singleSelect("solubility", "Solubility", toOptions(solubilityData))}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <FieldLabel>Shelf Life</FieldLabel>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                {...register("shelfLifeValue")}
                                placeholder="e.g. 1"
                                className="h-8 border-none rounded-md"
                            />
                        </div>
                        <div className="space-y-1">
                            <FieldLabel>Shelf Life Unit</FieldLabel>
                            <AccordionSelect
                                id="shelfLifeUnit"
                                value={watch("shelfLifeUnit") || "year"}
                                onChange={(e) => setValue("shelfLifeUnit", e.target.value)}
                                options={[
                                    { value: "month", label: "Month" },
                                    { value: "year", label: "Year" },
                                ]}
                                className="text-base-color"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <FieldLabel>Storage Condition</FieldLabel>
                        <textarea
                            {...register("storageCondition")}
                            className="h-[60px] w-full px-3 py-2 text-xs bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {multiSelect("packagingAvailable", "Packaging Available", packagingOptions)}
                    {multiSelect("countriesOfOrigin", "Raw Materials Country of Origin", countryOptions)}

                    <div className="space-y-1">
                        <FieldLabel>Recommended Dosing</FieldLabel>
                        <Input
                            {...register("recommendedDosing")}
                            placeholder="e.g. 0.2% - 0.3%"
                            className="h-8 border-none rounded-md"
                        />
                    </div>

                    {multiSelect("performStabilities", "Perform Stability", toOptions(performStabilityData), {
                        allowCreate: true,
                        isCreating: createPerformStability.isPending,
                        onCreate: (name) =>
                            handleCreateTaxonomy(
                                createPerformStability,
                                watch("performStabilities"),
                                "performStabilities",
                                name
                            ),
                    })}

                    <div className="space-y-1">
                        <FieldLabel>Product Advantage</FieldLabel>
                        <Input {...register("productAdvantage")} className="h-8 border-none rounded-md" />
                    </div>

                    {multiSelect("applicationAreas", "Application Area", toOptions(applicationAreaData), {
                        allowCreate: true,
                        isCreating: createApplicationArea.isPending,
                        onCreate: (name) =>
                            handleCreateTaxonomy(
                                createApplicationArea,
                                watch("applicationAreas"),
                                "applicationAreas",
                                name
                            ),
                    })}

                    <p className="text-xs font-semibold text-base-color pt-2">D. Pricing & physical type</p>
                    {singleSelect(
                        "type",
                        "Physical Type",
                        Object.entries(PRODUCT_TYPES).map(([key, value]) => ({
                            value,
                            label: key.charAt(0) + key.slice(1).toLowerCase(),
                        })),
                        true
                    )}

                    <div className="space-y-1">
                        <FieldLabel required>Standard Price (Tk/Kg)</FieldLabel>
                        <div className="relative">
                            <span className="absolute text-sm font-medium -translate-y-1/2 left-3 top-1/2">৳</span>
                            <Input
                                {...register("standardPrice", {
                                    required: "Standard price is required",
                                    min: { value: 0, message: "Must be positive" },
                                    validate: (value) => !isNaN(parseFloat(value)) || "Must be a number",
                                })}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="300"
                                className="h-8 border-none rounded-md"
                                inputClassName="pl-6! pr-12"
                            />
                            <span className="absolute text-xs -translate-y-1/2 right-3 top-1/2 text-base-color">
                                / Kg
                            </span>
                        </div>
                        {errors.standardPrice && <p className="text-xs text-red-500">{errors.standardPrice.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <FieldLabel>Remarks</FieldLabel>
                        <textarea
                            {...register("remarks")}
                            className="h-[50px] w-full px-3 py-2 text-xs bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    <ModalFooter className="flex-row gap-4 mt-4 sm:justify-between h-9">
                        <Button
                            type="button"
                            intent="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full border-table-stroke text-base-color"
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
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {mode === "create" ? "Creating..." : "Saving..."}
                                </>
                            ) : mode === "create" ? (
                                "Add Product"
                            ) : (
                                "Update"
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
            setError(getApiErrorMessage(err, "An error occurred while archiving the product"));
        } finally {
            setIsLoading(false);
        }
    };

    const isBulk = Array.isArray(productCode);

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className={cn("max-w-[480px] gap-0 px-5 py-5 rounded-2xl", className)}>
                <ModalHeader className="pb-4">
                    <ModalTitle className="text-lg font-semibold text-center">
                        {isBulk ? "Archive Products" : "Archive Product"}
                    </ModalTitle>
                </ModalHeader>
                <div className="flex flex-col items-center space-y-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center w-16 h-16 text-white rounded-full bg-primary"
                    >
                        <Archive className="w-8 h-8" />
                    </motion.div>
                    <p className="text-sm text-center text-base-color">
                        {isBulk
                            ? "Are you sure you want to archive these products?"
                            : "Are you sure you want to archive this product?"}
                    </p>
                    {productCode && (
                        <p className="text-xs font-medium text-foreground">
                            {isBulk
                                ? `${productCode.length} product(s) selected`
                                : `${productCode.commercialCode || productCode.xpCode || productCode.productCode} - ${productCode.productName || productCode.name}`}
                        </p>
                    )}
                    {error && (
                        <div className="w-full p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}
                </div>
                <ModalFooter className="flex flex-row justify-center mt-6 gap-3">
                    <Button intent="outline" onClick={() => handleClose(false)} disabled={isLoading} className="flex-1">
                        Cancel
                    </Button>
                    <Button intent="primary" onClick={handleConfirm} disabled={isLoading} className="flex-1">
                        {isLoading ? "Archiving..." : "Confirm"}
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
            setError(getApiErrorMessage(err, "An error occurred while restoring the product"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className={cn("max-w-[480px] gap-0 px-5 py-5 rounded-2xl", className)}>
                <ModalHeader className="pb-4">
                    <ModalTitle className="text-lg font-semibold text-center">Restore Product</ModalTitle>
                </ModalHeader>
                <div className="flex flex-col items-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-center w-16 h-16 text-white rounded-full bg-invite-status-text"
                    >
                        <AiFillThunderbolt className="w-8 h-8" />
                    </motion.div>
                    <p className="text-sm text-center text-muted-foreground">
                        Are you sure you want to restore this product?
                    </p>
                    {productCode && (
                        <p className="text-xs font-medium text-foreground">
                            {(productCode.commercialCode || productCode.xpCode || productCode.productCode)} -{" "}
                            {productCode.productName || productCode.name}
                        </p>
                    )}
                    {error && (
                        <div className="w-full p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}
                </div>
                <ModalFooter className="flex flex-row justify-center mt-6 gap-3">
                    <Button intent="outline" onClick={() => handleClose(false)} disabled={isLoading} className="flex-1">
                        Cancel
                    </Button>
                    <Button intent="primary" onClick={handleConfirm} disabled={isLoading} className="flex-1">
                        {isLoading ? "Restoring..." : "Confirm"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
