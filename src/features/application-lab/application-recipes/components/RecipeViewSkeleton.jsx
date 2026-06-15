import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export const RecipeViewSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 w-full min-h-0 bg-transparent">
      {/* Desktop Skeleton */}
      <div className="hidden md:flex flex-col flex-1 w-full min-h-0 bg-white dark:bg-[#0B0B0F] rounded-4xl mb-4 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-64 h-10 rounded-lg" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        {/* Reference Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-5" />
            <Skeleton className="w-24 h-7 rounded-full" />
          </div>
          <Skeleton className="w-40 h-10 rounded-full" />
        </div>

        {/* Tabs and Content Box */}
        <div className="flex-1 border border-[#EEEBF4] dark:border-primary/50 rounded-4xl p-5 space-y-6">
          <div className="grid grid-cols-3 gap-0">
            <Skeleton className="h-10 rounded-l-lg border-r-0" />
            <Skeleton className="h-10 rounded-none border-x-0" />
            <Skeleton className="h-10 rounded-r-lg border-l-0" />
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-12 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-5" />
            <div className="flex gap-2">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="flex md:hidden flex-col flex-1 w-full bg-background dark:bg-[#0B0B0F] min-h-screen">
        <div className="sticky top-0 z-50 bg-background pt-4 pb-2 px-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-8 rounded-lg" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Skeleton className="w-24 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="w-24 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="w-24 h-8 rounded-full flex-shrink-0" />
          </div>
        </div>
        <div className="p-4 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Skeleton className="w-full h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};
