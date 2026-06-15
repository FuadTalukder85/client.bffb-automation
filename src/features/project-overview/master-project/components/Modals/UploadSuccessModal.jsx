import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function UploadSuccessModal({ open, onOpenChange, result = null, className }) {
  const handleClose = (isOpen) => {
    onOpenChange(isOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
            "sm:max-w-[400px] md:max-w-[600px] gap-0 px-5 py-5 md:px-12 md:py-10 rounded-2xl md:rounded-3xl",
          className
        )}
      >
        <ModalHeader className="pb-4 md:pb-6">
          <ModalTitle className="text-lg font-semibold text-center md:text-2xl">
            Import Complete
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          {/* Success Icon Area */}
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full md:w-24 md:h-24 bg-[#8B5CF6]">
              <Check className="w-8 h-8 text-white md:w-10 md:h-10" strokeWidth={3} />
            </div>
          </div>
          
          <p className="px-4 text-sm text-center text-lighter-text md:text-base md:px-8">
            {result?.message || "Projects imported successfully"}
          </p>

          {result?.data?.results && (
            <div className="grid w-full grid-cols-2 gap-3 text-center text-xs text-muted-foreground">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-base font-semibold text-foreground">
                  {result.data.results.projects?.attempted || 0}
                </p>
                <p>Attempted</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-base font-semibold text-foreground">
                  {result.data.results.projects?.created || 0}
                </p>
                <p>Created (New)</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-base font-semibold text-foreground">
                  {result.data.results.projects?.modified || 0}
                </p>
                <p>Updated</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-base font-semibold text-foreground">
                  {result.data.results.projects?.unchanged || 0}
                </p>
                <p>Unchanged</p>
              </div>
            </div>
          )}

          {/* Production schedules import is disabled - hiding this section */}
          {/* {result?.data?.results?.productionSchedules && (
            <div className="grid w-full grid-cols-2 gap-3 text-center text-xs text-muted-foreground">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-base font-semibold text-foreground">
                  {result.data.results.productionSchedules.attempted || 0}
                </p>
                <p>Schedules Attempted</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-base font-semibold text-foreground">
                  {result.data.results.productionSchedules.created || 0}
                </p>
                <p>Schedules Created</p>
              </div>
            </div>
          )} */}
        </div>

        <ModalFooter className="flex flex-row justify-center w-full mt-6 md:mt-8 md:gap-6">
          <Button
            intent="primary"
            onClick={() => handleClose(false)}
            className="w-full max-w-[140px] md:max-w-[200px] md:h-12 md:text-base bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
