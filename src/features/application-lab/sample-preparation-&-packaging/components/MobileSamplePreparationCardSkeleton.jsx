import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const MobileSamplePreparationCardSkeleton = ({ cards = 3 }) => {
    return (
        <div className="flex flex-col gap-4 md:hidden">
            {Array.from({ length: cards }).map((_, index) => (
                <div
                    key={index}
                    className="p-4 border rounded-xl bg-background border-border"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <Skeleton className="flex-1 h-6" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-32 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-28 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-36 h-6 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-36 h-6 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-32 h-6 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-36 h-6 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-32 h-6 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-20 h-4" />
                            <Skeleton className="w-28 h-6 rounded-full" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <Skeleton className="w-full h-10 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
};
