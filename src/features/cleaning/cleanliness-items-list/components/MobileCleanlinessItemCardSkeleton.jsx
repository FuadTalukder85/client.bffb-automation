import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function MobileCleanlinessItemCardSkeleton({ cards = 5 }) {
    return (
        <div className="w-full">
            {Array.from({ length: cards }).map((_, cardIndex) => (
                <div
                    key={cardIndex}
                    className={cn(
                        "flex md:hidden w-full flex-col rounded-xl bg-background border border-table-stroke p-3 my-4"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="w-full h-5 mb-1" />
                            <Skeleton className="w-2/3 h-4" />
                        </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center px-1">
                            <Skeleton className="w-16 h-4" />
                            <Skeleton className="w-20 h-5 rounded-full" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <div className="flex-1 flex gap-0">
                            <Skeleton className="flex-1 h-9 rounded-l-md rounded-r-none" />
                            <Skeleton className="flex-1 h-9 rounded-r-md rounded-l-none" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
