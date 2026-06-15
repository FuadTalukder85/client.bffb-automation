import React from "react";
import MobileProjectTaskCard from "./MobileProjectTaskCard";
import { Loader2 } from "lucide-react";
import { NoData } from "@/components/ui/NoData";

const MobileProjectTaskList = ({
  projects = [],
  isLoading,
  error,
  onManageTasks,
  currentPage = 1,
  itemsPerPage = 20,
  noDataMessage,
  noDataDescription,
  errorMessage,
  hasError,
}) => {
  const serialOffset = (currentPage - 1) * itemsPerPage;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 md:hidden">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }


  if (!projects || projects.length === 0) {
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

  return (
    <div className="flex flex-col w-full mt-6 md:hidden">
      {projects.map((project, index) => {
        const projectId = project._id || project.id || index;
        return (
          <MobileProjectTaskCard
            key={projectId}
            serial={serialOffset + index + 1}
            project={project}
            onManageTasks={onManageTasks}
          />
        );
      })}
    </div>
  );
};

export default MobileProjectTaskList;
