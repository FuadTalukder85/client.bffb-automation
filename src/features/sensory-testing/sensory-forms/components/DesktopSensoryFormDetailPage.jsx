import React from "react";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Button } from "@/components/ui/Button";
import { Save, Send } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { SensoryDetailSkeleton } from "./SensoryDetailSkeleton";
import { SubmitEvaluationModal } from "@/features/sensory-testing/sensory-top-sheet/components/SubmitEvaluationModal";

const ratingLabels = [
  { value: 0, label: "N/A", emoji: "🚫" },
  { value: 1, label: "1 Bad", emoji: "☹️" },
  { value: 2, label: "2 Regular", emoji: "😐" },
  { value: 3, label: "3 Good", emoji: "😊" },
  { value: 4, label: "4 Better", emoji: "😁" },
  { value: 5, label: "5 Excellent", emoji: "😍" },
];

const RatingSlider = ({ label, field, value, onChange, disabled, required }) => {
  return (
    <div className="flex items-center gap-6 lg:gap-3 xl:gap-4 2xl:gap-4.5 3xl:gap-6 group bg-[#FCFBFD] hover:bg-[#F9F8FD] dark:bg-[#0B0B0F] dark:hover:bg-[#0B0B0F] rounded-[50px] transition-all duration-200 px-6 lg:px-3 xl:px-4 2xl:px-4.5 3xl:px-6 py-3.5 lg:py-[7.5px] xl:py-[9px] 2xl:py-[11px] 3xl:py-3.5 border border-transparent hover:border-primary/10">
      <span className="w-44 lg:w-[95px] xl:w-[125px] 2xl:w-[140px] 3xl:w-44 text-[15px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-[15px] font-semibold text-primary capitalize shrink-0 flex items-center gap-1 dark:text-white">
        {label}
        {/* {required && <span className="text-red-500 font-bold">*</span>} */}
      </span>
      
      <div className="relative flex-1 flex items-center">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2.5 lg:h-[5.5px] xl:h-[7px] 2xl:h-[8px] 3xl:h-2.5 bg-[#F3F0FA] rounded-full overflow-hidden dark:bg-[#111217]">
        </div>

        {/* Selected Value Track (Stripe effect from image) */}
        {(value !== undefined && value !== null) && (
           <div 
             className="absolute top-1/2 -translate-y-1/2 left-0 h-2.5 lg:h-[5.5px] xl:h-[7px] 2xl:h-[8px] 3xl:h-2.5 bg-[#E3DFEB]/60 pointer-events-none rounded-full dark:bg-[#34283f]/60"
             style={{ 
               width: `${(value / 5) * 100}%`,
               backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 75%, transparent 75%, transparent)',
               backgroundSize: '10px 10px'
             }}
           />
        )}

        {/* Dots */}
        <div className="relative w-full flex justify-between items-center z-10 px-1">
          {[0, 1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} className="relative flex items-center justify-center w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7">
                {/* Only show halo for selected rating */}
              {value >= dot && <div className={cn("absolute inset-0 rounded-full", dot === 0 ? "bg-slate-500/15" : "bg-primary/15")} />}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(field, dot)}
                className={cn(
                  "relative z-10 w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5 rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  value >= dot
                    ? (dot === 0 ? "bg-[#94A3B8] border-[#94A3B8] shadow-sm" : "bg-primary border-primary shadow-sm")
                    : "bg-white border-primary shadow-none dark:bg-transparent dark:border-white/10"
                )}
                style={!disabled ? { cursor: 'pointer' } : {}}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectBriefBox = ({ label, children }) => (
  <div className="mb-6 lg:mb-3.5 xl:mb-4 2xl:mb-4.5 3xl:mb-6">
    <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 dark:text-white">{label}</label>
    <div className="p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl bg-[#F9F8FD] dark:bg-[#0B0B0F] border border-[#E2D8F0] dark:border-primary/50 min-h-[100px] lg:min-h-[55px] xl:min-h-[71px] 2xl:min-h-[80px] 3xl:min-h-[100px]">
      <p className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] leading-relaxed dark:text-white">
        {children}
      </p>
    </div>
  </div>
);

const FieldInput = ({ label, value }) => (
  <div className="mb-6 lg:mb-3.5 xl:mb-4 2xl:mb-4.5 3xl:mb-6">
    <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 dark:text-white">{label}</label>
    <div className="h-[46px] lg:h-[24px] xl:h-[32px] 2xl:h-[36px] 3xl:h-[46px] px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 flex items-center rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl bg-[#F9F8FD] dark:bg-[#0B0B0F] border border-[#E2D8F0] dark:border-primary/50">
      <span className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#4A4A4A] truncate dark:text-white">
        {value || "—"}
      </span>
    </div>
  </div>
);

export default function DesktopSensoryFormDetailPage({
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
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);

  const handleSubmitEvaluation = (evaluation) => {
    // evaluation value ignored for form; simply submit
    handleSubmit();
  }; 
  if (isLoading) return <SensoryDetailSkeleton />;

  if (hasError) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] bg-background dark:bg-[#0B0B0F] rounded-3xl">
        <div className="text-red-500 text-center py-10">{errorMessage}</div>
        <BackButton />
      </section>
    );
  }

  return (
    <section className="flex flex-col min-h-[calc(100vh-6rem)] bg-background dark:bg-[#0B0B0F] rounded-3xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 lg:pb-2 xl:pb-2.5 2xl:pb-3 3xl:pb-4 flex-none bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton className="" />
          <div className="flex flex-col">
            <h1 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-foreground leading-tight">
              {sampleDetails?.recipeName || "Sensory Evaluation"}
            </h1>
            <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
               <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
                 {sampleDetails?.recipeCode || "—"}
               </span>
               <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 y-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-foreground">
                  {isFormSubmitted ? "Completed" : "In Progress"}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
           <div className="hidden lg:block">
              <SearchInput 
                placeholder="Search..." 
              />
           </div>
           <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 lg:p-3.5 xl:p-4 2xl:p-4.5 3xl:p-6 gap-6 lg:gap-3.5 xl:gap-4 2xl:gap-4.5 3xl:gap-6 rounded-[24px] border border-border dark:border-white/10 dark:bg-[#0B0B0F]">
        {/* Left Side: Description Panel */}
        <div className="w-[480px] lg:w-[255px] xl:w-[341px] 2xl:w-[385px] 3xl:w-[480px] flex flex-col gap-6 lg:gap-3.5 xl:gap-4 2xl:gap-4.5 3xl:gap-6 overflow-y-auto pr-4 custom-scrollbar border-r border-border dark:border-white/10">
          <div className="flex-none">
            <h2 className="text-[18px] lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[18px] font-bold text-foreground mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">Description</h2>
            
            <ProjectBriefBox label="Project Brief">
              {sampleDetails?.projectBrief || "No brief available."}
            </ProjectBriefBox>

            <ProjectBriefBox label="BD | CRO Brief">
              {sampleDetails?.bdCroBrief || "No additional brief available."}
            </ProjectBriefBox>

            <FieldInput label="Recipe Code" value={sampleDetails?.recipeCode} />
            <FieldInput label="Application Recipe Name" value={sampleDetails?.recipeName} />
            <FieldInput label="Panelist Name" value={user?.name || user?.email} />
            <FieldInput label="Date of Evaluation" value={today} />
            <FieldInput
              label="Production Date"
              value={productionDate ? new Date(productionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined}
            />

            <div className="mb-6">
              <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] dark:text-white mb-2">BFF Product Code & Dosages</label>
              {productCodeTable || <div className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground p-4 italic opacity-60">No product codes listed.</div>}
            </div>

            <FieldInput label="Target Cost" value={sampleDetails?.targetCost ? `${sampleDetails.targetCost} /kg` : undefined} />
            <FieldInput label="Costing (Actual Cost)" value={sampleDetails?.actualCostPerKg ? `${sampleDetails.actualCostPerKg.toFixed(2)} /kg` : undefined} />
            <FieldInput label="Benchmark" value={sampleDetails?.benchmark} />
            <FieldInput label="Link" value={sampleDetails?.link} />
          </div>
        </div>

        {/* Right Side: Sensory Form Panel */}
        <div className="flex-1 bg-card flex flex-col overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl lg:max-w-[515px] xl:max-w-[637px] 2xl:max-w-[715px] 3xl:max-w-4xl mx-auto w-full">
            <h2 className="text-[18px] lg:text-[9.5px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[18px] font-bold text-foreground mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4 text-center">Sensory Form</h2>

            {/* Rating Legend Header */}
            <div className="flex w-full justify-end gap-0 mb-10  p-2">
              <div className="flex max-w-[700px] lg:max-w-[375px] xl:max-w-[500px] 2xl:max-w-[560px] 3xl:max-w-[700px] items-center justify-end gap-0 w-full bg-primary/5 rounded-[20px] border border-border">
                {ratingLabels.map((item) => (
                  <div key={item.value} className="flex-1 flex flex-col items-center py-2 px-1 lg:px-[1px] xl:px-[2px] 2xl:px-[3px] 3xl:px-1 text-center">
                    <span className="text-2xl text-[12.5px] lg:text-[17px] 2xl:text-[19px] 3xl:text-2xl mb-2 drop-shadow-sm">{item.emoji}</span>
                    <span className="text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[10px] font-bold bg-card px-3 py-1.5 rounded-full border border-border text-foreground shadow-sm tracking-tight leading-none">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
              <div className="space-y-4 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3.5 3xl:space-y-4 mb-10 lg:mb-5.5 xl:mb-7 2xl:mb-8 3xl:mb-10">
                <RatingSlider label="Appearance" field="appearance" value={formData.appearance} onChange={handleRatingChange} disabled={false} required />
                <RatingSlider label="Aroma" field="aroma" value={formData.aroma} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Taste" field="taste" value={formData.taste} onChange={handleRatingChange} disabled={false} required />
                <RatingSlider label="Flavour" field="flavour" value={formData.flavour} onChange={handleRatingChange} disabled={false} required />
                <RatingSlider label="Sweet" field="sweet" value={formData.sweet} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Sour" field="sour" value={formData.sour} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Salty" field="salty" value={formData.salty} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Spicy" field="spicy" value={formData.spicy} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Bitter" field="bitter" value={formData.bitter} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Texture" field="texture" value={formData.texture} onChange={handleRatingChange} disabled={false} />
                <RatingSlider label="Overall Acceptability" field="overAll" value={formData.overAll} onChange={handleRatingChange} disabled={false} />
              </div>

            <div className="space-y-6 lg:space-y-6-3 xl:space-y-6-4 2xl:space-y-6-4.5 3xl:space-y-6-6">
              <div>
                <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] mb-2 dark:text-white">Comment</label>
                <textarea
                  value={formData.panelistComment}
                  onChange={(e) => handleTextChange("panelistComment", e.target.value)}
                  placeholder="Visually, the swirls are nice and distinct, the chocolate is rich and dark. There is a mild tangy aftertaste. Not too sweet."
                  className="w-full min-h-[120px] lg:min-h-[64px] xl:min-h-[85px] 2xl:min-h-[96px] 3xl:min-h-[120px] p-5 lg:p-2.5 xl:p-3.5 2xl:p-4 3xl:p-5 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl border border-[#E2D8F0] dark:border-primary/50 bg-[#F9F8FD] dark:bg-[#0B0B0F] text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] focus:outline-none transition-all font-medium text-[#4A4A4A] dark:text-white leading-relaxed placeholder:opacity-30 dark:placeholder:text-white/40"
                  disabled={false}
                />
              </div>
              <div>
                <label className="block text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-[#1A1A1A] mb-2 dark:text-white">Remark</label>
                <textarea
                  value={formData.panelistRemark}
                  onChange={(e) => handleTextChange("panelistRemark", e.target.value)}
                  placeholder="If I were to tweak it, I might make the tang slightly bolder, just enough so that the 'tangy' promise hits you immediately with the first bite and not as an aftertaste."
                  className="w-full min-h-[120px] lg:min-h-[64px] xl:min-h-[85px] 2xl:min-h-[96px] 3xl:min-h-[120px] p-5 lg:p-2.5 xl:p-3.5 2xl:p-4 3xl:p-5 rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl border border-[#E2D8F0] dark:border-primary/50 bg-[#F9F8FD] dark:bg-[#0B0B0F] text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] focus:outline-none transition-all font-medium text-[#4A4A4A] dark:text-white leading-relaxed placeholder:opacity-30 dark:placeholder:text-white/40"
                  disabled={false}
                />
              </div>
            </div>

              <div className="flex gap-4 justify-end mt-12 pb-10 lg:pb-5 xl:pb-7 2xl:pb-8 3xl:pb-10">
                {/* <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="h-12 lg:h-6.5 xl:h-8.5 2xl:h-10 3xl:h-12 px-10 lg:px-5 xl:px-7 2xl:px-8 3xl:px-10 rounded-full border border-primary bg-transparent text-primary font-bold hover:bg-primary hover:text-white cursor-pointer transition-all shadow-sm"
                >
                  <Save className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
                  {isFormSubmitted ? "Save Changes" : "Save Draft"}
                </Button> */}
                <Button
                  onClick={() => setIsSubmitModalOpen(true)}
                  disabled={isSubmitting}
                  className="h-12 lg:h-6.5 xl:h-8.5 2xl:h-10 3xl:h-12 px-12 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/30 transition-all hover:bg-transparent hover:text-primary border border-primary cursor-pointer"
                >
                  <Send className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
                  {isFormSubmitted ? "Update Submission" : "Submit"}
                </Button>
              </div>
          </div>
        </div>
      </div>
      <SubmitEvaluationModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        mode="sensoryForm"
        onConfirm={handleSubmitEvaluation}
      />
    </section>
  );
}
