import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DesktopShelfLifeTestRecordSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-4 flex-none ms-0 lg:ms-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-7 rounded-md" />
            <Skeleton className="w-24 h-5 rounded-full" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
          <Skeleton className="w-60 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4 ms-5">
        <Skeleton className="w-32 h-11 rounded-full" />
      </div>

      <div className="flex-1 w-full border border-[#F3F4F6] dark:border-primary/50 rounded-[40px] overflow-auto max-h-[calc(100vh-6rem)] custom-scrollbar bg-white dark:bg-[#07020D]">
        <div className="w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-5 space-y-10">
            <div className="space-y-4">
              <div className="text-center">
                <Skeleton className="w-32 h-6 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-4.5 xl:gap-x-5.5 2xl:gap-x-6.5 3xl:gap-x-8 gap-y-4 lg:gap-y-2 xl:gap-y-2.5 2xl:gap-y-3.5 3xl:gap-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-full h-11 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Skeleton className="w-28 h-6 mx-auto" />
              </div>
              <Skeleton className="w-36 h-8 rounded-full" />
              <div className="w-full border border-[#F3F4F6] dark:border-primary/50 rounded-2xl p-4">
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              <Skeleton className="w-32 h-11 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-full h-28 rounded-xl" />
            </div>

            <div className="flex justify-end gap-4">
              <Skeleton className="w-32 h-12 rounded-full" />
              <Skeleton className="w-28 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
