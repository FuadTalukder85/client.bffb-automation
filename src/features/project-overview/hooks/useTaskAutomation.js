import { useState } from "react";
import { useCreateProjectTask } from "@/hooks/mutations/useProjectTaskMutations";
import { ACTION_TASKS_MAP } from "@/config/taskAutomation";

export function useTaskAutomation({
  projectId,
  projectName,
  projectMembers = [],
  onInitiateUpdate, // Callback to trigger original stage update
  onBack,
}) {
  const { mutateAsync: createProjectTask } = useCreateProjectTask();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [tasksToCreate, setTasksToCreate] = useState([]);
  const [pendingActionData, setPendingActionData] = useState(null);
  const [assignedTasksList, setAssignedTasksList] = useState([]);

  // Intercept the initial stage update submission
  const interceptStageUpdate = (formData) => {
    const actionTasks = ACTION_TASKS_MAP[formData.action];
    
    if (actionTasks && actionTasks.length > 0) {
      setPendingActionData(formData);
      setTasksToCreate(actionTasks);
      setIsAssignOpen(true);
      return true; // Intercepted
    }
    
    return false; // Not intercepted, proceed normally
  };

  // Confirm task assignments
  const handleAssignConfirm = async (taskAssignments) => {
    try {
      // 1. Trigger the original stage initiation callback
      if (onInitiateUpdate && pendingActionData) {
        await onInitiateUpdate(pendingActionData);
      }

      // 2. Create the project tasks
      const createdTasksSummary = [];
      for (const task of tasksToCreate) {
        const assignment = taskAssignments[task.title];
        if (!assignment || !Array.isArray(assignment.assignedTo) || assignment.assignedTo.length === 0) continue;

        const assigneeNames = [];
        for (const userId of assignment.assignedTo) {
          const member = projectMembers.find((m) => m.user?._id === userId);
          const assigneeName = member ? member.user.name : "Unknown User";
          assigneeNames.push(assigneeName);

          const taskPayload = {
            title: task.title,
            description: assignment.description || "",
            project: projectId,
            assignedTo: userId,
            module: task.module,
            subModule: task.subModule,
            startDate: assignment.startDate || null,
            dueDate: assignment.dueDate || null,
          };

          await createProjectTask(taskPayload);
        }

        createdTasksSummary.push({
          title: task.title,
          assigneeName: assigneeNames.join(", "),
          startDate: assignment.startDate,
          dueDate: assignment.dueDate,
        });
      }

      // 3. Open success confirmation modal
      setAssignedTasksList(createdTasksSummary);
      setIsAssignOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Failed to complete task assignments:", error);
      alert(error.message || "Failed to complete task assignments. Please try again.");
    }
  };

  const handleAssignBack = () => {
    setIsAssignOpen(false);
    setPendingActionData(null);
    onBack?.();
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setAssignedTasksList([]);
    setPendingActionData(null);
  };

  return {
    isAssignOpen,
    isSuccessOpen,
    tasksToCreate,
    assignedTasksList,
    interceptStageUpdate,
    handleAssignConfirm,
    handleAssignBack,
    handleSuccessClose,
  };
}
