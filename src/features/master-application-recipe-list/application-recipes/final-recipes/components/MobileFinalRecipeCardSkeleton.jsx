import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";

export function MobileFinalRecipeCardSkeleton({ cards = 3 }) {
    return (
        <>
            {Array.from({ length: cards }).map((_, index) => (
                <ExpandableCard key={index} className="p-3 my-4 rounded-xl bg-background">
                    <ExpandableCard.Content initialHeight={140}>
                        <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                            <Skeleton className="w-24 h-5" />
                            <div className="flex-1 flex justify-end">
                                <Skeleton className="w-20 h-5" />
                            </div>
                        </div>

                        <InfoTable>
                            <InfoTable.Row label={<Skeleton className="w-20 h-4" />}>
                                <div className="flex justify-end">
                                    <Skeleton className="w-32 h-5" />
                                </div>
                            </InfoTable.Row>
                            <InfoTable.Row label={<Skeleton className="w-24 h-4" />}>
                                <div className="flex flex-col items-end gap-1 py-1">
                                    <Skeleton className="w-32 h-5" />
                                    <Skeleton className="w-24 h-4" />
                                </div>
                            </InfoTable.Row>
                            <InfoTable.Row label={<Skeleton className="w-16 h-4" />}>
                                <div className="flex gap-1 justify-end">
                                    <Skeleton className="w-12 h-6 rounded-3xl" />
                                    <Skeleton className="w-12 h-6 rounded-3xl" />
                                    <Skeleton className="w-12 h-6 rounded-3xl" />
                                </div>
                            </InfoTable.Row>
                            <InfoTable.Row label={<Skeleton className="w-12 h-4" />}>
                                <div className="flex gap-1 justify-end">
                                    <Skeleton className="w-10 h-6 rounded-3xl" />
                                    <Skeleton className="w-14 h-6 rounded-3xl" />
                                </div>
                            </InfoTable.Row>
                        </InfoTable>
                    </ExpandableCard.Content>
                    <ExpandableCard.Footer className="pt-2">
                        <div className="flex-1">
                            <Skeleton className="w-full h-9 rounded-md" />
                        </div>
                        <div className="ml-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                        </div>
                    </ExpandableCard.Footer>
                </ExpandableCard>
            ))}
        </>
    );
}
