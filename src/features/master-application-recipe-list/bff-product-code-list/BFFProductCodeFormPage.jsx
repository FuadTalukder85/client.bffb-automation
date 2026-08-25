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
    <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
      <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={handleOpenPicker}
        className={cn(
          "relative flex items-center w-full rounded-md px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 text-xs transition-colors h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8",
          commonInputClass,
          !isReadOnly && "cursor-pointer hover:border-[#B89CF5]",
          isHighlighted && "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
          isReadOnly && "cursor-default"
        )}
      >
        <CalendarIcon className="w-3.5 h-3.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 3xl:w-3.5 3xl:h-3.5 mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2 text-muted-foreground shrink-0 flex-none" />
        <span
          className={cn(
            "flex-1 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs truncate select-none",
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
      {error && <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{error}</p>}
    </div>
  );
};

const CIRCLED_NUMBERS = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
};

const FormSectionHeader = ({ number, title, subtitle }) => (
  <div className="flex items-center gap-2.5 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 mb-4 md:mb-5 lg:mb-2 xl:mb-3 2xl:mb-4 3xl:mb-5">
    <div className="w-7 h-7 lg:w-4.5 lg:h-4.5 xl:w-5.5 xl:h-5.5 2xl:w-6.5 2xl:h-6.5 3xl:w-8 3xl:h-8 rounded-lg lg:rounded-md 2xl:rounded-lg bg-[#F5EFFE] dark:bg-purple-950/50 flex items-center justify-center text-[#7E3AF2] dark:text-[#B89CF5] shrink-0 text-sm lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base font-semibold">
      {CIRCLED_NUMBERS[number] || number}
    </div>
    <div>
      <h3 className="text-xs lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-bold text-[#1E1B2E] dark:text-foreground leading-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#716A85] dark:text-muted-foreground mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

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
        productAdvantage: "",
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
    "text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] bg-[#FBFBFD] focus:outline-none h-full"
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
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-4 md:mb-5 gap-2 sm:gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 ms-0 lg:ms-5 flex-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BackButton
            onClick={() => navigate("/bff-product/list")}
            className="bg-[#F2EAFA] text-[#6B46C1] hover:bg-[#E7DAF7] flex-none"
          />
          <DesktopBreadcrumb items={breadcrumbItems} />
          <div className="md:hidden truncate">
            <span className="text-base sm:text-lg font-bold text-primary truncate block">
              {breadcrumbTitle || (mode === "create" ? "Add BFF Product" : "Product Details")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 flex-none">
          {isReadOnly ? (
            <button
              type="button"
              onClick={() => setIsReadOnly(false)}
              className="bg-primary text-white hover:bg-[#5A3AAB] flex items-center gap-1.5 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-1.5 px-[14px] lg:px-3 xl:px-3.5 2xl:px-4 3xl:px-5 py-1.5 lg:py-0.5 xl:py-1 2xl:py-[5px] 3xl:py-1.5 rounded-full text-[14px] lg:text-[8px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <SquarePen className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-white" />
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
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center justify-between flex-none">
          <span>{serverError}</span>
          <button onClick={() => setServerError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section-Wise Form Container with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-4 lg:pb-4.5 xl:pb-5.5 2xl:pb-6.5 3xl:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          {/* Section 1: Identification */}
          <div className="bg-white dark:bg-card rounded-2xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl  p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#EBE4F7] dark:border-border shadow-xs">
            <FormSectionHeader
              number="1"
              title="Identification"
              subtitle="Core naming and codes used to reference this product"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 3xl:gap-5">
              {/* 1. Product Name */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* 2. BFF Brand Name */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  BFF Brand Name
                </label>
                <AccordionSelect
                  id="bffBrandNames"
                  disabled={isReadOnly}
                  value={watch("bffBrandNames") || []}
                  onChange={(e) =>
                    setValue("bffBrandNames", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="flex items-center gap-1 text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  <span>XP Code</span>
                  {!isCommercialCodeEntered && <span className="text-red-500">*</span>}
                  <span
                    className="inline-flex items-center justify-center w-3.5 h-3.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 3xl:w-3.5 3xl:h-3.5 rounded-full bg-[#F2EAFA] text-[#6B46C1] text-[9px] lg:text-[6px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[9px] font-bold cursor-help"
                    title="Experimental / Pre-commercial code"
                  >
                    ?
                  </span>
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.productCode.message}</p>
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
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">
                    {errors.commercializedProductCode.message}
                  </p>
                )}
              </div>

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
                    isHighlighted={isHighlighted(
                      "Commercial Code Issue Date",
                      "DD/MM/YYYY",
                      "commercialCodeIssueDate"
                    )}
                    commonInputClass={commonInputClass}
                  />
                )}
              />
            </div>
          </div>

          {/* Section 2: Classification */}
          <div className="bg-white dark:bg-card rounded-2xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl  p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#EBE4F7] dark:border-border shadow-xs">
            <FormSectionHeader
              number="2"
              title="Classification"
              subtitle="Where this product sits in the catalog"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 3xl:gap-5">
              {/* 7. Segment */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Segment <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="segment"
                  disabled={isReadOnly}
                  value={watch("segment") || ""}
                  onChange={(e) =>
                    setValue("segment", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.segment.message}</p>
                )}
              </div>

              {/* 8. Category */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Category <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="category"
                  disabled={isReadOnly}
                  value={watch("category") || ""}
                  onChange={(e) =>
                    setValue("category", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* 9. Market */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Market <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="market"
                  disabled={isReadOnly}
                  value={watch("market") || ""}
                  onChange={(e) =>
                    setValue("market", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.market.message}</p>
                )}
              </div>

              {/* 10. Brand */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Brand <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="brand"
                  disabled={isReadOnly}
                  value={watch("brand") || ""}
                  onChange={(e) =>
                    setValue("brand", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.brand.message}</p>
                )}
              </div>

              {/* 11. Product Type */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <AccordionSelect
                  id="productType"
                  disabled={isReadOnly}
                  value={watch("productType") || ""}
                  onChange={(e) =>
                    setValue("productType", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.productType.message}</p>
                )}
              </div>

              {/* 12. Application Area */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Application Area
                </label>
                <AccordionSelect
                  id="applicationAreas"
                  disabled={isReadOnly}
                  value={watch("applicationAreas") || []}
                  onChange={(e) =>
                    setValue("applicationAreas", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
            </div>
          </div>

          {/* Section 3: Sensory & Technical Profile */}
          <div className="bg-white dark:bg-card rounded-2xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl  p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#EBE4F7] dark:border-border shadow-xs">
            <FormSectionHeader
              number="3"
              title="Sensory & Technical Profile"
              subtitle="Descriptive and performance detail for this product"
            />
            <div className="space-y-4 md:space-y-5 lg:space-y-2.5 xl:space-y-3.5 2xl:space-y-4 3xl:space-y-5">
              {/* Row 1: Direction & Aroma & Taste Description (2 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 3xl:gap-5">
                {/* Direction */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 flex flex-col">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                    Direction
                  </label>
                  <Input
                    type="textarea"
                    readOnly={isReadOnly}
                    {...register("direction")}
                    placeholder="Describe flavour direction"
                    className={cn(
                      "w-full min-h-[90px] md:min-h-[100px] lg:min-h-[60px] xl:min-h-[70px] 2xl:min-h-[85px] 3xl:min-h-[100px] bg-[#FBFBFD] dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                      isHighlighted("Direction", "Describe flavour direction", "direction") &&
                      "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                      isReadOnly && "pointer-events-none"
                    )}
                    inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] focus:outline-none resize-none h-full p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-[#FBFBFD] dark:bg-background"
                  />
                </div>

                {/* Aroma & Taste Description */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 flex flex-col">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                    Aroma & Taste Description
                  </label>
                  <Input
                    type="textarea"
                    readOnly={isReadOnly}
                    {...register("aromaTasteDescription")}
                    placeholder="Describe aroma and taste"
                    className={cn(
                      "w-full min-h-[90px] md:min-h-[100px] lg:min-h-[60px] xl:min-h-[70px] 2xl:min-h-[85px] 3xl:min-h-[100px] bg-[#FBFBFD] dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                      isHighlighted(
                        "Aroma & Taste Description",
                        "Describe aroma and taste",
                        "aromaTasteDescription"
                      ) && "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                      isReadOnly && "pointer-events-none"
                    )}
                    inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] focus:outline-none resize-none h-full p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-[#FBFBFD] dark:bg-background"
                  />
                </div>
              </div>

              {/* Row 2 & 3: Heat Stability, Perform Stability, Solubility, Recommended Dosing, Benchmark (4 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 3xl:gap-5">
                {/* Recommended Heat Stability */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                    Recommended Heat Stability
                  </label>
                  <Input
                    {...register("recommendedHeatStability")}
                    readOnly={isReadOnly}
                    placeholder="e.g. 180 Degree"
                    className={cn(
                      commonInputClass,
                      isHighlighted(
                        "Recommended Heat Stability",
                        "e.g. 180 Degree",
                        "recommendedHeatStability"
                      ) && "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                    )}
                    inputClassName={commonInnerClass}
                  />
                </div>

                {/* Perform Stability */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                    Perform Stability
                  </label>
                  <AccordionSelect
                    id="performStabilities"
                    disabled={isReadOnly}
                    value={watch("performStabilities") || []}
                    onChange={(e) =>
                      setValue("performStabilities", e.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    options={toOptions(performStabilityData)}
                    placeholder="Select stability type"
                    multiple={true}
                    creatable={true}
                    className={cn(
                      selectClassName,
                      isHighlighted(
                        "Perform Stability",
                        "Select stability type",
                        "performStabilities"
                      ) && "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                    )}
                  />
                </div>

                {/* Solubility */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                    Solubility
                  </label>
                  <AccordionSelect
                    id="solubility"
                    disabled={isReadOnly}
                    value={watch("solubility") || ""}
                    onChange={(e) =>
                      setValue("solubility", e.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
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

                {/* Recommended Dosing */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                    Recommended Dosing
                  </label>
                  <Input
                    {...register("recommendedDosing")}
                    readOnly={isReadOnly}
                    placeholder="e.g. 0.2% - 0.3%"
                    className={cn(
                      commonInputClass,
                      isHighlighted(
                        "Recommended Dosing",
                        "e.g. 0.2% - 0.3%",
                        "recommendedDosing"
                      ) && "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                    )}
                    inputClassName={commonInnerClass}
                  />
                </div>

                {/* Benchmark */}
                <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                  <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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
              </div>
            </div>
          </div>

          {/* Section 4: Logistics & Compliance */}
          <div className="bg-white dark:bg-card rounded-2xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl  p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#EBE4F7] dark:border-border shadow-xs">
            <FormSectionHeader
              number="4"
              title="Logistics & Compliance"
              subtitle="Availability, storage and regulatory status"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 3xl:gap-5">
              {/* Row 1 */}
              {/* 1. Customer Lead Time */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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

              {/* 2. Shelf Life */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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

              {/* 3. Available Forms */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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

              {/* 4. Packaging Available */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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

              {/* Row 2 */}
              {/* 5. Storage Condition (Spans 2 cols) */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 col-span-1 md:col-span-2 flex flex-col">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Storage Condition
                </label>
                <Input
                  type="textarea"
                  readOnly={isReadOnly}
                  {...register("storageCondition")}
                  placeholder="Describe storage conditions"
                  className={cn(
                    "w-full min-h-[90px] md:min-h-[100px] lg:min-h-[60px] xl:min-h-[70px] 2xl:min-h-[85px] 3xl:min-h-[100px] bg-[#FBFBFD] dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                    isHighlighted("Storage Condition", "Describe storage conditions", "storageCondition") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                    isReadOnly && "pointer-events-none"
                  )}
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] focus:outline-none resize-none h-full p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-[#FBFBFD] dark:bg-background"
                />
              </div>

              {/* 6. Raw Materials Country of Origin */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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

              {/* 7. Regulatory Status */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Regulatory Status
                </label>
                <AccordionSelect
                  id="regulatoryStatuses"
                  disabled={isReadOnly}
                  value={watch("regulatoryStatuses") || []}
                  onChange={(e) =>
                    setValue("regulatoryStatuses", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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

              {/* Row 3 */}
              {/* 8. Certifications */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Certifications
                </label>
                <AccordionSelect
                  id="certifications"
                  disabled={isReadOnly}
                  value={watch("certifications") || []}
                  onChange={(e) =>
                    setValue("certifications", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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

              {/* 9. Alternate Product */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
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

              {/* 10. Certificate Of Analysis (Spans 2 cols) */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 col-span-1">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Certificate of Analysis
                </label>
                <div
                  className={cn(
                    "w-full h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 px-3 bg-[#FBFBFD] dark:bg-purple-950/20 border border-dashed border-[#B89CF5] rounded-md flex items-center justify-between transition-colors",
                    isHighlighted("Certificate Of Analysis", "Upload file", "coaFile") &&
                    "ring-2 ring-[#6B46C1]",
                    isReadOnly && "pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-[#0D111A] dark:text-foreground truncate">
                    <Paperclip className="w-3.5 h-3.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 3xl:w-3.5 3xl:h-3.5 text-[#6B46C1] flex-none" />
                    <span className={cn("truncate text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs", selectedFileName ? "text-[#1E1B2E] dark:text-foreground" : "text-[#948FA5]")}>
                      {selectedFileName || "No file selected"}
                    </span>
                  </div>
                  {!isReadOnly && (
                    <label className="px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-2.5 py-0.5 bg-[#EEEBF4] dark:bg-purple-950/50 border border-[#B89CF5] rounded-md text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#6B46C1] dark:text-[#B89CF5] flex-none transition-colors cursor-pointer hover:bg-[#F3EDFD]">
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
            </div>
          </div>

          {/* Section 5: Commercial */}
          <div className="bg-white dark:bg-card rounded-2xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl  p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#EBE4F7] dark:border-border shadow-xs">
            <FormSectionHeader
              number="5"
              title="Commercial"
              subtitle="Pricing, positioning and identifiers"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 3xl:gap-5 items-start">
              {/* Standard Price */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 col-span-1">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Standard Price <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("standardPrice", {
                    required: "Standard price is required",
                  })}
                  readOnly={isReadOnly}
                  placeholder="500"
                  className={cn(
                    commonInputClass,
                    isHighlighted("Standard Price", "500", "standardPrice") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                  )}
                  inputClassName={commonInnerClass}
                />
                {errors.standardPrice && (
                  <p className="text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.standardPrice.message}</p>
                )}
              </div>

              {/* Product Advantage */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 col-span-1 md:col-span-2 flex flex-col">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Product Advantage
                </label>
                <Input
                  type="textarea"
                  readOnly={isReadOnly}
                  {...register("productAdvantage")}
                  placeholder="Describe product advantages"
                  className={cn(
                    "w-full min-h-[80px] lg:min-h-[50px] xl:min-h-[60px] 2xl:min-h-[70px] 3xl:min-h-[80px] bg-[#FBFBFD] dark:bg-background border border-[#DFD5F5] dark:border-border rounded-md",
                    isHighlighted("Product Advantage", "Describe product advantages", "productAdvantage") &&
                    "border-[#6B46C1] ring-2 ring-[#6B46C1]/20",
                    isReadOnly && "pointer-events-none"
                  )}
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-[#1E1B2E] dark:text-foreground placeholder:text-[#948FA5] focus:outline-none resize-none h-full p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-[#FBFBFD] dark:bg-background"
                />
              </div>

              {/* Barcode */}
              <div className="space-y-1.5 lg:space-y-[3px] xl:space-y-[4px] 2xl:space-y-[4.5px] 3xl:space-y-1.5 col-span-1">
                <label className="block text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-[#1E1B2E] dark:text-foreground">
                  Barcode
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    {...register("remarks")}
                    readOnly={isReadOnly}
                    placeholder="testing remarks"
                    className={cn(
                      "flex-1",
                      commonInputClass,
                      isHighlighted("Barcode", "testing remarks", "remarks") &&
                      "border-[#6B46C1] ring-2 ring-[#6B46C1]/20"
                    )}
                    inputClassName={commonInnerClass}
                  />
                  <button
                    type="button"
                    title="Download Barcode"
                    className="w-8 h-8 lg:w-4.5 lg:h-4.5 xl:w-5.5 xl:h-5.5 2xl:w-6.5 2xl:h-6.5 3xl:w-8 3xl:h-8 bg-[#ECE5F8] hover:bg-[#E2D6F5] dark:bg-accent text-[#6B46C1] rounded-md flex items-center justify-center flex-none transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 3xl:w-3.5 3xl:h-3.5 text-[#6B46C1]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Entities Section - shown only in edit/view mode */}
          {mode !== "create" && id && (
            <div className="bg-white dark:bg-card rounded-2xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#EBE4F7] dark:border-border shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-4">
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
        </form>
      </div>
    </section>
  );
}
