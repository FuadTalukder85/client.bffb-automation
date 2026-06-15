import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const SamplePreparationTableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="hidden w-full px-2 md:flex md:flex-col md:flex-1 md:min-h-0">
            <div className="flex flex-col flex-1 overflow-hidden border shadow-sm bg-background border-border/50 rounded-xl">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b bg-muted/50 border-border">
                    <Skeleton className="w-12 h-10" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="w-40 h-10" />
                    <Skeleton className="w-32 h-10" />
                    <Skeleton className="w-44 h-10" />
                    <Skeleton className="w-44 h-10" />
                    <Skeleton className="w-36 h-10" />
                    <Skeleton className="w-44 h-10" />
                    <Skeleton className="w-36 h-10" />
                    <Skeleton className="w-36 h-10" />
                    <Skeleton className="w-24 h-10" />
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-auto">
                    {Array.from({ length: rows }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-none"
                        >
                            <Skeleton className="w-12 h-10 rounded-full" />
                            <Skeleton className="h-8 w-28" />
                            <Skeleton className="w-40 h-8" />
                            <Skeleton className="w-32 h-8" />
                            <Skeleton className="w-44 h-8 rounded-full" />
                            <Skeleton className="w-44 h-8 rounded-full" />
                            <Skeleton className="w-36 h-8 rounded-full" />
                            <Skeleton className="w-44 h-8 rounded-full" />
                            <Skeleton className="w-36 h-8 rounded-full" />
                            <Skeleton className="w-36 h-8 rounded-full" />
                            <Skeleton className="w-24 h-8 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                    <Skeleton className="w-32 h-8" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                    </div>
                    <Skeleton className="w-32 h-8" />
                </div>
            </div>
        </div>
    );
};
