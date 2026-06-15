import React from "react";
import { useNavigate } from "react-router";
import { useProjectStats } from "@/hooks/useProjectTasks";

export function ProjectTaskStatsButton({ projectId, className = "" }) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useProjectStats(projectId);

  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/project-tasks/${projectId}`);
  };

  const pendingCount = stats?.pending || 0;
  const inProgressCount = stats?.in_progress || 0;

  return (
    <button
      onClick={handleNavigate}
      title="View Project Tasks (Pending | In Progress)"
      aria-label="View Project Tasks"
      className={`action-button flex items-center justify-center w-auto text-xs lg:text-[7px]! xl:text-[8px]! 2xl:text-[10px]! 3xl:text-xs! font-semibold rounded-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke dark:border-primary/60 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none 3xl:px-3 xl:px-2.5 ${className}`}
    >
      {isLoading ? (
        <span className="opacity-50 text-[10px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs">...</span>
      ) : (
        <span className="flex items-center justify-center whitespace-nowrap">
          <span className="text-yellow-600 dark:text-yellow-500">{pendingCount}</span>
          <span className="mx-1 text-muted-foreground h-3.5 w-[1px] bg-primary/25 dark:bg-primary"></span>
          <span className="text-blue-600 dark:text-blue-500">{inProgressCount}</span>
        </span>
      )}
    </button>
  );
}
