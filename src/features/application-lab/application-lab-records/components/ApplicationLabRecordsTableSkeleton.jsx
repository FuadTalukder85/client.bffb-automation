import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const ApplicationLabRecordsTableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="hidden px-2 border shadow-sm md:flex md:flex-col md:min-h-0 bg-background border-border/50">
            {/* Table Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-40 h-6" />
                <Skeleton className="w-28 h-6" />
                <Skeleton className="w-36 h-6" />
                <Skeleton className="w-36 h-6" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-28 h-6" />
                <Skeleton className="w-28 h-6" />
                <Skeleton className="w-24 h-6" />
            </div>

            {/* Table Rows */}
            <div className="flex-1 space-y-3 p-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg border-border/50 bg-background">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-40 h-6" />
                        <Skeleton className="w-28 h-6" />
                        <Skeleton className="w-36 h-12 rounded-full" />
                        <Skeleton className="w-36 h-12 rounded-full" />
                        <Skeleton className="w-32 h-12 rounded-full" />
                        <Skeleton className="w-32 h-12 rounded-full" />
                        <Skeleton className="w-32 h-12 rounded-full" />
                        <Skeleton className="w-28 h-12 rounded-full" />
                        <Skeleton className="w-28 h-12 rounded-full" />
                        <Skeleton className="w-24 h-8 rounded-md" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border/50">
                <Skeleton className="w-32 h-8" />
                <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                </div>
                <Skeleton className="w-32 h-8" />
            </div>
        </div>
    );
};
