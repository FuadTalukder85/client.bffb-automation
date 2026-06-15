import React from "react";
import MobileInternalTaskCard from "./MobileInternalTaskCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { NoData } from "@/components/ui/NoData";

export function MobileInternalTaskList({ tasks, currentPage, itemsPerPage, onRestore, isLoading, noDataMessage, noDataDescription, errorMessage, hasError }) {
  // Show skeletons while loading to avoid flashing "No tasks found"
  if (isLoading) {
    return (
      <div className="mt-6 md:hidden">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-3 mb-4 rounded-xl bg-background">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-shade-2 flex items-center justify-center">
                <Skeleton className="rounded-full size-4 xl:size-5 2xl:size-6 3xl:size-7" />
              </div>
              <div className="flex-1 text-right">
                <Skeleton className="w-32 h-4" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-4" />
            </div>

            <div className="flex items-center justify-between mt-4">
              <Skeleton className="w-24 h-9 rounded-md" />
              <Skeleton className="w-10 h-9 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="md:hidden">
        {hasError ? (
          <div className="flex items-center justify-center py-10 text-center text-red-500">
            {errorMessage}
          </div>
        ) : (
          <NoData message={noDataMessage} description={noDataDescription} />
        )}
      </div>
    );
  }

  // Calculate serial numbers based on pagination
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="mt-6 md:hidden">
      {tasks.map((task, index) => (
        <MobileInternalTaskCard
          key={task.id}
          task={task}
          serialNumber={startIndex + index + 1}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}

export default MobileInternalTaskList;
