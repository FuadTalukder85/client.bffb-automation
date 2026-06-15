import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function MobileProductDevelopmentCardSkeleton({ cards = 5 }) {
    return (
        <div className="w-full">
            {Array.from({ length: cards }).map((_, cardIndex) => (
                <div
                    key={cardIndex}
                    className={cn(
                        "flex md:hidden w-full flex-col rounded-xl bg-background border border-table-stroke mb-4"
                    )}
                >
                    <div className="flex items-center justify-between p-4 pb-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="w-24 h-5" />
                                <Skeleton className="w-16 h-5 rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-32 h-5" />
                        </div>
                    </div>
                    <div className="h-[0.1px] bg-table-stroke mx-4 mb-2"></div>
                    <div className="px-4 pt-2 pb-4">
                        <div className="flex gap-0 w-full">
                            <Skeleton className="flex-1 h-10 rounded-r-none" />
                            <Skeleton className="flex-1 h-10 rounded-none" />
                            <Skeleton className="flex-1 h-10 rounded-l-none" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}