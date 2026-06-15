import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SingleMaintenanceScheduleMobileSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FBFBFF] dark:bg-[#0B0B0F] p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="h-7 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-2xl" />
      </div>

      {/* Selectors Skeleton */}
      <div className="flex items-center justify-between gap-4 mb-6 border border-border/40 py-2 px-3 rounded-2xl bg-white dark:bg-slate-900 shrink-0 shadow-sm transition-colors">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-3 my-4 rounded-xl border border-[#F6F4F9] shadow-sm transition-colors h-[140px] flex flex-col">
            <div className="flex items-center gap-3 mb-3 shrink-0">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-6 pt-3 border-t border-border/20">
               <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
