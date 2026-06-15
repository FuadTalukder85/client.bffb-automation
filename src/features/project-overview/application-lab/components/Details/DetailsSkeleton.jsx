import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Bug } from "lucide-react";

export const DetailsSkeleton = ({ showDebugPanel, setShowDebugPanel, projectFieldGroups }) => {
    const renderSkeletonField = (config) => {
        if (config.fullWidth) {
            return (
                <div key={config.id} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className={`w-full ${config.type === 'textarea' ? 'h-32' : 'h-10'}`} />
                </div>
            );
        }
        return (
            <div key={config.id} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-full h-10" />
            </div>
        );
    };

    const renderSkeletonGroup = (group, index) => {
        const fullWidthField = group.find(f => f.fullWidth);
        const regularFields = group.filter(f => !f.fullWidth);

        return (
            <div key={group[0]?.id || index} className="px-4 py-2 md:py-1.5">
                {fullWidthField && <div className="">{renderSkeletonField(fullWidthField)}</div>}
                {regularFields.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regularFields.map(renderSkeletonField)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <section className=" flex flex-col px-0 pb-20 page-section-spacing min-h-[calc(100vh-6rem)]">
            {/* Page Header Skeleton */}
            <div className="items-center justify-between hidden ms-0 lg:ms-5 mb-6 md:flex">
                <div className="flex items-center gap-3 py-4 md:p-0 md:m-0">
                    <Skeleton className="w-8 h-8" />
                    <Skeleton className="w-48 h-6" />
                </div>
                <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
                    <Skeleton className="w-8 h-8" />
                </div>
            </div>

            {/* Mobile Header Skeleton */}
            <div className="flex items-center justify-between py-4 ms-0 md:hidden mb-6">
                <div className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 mt-1" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                </div>
                <Skeleton className="w-10 h-10" />
            </div>

            {/* Debug Panel Toggle Button */}
            <button
                type="button"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 px-2 py-2 bg-purple-600/50 hover:bg-purple-600/80 text-white rounded-full transition-all text-xs font-medium shadow-md backdrop-blur-sm opacity-50 hover:opacity-100"
            >
                <Bug size={12} />
            </button>

            <div className="flex justify-between w-full gap-6">
                {/* main area scrollable skeleton */}
                <div className="flex-grow overflow-y-auto max-h-[75dvh] ms-0 lg:ms-5 bg-background rounded-2xl md:px-6 md:pb-12">
                    {projectFieldGroups.map(renderSkeletonGroup)}
                </div>

                {/* collapsible sidebar skeleton */}
                <div className="hidden lg:block lg:me-5 max-h-[75dvh]">
                    <div className="bg-background rounded-2xl p-4 w-80">
                        <Skeleton className="w-full h-8 mb-4" />
                        <Skeleton className="w-full h-64" />
                    </div>
                </div>
            </div>
        </section>
    );
};