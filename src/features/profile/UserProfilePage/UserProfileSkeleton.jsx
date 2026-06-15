import React from "react";

const UserProfileSkeleton = () => {
  return (
    <div className="flex flex-col flex-1 min-h-0 page-section-spacing space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-primary-shade-2/40 animate-pulse rounded-lg" />
        <div className="hidden md:flex gap-2">
            <div className="h-10 w-64 bg-primary-shade-2/40 animate-pulse rounded-lg" />
            <div className="h-10 w-10 bg-primary-shade-2/40 animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="grid flex-1 min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col flex-1 min-h-0 gap-4">
          {/* Profile Card Skeleton */}
          <div className="p-3 rounded-2xl border border-table-stroke bg-background/95">
            <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
              <div className="h-44 md:w-44 bg-primary-shade-2/40 animate-pulse rounded-xl" />
              <div className="flex-1 p-3 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-32 bg-primary-shade-2/40 animate-pulse rounded" />
                    <div className="h-5 w-24 bg-primary-shade-2/40 animate-pulse rounded-full" />
                  </div>
                  <div className="h-6 w-16 bg-primary-shade-2/40 animate-pulse rounded-full" />
                </div>
                <div className="flex gap-4">
                   <div className="h-4 w-24 bg-primary-shade-2/40 animate-pulse rounded" />
                   <div className="h-4 w-32 bg-primary-shade-2/40 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Tabs Skeleton */}
          <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-table-stroke bg-background/95 overflow-hidden">
            <div className="px-4 pt-3 border-b border-table-stroke h-16 bg-primary-shade-2/10 animate-pulse" />
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full bg-primary-shade-2/40 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Projects Aside Skeleton */}
        <aside className="hidden xl:flex flex-col min-h-0 p-4 rounded-2xl border border-table-stroke bg-background/95 space-y-4">
          <div className="h-6 w-32 bg-primary-shade-2/40 animate-pulse rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="flex gap-3">
                <div className="size-9 rounded-full bg-primary-shade-2/40 animate-pulse" />
                <div className="flex-1 space-y-2">
                   <div className="h-4 w-full bg-primary-shade-2/40 animate-pulse rounded" />
                   <div className="h-3 w-1/2 bg-primary-shade-2/40 animate-pulse rounded" />
                </div>
             </div>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;
