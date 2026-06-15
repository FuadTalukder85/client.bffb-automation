import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function SensoryDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] bg-background rounded-3xl animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 flex-none bg-background">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-7 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="w-24 h-5 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-60 h-10 rounded-lg hidden lg:block" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6 rounded-[24px] border border-border">
        {/* Left Side: Description Panel Skeleton */}
        <div className="w-[480px] flex flex-col gap-6 overflow-hidden pr-4 border-r border-border">
          <div className="flex-none space-y-6">
            <Skeleton className="w-32 h-6 mb-4" />
            
            {/* Project Brief Boxes */}
            <div className="space-y-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-full h-24 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-full h-24 rounded-xl" />
            </div>

            {/* Field Inputs */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-28 h-4" />
                <Skeleton className="w-full h-[46px] rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form/Table Panel Skeleton */}
        <div className="flex-1 bg-card flex flex-col overflow-hidden px-4">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <Skeleton className="w-40 h-7 mb-8" />

            {/* Legend Skeleton */}
            <div className="w-full flex items-center justify-center gap-4 mb-10 bg-primary/5 rounded-[20px] p-4 border border-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-20 h-5 rounded-full" />
                </div>
              ))}
            </div>

            {/* Content Skeleton (Sliders or Table) */}
            <div className="w-full space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-14 rounded-[50px]" />
              ))}
            </div>

            {/* Textarea boxes */}
            <div className="w-full mt-10 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-full h-32 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-full h-32 rounded-xl" />
                </div>
            </div>

            {/* Buttons */}
            <div className="w-full flex justify-end gap-4 mt-12 pb-10">
                <Skeleton className="w-32 h-12 rounded-full" />
                <Skeleton className="w-36 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
