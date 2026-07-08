import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { recipeAPI } from "@/services/recipeService";
import { Loader2, Download, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function DownloadHistoryModal({
  open,
  onOpenChange,
  recipeId,
  recipeName,
}) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !recipeId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await recipeAPI.getRecipeDownloadHistory(recipeId);
        setLogs(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch download history:", error);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [open, recipeId]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent showCloseButton className="max-w-[calc(100%-2.5rem)] sm:max-w-[500px] lg:max-w-[480px]! xl:max-w-[540px]! 2xl:max-w-[600px]! 3xl:max-w-[700px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-gradient-to-b from-white to-[#F3F0FA] dark:from-gray-900 dark:to-[#1A1625] shadow-2xl dark:border-nav-border overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <ModalHeader className="relative z-10 pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-center text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-gray-900 dark:text-white">
            Download History
          </ModalTitle>
          {recipeName && (
            <p className="text-center text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-lighter-text mt-1 lg:mt-0.5 xl:mt-0.5 2xl:mt-[3px] 3xl:mt-1">
              {recipeName}
            </p>
          )}
        </ModalHeader>

        <div className="relative z-10 w-full min-w-0 max-h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-lighter-text">
              <Download className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No downloads yet</p>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-1 xl:space-y-1.5 2xl:space-y-2 3xl:space-y-2.5">
              {logs.map((log, index) => (
                <div
                  key={log._id || index}
                  className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-xl bg-white dark:bg-gray-800/40 border border-border/50 shadow-sm min-w-0"
                >
                  <div className="p-2 lg:p-1 xl:p-1.5 2xl:p-2 3xl:p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
                    <User className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {log.userId?.name || log.userId?.email || "Unknown User"}
                    </p>
                    <p className="text-[10px] lg:text-[7px] xl:text-[8px]! 2xl:text-[10px]! 3xl:text-xs! text-lighter-text truncate">
                      {log.details?.exportType === "internal"
                        ? "Internal Use"
                        : log.details?.exportType === "with-sop"
                          ? "Client - With SOP"
                          : "Client - Without SOP"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-2 shrink-0">
                    <Clock className="w-3 lg:w-2 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-2 xl:h-2 2xl:h-2.5 3xl:h-3 text-lighter-text" />
                    <span className="text-[10px] lg:text-[7px] xl:text-[8px]! 2xl:text-[10px]! 3xl:text-xs! text-lighter-text whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
