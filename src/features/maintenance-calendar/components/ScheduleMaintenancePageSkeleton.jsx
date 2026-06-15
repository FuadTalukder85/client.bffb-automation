import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ScheduleMaintenancePageSkeleton() {
  return (
    <section className="flex flex-col min-h-[calc(100vh-6rem)] bg-background dark:bg-[#0B0B0F] rounded-3xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-4 flex-none bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-60 rounded-full hidden lg:block" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6 rounded-3xl border border-border dark:border-white/10 dark:bg-[#0B0B0F]">
        <div className="w-110 flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar border-r border-border dark:border-white/10">
          <div className="space-y-6 py-2">
            {Array.from({ length: 3 }).map((_, groupIdx) => (
              <div key={`dept-skeleton-${groupIdx}`} className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, itemIdx) => (
                    <div
                      key={`item-skeleton-${groupIdx}-${itemIdx}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/40"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Skeleton className="w-7 h-7 rounded-full" />
                        <Skeleton className="h-5 w-44" />
                      </div>
                      <Skeleton className="w-5 h-5 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-card flex flex-col overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full px-4">
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="bg-[#FCFBFD] dark:bg-[#111115] rounded-4xl p-8 border border-[#E2D8F0] dark:border-white/5 space-y-10">
              <Skeleton className="h-11 w-full max-w-lg mx-auto rounded-lg" />
              <Skeleton className="h-56 w-full rounded-3xl" />
              <Skeleton className="h-96 w-full rounded-[28px]" />
            </div>

            <div className="flex gap-4 justify-end mt-12 pb-10">
              <Skeleton className="h-12 w-56 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
