import React, { useMemo } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EvaluationCommentModal } from "./EvaluationCommentModal";
import { SubmitEvaluationModal } from "./SubmitEvaluationModal";
import { SensoryDetailSkeleton } from "../../sensory-forms/components/SensoryDetailSkeleton";
import { useCreateSensoryTopSheet, useUpdateSensoryTopSheet } from "@/hooks/useSensoryForm";

// ─── Shared colour palette for ratings ─────────────────────────────────────
const RATING_COLORS = {
  0: {
    bg: "bg-[#F3E7FF]",
    border: "border-[#C7D2FE]",
    text: "text-[#5B21B6]",
    filled: "bg-[#C7D2FE] text-[#5B21B6]",
  },
  1: {
    bg: "bg-[#FFD2E5]",
    border: "border-[#E78B99]",
    text: "text-[#D6005A]",
    filled: "bg-[#FCA88A] text-white",
  },
  2: {
    bg: "bg-[#FFD7C9]",
    border: "border-[#F9B193]",
    text: "text-[#E33A00 ]",
    filled: "bg-[#FCA88A] text-white",
  },
  3: {
    bg: "bg-[#FEEDBB]",
    border: "border-[#E4DA9F]",
    text: "text-[#896700]",
    filled: "bg-[#FDE68A] text-[#92400E]",
  },
  4: {
    bg: "bg-[#D4DEFF]",
    border: "border-[#92B7FF]",
    text: "text-[#0039FF]",
    filled: "bg-[#BFDBFE] text-[#1D4ED8]",
  },
  5: {
    bg: "bg-[#AAFFB3]",
    border: "border-[#98CFAC]",
    text: "text-[#006209]",
    filled: "bg-[#4ADE80] text-white",
  },
};

const ratingLabels = [
  { value: 0, label: "N/A" },
  { value: 1, label: "Bad" },
  { value: 2, label: "Regular" },
  { value: 3, label: "Good" },
  { value: 4, label: "Better" },
  { value: 5, label: "Excellent" },
];

const COLUMNS = [
  { key: "appearance", label: "Appearance" },
  { key: "aroma", label: "Aroma" },
  { key: "taste", label: "Taste" },
  { key: "flavour", label: "Flavour" },
  { key: "sweet", label: "Sweet" },
  { key: "sour", label: "Sour" },
  { key: "salty", label: "Salty" },
  { key: "spicy", label: "Spicy" },
  { key: "bitter", label: "Bitter" },
  { key: "texture", label: "Texture" },
  { key: "overAll", label: "Overall Acceptability" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const ProjectBriefBox = ({ label, children }) => (
  <div className="mb-6 lg:mb-3.5 xl:mb-4 2xl:mb-4.5 3xl:mb-6">
    <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2">
      {label}
    </label>
    <div className="p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl bg-[#F9F8FD] dark:bg-[#0B0B0F] border border-[#E2D8F0] dark:border-border min-h-[100px] lg:min-h-[55px] xl:min-h-[71px] 2xl:min-h-[80px] 3xl:min-h-[100px]">
      <p className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] dark:text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  </div>
);

const FieldInput = ({ label, value }) => (
  <div className="mb-6 lg:mb-3.5 xl:mb-4 2xl:mb-4.5 3xl:mb-6">
    <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2">
      {label}
    </label>
    <div className="h-[46px] lg:h-[24px] xl:h-[32px] 2xl:h-[36px] 3xl:h-[46px] px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 flex items-center rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl bg-[#F9F8FD] dark:bg-[#0B0B0F] border border-[#E2D8F0] dark:border-border">
      <span className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] dark:text-muted-foreground truncate">
        {value || "—"}
      </span>
    </div>
  </div>
);

const RatingCircle = ({ value }) => {
  if (value === 0 || value == null) {
    return (
      <div className="w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 rounded-full bg-[#E5E5E5] dark:bg-muted border-4 lg:border-2 xl:border-3 2xl:border-3 3xl:border-4 border-[#D6D6D6] dark:border-border flex items-center justify-center text-gray-300 font-bold text-sm lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-sm mx-auto">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.09245 0.00532904L5.7784 0.0378548C4.25451 0.189913 2.71923 0.975411 1.68106 2.13496C0.53306 3.41729 -0.0502981 5.00861 0.00340016 6.70402C0.0969653 9.63215 2.11065 12.1114 4.96723 12.8172C5.80826 13.0204 6.68129 13.0546 7.53564 12.9178C8.39 12.781 9.20865 12.4759 9.94408 12.0204C11.3905 11.1197 12.4258 9.68793 12.8275 8.0327C12.9675 7.46268 13 7.17239 13 6.49829C13 5.8242 12.9675 5.5339 12.8275 4.96389C12.1831 2.33336 10.0157 0.398078 7.31856 0.0451732C7.0875 0.0150868 6.24704 -0.011747 6.09245 0.00532904ZM7.19896 1.26408C7.76098 1.33549 8.30727 1.49953 8.81561 1.74953C9.38351 2.02599 9.77567 2.30734 10.237 2.7684C10.6596 3.17671 11.005 3.65796 11.2564 4.18896C11.6185 4.93299 11.782 5.651 11.782 6.49829C11.7928 7.30719 11.6086 8.1068 11.245 8.82958C11.1051 9.11499 10.8228 9.57279 10.691 9.72811L10.6462 9.78096L6.93373 6.06977L3.22041 2.35938L3.2733 2.31466C3.4287 2.18293 3.88676 1.90077 4.17234 1.76091C5.10904 1.29728 6.16309 1.12426 7.19896 1.26408ZM6.08188 6.93251L9.79194 10.6413L9.73742 10.6844C9.45358 10.8937 9.15256 11.0786 8.83757 11.2373C8.32759 11.4861 7.78233 11.6551 7.22093 11.7382C6.87596 11.7911 6.13395 11.7911 5.78898 11.7382C4.20407 11.4975 2.86649 10.6331 2.02441 9.30446C1.81727 8.96124 1.64449 8.59845 1.50858 8.22135C1.18895 7.28276 1.13573 6.27402 1.35481 5.30704C1.52291 4.60799 1.8258 3.94841 2.24652 3.36524C2.30347 3.288 2.35473 3.22457 2.36124 3.22457C2.36775 3.22457 4.04134 4.89314 6.08188 6.93251Z" fill="#6C6C6C"/>
      </svg>
    </div>
    );
  }
  // if (value == null) {
  //   return (
  //     <div className="w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 rounded-full bg-gray-50 dark:bg-muted border-4 lg:border-2 xl:border-3 2xl:border-3 3xl:border-4 border-gray-200 dark:border-border flex items-center justify-center text-gray-300 font-bold text-sm lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-sm mx-auto">
  //       —
  //     </div>
  //   );
  // }
  const c = RATING_COLORS[value] || RATING_COLORS[1];
  return (
    <div
      className={`w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 rounded-full ${c.bg} border-4 lg:border-2 xl:border-3 2xl:border-3 3xl:border-4 ${c.border} flex items-center justify-center ${c.text} font-bold text-sm lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-sm mx-auto`}
    >
      {value}
    </div>
  );
};

const MeanCircle = ({ value }) => {
  const baseClasses = "max-w-[52px] lg:max-w-[28px] xl:max-w-[36px] 2xl:max-w-[42px] 3xl:max-w-[52px] h-8 lg:h-4 xl:h-5 2xl:h-6 3xl:h-8 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 rounded-full flex items-center justify-center text-[12px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[12px] mx-auto";

  if (value === null || value === undefined) {
    return (
      <div className={`${baseClasses} bg-[#E5E5E5] text-[#6B7280] font-semibold`}>
        N/A
      </div>
    );
  }

  const rounded = Math.round(value);
  const c = rounded >= 1 && rounded <= 5 ? RATING_COLORS[rounded] : null;
  const display = value.toFixed(2);
  return (
    <div className={`${baseClasses} ${c ? `${c.bg} ${c.text}` : "bg-[#E9E6EF] text-[#6B7280]"} font-semibold`}>
      {display}
    </div>
  );
};

const TotalCircle = ({ value }) => {
  const baseClasses = "max-w-[52px] lg:max-w-[28px] xl:max-w-[36px] 2xl:max-w-[42px] 3xl:max-w-[52px] h-8 lg:h-4 xl:h-5 2xl:h-6 3xl:h-8 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 rounded-full flex items-center justify-center text-[12px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[12px] mx-auto";

  if (value === null || value === undefined) {
    return (
      <div className={`${baseClasses} bg-[#E5E5E5] text-[#6B7280] font-semibold`}>
        N/A
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-[#E9E6EF] text-[#3F3F46] font-semibold`}>
      {value}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function DesktopSensoryTopSheetDetailPage({
  sampleId,
  sampleDetails,
  evaluations = [],
  aggregated = {},
  existingTopSheet,
  canSubmitTopSheet,
  topSheetSubmitPhase,
  sensoryFormComments = [],
  sensoryFormRemarks = [],
  today,
  productCodeTable,
  isLoading,
  hasError,
  errorMessage,
  onSubmitEvaluation,
  isSubmitModalOpen,
  setIsSubmitModalOpen,
}) {
  if (isLoading) return <SensoryDetailSkeleton />;

  if (hasError) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] bg-background dark:bg-[#0B0B0F] rounded-3xl">
        <div className="text-red-500 text-center py-10">{errorMessage}</div>
        <BackButton />
      </section>
    );
  }

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEval, setSelectedEval] = React.useState(null);
  const [isTableExpanded, setIsTableExpanded] = React.useState(false);

  // Form state for top sheet (only editable if no top sheet exists)
  const [formData, setFormData] = React.useState({
    panelistComment: "",
    panelistRemarks: "",
  });

  // Update form data when existingTopSheet changes
  React.useEffect(() => {
    if (existingTopSheet) {
      setFormData({
        approvedForShelfTesting: existingTopSheet.approvedForShelfTesting || false,
        approveForApplicationLab: existingTopSheet.approveForApplicationLab || false,
        panelistComment: existingTopSheet.panelistComment || "",
        panelistRemarks: existingTopSheet.panelistRemarks || "",
      });
    } else {
      // Reset to empty if no top sheet exists
      setFormData({
        approvedForShelfTesting: false,
        approveForApplicationLab: false,
        panelistComment: "",
        panelistRemarks: "",
      });
    }
  }, [existingTopSheet]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenModal = (item) => {
    setSelectedEval(item);
    setIsModalOpen(true);
  };

  const handleSubmitEvaluation = async (action) => {
    try {
      await onSubmitEvaluation?.(action, formData);
      setIsSubmitModalOpen(false);
    } catch (error) {
      console.error("Error submitting top sheet:", error);
    }
  };

  const totals = useMemo(
    () =>
      COLUMNS.reduce((acc, { key }) => {
        if (aggregated[key]?.total !== undefined) {
          acc[key] = aggregated[key].total;
          return acc;
        }

        const filled = evaluations
          .map((e) => e[key])
          .filter((value) => value !== null && value !== undefined && Number(value) >= 1);

        acc[key] = filled.length > 0
          ? filled.reduce((sum, value) => sum + Number(value), 0)
          : null;
        return acc;
      }, {}),
    [aggregated, evaluations],
  );

  // Use pre-computed averages from the API when available, fall back to local calculation
  const means = useMemo(
    () =>
      COLUMNS.reduce((acc, { key }) => {
        if (aggregated[key]?.average != null) {
          acc[key] = aggregated[key].average;
        } else if (aggregated[key]?.allNa) {
          acc[key] = null;
        } else {
          const filled = evaluations.filter(
            (e) => e[key] != null && Number(e[key]) >= 1,
          );
          acc[key] =
            filled.length > 0
              ? filled.reduce((sum, e) => sum + Number(e[key]), 0) /
                filled.length
              : null;
        }
        return acc;
      }, {}),
    [aggregated, evaluations],
  );

  return (
    <section className="flex flex-col min-h-[calc(100vh-6rem)] bg-background dark:bg-[#0B0B0F] rounded-3xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 lg:pb-2 xl:pb-2.5 2xl:pb-3 3xl:pb-4 flex-none bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton className="" />
          <div className="flex flex-col">
            <h1 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-foreground leading-tight">
              {sampleDetails?.recipeName || "Sensory Topsheet"}
            </h1>
            <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
              <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
                {sampleDetails?.recipeCode || "—"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <div className="hidden lg:block">
            <SearchInput placeholder="Search..." />
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 lg:p-3 xl:p-3 2xl:p-4.5 3xl:p-6 gap-6 lg:gap-3 xl:gap-3.5 2xl:gap-4.5 3xl:gap-6 rounded-[24px] border border-border dark:border-white/10 dark:bg-[#0B0B0F]">
        {/* ── Left: Description Panel ─────────────────────────────── */}
        <div className="w-[480px] lg:w-[255px] xl:w-[341px] 2xl:w-[385px] 3xl:w-[480px] flex flex-col gap-6 lg:gap-3.5 xl:gap-4 2xl:gap-4.5 3xl:gap-6 overflow-y-auto pr-4 custom-scrollbar border-r border-border dark:border-white/10">
          <div className="flex-none">
            <h2 className="text-[18px] lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[18px] font-bold text-foreground mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
              Description
            </h2>

            <ProjectBriefBox label="Project Brief">
              {sampleDetails?.projectBrief || "No brief available."}
            </ProjectBriefBox>

            <ProjectBriefBox label="BD | CRO Brief">
              {sampleDetails?.bdCroBrief || "No additional brief available."}
            </ProjectBriefBox>

            <FieldInput label="Recipe Code" value={sampleDetails?.recipeCode} />
            <FieldInput
              label="Application Recipe Name"
              value={sampleDetails?.recipeName}
            />
            <FieldInput label="Date of Evaluation" value={today} />
            <FieldInput
              label="Production Date"
              value={
                sampleDetails?.productionDate
                  ? new Date(sampleDetails.productionDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )
                  : undefined
              }
            />

            <div className="mb-6 lg:mb-3.5 xl:mb-4 2xl:mb-4.5 3xl:mb-6">
              <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2">
                BFF Product Code & Dosages
              </label>
              {productCodeTable || (
                <div className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 italic opacity-60">
                  No product codes listed.
                </div>
              )}
            </div>

            <FieldInput
              label="Target Cost"
              value={
                sampleDetails?.targetCost
                  ? `${sampleDetails.targetCost} /kg`
                  : undefined
              }
            />
            <FieldInput
              label="Costing (Actual Cost)"
              value={
                sampleDetails?.actualCostPerKg
                  ? `${sampleDetails.actualCostPerKg.toFixed(2)} /kg`
                  : undefined
              }
            />
            <FieldInput label="Benchmark" value={sampleDetails?.benchmark} />
            <FieldInput label="Link" value={sampleDetails?.link} />
          </div>
        </div>

        {/* ── Right: Sensory Topsheet Panel ──────────────────────── */}
        <div className="flex-1 bg-card dark:bg-[#0B0B0F] flex flex-col overflow-y-auto custom-scrollbar px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4">
          <h2 className="text-[20px] lg:text-[10.5px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[20px] font-bold text-foreground text-center mb-8 lg:mb-4.5 xl:mb-5.5 2xl:mb-6.5 3xl:mb-8">
            Sensory Topsheet     
          </h2>

          {/* Rating Legend */}
          <div className="flex items-center justify-center mb-10 lg:mb-5.5 xl:mb-7 2xl:mb-8 3xl:mb-10 bg-[#F3E7FF] dark:bg-primary/10 rounded-3xl lg:rounded-[16px] xl:rounded-[20px] 2xl:rounded-[24px] 3xl:rounded-3xl px-6 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 gap-0 w-full max-w-[700px] lg:max-w-[453px] xl:max-w-[600px] 2xl:max-w-[680px] 3xl:max-w-[850px] mx-auto">
            {ratingLabels.map(({ value, label }) => {
              const c = RATING_COLORS[value];
              return (
                <div
                  key={value}
                  className="flex-1 flex flex-col items-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-1.5 3xl:gap-2 text-center"
                >
                  {value === 0 ? (
                    <div className="w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 rounded-full bg-[#E5E5E5] dark:bg-muted border-4 lg:border-2 xl:border-3 2xl:border-3 3xl:border-4 border-[#D6D6D6] dark:border-border flex items-center justify-center text-gray-300 font-bold text-sm lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-sm mx-auto">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.09245 0.00532904L5.7784 0.0378548C4.25451 0.189913 2.71923 0.975411 1.68106 2.13496C0.53306 3.41729 -0.0502981 5.00861 0.00340016 6.70402C0.0969653 9.63215 2.11065 12.1114 4.96723 12.8172C5.80826 13.0204 6.68129 13.0546 7.53564 12.9178C8.39 12.781 9.20865 12.4759 9.94408 12.0204C11.3905 11.1197 12.4258 9.68793 12.8275 8.0327C12.9675 7.46268 13 7.17239 13 6.49829C13 5.8242 12.9675 5.5339 12.8275 4.96389C12.1831 2.33336 10.0157 0.398078 7.31856 0.0451732C7.0875 0.0150868 6.24704 -0.011747 6.09245 0.00532904ZM7.19896 1.26408C7.76098 1.33549 8.30727 1.49953 8.81561 1.74953C9.38351 2.02599 9.77567 2.30734 10.237 2.7684C10.6596 3.17671 11.005 3.65796 11.2564 4.18896C11.6185 4.93299 11.782 5.651 11.782 6.49829C11.7928 7.30719 11.6086 8.1068 11.245 8.82958C11.1051 9.11499 10.8228 9.57279 10.691 9.72811L10.6462 9.78096L6.93373 6.06977L3.22041 2.35938L3.2733 2.31466C3.4287 2.18293 3.88676 1.90077 4.17234 1.76091C5.10904 1.29728 6.16309 1.12426 7.19896 1.26408ZM6.08188 6.93251L9.79194 10.6413L9.73742 10.6844C9.45358 10.8937 9.15256 11.0786 8.83757 11.2373C8.32759 11.4861 7.78233 11.6551 7.22093 11.7382C6.87596 11.7911 6.13395 11.7911 5.78898 11.7382C4.20407 11.4975 2.86649 10.6331 2.02441 9.30446C1.81727 8.96124 1.64449 8.59845 1.50858 8.22135C1.18895 7.28276 1.13573 6.27402 1.35481 5.30704C1.52291 4.60799 1.8258 3.94841 2.24652 3.36524C2.30347 3.288 2.35473 3.22457 2.36124 3.22457C2.36775 3.22457 4.04134 4.89314 6.08188 6.93251Z" fill="#6C6C6C" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className={`w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 rounded-full ${c.bg} border-4 lg:border-2 xl:border-3 2xl:border-3 3xl:border-4 ${c.border} flex items-center justify-center ${c.text} font-semibold text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px]`}
                    >
                      {value}
                    </div>
                  )}
                  <span className="text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-semibold dark:bg-[#0B0B0F] px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-1 rounded-full border border-gray-400 dark:border-border text-[#79737F] dark:text-muted-foreground tracking-tight leading-none whitespace-nowrap">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div>
            <div className="rounded-2xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-2xl border border-border/60 dark:border-border bg-white dark:bg-[#0B0B0F]">
              <div
                className={`overflow-auto transition-all duration-500 ease-in-out overflow-y-auto custom-scrollbar ${isTableExpanded ? "max-h-[75vh] opacity-100" : "max-h-[200px] opacity-95"}`}
              >
              <table
                className="w-full border-collapse min-w-[900px] lg:min-w-[500px] xl:min-w-[680px] 2xl:min-w-[760px] 3xl:min-w-[900px]"
              >
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  <th className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-5 lg:px-2.5 xl:px-3.5 2xl:px-4 3xl:px-5 text-[13px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] font-semibold text-gray-600 dark:text-muted-foreground text-center whitespace-nowrap w-16 lg:w-8 xl:w-10 2xl:w-12 3xl:w-16">
                    SL
                  </th>
                  <th className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[13px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] font-semibold text-gray-600 dark:text-muted-foreground text-left whitespace-nowrap min-w-36 lg:min-w-[95px] xl:min-w-[125px] 2xl:min-w-[140px] 3xl:min-w-36">
                    Panelist Name
                  </th>
                  {COLUMNS.map(({ key, label }) => (
                    <th
                      key={key}
                      className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 text-[12px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[12px] font-semibold text-gray-600 dark:text-muted-foreground text-center leading-tight"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 w-12 lg:w-6 xl:w-8 2xl:w-10 3xl:w-12" />
                </tr>
              </thead>
              <tbody>
                {evaluations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length + 3}
                      className="py-16 lg:py-8 xl:py-10 2xl:py-12 3xl:py-16 text-center text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground italic"
                    >
                      No evaluations submitted yet.
                    </td>
                  </tr>
                ) : (
                  evaluations.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-50 dark:border-border/40 hover:bg-gray-50/50 dark:hover:bg-primary/5 transition-colors"
                    >
                      <td className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-5 lg:px-2.5 xl:px-3.5 2xl:px-4 3xl:px-5 text-center ">
                        <span className="text-[13px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] font-bold text-primary bg-[#EEEBF4] h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 flex items-center justify-center rounded-full">
                          {item.sl || idx + 1}
                        </span>
                      </td>
                      <td className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[13px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] font-semibold text-gray-700 dark:text-foreground whitespace-nowrap">
                        {item.panelistID?.name || item.panelistName || "—"}
                      </td>
                      {COLUMNS.map(({ key }) => (
                        <td key={key} className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 text-center">
                          <RatingCircle value={item[key]} />
                        </td>
                      ))}
                      <td className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-center">
                        <button
                          className="py-1 lg:py-0.5 xl:py-[3px] 2xl:py-[3.5px] 3xl:py-1 px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-2.5 rounded-sm bg-[#EEEBF4] dark:bg-muted text-primary dark:text-muted-foreground hover:bg-primary/70 hover:text-white transition-colors cursor-pointer"
                          title="View comment"
                          onClick={() => handleOpenModal(item)}
                        >
                          <svg className="w-[22px] lg:w-[11px] xl:w-[14px] 2xl:w-[18px] 3xl:w-[22px] h-[22px] lg:h-[11px] xl:h-[14px] 2xl:h-[18px] 3xl:h-[22px]" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-4.59l-3.7 3.71c-.18.18-.43.29-.71.29a1 1 0 0 1-1-1v-3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m13 1H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4v4l4-4h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M5 7h13v1H5zm0 3h12v1H5zm0 3h8v1H5z"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                {/* Total */}
                <tr>
                  <td
                    colSpan={2}
                    className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-5 lg:px-2.5 xl:px-3.5 2xl:px-4 3xl:px-5 text-[12px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[12px] font-semibold text-gray-700 dark:text-muted-foreground text-center"
                  >
                    Total
                  </td>
                  {COLUMNS.map(({ key }) => (
                    <td key={key} className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 text-center">
                      <TotalCircle value={totals[key]} />
                    </td>
                  ))}
                  <td />
                </tr>

                {/* Mean */}
                <tr>
                  <td
                    colSpan={2}
                    className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-5 lg:px-2.5 xl:px-3.5 2xl:px-4 3xl:px-5 text-[12px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[12px] font-semibold text-gray-700 dark:text-muted-foreground text-center"
                  >
                    Mean
                  </td>
                  {COLUMNS.map(({ key }) => (
                    <td key={key} className="py-4 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4 px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 text-center">
                      <MeanCircle value={means[key]} />
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
              </table>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <Button
                  type="button"
                  onClick={() => setIsTableExpanded((prev) => !prev)}
                  className="relative z-10 bg-primary 3xl:border-2 2xl:border-2 xl:border-[1.5px] lg:border border-border 3xl:rounded-lg 2xl:rounded-md xl:rounded-sm lg:rounded-sm shadow-lg hover:shadow-xl active:scale-95 transition-all duration-500 ease-in-out flex items-center justify-center touch-manipulation px-1.5! lg:px-2! xl:px-2.5! 2xl:px-3! 3xl:px-3.5! py-0.5!"
                  aria-label={isTableExpanded ? "Collapse table" : "Expand table"}
                  title={isTableExpanded ? "Collapse table" : "Expand table"}
                >
                  <ChevronRight
                    className={`3xl:w-6 2xl:w-5 xl:w-4 lg:w-3 w-4 3xl:h-6 2xl:h-5 xl:h-4 lg:h-3 h-4 text-primary-shade-2 transition-transform duration-500 ease-in-out ${isTableExpanded ? "rotate-90" : "-rotate-90"}`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Top Sheet Section */}
          {existingTopSheet ? (
            <div className="mt-8 lg:mt-4.5 xl:mt-5.5 2xl:mt-6.5 3xl:mt-8 space-y-6 lg:space-y-3.5 xl:space-y-4 2xl:space-y-4.5 3xl:space-y-6">
              {/* Display stored comments/remarks */}
              {existingTopSheet.panelistComment && (
                <div>
                  <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
                    Comment
                  </label>
                  <div className="w-full min-h-20 lg:min-h-[42px] xl:min-h-[56px] 2xl:min-h-[64px] 3xl:min-h-20 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl border border-[#E2D8F0] dark:border-border bg-white dark:bg-[#0B0B0F] text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] dark:text-foreground leading-relaxed">
                    {existingTopSheet.panelistComment}
                  </div>
                </div>
              )}
              {existingTopSheet.panelistRemarks && (
                <div>
                  <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
                    Remark
                  </label>
                  <div className="w-full min-h-20 lg:min-h-[42px] xl:min-h-[56px] 2xl:min-h-[64px] 3xl:min-h-20 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl border border-[#E2D8F0] dark:border-border bg-white dark:bg-[#0B0B0F] text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] dark:text-foreground leading-relaxed">
                    {existingTopSheet.panelistRemarks}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 lg:mt-4.5 xl:mt-5.5 2xl:mt-6.5 3xl:mt-8 space-y-6 lg:space-y-3.5 xl:space-y-4 2xl:space-y-4.5 3xl:space-y-6">
              {/* Input form for new top sheet */}
              <div className="space-y-6 lg:space-y-3.5 xl:space-y-4 2xl:space-y-4.5 3xl:space-y-6">
                {/* Comment Input */}
                <div>
                  <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
                    Comment
                  </label>
                  <textarea
                    value={formData.panelistComment}
                    onChange={(e) => handleFormChange('panelistComment', e.target.value)}
                    placeholder="Enter your comment..."
                    className="w-full min-h-20 lg:min-h-[42px] xl:min-h-[56px] 2xl:min-h-[64px] 3xl:min-h-20 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl border border-[#E2D8F0] dark:border-border bg-white dark:bg-[#0B0B0F] text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] dark:text-foreground leading-relaxed placeholder:opacity-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Remark Input */}
                <div>
                  <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-foreground mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
                    Remark
                  </label>
                  <textarea
                    value={formData.panelistRemarks}
                    onChange={(e) => handleFormChange('panelistRemarks', e.target.value)}
                    placeholder="Enter your remark..."
                    className="w-full min-h-20 lg:min-h-[42px] xl:min-h-[56px] 2xl:min-h-[64px] 3xl:min-h-20 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl border border-[#E2D8F0] dark:border-border bg-white dark:bg-[#0B0B0F] text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] dark:text-foreground leading-relaxed placeholder:opacity-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

              </div>
            </div>
          )}

          {canSubmitTopSheet && (
            <div className="flex gap-4 justify-end mt-12 pb-10 lg:pb-5 xl:pb-7 2xl:pb-8 3xl:pb-10">
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                className="h-12 lg:h-6.5 xl:h-8.5 2xl:h-10 3xl:h-12 px-12 lg:px-6 xl:px-8 2xl:px-10 3xl:px-12 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/30 transition-all hover:bg-transparent hover:text-primary border border-primary cursor-pointer"
              >
                <Send className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>
      <EvaluationCommentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedEval}
        comments={sensoryFormComments}
        remarks={sensoryFormRemarks}
      />
      <SubmitEvaluationModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        mode="topSheet"
        submitPhase={topSheetSubmitPhase}
        onConfirm={handleSubmitEvaluation}
      />
    </section>
  );
}
