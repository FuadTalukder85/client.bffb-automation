import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/Modal";
import { FileText, Users, Loader2, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExportTypeModal({
  open,
  onOpenChange,
  onInternal,
  onForClient,
  isExporting = false,
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[calc(100%-2.5rem)] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-gradient-to-b from-white to-[#F3F0FA] dark:from-gray-900 dark:to-[#1A1625] shadow-2xl overflow-hidden dark:border-nav-border">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <ModalHeader className="relative z-10 pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-center text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-gray-900 dark:text-white">
            Export Recipe PDF
          </ModalTitle>
          <ModalDescription className="text-center text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-lighter-text mt-1 lg:mt-0.5 xl:mt-0.5 2xl:mt-[3px] 3xl:mt-1">
            Choose the configuration for your export
          </ModalDescription>
        </ModalHeader>

        <div className="relative z-10 space-y-4 lg:space-y-1.5 xl:space-y-2 2xl:space-y-3 3xl:space-y-4">
          {/* For Client Card */}
          <button
            onClick={onForClient}
            disabled={isExporting}
            className={cn(
              "group relative w-full p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-2xl lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800/40 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 text-left flex items-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 disabled:opacity-50 disabled:cursor-not-allowed",
              "before:absolute before:inset-0 before:rounded-2xl before:bg-primary/5 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
            )}
          >
            <div className="relative z-10 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
              <Users className="w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! mb-0.5">
                For Client
              </h3>
              <p className="text-[10px] lg:text-[7px] xl:text-[8px]! 2xl:text-[10px]! 3xl:text-xs! text-lighter-text leading-tight">
                Export with or without SOP specifically for client presentation
              </p>
            </div>
            <ChevronRight className="relative z-10 w-5 h-5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-gray-300 group-hover:text-primary cursor-pointer" />
          </button>

          {/* Internal Card */}
          <button
            onClick={onInternal}
            disabled={isExporting}
            className={cn(
              "group relative w-full p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-2xl lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800/40 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 text-left flex items-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 disabled:opacity-50 disabled:cursor-not-allowed",
              "before:absolute before:inset-0 before:rounded-2xl before:bg-primary/5 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
            )}
          >
            <div className="relative z-10 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
              <FileText className="w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6" />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! mb-0.5">
                Internal Use
              </h3>
              <p className="text-[10px] lg:text-[7px] xl:text-[8px]! 2xl:text-[10px]! 3xl:text-xs! text-lighter-text leading-tight">
                Export all recipe details including complete ingredients table
              </p>
            </div>
            <Download className="relative z-10 w-5 h-5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-gray-300 group-hover:text-primary cursor-pointer" />
          </button>
        </div>

        {isExporting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
            <Loader2 className="w-10 h-10 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 text-primary animate-spin mb-3" />
            <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-primary animate-pulse">
              Generating PDF...
            </span>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}


