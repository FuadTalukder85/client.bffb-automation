import React, { useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Button } from "@/components/ui/Button";
import { Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmitEvaluationModal } from "@/features/sensory-testing/sensory-top-sheet/components/SubmitEvaluationModal";

const ratingLabels = [
  { value: 0, label: "N/A", emoji: "🚫" },
  { value: 1, label: "1 Bad", emoji: "☹️" },
  { value: 2, label: "2 Regular", emoji: "😐" },
  { value: 3, label: "3 Good", emoji: "😊" },
  { value: 4, label: "4 Better", emoji: "😁" },
  { value: 5, label: "5 Excellent", emoji: "😍" },
];

const MobileRatingSlider = ({ label, field, value, onChange, disabled, required }) => {
  return (
    <div className="flex flex-col gap-3 py-1 last:pb-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary capitalize dark:text-white">
          {label}
        </span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </div>

      <div className="group bg-[#FCFBFD] rounded-[50px] px-4 py-3 transition-all dark:bg-[#0B0B0F]">
        <div className="relative flex items-center">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-[#F3F0FA] rounded-full dark:bg-[#111217]" />

          {(value !== undefined && value !== null) && (
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-[#E3DFEB]/60 pointer-events-none rounded-full dark:bg-[#34283f]/60"
              style={{
                width: `${(value / 5) * 100}%`,
                backgroundImage:
                  'linear-gradient(45deg, rgba(255,255,255,0.45) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.45) 75%, transparent 75%, transparent)',
                backgroundSize: '10px 10px'
              }}
            />
          )}

          <div className="relative w-full flex justify-between items-center z-10 px-1">
            {[0, 1, 2, 3, 4, 5].map((dot) => (
              <div key={dot} className="relative flex items-center justify-center w-5 h-5">
                {value >= dot && <div className="absolute inset-0 bg-[#7C5CC4]/15 rounded-full" />}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(field, dot)}
                  className={cn(
                    "relative z-10 w-3 h-3 rounded-full border-2 transition-all duration-300 focus:outline-none shadow-sm",
                    value >= dot
                      ? "bg-[#7C5CC4] border-[#7C5CC4]"
                      : "bg-white border-[#D6C4F0] dark:bg-transparent dark:border-white/10"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileFieldInput = ({ label, value }) => (
  <div>
    <label className="block text-[14px] font-semibold text-[#1A1A1A] mb-2 dark:text-white">{label}</label>
    <div className="p-2 flex items-center rounded-md bg-white border border-[#7C5CC4] shadow-none dark:bg-transparent dark:border-white/10">
      <span className="text-[14px] text-[#4A4A4A] dark:text-white">
        {value || "—"}
      </span>
    </div>
  </div>
);

const MobileProjectBriefBox = ({ label, children }) => (
  <div>
    <label className="block text-[14px] font-bold text-[#1A1A1A] mb-2 dark:text-white">{label}</label>
    <div className="px-2 py-3.5 rounded-md bg-white border border-[#7C5CC4] shadow-none dark:bg-transparent dark:border-white/10">
      <p className="text-[14px] text-[#4A4A4A] dark:text-white">
        {children}
      </p>
    </div>
  </div>
);

export default function MobileSensoryFormDetailPage({
  sampleDetails,
  productionDate,
  formData,
  handleRatingChange,
  handleTextChange,
  handleSaveDraft,
  handleSubmit,
  isFormSubmitted,
  isSubmitting,
  isLoading,
  today,
  productCodeTable,
  user,
  hasError,
  errorMessage,
}) {
  const [activeTab, setActiveTab] = useState("description"); // "description" or "evaluation"
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);

  const handleSubmitEvaluation = (evaluation) => {
    // evaluation value ignored for form; simply submit
    handleSubmit();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="text-red-500 text-center py-10 px-4">{errorMessage}</div>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-6">
      {/* Header Area */}
      <div className="flex items-center gap-3">
        <BackButton className="w-8 h-8 rounded-none bg-transparent text-[#7C5CC4] hover:bg-transparent border-none shadow-none shrink-0 p-0" />
        <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-tight dark:text-white">
          {sampleDetails?.recipeName || "Sensory Evaluation"}
        </h1>
      </div>

      {/* Badges/Pills */}
      <div className="flex items-center gap-2">
         <div className="px-2 rounded-full border border-primary bg-white dark:bg-transparent dark:border-white/10">
           <span className="text-[12px] font-bold text-[#7C5CC4] dark:text-white">
             {sampleDetails?.recipeCode || "—"}
           </span>
         </div>
         <div className="px-2 rounded-full border border-[#716C7B] bg-[#EEEBF4] dark:bg-transparent dark:border-white/10">
           <span className="text-[12px] font-semibold text-[#2C2C2C] dark:text-white">
             {isFormSubmitted ? "Completed" : "In Progress"}
           </span>
         </div>
      </div>

      {/* Search Bar - use prebuilt SearchInput component */}
      <div className="w-full">
        <SearchInput
          placeholder="Search..."
          className="rounded-md border border-[#E2D8F0] bg-white text-[14px] focus:outline-none placeholder:text-[#4A4A4A]/40 dark:bg-transparent dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
          iconClassName="right-3 w-3 h-3 text-[#4A4A4A]/40 dark:text-white/40"
        />
      </div>

      {/* Tab Switcher - Segmented Style */}
      <div className="flex bg-white rounded-md border border-[#EEEBF4] dark:bg-transparent dark:border-white/10">
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-l-md transition-all",
            activeTab === "description" 
              ? "bg-[#EEEBF4] text-[#1A1A1A] shadow-sm dark:bg-transparent dark:text-white" 
              : "text-[#4A4A4A]/50 bg-transparent dark:text-white/60"
          )}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("evaluation")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-r-md transition-all",
            activeTab === "evaluation" 
              ? "bg-[#EEEBF4] text-[#1A1A1A] shadow-sm dark:bg-transparent dark:text-white" 
              : "text-[#4A4A4A]/50 bg-transparent dark:text-white/60"
          )}
        >
          Sensory Form
        </button>
      </div>

      {/* Main Container - Card with Border */}
      <div className="bg-white rounded-md border border-[#E2D8F0] p-2 lm:p-3 shadow-sm dark:bg-[#0B0B0F] dark:border-white/10">
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
            <MobileFieldInput label="Panelist Name" value={user?.name || user?.email} />
            <MobileFieldInput label="Date of Evaluation" value={today} />
            <MobileFieldInput
              label="Production Date"
              value={productionDate ? new Date(productionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined}
            />
            
            <div>
              <label className="block text-[14px] font-bold text-[#1A1A1A] mb-2 dark:text-white">BFF Product Code & Dosages</label>
              <div className="rounded-xl border border-[#E2D8F0] overflow-hidden bg-white dark:bg-transparent dark:border-white/10">
                {productCodeTable || (
                  <div className="p-4 text-sm text-[#4A4A4A] dark:text-white italic opacity-60">
                    No product codes listed.
                  </div>
                )}
              </div>
            </div>

            <MobileFieldInput label="Target Cost" value={sampleDetails?.targetCost} />
            <MobileFieldInput label="Costing (Actual Cost)" value={sampleDetails?.actualCostPerKg?.toFixed(2)} />
            <MobileFieldInput label="Benchmark" value={sampleDetails?.benchmark} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Rating Legend strip */}
            <div className="flex items-center justify-between gap-1 p-2 bg-[#F3E7FF] rounded-2xl border border-[#E2D8F0]/60 dark:bg-transparent dark:border-white/10">
              {ratingLabels.map((item) => (
                <div key={item.value} className="flex flex-col items-center">
                  <span className="text-md drop-shadow-sm">{item.emoji}</span>
                  <div className="px-2 rounded-full border border-[#79737F] shadow-sm text-center dark:border-white/10">
                    <div className="text-[8px] lm:text-[10px] font-semibold text-[#1A1A1A] whitespace-nowrap dark:text-white">
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <div className="w-8 h-8 border-4 border-[#7C5CC4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col">
                <MobileRatingSlider label="Appearance" field="appearance" value={formData.appearance} onChange={handleRatingChange} disabled={isSubmitting} required />
                <MobileRatingSlider label="Aroma" field="aroma" value={formData.aroma} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Taste" field="taste" value={formData.taste} onChange={handleRatingChange} disabled={isSubmitting} required />
                <MobileRatingSlider label="Flavour" field="flavour" value={formData.flavour} onChange={handleRatingChange} disabled={isSubmitting} required />
                <MobileRatingSlider label="Sweet" field="sweet" value={formData.sweet} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Sour" field="sour" value={formData.sour} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Salty" field="salty" value={formData.salty} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Spicy" field="spicy" value={formData.spicy} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Bitter" field="bitter" value={formData.bitter} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Texture" field="texture" value={formData.texture} onChange={handleRatingChange} disabled={isSubmitting} />
                <MobileRatingSlider label="Overall Acceptability" field="overAll" value={formData.overAll} onChange={handleRatingChange} disabled={isSubmitting} />

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[14px] font-bold text-[#1A1A1A] mb-2 dark:text-white">Comment</label>
                    <textarea
                      value={formData.panelistComment}
                      onChange={(e) => handleTextChange("panelistComment", e.target.value)}
                      placeholder="Comment..."
                      className="w-full min-h-10 p-2 rounded-md border border-[#E2D8F0] bg-white text-[14px] focus:outline-none transition-all font-medium text-[#4A4A4A] leading-relaxed placeholder:opacity-30 dark:bg-[#0B0B0F] dark:text-white dark:border-white/10 dark:placeholder:text-white/40"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-[#1A1A1A] mb-2 dark:text-white">Remark</label>
                    <textarea
                      value={formData.panelistRemark}
                      onChange={(e) => handleTextChange("panelistRemark", e.target.value)}
                      placeholder="Remark..."
                      className="w-full min-h-10 p-2 rounded-md border border-[#E2D8F0] bg-white text-[14px] focus:outline-none transition-all font-medium text-[#4A4A4A] leading-relaxed placeholder:opacity-30 dark:bg-[#0B0B0F] dark:text-white dark:border-white/10 dark:placeholder:text-white/40"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      {activeTab === "evaluation" && (
        <div className="flex flex-col gap-4 mt-6">
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={isSubmitting}
            className="w-full h-11 rounded-full bg-[#7C5CC4] text-white text-xs font-bold hover:bg-[#6849A8] shadow-xl shadow-[#7C5CC4]/20"
          >
            <Send className="w-4 h-4 mr-2" />
            {isFormSubmitted ? "Update Submission" : "Submit"}
          </Button>
          {/* <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="w-full h-14 rounded-full border-[#7C5CC4]/40 text-[#7C5CC4] text-[16px] font-bold hover:bg-[#7C5CC4]/5"
          >
            <Save className="w-5 h-5 mr-3" />
            {isFormSubmitted ? "Save Changes" : "Save Draft"}
          </Button> */}
        </div>
      )}
      <SubmitEvaluationModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        mode="sensoryForm"
        onConfirm={handleSubmitEvaluation}
      />
    </div>
  );
}
