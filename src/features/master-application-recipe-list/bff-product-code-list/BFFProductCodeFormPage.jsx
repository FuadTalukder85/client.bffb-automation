import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/ui/BackButton";
import { DesktopBreadcrumb } from "@/components/ui/DesktopBreadcrumb";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { cn } from "@/lib/utils";
import { AppliedRecipesList } from "./components/AppliedRecipesList";
import { AppliedClientsList } from "./components/AppliedClientsList";
import { AppliedProspectsList } from "./components/AppliedProspectsList";
import {
  Save,
  FileText,
  X,
  Paperclip,
  Download,
  Loader2,
  Calendar as CalendarIcon,
  SquarePen,
} from "lucide-react";
import { toast } from "sonner";
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
  if (typeof value === "object") return value.name || value._id || value.id || "";
  return String(value);
};

const AVAILABLE_FORM_OPTIONS = [
  { value: "Liquid", label: "Liquid" },
  { value: "Solid", label: "Solid" },
];

const toIdList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map(toId).filter(Boolean);
};

const formatToDDMMYYYY = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    return value.trim();
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.trim().split("-");
    return `${day}/${month}/${year}`;
  }
  if (typeof value === "string" && value.includes("T")) {
    const datePortion = value.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePortion)) {
      const [year, month, day] = datePortion.split("-");
      return `${day}/${month}/${year}`;
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatToYYYYMMDD = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
    const [day, month, year] = value.trim().split("/");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "string" && value.includes("T")) {
    const datePortion = value.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePortion)) {
      return datePortion;
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateInput = (value) => {
  if (!value) return "";
  return formatToYYYYMMDD(value);
};

const FormDateField = ({
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  isReadOnly,
  isHighlighted,
  commonInputClass,
  placeholder = "DD/MM/YYYY",
}) => {
  const inputRef = React.useRef(null);
  const displayValue = formatToDDMMYYYY(value);
  const nativeValue = formatToYYYYMMDD(value);

  const handleOpenPicker = () => {
    if (isReadOnly || !inputRef.current) return;
    try {
      if (typeof inputRef.current.showPicker === "function") {
        inputRef.current.showPicker();
        return;
      }
    } catch (err) {
      // Fallback
    }
    inputRef.current.focus();
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={handleOpenPicker}
        className={cn(
          "relative flex items-center w-full rounded-md px-3 text-xs transition-colors h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8",
          commonInputClass,
          !isReadOnly && "cursor-pointer hover:border-[#B89CF5]",
          isHighlighted && "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
          isReadOnly && "cursor-default"
        )}
      >
        <CalendarIcon className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0 flex-none" />
        <span
          className={cn(
            "flex-1 text-xs truncate select-none",
            displayValue
              ? "text-[#1E1B2E] dark:text-foreground font-normal"
              : "text-[#948FA5]"
          )}
        >
          {displayValue || placeholder}
        </span>
        <input
          type="date"
          ref={inputRef}
          value={nativeValue}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          onBlur={onBlur}
          disabled={isReadOnly}
          tabIndex={-1}
          className="sr-only opacity-0 absolute pointer-events-none"
        />
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

const taxonomyHookArgs = { status: "active", page: 1, limit: 200 };

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function BFFProductCodeFormPage({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isReadOnly, setIsReadOnly] = useState(
    location.state?.isReadOnly ?? (mode === "view")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const defaultSegmentFromState = location.state?.defaultSegment || "";
  const passedProductCode = location.state?.productCode || null;

  // Fetch product data for edit/view mode
  const { data: fetchedProductData, isLoading: isFetchingProduct } = useQuery({
    queryKey: ["bff-product-code-detail", id],
    queryFn: () => bffProductCodeService.getProductCode(id),
    enabled: Boolean(id),
    placeholderData: passedProductCode ? { data: passedProductCode } : undefined,
  });

  const productCode = useMemo(() => {
    if (mode === "create") return null;
    return (
      fetchedProductData?.data ||
      fetchedProductData ||
      passedProductCode ||
      null
    );
  }, [mode, fetchedProductData, passedProductCode]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm();

  // Taxonomy queries
  const { data: bffBrandData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.BFF_BRAND_NAME,
    taxonomyHookArgs
  );
  const { data: segmentData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT,
    taxonomyHookArgs
  );
  const { data: categoryData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.CATEGORY,
    taxonomyHookArgs
  );
  const { data: marketData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.MARKET,
    taxonomyHookArgs
  );
  const { data: brandData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.BRAND,
    taxonomyHookArgs
  );
  const { data: productTypeData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.PRODUCT_TYPE,
    taxonomyHookArgs
  );
  const { data: regulatoryData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.REGULATORY_STATUS,
    taxonomyHookArgs
  );
  const { data: certificationData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.CERTIFICATION,
    taxonomyHookArgs
  );
  const { data: availableFormData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.AVAILABLE_FORM,
    taxonomyHookArgs
  );
  const { data: solubilityData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.SOLUBILITY,
    taxonomyHookArgs
  );
  const { data: performStabilityData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.PERFORM_STABILITY,
    taxonomyHookArgs
  );
  const { data: applicationAreaData } = useBFFProductTaxonomy(
    BFF_PRODUCT_TAXONOMY_KINDS.APPLICATION_AREA,
    taxonomyHookArgs
  );

  const { data: packagingData } = usePackagingTypes({
    status: "active",
    page: 1,
    limit: 200,
  });
  const { data: productsData } = useBFFProductCodes({
    isActive: "true",
    page: 1,
    limit: 200,
  });
  const { data: countriesResponse } = useQuery({
    queryKey: ["bff-product-countries"],
    queryFn: () => bffProductCodeService.getCountries(),
    staleTime: Infinity,
  });

  const createdTaxonomyCacheRef = React.useRef({});

  const toOptions = (payload) =>
    (payload?.data || []).map((item) => ({
      value: item._id || item.id,
      label: item.name || item.title,
    }));

  const countryOptions = useMemo(() => {
    const list = countriesResponse?.data || countriesResponse || [];
    return (Array.isArray(list) ? list : []).map((name) => ({
      value: name,
      label: name,
    }));
  }, [countriesResponse]);

  const packagingOptions = useMemo(
    () =>
      (packagingData?.data || []).map((item) => ({
        value: item.id || item._id,
        label: item.name || item.title,
      })),
    [packagingData]
  );

  const alternateProductOptions = useMemo(() => {
    const currentId = toId(productCode?._id || productCode?.id || id);
    return (productsData?.data || [])
      .filter((item) => toId(item._id || item.id) !== currentId)
      .map((item) => ({
        value: item._id || item.id,
        label: `${item.commercialCode || item.commercializedProductCode || item.xpCode || item.productCode || "—"} - ${item.productName || item.name}`,
      }));
  }, [productsData, productCode, id]);

  const productNameWatch = watch("name");
  const productCodeWatch = watch("productCode");
  const commercializedProductCodeWatch = watch("commercializedProductCode");

  const isXpCodeEntered = Boolean(
    productCodeWatch && String(productCodeWatch).trim()
  );
  const isCommercialCodeEntered = Boolean(
    commercializedProductCodeWatch &&
    String(commercializedProductCodeWatch).trim()
  );

  useEffect(() => {
    if (isXpCodeEntered) {
      clearErrors(["commercializedProductCode", "commercialCodeIssueDate"]);
    }
  }, [isXpCodeEntered, clearErrors]);

  useEffect(() => {
    if (isCommercialCodeEntered) {
      clearErrors(["productCode", "xpIssueDate"]);
    }
  }, [isCommercialCodeEntered, clearErrors]);

  // Populate form values
  useEffect(() => {
    if (mode !== "create" && productCode) {
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
        segment: toId(productCode.segment) || defaultSegmentFromState || "",
        category: toId(productCode.category),
        market: toId(productCode.market),
        brand: toId(productCode.brand),
        productType: toId(productCode.productType),
        direction: productCode.direction || "",
        aromaTasteDescription: productCode.aromaTasteDescription || "",
        benchmark: productCode.benchmark || "",
        recommendedHeatStability: productCode.recommendedHeatStability || "",
        coaFile: productCode.coaFile || "",
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
      setSelectedFileName(productCode.coaFile || "");
    } else if (mode === "create") {
      reset({
        name: "",
        bffBrandNames: [],
        productCode: "",
        xpIssueDate: "",
        commercializedProductCode: "",
        commercialCodeIssueDate: "",
        isCommercialized: false,
        segment: defaultSegmentFromState || "",
        category: "",
        market: "",
        brand: "",
        productType: "",
        direction: "",
        aromaTasteDescription: "",
        benchmark: "",
        recommendedHeatStability: "",
        coaFile: "",
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
        productAdvantage: [],
        applicationAreas: [],
        type: "solid",
        standardPrice: "",
        remarks: "",
      });
      setSelectedFileName("");
    }
    setServerError(null);
  }, [productCode, mode, reset, defaultSegmentFromState]);

  const normalizeCode = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized) return null;
    const lower = normalized.toLowerCase();
    if (lower === "null" || lower === "undefined") return null;
    return normalized;
  };

  const isValidObjectId = (val) =>
    typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val.trim());

  const ensureArrayOfObjectIds = (val) => {
    const arr = Array.isArray(val) ? val : typeof val === "string" ? [val] : [];
    return arr
      .map((item) => (typeof item === "object" ? item?._id || item?.id : item))
      .map((item) => String(item || "").trim())
      .filter((item) => /^[0-9a-fA-F]{24}$/.test(item));
  };

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

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const commercialCode =
        formData.isCommercialized || formData.commercializedProductCode
          ? normalizeCode(formData.commercializedProductCode)
          : null;
      const xpCode = normalizeCode(formData.productCode);

      // Resolve taxonomy items (creating any newly typed entries in the database on Confirm click)
      const bffBrandNames = await resolveMultipleTaxonomyIds(
        BFF_PRODUCT_TAXONOMY_KINDS.BFF_BRAND_NAME,
        formData.bffBrandNames
      );
      const segment = await resolveSingleTaxonomyId(
        BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT,
        formData.segment
      );
      const category = await resolveSingleTaxonomyId(
        BFF_PRODUCT_TAXONOMY_KINDS.CATEGORY,
        formData.category
      );
      const market = await resolveSingleTaxonomyId(
        BFF_PRODUCT_TAXONOMY_KINDS.MARKET,
        formData.market
      );
      const brand = await resolveSingleTaxonomyId(
        BFF_PRODUCT_TAXONOMY_KINDS.BRAND,
        formData.brand
      );
      const productType = await resolveSingleTaxonomyId(
        BFF_PRODUCT_TAXONOMY_KINDS.PRODUCT_TYPE,
        formData.productType
      );
      const regulatoryStatuses = await resolveMultipleTaxonomyIds(
        BFF_PRODUCT_TAXONOMY_KINDS.REGULATORY_STATUS,
        formData.regulatoryStatuses
      );
      const certifications = await resolveMultipleTaxonomyIds(
        BFF_PRODUCT_TAXONOMY_KINDS.CERTIFICATION,
        formData.certifications
      );
      const solubility = await resolveSingleTaxonomyId(
        BFF_PRODUCT_TAXONOMY_KINDS.SOLUBILITY,
        formData.solubility
      );
      const performStabilities = await resolveMultipleTaxonomyIds(
        BFF_PRODUCT_TAXONOMY_KINDS.PERFORM_STABILITY,
        formData.performStabilities
      );
      const applicationAreas = await resolveMultipleTaxonomyIds(
        BFF_PRODUCT_TAXONOMY_KINDS.APPLICATION_AREA,
        formData.applicationAreas
      );

      const submitData = {
        productName: formData.name,
        name: formData.name,
        bffBrandNames,
        xpCode,
        productCode: xpCode,
        xpIssueDate: formData.xpIssueDate || null,
        commercialCode,
        commercializedProductCode: commercialCode,
        commercialCodeIssueDate: formData.commercialCodeIssueDate || null,
        segment,
        category,
        market,
        brand,
        productType,
        direction: formData.direction || "",
        aromaTasteDescription: formData.aromaTasteDescription || "",
        benchmark: formData.benchmark || "",
        recommendedHeatStability: formData.recommendedHeatStability || "",
        coaFile: typeof formData.coaFile === "string" ? formData.coaFile : selectedFileName || null,
        regulatoryStatuses,
        certifications,
        alternateProducts: ensureArrayOfObjectIds(formData.alternateProducts),
        customerLeadTime: formData.customerLeadTime || "",
        availableForm: formData.availableForm || null,
        solubility,
        shelfLifeValue:
          formData.shelfLifeValue !== "" && formData.shelfLifeValue !== null
            ? Number(formData.shelfLifeValue)
            : null,
        shelfLifeUnit: formData.shelfLifeUnit || null,
        storageCondition: formData.storageCondition || "",
        packagingAvailable: ensureArrayOfObjectIds(formData.packagingAvailable),
        countriesOfOrigin: Array.isArray(formData.countriesOfOrigin)
          ? formData.countriesOfOrigin.filter(Boolean)
          : typeof formData.countriesOfOrigin === "string" && formData.countriesOfOrigin.trim()
            ? [formData.countriesOfOrigin.trim()]
            : [],
        recommendedDosing: formData.recommendedDosing || "",
        performStabilities,
        productAdvantage: formData.productAdvantage || "",
        applicationAreas,
        type: formData.type || "solid",
        standardPrice: parseFloat(formData.standardPrice),
        remarks: formData.remarks || "",
      };

      if (mode === "create") {
        const response = await bffProductCodeService.createProductCode(submitData);
        toast.success(
          getResponseMessage(response, "BFF product code created successfully")
        );
      } else {
        const targetId = id || productCode?._id || productCode?.id;
        const response = await bffProductCodeService.updateProductCode(
          targetId,
          submitData
        );
        toast.success(
          getResponseMessage(response, "BFF product code updated successfully")
        );
      }

      queryClient.invalidateQueries({ queryKey: ["bff-product-segment"] });
      queryClient.invalidateQueries({ queryKey: ["bff-product-codes"] });
      navigate("/bff-product/list");
    } catch (err) {
      console.error("Failed to save product code:", err);
      const msg = getApiErrorMessage(
        err,
        "An error occurred while saving the product"
      );
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTaxonomy = async (
    kindMutation,
    currentValues,
    fieldName,
    name
  ) => {
    const created = await kindMutation.mutateAsync({ name });
    const newId =
      created?.data?._id || created?._id || created?.data?.data?._id;
    if (newId) {
      setValue(fieldName, [...(currentValues || []), newId]);
    }
  };

  // Field search highlight helper
  const isHighlighted = (label, placeholder, fieldName) => {
    if (!fieldSearchTerm || !fieldSearchTerm.trim()) return false;
    const term = fieldSearchTerm.toLowerCase().trim();
    return (
      (label && label.toLowerCase().includes(term)) ||
      (placeholder && placeholder.toLowerCase().includes(term)) ||
      (fieldName && fieldName.toLowerCase().includes(term))
    );
  };

  const breadcrumbTitle =
    productNameWatch || productCode?.productName || productCode?.name || "";

  const breadcrumbItems =
    mode === "create"
      ? [{ label: "BFF Product List", link: "/bff-product/list" }]
      : [
        { label: "BFF Product List", link: "/bff-product/list" },
        ...(breadcrumbTitle ? [{ label: breadcrumbTitle }] : []),
      ];

  if (mode !== "create" && isFetchingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#6B46C1] animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  const commonInputClass = cn(
    "bg-[#FBFBFD] dark:bg-background border border-[#DFD5F5] dark:border-border 3xl:h-11 transition-colors",
    isReadOnly && "pointer-events-none"
  );
  const commonInnerClass = cn(
    "text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] bg-[#FBFBFD] focus:outline-none h-full"
  );

  const selectClassName = cn(
    commonInputClass,
    isReadOnly && "disabled:opacity-100 opacity-100 text-[#1E1B2E] dark:text-foreground [&_span]:opacity-100 [&_span]:text-[#1E1B2E] dark:[&_span]:text-foreground"
  );

  const handleCancel = () => {
    if (mode === "create") {
      navigate("/bff-product/list");
    } else {
      reset();
      setIsReadOnly(true);
    }
  };

  return (
    <section className="min-h-[calc(100vh-6rem)]">
      {/* Top Header Bar - EXACT MATCH TO IMAGE */}
      <div className="flex items-center justify-between mb-4 md:mb-5 gap-2 sm:gap-3 ms-0 lg:ms-5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BackButton
            onClick={() => navigate("/bff-product/list")}
            className="w-9 h-9 rounded-xl bg-[#F2EAFA] text-[#6B46C1] hover:bg-[#E7DAF7] flex-none"
          />
          <DesktopBreadcrumb items={breadcrumbItems} />
          <div className="md:hidden truncate">
            <span className="text-base sm:text-lg font-bold text-primary truncate block">
              {breadcrumbTitle || (mode === "create" ? "Add BFF Product" : "Product Details")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-none">
          {isReadOnly ? (
            <button
              type="button"
              onClick={() => setIsReadOnly(false)}
              className="bg-primary text-white hover:bg-[#5A3AAB] flex items-center gap-1.5 sm:gap-2 rpx-[14px] sm:px-5 py-1.5 rounded-full rtext-[14px] font-semibold shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <SquarePen className="rw-[16px] rh-[16px] text-white" />
              Edit Details
            </button>
          ) : (
            <div className="desktop-page-btn-wrapper flex items-center gap-0 rounded-full overflow-hidden shadow-sm border border-border">
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                title="Confirm"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 md:py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors disabled:opacity-50 text-xs md:text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                ) : (
                  <Save className="desktop-page-btn m-0! w-3.5 h-3.5 sm:w-auto sm:h-auto" />
                )}
                {isLoading ? "Saving..." : "Confirm"}
              </Button>

              <div className="w-px h-4 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-border" />

              <Button
                type="button"
                onClick={handleCancel}
                title="Cancel"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 md:py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors text-xs md:text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              >
                <X className="desktop-page-btn m-0! w-3.5 h-3.5 sm:w-auto sm:h-auto" />
                Cancel
              </Button>
            </div>
          )}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
          <span>{serverError}</span>
          <button onClick={() => setServerError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form Container Card - 1-COLUMN ON MOBILE, 5-COLUMN ON DESKTOP */}
      <div className="min-h-[calc(100vh-6rem)] bg-white dark:bg-background rounded-2xl md:rounded-3xl p-4 sm:p-5 lg:p-6 border border-[#EBE4F7] dark:border-border shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full md:overflow-x-auto pb-1">
            <div className="w-full min-w-0 md:min-w-[940px] grid grid-cols-1 md:grid-cols-5 gap-x-5 gap-y-5 md:gap-y-8">
              {/* ROW 1 */}
              {/* 1. Product Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("name", { required: "Product name is required" })}
                  readOnly={isReadOnly}
                  placeholder="Enter product name"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Product Name", "Enter product name", "name") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* 2. BFF Brand Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  BFF Brand Name
                </label>
                <AccordionSelect
                  id="bffBrandNames"
                  disabled={isReadOnly}
                  value={watch("bffBrandNames") || []}
                  onChange={(e) => setValue("bffBrandNames", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(bffBrandData)}
                  placeholder="Select brand name"
                  multiple={true}
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("BFF Brand Name", "Select brand name", "bffBrandNames") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 3. XP Code */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  XP Code {!isCommercialCodeEntered && <span className="text-red-500">*</span>}
                </label>
                <Input
                  {...register("productCode", {
                    required: !isCommercialCodeEntered ? "XP Code is required" : false,
                  })}
                  readOnly={isReadOnly}
                  placeholder="e.g. XP-0000"
                  className={cn(
                    commonInputClass,
                    isHighlighted("XP Code", "e.g. XP-0000", "productCode") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
                {errors.productCode && (
                  <p className="text-[11px] text-red-500">{errors.productCode.message}</p>
                )}
              </div>

              {/* 4. XP Issue Date */}
              <Controller
                name="xpIssueDate"
                control={control}
                rules={{
                  required: !isCommercialCodeEntered ? "XP Issue Date is required" : false,
                }}
                render={({ field }) => (
                  <FormDateField
                    label="XP Issue Date"
                    required={!isCommercialCodeEntered}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.xpIssueDate?.message}
                    isReadOnly={isReadOnly}
                    isHighlighted={isHighlighted("XP Issue Date", "DD/MM/YYYY", "xpIssueDate")}
                    commonInputClass={commonInputClass}
                  />
                )}
              />

              {/* 5. Commercial Code */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Commercial Code {!isXpCodeEntered && <span className="text-red-500">*</span>}
                </label>
                <Input
                  {...register("commercializedProductCode", {
                    required: !isXpCodeEntered ? "Commercial code is required" : false,
                  })}
                  readOnly={isReadOnly}
                  placeholder="e.g. 000 000"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Commercial Code", "e.g. 000 000", "commercializedProductCode") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
                {errors.commercializedProductCode && (
                  <p className="text-[11px] text-red-500">
                    {errors.commercializedProductCode.message}
                  </p>
                )}
              </div>

              {/* ROW 2 */}
              {/* 6. Commercial Code Issue Date */}
              <Controller
                name="commercialCodeIssueDate"
                control={control}
                rules={{
                  required: !isXpCodeEntered ? "Commercial code issue date is required" : false,
                }}
                render={({ field }) => (
                  <FormDateField
                    label="Commercial Code Issue Date"
                    required={!isXpCodeEntered}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.commercialCodeIssueDate?.message}
                    isReadOnly={isReadOnly}
                    isHighlighted={isHighlighted("Commercial Code Issue Date", "DD/MM/YYYY", "commercialCodeIssueDate")}
                    commonInputClass={commonInputClass}
                  />
                )}
              />

              {/* 7. Segment */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Segment <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="segment"
                  disabled={isReadOnly}
                  value={watch("segment") || ""}
                  onChange={(e) => setValue("segment", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(segmentData)}
                  placeholder="Select segment"
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Segment", "Select segment", "segment") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
                <input
                  type="hidden"
                  {...register("segment", { required: "Segment is required" })}
                />
                {errors.segment && (
                  <p className="text-[11px] text-red-500">{errors.segment.message}</p>
                )}
              </div>

              {/* 8. Category */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Category <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="category"
                  disabled={isReadOnly}
                  value={watch("category") || ""}
                  onChange={(e) => setValue("category", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(categoryData)}
                  placeholder="Select category"
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Category", "Select category", "category") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
                <input
                  type="hidden"
                  {...register("category", { required: "Category is required" })}
                />
                {errors.category && (
                  <p className="text-[11px] text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* 9. Market */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Market <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="market"
                  disabled={isReadOnly}
                  value={watch("market") || ""}
                  onChange={(e) => setValue("market", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(marketData)}
                  placeholder="Select market"
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Market", "Select market", "market") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
                <input
                  type="hidden"
                  {...register("market", { required: "Market is required" })}
                />
                {errors.market && (
                  <p className="text-[11px] text-red-500">{errors.market.message}</p>
                )}
              </div>

              {/* 10. Brand */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Brand <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="brand"
                  disabled={isReadOnly}
                  value={watch("brand") || ""}
                  onChange={(e) => setValue("brand", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(brandData)}
                  placeholder="Select brand"
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Brand", "Select brand", "brand") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
                <input
                  type="hidden"
                  {...register("brand", { required: "Brand is required" })}
                />
                {errors.brand && (
                  <p className="text-[11px] text-red-500">{errors.brand.message}</p>
                )}
              </div>

              {/* ROW 3 & 4 */}
              {/* 11. Product Type */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="productType"
                  disabled={isReadOnly}
                  value={watch("productType") || ""}
                  onChange={(e) => setValue("productType", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(productTypeData)}
                  placeholder="Select type"
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Product Type", "Select type", "productType") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
                <input
                  type="hidden"
                  {...register("productType", { required: "Product type is required" })}
                />
                {errors.productType && (
                  <p className="text-[11px] text-red-500">{errors.productType.message}</p>
                )}
              </div>

              {/* 12. Direction (Spans 2 Rows vertically on Desktop) */}
              <div className="space-y-1.5 md:row-span-2 flex flex-col">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Direction
                </label>
                <Input
                  type="textarea"
                  readOnly={isReadOnly}
                  {...register("direction")}
                  placeholder="Describe flavour direction"
                  className={cn(
                    "flex-1 min-h-[100px] md:min-h-[115px] w-full bg-white dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                    isHighlighted("Direction", "Describe flavour direction", "direction") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                    isReadOnly && "pointer-events-none"
                  )}
                  inputClassName="text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] focus:outline-none resize-none h-full p-3 bg-[#FBFBFD]"
                />
              </div>

              {/* 13. Aroma & Taste Description (Spans 2 Rows vertically on Desktop) */}
              <div className="space-y-1.5 md:row-span-2 flex flex-col">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Aroma & Taste Description
                </label>
                <Input
                  type="textarea"
                  readOnly={isReadOnly}
                  {...register("aromaTasteDescription")}
                  placeholder="Describe aroma and taste"
                  className={cn(
                    "flex-1 min-h-[100px] md:min-h-[115px] w-full bg-white dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                    isHighlighted("Aroma & Taste Description", "Describe aroma and taste", "aromaTasteDescription") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                    isReadOnly && "pointer-events-none"
                  )}
                  inputClassName="text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] focus:outline-none resize-none h-full p-3 bg-[#FBFBFD]"
                />
              </div>

              {/* 14. Benchmark */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Benchmark
                </label>
                <Input
                  {...register("benchmark")}
                  readOnly={isReadOnly}
                  placeholder="Enter benchmark product"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Benchmark", "Enter benchmark product", "benchmark") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* 15. Certificate Of Analysis */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Certificate Of Analysis
                </label>
                <div
                  className={cn(
                    "w-full h-10.5 px-3 bg-[#FBFBFD] dark:bg-purple-950/20 border border-dashed border-[#B89CF5] rounded-md flex items-center justify-between transition-colors",
                    isHighlighted("Certificate Of Analysis", "Upload file", "coaFile") &&
                    "ring-2 ring-[#6B46C1]",
                    isReadOnly && "pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-[#0D111A] truncate">
                    <Paperclip className="w-4 h-4 text-[#6B46C1] flex-none" />
                    <span className="truncate">{selectedFileName || "Upload file"}</span>
                  </div>
                  {!isReadOnly && (
                    <label className="px-3 py-1 bg-[#EEEBF4] border border-[#B89CF5] rounded-lg text-xs font-semibold text-[#6B46C1] flex-none transition-colors cursor-pointer hover:bg-[#F3EDFD]">
                      Browse
                      <input
                        type="file"
                        className="hidden"
                        {...register("coaFile", {
                          onChange: (e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedFileName(file.name);
                          },
                        })}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 16. Customer Lead Time */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Customer Lead Time
                </label>
                <Input
                  {...register("customerLeadTime")}
                  readOnly={isReadOnly}
                  placeholder="e.g. 7 days"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Customer Lead Time", "e.g. 7 days", "customerLeadTime") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* Row 4 Col 2 & Col 3 are filled by Direction & Aroma textareas (row-span-2) */}

              {/* 17. Recommended Heat Stability */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Recommended Heat Stability
                </label>
                <Input
                  {...register("recommendedHeatStability")}
                  readOnly={isReadOnly}
                  placeholder="e.g. 180 Degree"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Recommended Heat Stability", "e.g. 180 Degree", "recommendedHeatStability") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* 18. Regulatory Status */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Regulatory Status
                </label>
                <AccordionSelect
                  id="regulatoryStatuses"
                  disabled={isReadOnly}
                  value={watch("regulatoryStatuses") || []}
                  onChange={(e) => setValue("regulatoryStatuses", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(regulatoryData)}
                  placeholder="Select regulatory status"
                  multiple={true}
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Regulatory Status", "Select regulatory status", "regulatoryStatuses") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* ROW 5 & 6 */}
              {/* 19. Certifications */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Certifications
                </label>
                <AccordionSelect
                  id="certifications"
                  disabled={isReadOnly}
                  value={watch("certifications") || []}
                  onChange={(e) => setValue("certifications", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(certificationData)}
                  placeholder="Select certifications"
                  multiple={true}
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Certifications", "Select certifications", "certifications") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 20. Available Forms */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Available Forms
                </label>
                <AccordionSelect
                  id="availableForm"
                  disabled={isReadOnly}
                  value={watch("availableForm") || ""}
                  onChange={(e) => setValue("availableForm", e.target.value)}
                  options={AVAILABLE_FORM_OPTIONS}
                  placeholder="Select form"
                  className={cn(
                    selectClassName,
                    isHighlighted("Available Forms", "Select form", "availableForm") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 21. Shelf Life */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Shelf Life
                </label>
                <Input
                  {...register("shelfLifeValue")}
                  readOnly={isReadOnly}
                  placeholder="e.g. 1 Year"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Shelf Life", "e.g. 1 Year", "shelfLifeValue") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* 22. Storage Condition (Spans 2 Rows vertically on Desktop) */}
              <div className="space-y-1.5 md:row-span-2 flex flex-col">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Storage Condition
                </label>
                <Input
                  type="textarea"
                  readOnly={isReadOnly}
                  {...register("storageCondition")}
                  placeholder="Describe storage conditions"
                  className={cn(
                    "flex-1 min-h-[100px] md:min-h-[115px] w-full bg-white dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                    isHighlighted("Storage Condition", "Describe storage conditions", "storageCondition") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                    isReadOnly && "pointer-events-none"
                  )}
                  inputClassName="text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5]  focus:outline-none resize-none h-full p-3 bg-[#FBFBFD]"
                />
              </div>

              {/* 23. Raw Materials Country of Origin */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Raw Materials Country of Origin
                </label>
                <Input
                  {...register("countriesOfOrigin")}
                  readOnly={isReadOnly}
                  placeholder="Select country"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Raw Materials Country of Origin", "Select country", "countriesOfOrigin") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* 24. Alternate Product */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Alternate Product
                </label>
                <AccordionSelect
                  id="alternateProducts"
                  disabled={isReadOnly}
                  value={watch("alternateProducts") || []}
                  onChange={(e) => setValue("alternateProducts", e.target.value)}
                  options={alternateProductOptions}
                  placeholder="Select alternate products"
                  multiple={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Alternate Product", "Select alternate products", "alternateProducts") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 25. Solubility */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Solubility
                </label>
                <AccordionSelect
                  id="solubility"
                  disabled={isReadOnly}
                  value={watch("solubility") || ""}
                  onChange={(e) => setValue("solubility", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(solubilityData)}
                  placeholder="Select solubility"
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Solubility", "Select solubility", "solubility") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 26. Packaging Available */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Packaging Available
                </label>
                <AccordionSelect
                  id="packagingAvailable"
                  disabled={isReadOnly}
                  value={watch("packagingAvailable") || []}
                  onChange={(e) => setValue("packagingAvailable", e.target.value)}
                  options={packagingOptions}
                  placeholder="Select packaging available"
                  multiple={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Packaging Available", "Select packaging available", "packagingAvailable") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* Row 6 Col 4 is occupied by Storage Condition (row-span-2) */}

              {/* 27. Recommended Dosing */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Recommended Dosing
                </label>
                <Input
                  {...register("recommendedDosing")}
                  readOnly={isReadOnly}
                  placeholder="e.g. 0.2% - 0.3%"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Recommended Dosing", "e.g. 0.2% - 0.3%", "recommendedDosing") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* ROW 7 */}
              {/* 28. Product Advantage */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Product Advantage
                </label>
                <Input
                  {...register("productAdvantage")}
                  readOnly={isReadOnly}
                  placeholder="Describe product advantages"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Product Advantage", "Describe product advantages", "productAdvantage") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
              </div>

              {/* 29. Standard Price */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Standard Price <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("standardPrice", {
                    required: "Standard price is required",
                  })}
                  readOnly={isReadOnly}
                  placeholder="e.g. 300 TK/Kg"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Standard Price", "e.g. 300 TK/Kg", "standardPrice") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
                {errors.standardPrice && (
                  <p className="text-[11px] text-red-500">{errors.standardPrice.message}</p>
                )}
              </div>

              {/* 30. Perform Stability */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Perform Stability
                </label>
                <AccordionSelect
                  id="performStabilities"
                  disabled={isReadOnly}
                  value={watch("performStabilities") || []}
                  onChange={(e) => setValue("performStabilities", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(performStabilityData)}
                  placeholder="Select stability type"
                  multiple={true}
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Perform Stability", "Select stability type", "performStabilities") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 31. Application Area */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Application Area
                </label>
                <AccordionSelect
                  id="applicationAreas"
                  disabled={isReadOnly}
                  value={watch("applicationAreas") || []}
                  onChange={(e) => setValue("applicationAreas", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  options={toOptions(applicationAreaData)}
                  placeholder="Select application areas"
                  multiple={true}
                  creatable={true}
                  className={cn(
                    selectClassName,
                    isHighlighted("Application Area", "Select application areas", "applicationAreas") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                />
              </div>

              {/* 32. Barcode */}
              <div className="space-y-1.5">
                <label className="block text-[11px] xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Barcode
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    {...register("remarks")}
                    readOnly={isReadOnly}
                    placeholder="Enter barcode number"
                    className={cn(
                      "flex-1",
                      commonInputClass,
                      isHighlighted("Barcode", "Enter barcode number", "remarks") &&
                      "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                    )}
                    inputClassName={commonInnerClass}
                  />
                  <button
                    type="button"
                    title="Download Barcode"
                    className="w-9.5 h-9.5 bg-[#ECE5F8] hover:bg-[#E2D6F5] dark:bg-accent text-[#6B46C1] rounded-xl flex items-center justify-center flex-none transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#6B46C1]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        {/* Associated Entities Section - shown only in edit/view mode */}
        {mode !== "create" && id && (
          <div className="mt-6 pt-5 border-t border-[#ECE5F8] dark:border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Applied Recipes */}
              <AppliedRecipesList
                productCodeId={id || productCode?._id || productCode?.id}
                referenceRecipes={productCode?.referenceRecipes}
              />

              {/* 2. Clients */}
              <AppliedClientsList
                productCodeId={id || productCode?._id || productCode?.id}
                referenceClients={productCode?.referenceClients}
              />

              {/* 3. Prospects */}
              <AppliedProspectsList
                productCodeId={id || productCode?._id || productCode?.id}
                referenceProspects={productCode?.referenceProspects}
              />
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
