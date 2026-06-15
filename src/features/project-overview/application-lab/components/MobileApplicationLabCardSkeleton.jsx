import { Skeleton } from "@/components/ui/Skeleton";

export const MobileApplicationLabCardSkeleton = ({ cards = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="p-4 border rounded-xl bg-background border-border/50 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="w-24 h-4" />
                                <Skeleton className="w-32 h-3" />
                            </div>
                        </div>
                        <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Skeleton className="h-12 rounded-lg" />
                        <Skeleton className="h-12 rounded-lg" />
                    </div>
                    <Skeleton className="w-full h-10 rounded-lg" />
                </div>
            ))}
        </div>
    );
};
