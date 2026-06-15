import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SingleMaintenanceScheduleSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans p-6 md:p-8">
      {/* Header Bar Skeleton */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Selectors Skeleton */}
      <div className="flex items-center justify-between gap-4 mb-6 border border-border/50 max-w-[400px] py-1 px-2 rounded-md shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-border/10">
        <div className="p-4 border-b border-border/10 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-6 flex-1 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
