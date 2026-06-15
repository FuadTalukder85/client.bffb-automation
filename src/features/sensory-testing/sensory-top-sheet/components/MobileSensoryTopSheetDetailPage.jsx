import React, { useState, useMemo } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { AlignLeft, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { EvaluationCommentModal } from "./EvaluationCommentModal";
import { SubmitEvaluationModal } from "./SubmitEvaluationModal";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";
import { useCreateSensoryTopSheet, useUpdateSensoryTopSheet } from "@/hooks/useSensoryForm";

// ─── Shared colour palette for ratings ─────────────────────────────────────
const RATING_COLORS = {
  0: { bg: "bg-[#F3E7FF]", border: "border-[#C7D2FE]", text: "text-[#5B21B6]", filled: "bg-[#C7D2FE] text-[#5B21B6]" },
  1: { bg: "bg-[#FFE4E6]", border: "border-[#F87171]", text: "text-[#EF4444]", filled: "bg-[#F87171] text-white" },
  2: { bg: "bg-[#FFEDD5]", border: "border-[#FB923C]", text: "text-[#FB923C]", filled: "bg-[#FCA88A] text-white" },
  3: { bg: "bg-[#FEFCE8]", border: "border-[#FACC15]", text: "text-[#EAB308]", filled: "bg-[#FDE68A] text-[#92400E]" },
  4: { bg: "bg-[#DBEAFE]", border: "border-[#93C5FD]", text: "text-[#60A5FA]", filled: "bg-[#BFDBFE] text-[#1D4ED8]" },
  5: { bg: "bg-[#DCFCE7]", border: "border-[#4ADE80]", text: "text-[#22C55E]", filled: "bg-[#4ADE80] text-white" },
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
  { key: "overAll", label: "Overall" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const MobileFieldInput = ({ label, value }) => (
  <div>
    <label className="block text-[14px] font-semibold text-[#1A1A1A] dark:text-white mb-2">{label}</label>
    <div className="p-2 flex items-center rounded-md bg-white dark:bg-[#0B0B0F] border border-[#7C5CC4] dark:border-white/10">
      <span className="text-[14px] text-[#4A4A4A] dark:text-white">{value || "—"}</span>
    </div>
  </div>
);

const MobileProjectBriefBox = ({ label, children }) => (
  <div>
    <label className="block text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">{label}</label>
    <div className="px-2 py-3.5 rounded-md bg-white dark:bg-[#0B0B0F] border border-[#7C5CC4] dark:border-white/10">
      <p className="text-[14px] text-[#4A4A4A] dark:text-white">{children}</p>
    </div>
  </div>
);

const RatingCircle = ({ value }) => {
  if (value === 0) {
    return (
      <div className="w-7 h-7 rounded-full bg-[#F3E7FF] border-2 border-[#C7D2FE] flex items-center justify-center text-[#5B21B6] font-bold text-[10px] mx-auto">
        N/A
      </div>
    );
  }
  if (value == null) {
    return (
      <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-muted border-2 border-gray-200 dark:border-border flex items-center justify-center text-gray-300 font-bold text-[10px] mx-auto">
        —
      </div>
    );
  }
  const c = RATING_COLORS[value] || RATING_COLORS[1];
  return (
    <div className={`w-7 h-7 rounded-full ${c.bg} border-2 ${c.border} flex items-center justify-center ${c.text} font-bold text-[11px] leading-none mx-auto`}>
      {value}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function MobileSensoryTopSheetDetailPage({
  sampleDetails,
  evaluations = [],
  aggregated = {},
  existingTopSheet,
  canSubmitTopSheet,
  topSheetSubmitPhase,
  sensoryFormComments = [],
  sensoryFormRemarks = [],
  productCodeTable,
  today,
  sampleId,
  hasError,
  errorMessage,
  isSubmitModalOpen,
  setIsSubmitModalOpen,
  onSubmitEvaluation,
}) {
  const [activeTab, setActiveTab] = useState("description");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="text-red-500 text-center py-10 px-4">{errorMessage}</div>
        <BackButton />
      </div>
    );
  }
  const [formData, setFormData] = useState({
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
   
  const totals = useMemo(() =>
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
    [aggregated, evaluations]
  );

  // Use pre-computed averages from API, fall back to local calculation
  const means = useMemo(() =>
    COLUMNS.reduce((acc, { key }) => {
      if (aggregated[key]?.average != null) {
        acc[key] = aggregated[key].average;
      } else if (aggregated[key]?.allNa) {
        acc[key] = null;
      } else {
        const filled = evaluations.filter(e => e[key] != null && Number(e[key]) >= 1);
        acc[key] = filled.length > 0 ? filled.reduce((sum, e) => sum + Number(e[key]), 0) / filled.length : null;
      }
      return acc;
    }, {}),
    [aggregated, evaluations]
  );

  return (
    <div className="flex flex-col gap-2 bg-background dark:bg-[#0B0B0F]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton className="w-8 h-8 rounded-none bg-transparent text-[#7C5CC4] dark:text-primary hover:bg-transparent border-none shadow-none shrink-0 p-0" />
        <h1 className="text-[22px] font-bold text-[#1A1A1A] dark:text-white leading-tight">
          {sampleDetails?.recipeName || "Sensory Topsheet"}
        </h1>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2">
        <div className="px-2 rounded-full border border-primary bg-white dark:bg-[#0B0B0F] dark:border-primary/50">
          <span className="text-[12px] font-bold text-[#7C5CC4] dark:text-primary">
            {sampleDetails?.recipeCode || "—"}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="w-full">
        <SearchInput
          placeholder="Search..."
          className="rounded-md border border-[#E2D8F0] dark:border-white/20 bg-white dark:bg-[#0B0B0F] text-[14px] focus:outline-none dark:text-foreground"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white dark:bg-[#0B0B0F] rounded-md border border-[#EEEBF4] dark:border-white/20">
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-l-md transition-all",
            activeTab === "description"
              ? "bg-[#EEEBF4] dark:bg-primary/20 text-[#1A1A1A] dark:text-foreground shadow-sm"
              : "text-[#4A4A4A]/50 dark:text-gray-300 bg-transparent"
          )}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("topsheet")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-r-md transition-all",
            activeTab === "topsheet"
              ? "bg-[#EEEBF4] dark:bg-primary/20 text-[#1A1A1A] dark:text-foreground shadow-sm"
              : "text-[#4A4A4A]/50 dark:text-gray-300 bg-transparent"
          )}
        >
          Sensory Topsheet
        </button>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#0B0B0F] rounded-md border border-[#E2D8F0] dark:border-white/20 p-3 shadow-sm">
        {activeTab === "description" ? (
          <div className="flex flex-col gap-2">
            <MobileProjectBriefBox label="Project Brief">
              {sampleDetails?.projectBrief || "No brief available."}
            </MobileProjectBriefBox>
            <MobileProjectBriefBox label="BD | CRO Brief">
              {sampleDetails?.bdCroBrief || "No additional brief available."}
            </MobileProjectBriefBox>
            <MobileFieldInput label="Recipe Code" value={sampleDetails?.recipeCode} />
            <MobileFieldInput label="Application Recipe Name" value={sampleDetails?.recipeName} />
            <MobileFieldInput label="Date of Evaluation" value={today} />
            <MobileFieldInput
              label="Production Date"
              value={sampleDetails?.productionDate
                ? new Date(sampleDetails.productionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : undefined}
            />
            <div>
              <label className="block text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">BFF Product Code & Dosages</label>
              <div className="rounded-xl border border-[#E2D8F0] dark:border-white/20 overflow-hidden bg-white dark:bg-[#0B0B0F]">
                {productCodeTable || (
                  <div className="p-4 text-sm text-[#4A4A4A] dark:text-white italic opacity-60">
                    No product codes listed.
                  </div>
                )}
              </div>
            </div>
            <MobileFieldInput label="Target Cost" value={sampleDetails?.targetCost ? `${sampleDetails.targetCost} /kg` : undefined} />
            <MobileFieldInput label="Costing (Actual Cost)" value={sampleDetails?.actualCostPerKg?.toFixed(2)} />
            <MobileFieldInput label="Benchmark" value={sampleDetails?.benchmark} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="flex items-center justify-between gap-1 p-2 bg-[#F3E7FF] dark:bg-[#0B0B0F] rounded-2xl border border-[#E2D8F0]/60 dark:border-white/10">
              {ratingLabels.map(({ value, label }) => {
                const c = RATING_COLORS[value];
                return (
                  <div key={value} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full ${c.bg} ${c.border} dark:border-white/10 border-2 flex items-center justify-center ${c.text} font-bold text-sm`}>
                      {value}
                    </div>
                    <span className="text-[10px] font-semibold text-[#1A1A1A] dark:text-white whitespace-nowrap bg-white dark:bg-[#0B0B0F] px-1.5 py-0.5 rounded-full border border-[#79737F] dark:border-white/10">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Scrollable horizontal table */}
            <div className="overflow-x-auto -mx-3 px-3 custom-scrollbar">
              <table className="w-full border-collapse" style={{ minWidth: "900px" }}>
                <thead>
                  <tr className="border-b border-[#E2D8F0] dark:border-white/10">
                    <th className="py-2 px-3 text-[11px] font-bold text-base-color dark:text-white/50 text-center w-12">SL</th>
                    <th className="py-2 px-3 text-[11px] font-bold text-base-color dark:text-white/50 text-left">Panelist</th>
                    {COLUMNS.map(({ key, label }) => (
                      <th key={key} className="py-2 px-1 text-[10px] font-bold text-base-color dark:text-white/50 text-center w-16 leading-tight">
                        {label}
                      </th>
                    ))}
                    <th className="py-2 px-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {evaluations.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 3} className="py-10 text-center text-xs text-[#4A4A4A]/50 dark:text-white/40 italic">
                        No evaluations submitted yet.
                      </td>
                    </tr>
                  ) : (
                    evaluations.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#E2D8F0]/50 dark:border-white/5">
                        <td className="py-2 px-3 text-center">
                          <span className="text-[11px] font-bold text-primary bg-primary/10 dark:bg-primary/20 rounded-md px-1.5 py-0.5">
                            {item.sl || idx + 1}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[12px] font-semibold text-[#1A1A1A] dark:text-white">
                          {item.panelistID?.name || item.panelistName || "—"}
                        </td>
                        {COLUMNS.map(({ key }) => (
                          <td key={key} className="py-2 px-1">
                            <RatingCircle value={item[key]} />
                          </td>
                        ))}
                         <td className="py-2 px-2 text-center">
                          <button 
                            className="p-1 rounded-md text-[#4A4A4A]/40 dark:text-white/30 hover:text-primary transition-colors"
                            onClick={() => handleOpenModal(item)}
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#E2D8F0] dark:border-white/20 p-3 bg-white dark:bg-[#0B0B0F] space-y-2">
              <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-[#1A1A1A] dark:text-white/80">
                <span>Attribute</span>
                <span className="text-center">Total</span>
                <span className="text-center">Mean</span>
              </div>
              {COLUMNS.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-3 gap-2 items-center text-[11px] border-t border-[#E2D8F0]/60 dark:border-white/10 pt-2">
                  <span className="text-[#1A1A1A] dark:text-white/90">{label}</span>
                  <span className="text-center font-semibold text-primary">
                    {totals[key] === null || totals[key] === undefined ? "N/A" : totals[key]}
                  </span>
                  <span className="text-center font-semibold text-primary">
                    {means[key] === null || means[key] === undefined ? "N/A" : Number(means[key]).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Top sheet details or input */}
            {existingTopSheet ? (
              <div className="mt-2 space-y-3">
                {existingTopSheet.panelistComment && (
                  <div>
                    <label className="block text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">Comments</label>
                    <div className="w-full p-3 rounded-md border border-[#E2D8F0] dark:border-white/20 bg-white dark:bg-[#0B0B0F] text-[14px] text-[#4A4A4A] dark:text-white leading-relaxed">
                      {existingTopSheet.panelistComment}
                    </div>
                  </div>
                )}
                {existingTopSheet.panelistRemarks && (
                  <div>
                    <label className="block text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">Remarks</label>
                    <div className="w-full p-3 rounded-md border border-[#E2D8F0] dark:border-white/20 bg-white dark:bg-[#0B0B0F] text-[14px] text-[#4A4A4A] dark:text-white leading-relaxed">
                      {existingTopSheet.panelistRemarks}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                {/* Comments */}
                <div>
                  <label className="block text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">Comments</label>
                  <textarea
                    value={formData.panelistComment}
                    onChange={(e) => setFormData(prev => ({ ...prev, panelistComment: e.target.value }))}
                    placeholder="Enter your comments..."
                    className="w-full p-3 rounded-md border border-[#E2D8F0] dark:border-white/20 bg-white dark:bg-[#0B0B0F] text-[14px] text-[#4A4A4A] dark:text-white placeholder:text-[#4A4A4A]/50 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={3}
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">Remarks</label>
                  <textarea
                    value={formData.panelistRemarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, panelistRemarks: e.target.value }))}
                    placeholder="Enter your remarks..."
                    className="w-full p-3 rounded-md border border-[#E2D8F0] dark:border-white/20 bg-white dark:bg-[#0B0B0F] text-[14px] text-[#4A4A4A] dark:text-white placeholder:text-[#4A4A4A]/50 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
        {canSubmitTopSheet && (
          <div className="flex gap-4 justify-end mt-8 pb-4 px-2">
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full h-12 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/30 transition-all cursor-pointer"
            >
              <Send className="w-5 h-5 mr-2" />
              Submit
            </Button>
          </div>
        )}
      </div>
      )}
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
    </div>
  </div>
  );
}
