import React from "react";
import MobileSingleProjectTaskCard from "./MobileSingleProjectTaskCard";
import { Loader2 } from "lucide-react";
import { NoData } from "@/components/ui/NoData";

const MobileSingleProjectTaskList = ({ tasks = [], isLoading, onArchive, onStatusChange, searchTerm, errorMessage, hasError }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return hasError ? (
      <div className="py-10 text-center text-red-500">
        {errorMessage}
      </div>
    ) : (
      <NoData
        message="No Tasks Found"
        description={searchTerm
          ? `No tasks match "${searchTerm}". Try adjusting your search.`
          : "No tasks available yet."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const taskId = task._id || task.id;
        return (
          <MobileSingleProjectTaskCard 
            key={taskId} 
            task={task}
            onArchive={onArchive}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
};

export default MobileSingleProjectTaskList;
