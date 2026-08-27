import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { useCreateProjectTask } from "@/hooks/mutations/useProjectTaskMutations";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";

import { TaskAssignmentList } from "@/components/ui/TaskAssignment/TaskAssignmentList";

export function PrepareSampleModal({
  open,
  onOpenChange,
  projectId,
  recipeId,
  recipeCode,
  projectMembers = [],
  className,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["projectMembers"] });
    } catch (err) {
      console.error("Failed to refresh project members:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [dueDate, setDueDate] = useState("");

  const { mutateAsync: createProjectTask } = useCreateProjectTask();

  useEffect(() => {
    if (open) {
      setDescription("");
      setStartDate(new Date().toISOString());
      setDueDate("");
      setError(null);
    }
  }, [open]);

  const tasksToCreate = [
    {
      title: "Prepare Sample",
      responsibility: "Prepare Samples",
      module: "application-lab",
      subModule: "sample-preparation",
    },
    {
      title: "Set Daily Production Schedule",
      responsibility: "Daily Production Schedule",
      module: "application-lab",
      subModule: "production-schedule",
    },
  ];

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      if (!isOpen) {
        setError(null);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      for (const task of tasksToCreate) {
        const filteredMembers = projectMembers.filter((m) =>
          (m.responsibilities || []).includes(task.responsibility)
        );

        if (filteredMembers.length === 0) {
          console.log(`[TASK] No members found with responsibility: ${task.responsibility}`);
          continue;
        }

        for (const member of filteredMembers) {
          const taskPayload = {
            title: task.title,
            description: description,
            project: projectId,
            assignedTo: member.user?._id || member.user,
            module: task.module,
            subModule: task.subModule,
            startDate: startDate,
            dueDate: dueDate || null,
            recipeId: recipeId || null,
            recipeCode: recipeCode || null,
          };

          await createProjectTask(taskPayload);
        }
      }

      toast.success("Tasks assigned successfully");
      handleClose(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "An error occurred while assigning tasks"));
    } finally {
      setIsLoading(false);
    }
  };

  const allTasksHaveNoMembers = tasksToCreate.every((task) => {
    const filtered = projectMembers.filter((m) =>
      (m.responsibilities || []).includes(task.responsibility)
    );
    return filtered.length === 0;
  });

  const getTaskValues = () => {
    return {
      description,
      startDate,
      dueDate,
    };
  };

  const onTaskChange = (_, field, value) => {
    if (field === "description") setDescription(value);
    if (field === "startDate") setStartDate(value);
    if (field === "dueDate") setDueDate(value);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[540px] lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[540px] 3xl:max-w-[620px] gap-0 px-6 lg:px-4 xl:px-5 2xl:px-6 py-6 lg:py-4 xl:py-5 2xl:py-6 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden",
          className
        )}
      >
        <ModalHeader className="mb-4 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4 flex flex-row items-center justify-between">
          <ModalTitle className="text-lg lg:text-xs xl:text-sm 2xl:text-md 3xl:text-lg font-bold text-center text-base-color">
            Assign Task
          </ModalTitle>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh members list"
          >
            <RefreshCw className={cn("w-4 h-4 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4", isRefreshing && "animate-spin")} />
          </button>
        </ModalHeader>

        {error && (
          <div className="p-2 mb-4 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-600 border border-red-200 rounded-xl bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col min-h-0 overflow-hidden space-y-6 lg:space-y-3.5 xl:space-y-4 2xl:space-y-4.5 3xl:space-y-6">
          <div className="flex flex-col gap-6 py-2 overflow-y-auto max-h-[55vh] custom-scrollbar pr-1">
            <TaskAssignmentList
              tasksToCreate={tasksToCreate}
              projectMembers={projectMembers}
              getTaskValues={getTaskValues}
              onTaskChange={onTaskChange}
              getPlaceholder={() => "Flavour profile matches, initiate taste tests"}
            />
          </div>

          <ModalFooter className="flex-row gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 mt-6 lg:mt-3.5 xl:mt-4.5 2xl:mt-5 3xl:mt-6 text-foreground">
            <Button
              type="button"
              intent="outline"
              onClick={() => handleClose(false)}
              className="w-full text-xs font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-none"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              intent="primary"
              disabled={isLoading || allTasksHaveNoMembers}
              className="w-full text-xs font-semibold text-white bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
