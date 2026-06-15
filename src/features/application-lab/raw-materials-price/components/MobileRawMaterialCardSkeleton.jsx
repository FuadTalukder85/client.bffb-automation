import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function MobileRawMaterialCardSkeleton({ cards = 5 }) {
    return (
        <div className="w-full">
            {Array.from({ length: cards }).map((_, cardIndex) => (
                <div
                    key={cardIndex}
                    className={cn(
                        "flex md:hidden w-full flex-col rounded-xl bg-background border border-border/50 mb-4"
                    )}
                >
                    <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="w-24 h-5" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-20 h-6 rounded-full" />
                        </div>
                    </div>
                    <div className="h-[1px] bg-border/50 mx-4 mb-2"></div>
                    <div className="px-4 py-2 space-y-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-32 h-4" />
                        </div>
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-20 h-4" />
                        </div>
                    </div>
                    <div className="px-4 pt-2 pb-4 mt-2">
                        <div className="flex gap-0 w-full">
                            <Skeleton className="flex-1 h-9 rounded-r-none" />
                            <Skeleton className="flex-1 h-9 rounded-l-none" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
