import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function MobileCategoryCardSkeleton({ cards = 3 }) {
  return (
    <div className="">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="p-4 mb-4 border shadow-sm bg-background border-border rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-6 rounded-full" />
            <Skeleton className="w-1/2 h-6" />
          </div>
          <div className="flex gap-2 pt-4 mt-4 border-t border-border">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
