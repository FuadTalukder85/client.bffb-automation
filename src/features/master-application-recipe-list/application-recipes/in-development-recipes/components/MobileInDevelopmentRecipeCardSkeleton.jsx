import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExpandableCard } from "@/components/ui/ExpandableCard";

/**
 * Skeleton component for the mobile card view during loading
 */
export function MobileInDevelopmentRecipeCardSkeleton({ cards = 3 }) {
  return (
    <>
      {Array.from({ length: cards }).map((_, index) => (
        <ExpandableCard key={index} className="p-3 my-4 rounded-xl bg-background">
          {/* Content */}
          <ExpandableCard.Content initialHeight={140}>
            {/* Header Section with Serial and Title */}
            <div className="flex items-center gap-3 mb-3">
              {/* Serial Number Badge */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>

              {/* Recipe Code */}
              <div className="flex">
                <Skeleton className="w-20 h-5" />
              </div>

              {/* Created Date */}
              <div className="flex-1 text-right">
                <Skeleton className="w-16 h-5 ml-auto" />
              </div>
            </div>

            {/* Recipe Info Table */}
            <div className="space-y-3">
              {/* Recipe Name Row */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>

              {/* Project Details Row */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <Skeleton className="w-24 h-4" />
                <div className="text-right space-y-1">
                  <Skeleton className="w-28 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>

              {/* Categories Row */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <Skeleton className="w-16 h-4" />
                <div className="flex gap-1">
                  <Skeleton className="w-16 h-6 rounded-3xl" />
                  <Skeleton className="w-20 h-6 rounded-3xl" />
                  <Skeleton className="w-18 h-6 rounded-3xl" />
                </div>
              </div>

              {/* Tags Row */}
              <div className="flex justify-between items-center py-2">
                <Skeleton className="w-12 h-4" />
                <div className="flex gap-1 flex-wrap justify-end">
                  <Skeleton className="w-14 h-6 rounded-3xl" />
                  <Skeleton className="w-16 h-6 rounded-3xl" />
                  <Skeleton className="w-12 h-6 rounded-3xl" />
                </div>
              </div>
            </div>
          </ExpandableCard.Content>

          {/* Footer */}
          <ExpandableCard.Footer className="pt-2">
            {/* Left side - Action buttons */}
            <ExpandableCard.FooterLeft>
              <div className="flex gap-0">
                <Skeleton className="w-16 h-9 rounded-l-md" />
                <Skeleton className="w-16 h-9 rounded-none" />
                <Skeleton className="w-16 h-9 rounded-r-md" />
              </div>
            </ExpandableCard.FooterLeft>

            {/* Right side - Toggle button */}
            <ExpandableCard.FooterRight>
              <Skeleton className="w-20 h-8 rounded" />
            </ExpandableCard.FooterRight>
          </ExpandableCard.Footer>
        </ExpandableCard>
      ))}
    </>
  );
}