import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MobileMasterProjectScheduleCardSkeleton({ cards = 3 }) {
    return (
        <>
            {[...Array(cards)].map((_, index) => (
                <div
                    key={index}
                    className="p-4 mb-4 border rounded-2xl bg-background border-border/50"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-full max-w-[200px]" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="w-6 h-6 rounded shrink-0" />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="w-10 h-9 rounded" />
                    </div>
                </div>
            ))}
        </>
    );
}
