import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function MobileProductCodeCardSkeleton({ count = 3 }) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-background border border-border rounded-[20px] p-4"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="w-24 h-5" />
                            <Skeleton className="w-36 h-5" />
                        </div>
                        <Skeleton className="w-20 h-6 rounded-full" />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="w-12 h-4" />
                            <Skeleton className="w-16 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="w-12 h-4" />
                            <Skeleton className="w-24 h-5" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                        <Skeleton className="flex-1 h-9 rounded-lg" />
                        <Skeleton className="w-9 h-9 rounded-lg" />
                        <Skeleton className="w-9 h-9 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
