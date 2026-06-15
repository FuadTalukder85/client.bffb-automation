import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MaintenanceCalendarPageSkeleton() {
  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5 mb-4">
        <Skeleton className="h-10 w-64" />
        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <Skeleton className="h-10 w-60 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:ms-5 lg:mx-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-full hidden lg:block" />
        </div>
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>

      <div className="flex-1 min-h-0 lg:mx-2 p-2">
        <div className="rounded-2xl border border-border/40 p-4 bg-background space-y-3">
          <div className="grid grid-cols-6 gap-3 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-5 w-full" />
            ))}
          </div>

          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-6 gap-3 items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
