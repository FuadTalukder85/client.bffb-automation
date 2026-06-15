import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MaintenanceCalendarMobileSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-500 min-h-screen bg-[#F8F9FB] dark:bg-[#0B0B0F]">
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-border/40">
           <Skeleton className="h-6 w-24 rounded-md" />
           <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </div>

      {/* Table-like Mobile Grid Skeleton */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-[24px] border border-border/40 shadow-sm">
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-transparent">
          {/* Header Row */}
          <div className="flex h-12 border-b border-border/40 shrink-0">
             <div className="w-[140px] px-4 flex items-center shrink-0 border-r border-border/20 bg-slate-50 dark:bg-slate-800/60 sticky left-0 z-10">
                <Skeleton className="h-4 w-20" />
             </div>
             <div className="flex overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-16 flex items-center justify-center shrink-0">
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
             </div>
          </div>

          {/* Body Rows */}
          <div className="flex-1 overflow-y-auto">
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex h-12 border-b border-border/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                 <div className="w-[140px] px-4 flex flex-col justify-center shrink-0 border-r border-border/10 bg-white dark:bg-slate-900 sticky left-0 z-10">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-2 w-16 opacity-50" />
                 </div>
                 <div className="flex">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-16 flex items-center justify-center shrink-0">
                        <Skeleton className="h-6 w-10 rounded-md" />
                      </div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
