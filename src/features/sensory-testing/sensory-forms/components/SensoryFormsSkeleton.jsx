import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function SensoryFormsSkeleton({ rows = 10 }) {
  return (
    <div className="hidden px-2 border shadow-sm md:flex md:flex-col md:min-h-0 bg-background border-border/50 rounded-4xl overflow-hidden md:flex-1">
      {/* Table Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="flex-1 h-6" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-20 h-6" />
      </div>

      {/* Table Rows */}
      <div className="flex-1 space-y-3 p-4 overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg border-border/50 bg-background">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-6" />
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-32 h-6 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-md" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border/50">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>
    </div>
  );
}
