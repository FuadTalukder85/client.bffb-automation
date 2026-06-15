import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { IoMdArrowDropdown } from "react-icons/io";
import { ClipboardCheck } from "lucide-react";

export function SubmitEvaluationModal({
  open,
  onOpenChange,
  onConfirm,
  mode = "topSheet",
  submitPhase = "initial",
}) {
  const isSensoryFormMode = mode === "sensoryForm";
  const isShelfLifeOnlyPhase = mode === "topSheet" && submitPhase === "shelfLifeOnly";
  const shouldSkipSelection = isSensoryFormMode || isShelfLifeOnlyPhase;
  const [step, setStep] = useState(1);
  const [evaluation, setEvaluation] = useState(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [sendForShelfLife, setSendForShelfLife] = useState(false);
  const [dispatchSample, setDispatchSample] = useState(false);
  const [reworkTask, setReworkTask] = useState(null);
  const [isReworkSelectOpen, setIsReworkSelectOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isSensoryFormMode) {
      setStep(2);
      setEvaluation("approve");
      return;
    }

    if (isShelfLifeOnlyPhase) {
      setStep(2);
      setEvaluation("approve");
      return;
    }

    setStep(1);
    setEvaluation(null);
    setSendForShelfLife(false);
    setDispatchSample(false);
    setReworkTask(null);
  }, [open, isSensoryFormMode, isShelfLifeOnlyPhase]);

  const handleNext = () => setStep(2);
  const handleBack = () => {
    if (shouldSkipSelection) {
      handleClose();
      return;
    }
    setStep(1);
  };
  
  const handleClose = () => {
    setStep(1);
    setEvaluation(null);
    setIsSelectOpen(false);
    setSendForShelfLife(false);
    setDispatchSample(false);
    setReworkTask(null);
    setIsReworkSelectOpen(false);
    onOpenChange(false);
  };

  const options = useMemo(() => {
    if (mode === "sensoryForm") {
      return [
        {
          value: "approve",
          title: "Approve",
        },
      ];
    }

    return [
      {
        value: "rework",
        title: "Rework",
        subtitle: "Send to Application Lab",
      },
      {
        value: "approve",
        title: "Approve",
      },
    ];
  }, [mode]);

  const selectedOption = options.find(o => o.value === evaluation);

  const handleProceed = () => {
    if (mode === "topSheet") {
      onConfirm?.({
        evaluation,
        sendForShelfLife: evaluation === "approve" ? sendForShelfLife : false,
        dispatchSample: evaluation === "approve" ? dispatchSample : false,
        reworkTask: evaluation === "rework" ? reworkTask : null,
      });
      handleClose();
      return;
    }

    onConfirm?.(evaluation);
    handleClose();
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-[400px] lg:max-w-[320px] xl:max-w-[426px] 2xl:max-w-[480px] 3xl:max-w-[600px] gap-0 px-5 py-5 lg:px-6.5 xl:px-8.5 2xl:px-9.5 3xl:px-12 lg:py-5.5 xl:py-7 2xl:py-8 3xl:py-10 rounded-2xl md:rounded-3xl bg-background dark:bg-card dark:border dark:border-primary shadow-2xl overflow-hidden">
        <h2 className="font-semibold text-center text-lg text-[12.5px] lg:text-[17px] 2xl:text-[19px] 3xl:text-2xl text-[#1A1A1A] dark:text-foreground mb-6 lg:mb-5.5 xl:mb-7 2xl:mb-8 3xl:mb-10">
          Submit Evaluation
        </h2>

        {step === 1 && !shouldSkipSelection ? (
          <div className="flex flex-col gap-6 lg:gap-5.5 xl:gap-7 2xl:gap-8 3xl:gap-10">
            {/* Custom Accordion Select */}
            <div className="space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
              <label className="block text-xs lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] font-medium text-[#B0B0B0] dark:text-muted-foreground px-1">
                Approved for Shelf Life Testing
              </label>
              <div className="relative">
                <div 
                  className={cn(
                    "relative border-primary bg-[#FBF9FF] dark:bg-primary/5 rounded-xl lg:rounded-xs xl:rounded-sm 2xl:rounded-lg 3xl:rounded-xl transition-all overflow-hidden",
                    isSelectOpen ? "border" : "border"
                  )}
                >
                  <button
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full flex items-center justify-between px-5 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-5 h-[40px] lg:h-[25px] xl:h-[35px] 2xl:h-[40px] 3xl:h-[50px] text-left focus:outline-none"
                  >
                    <span className={cn(
                      "text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] font-semibold",
                      evaluation ? "text-[#4A4A4A] dark:text-primary" : "text-[#4A4A4A]/60 dark:text-primary"
                    )}>
                      {selectedOption ? selectedOption.title : "Select"}
                    </span>
                    <IoMdArrowDropdown 
                      className={cn(
                        "w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 text-primary fill-primary transition-transform duration-200",
                        isSelectOpen ? "-rotate-180" : ""
                      )} 
                    />
                  </button>

                  {isSelectOpen && (
                    <div className="border-t border-primary/20">
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setEvaluation(opt.value);
                            if (opt.value !== "approve") {
                              setSendForShelfLife(false);
                              setDispatchSample(false);
                            }
                            setIsSelectOpen(false);
                          }}
                          className={cn(
                            "w-full px-5 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-5 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left hover:bg-[#F3E7FF] dark:hover:bg-primary/10 transition-colors flex flex-col gap-0.5",
                            evaluation === opt.value && "bg-[#F3E7FF] dark:bg-primary/10"
                          )}
                        >
                          <span className="text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] font-bold text-[#4A4A4A] dark:text-foreground">
                            {opt.title}
                          </span>
                          {opt.subtitle && (
                            <span className="text-[12px] lg:text-[6px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] text-[#A1A1A1] dark:text-muted-foreground">
                              {opt.subtitle}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rework Task Select */}
            {evaluation === "rework" && (
              <div className="space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
                <label className="block text-xs lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] font-medium text-[#B0B0B0] dark:text-muted-foreground px-1">
                  Rework Task
                </label>
                <div className="relative">
                  <div className="relative border-primary bg-[#FBF9FF] dark:bg-primary/5 rounded-xl lg:rounded-xs xl:rounded-sm 2xl:rounded-lg 3xl:rounded-xl transition-all overflow-hidden border">
                    <button
                      onClick={() => setIsReworkSelectOpen(!isReworkSelectOpen)}
                      className="w-full flex items-center justify-between px-5 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-5 h-[40px] lg:h-[25px] xl:h-[35px] 2xl:h-[40px] 3xl:h-[50px] text-left focus:outline-none"
                    >
                      <span className={cn(
                        "text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] font-semibold",
                        reworkTask ? "text-[#4A4A4A] dark:text-primary" : "text-[#4A4A4A]/60 dark:text-primary"
                      )}>
                        {reworkTask || "Select"}
                      </span>
                      <IoMdArrowDropdown 
                        className={cn(
                          "w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 text-primary fill-primary transition-transform duration-200",
                          isReworkSelectOpen ? "-rotate-180" : ""
                        )} 
                      />
                    </button>

                    {isReworkSelectOpen && (
                      <div className="border-t border-primary/20">
                        {["Application Recipe", "Sample Preparation"].map((taskOpt) => (
                          <button
                            key={taskOpt}
                            onClick={() => {
                              setReworkTask(taskOpt);
                              setIsReworkSelectOpen(false);
                            }}
                            className={cn(
                              "w-full px-5 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-5 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-left hover:bg-[#F3E7FF] dark:hover:bg-primary/10 transition-colors flex flex-col gap-0.5",
                              reworkTask === taskOpt && "bg-[#F3E7FF] dark:bg-primary/10"
                            )}
                          >
                            <span className="text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] font-bold text-[#4A4A4A] dark:text-foreground">
                              {taskOpt}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mode === "topSheet" && evaluation === "approve" && (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 px-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendForShelfLife}
                    onChange={(e) => setSendForShelfLife(e.target.checked)}
                    className="w-5 lg:w-2 xl:w-3 2xl:w-3.5 3xl:w-5 h-5 lg:h-2 xl:h-3 2xl:h-3.5 3xl:h-5 border-2 border-primary accent-primary"
                  />
                  <span className="text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] text-[#8f8f8f] dark:text-muted-foreground">
                    Send for Shelf-Life Testing
                  </span>
                </label>
                <label className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 px-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dispatchSample}
                    onChange={(e) => setDispatchSample(e.target.checked)}
                    className="w-5 lg:w-2 xl:w-3 2xl:w-3.5 3xl:w-5 h-5 lg:h-2 xl:h-3 2xl:h-3.5 3xl:h-5 border-2 border-primary accent-primary"
                  />
                  <span className="text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] text-[#8f8f8f] dark:text-muted-foreground">
                    Dispatch Sample
                  </span>
                </label>
              </div>
            )}

            <div className="flex flex-row justify-center gap-3 mt-2 md:gap-6">
              <Button
                onClick={handleClose}
                className="flex-1 max-w-[140px] lg:max-w-[105px] xl:max-w-[140px] 2xl:max-w-[160px] 3xl:max-w-[200px] h-10 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 text-sm lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base border border-[#EEEBF4] dark:border-primary bg-transparent hover:bg-primary/20 text-primary dark:text-nav-highlight transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceed}
                disabled={!evaluation || (evaluation === "rework" && !reworkTask)}
                className="flex-1 max-w-[140px] lg:max-w-[105px] xl:max-w-[140px] 2xl:max-w-[160px] 3xl:max-w-[200px] h-10 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 text-sm lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base bg-[#593292] hover:bg-[#4A297A] text-white shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 lg:w-13 xl:w-17 2xl:w-19 3xl:w-24 h-16 lg:h-13 xl:h-17 2xl:h-19 3xl:h-24 rounded-full bg-[#593292] flex items-center justify-center mb-6 lg:mb-4.5 xl:mb-5.5 2xl:mb-6.5 3xl:mb-8 shadow-xl shadow-primary/20">
              <ClipboardCheck className="w-8 h-8 lg:w-8 xl:w-9 2xl:w-11 3xl:w-12 lg:h-8 xl:h-9 2xl:h-11 3xl:h-12 text-white" />
            </div>

            <h3 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-[#1A1A1A] dark:text-foreground mb-3 lg:mb-1 xl:mb-2 2xl:mb-3 3xl:mb-4 px-4 lg:px-1 xl:px-2 2xl:px-3 3xl:px-4">
              Are you sure you want to submit this form?
            </h3>
            
            <p className="text-sm lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] text-[#79737F] dark:text-muted-foreground mb-3 lg:mb-1 xl:mb-2 2xl:mb-3 3xl:mb-4 leading-relaxed max-w-[400px] px-2 md:px-0">
              {mode === "sensoryForm"
                ? "Fill in all the fields appropriately before proceeding with approval."
                : isShelfLifeOnlyPhase
                  ? "Choose to send this top sheet for shelf-life testing."
                  : "Fill in all the fields appropriately. Once submitted, your evaluation cannot be changed."}
            </p>

            {/* {mode === "topSheet" && evaluation === "approve" && (
              <label className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 px-1 cursor-pointer select-none mb-4">
                <input
                  type="checkbox"
                  checked={sendForShelfLife}
                  onChange={(e) => setSendForShelfLife(e.target.checked)}
                  className="w-5 lg:w-2 xl:w-3 2xl:w-3.5 3xl:w-5 h-5 lg:h-2 xl:h-3 2xl:h-3.5 3xl:h-5 border-2 border-primary accent-primary"
                />
                <span className="text-[14px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] text-[#8f8f8f] dark:text-muted-foreground">
                  Send for Shelf-Life Testing
                </span>
              </label>
            )} */}
            
            <p className="text-[11px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[14px] text-[#A1A1A1] dark:text-muted-foreground italic mb-6 lg:mb-5.5 xl:mb-7 2xl:mb-8 3xl:mb-10 leading-relaxed px-4 lg:px-1 xl:px-2 2xl:px-3 3xl:px-4">
              Make sure to only perform this function with proper authorization.
            </p>

            <div className="flex flex-row justify-center gap-3 lg:gap-3 xl:gap-4 2xl:gap-4.5 3xl:gap-6 w-full">
              <Button
                onClick={handleBack}
                className="flex-1 max-w-[140px] lg:max-w-[105px] xl:max-w-[140px] 2xl:max-w-[160px] 3xl:max-w-[200px] h-10 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 text-sm lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base border border-[#EEEBF4] dark:border-primary bg-transparent hover:bg-primary/20 text-primary dark:text-nav-highlight transition-all"
              >
                {shouldSkipSelection ? "Cancel" : "Back"}
              </Button>
              <Button
                onClick={() => {
                   handleProceed();
                }}
                className="flex-1 max-w-[140px] lg:max-w-[105px] xl:max-w-[140px] 2xl:max-w-[160px] 3xl:max-w-[200px] h-10 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 text-sm lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base bg-[#593292] hover:bg-[#4A297A] text-white shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                Proceed
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}