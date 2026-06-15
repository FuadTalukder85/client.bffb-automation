import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/utils/dateFormatter";
import { toast } from "sonner";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function RestoreMemberModal({ open, onOpenChange, member, onConfirm }) {
  const { teamId } = useParams();
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [assignableTasks, setAssignableTasks] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assignable tasks when modal opens
  useEffect(() => {
    const fetchAssignableTasks = async () => {
      if (!open || !teamId) return;

      setIsLoadingTasks(true);
      setError(null);

      try {
        const response = await api.get(`/teams/${teamId}/assignable-tasks`);
        setAssignableTasks(response.data?.data || null);
      } catch (err) {
        console.error("Failed to fetch assignable tasks:", err);
        const message = getErrorMessage(err, "Failed to load assignable tasks");
        setError(message);
        toast.error(message);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchAssignableTasks();
  }, [open, teamId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedTaskIds([]);
      setAssignableTasks(null);
      setError(null);
    }
  }, [open]);

  // Combine project and internal tasks for display
  const allTasks = useMemo(() => {
    if (!assignableTasks) return [];

    const projectTasks = (assignableTasks.projectTasks || []).map((task) => ({
      ...task,
      type: "project",
      displayTitle: task.title,
      displayProject: task.project?.name || "No Project",
    }));

    const internalTasks = (assignableTasks.internalTasks || []).map((task) => ({
      ...task,
      type: "internal",
      displayTitle: task.title,
      displayProject: "Internal Task",
    }));

    return [...projectTasks, ...internalTasks];
  }, [assignableTasks]);

  const handleTaskToggle = (taskId, taskType) => {
    const key = `${taskType}:${taskId}`;
    setSelectedTaskIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const isTaskSelected = (taskId, taskType) => {
    return selectedTaskIds.includes(`${taskType}:${taskId}`);
  };

  const handleConfirm = async () => {
    if (!member || !teamId) return;

    const userId = member?.user?._id || member?.user?.id || member?._id;
    if (!userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse selected task IDs into project and internal arrays
      const projectTaskIds = selectedTaskIds
        .filter((key) => key.startsWith("project:"))
        .map((key) => key.replace("project:", ""));

      const internalTaskIds = selectedTaskIds
        .filter((key) => key.startsWith("internal:"))
        .map((key) => key.replace("internal:", ""));

      await api.post(`/teams/${teamId}/members/${userId}/restore-with-tasks`, {
        projectTaskIds,
        internalTaskIds,
      });

      onConfirm?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to restore member:", err);
      const message = getErrorMessage(err, "Failed to restore member");
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "in_progress":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "not_started":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
      default:
        return "text-nav-highlight bg-primary-shade-2";
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown";
  };

  const memberName = member?.user?.name || member?.user?.username || member?.user?.email || "Member";
  const memberEmail = member?.user?.email || "";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[500px] p-6 gap-2 rounded-2xl">
        <ModalHeader className="space-y-3">
          <ModalTitle className="text-xl font-semibold text-center">
            Restore Team Member
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Member Info (Read-only) */}
        <div className="flex flex-col py-2 space-y-2">
          <label className="text-xs font-normal text-lighter-text">
            Member to Restore
          </label>
          <div className="flex items-center gap-3 p-3 border border-table-stroke rounded-lg bg-muted/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-shade-2 text-primary shrink-0">
              <span className="text-sm font-semibold">
                {member?.user?.employeeId || "?"}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {memberName}
              </p>
              {memberEmail && (
                <p className="text-xs text-muted-foreground truncate">
                  {memberEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col py-2 space-y-2">
          <label className="text-xs font-normal text-lighter-text">
            Assign Tasks (Optional)
          </label>
          {assignableTasks?.oldestMember && (
            <p className="text-xs text-muted-foreground">
              Tasks from: {assignableTasks.oldestMember.user?.name || "Team Member"}
            </p>
          )}
          <div className="h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {isLoadingTasks ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : allTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No tasks available to assign
              </div>
            ) : (
              allTasks.map((task, index) => (
                <div
                  key={`${task.type}-${task._id}`}
                  className="flex flex-col p-3 border border-table-stroke rounded-xl bg-background cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTaskToggle(task._id, task.type)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-lg bg-primary-shade-2 text-nav-highlight">
                        {index + 1}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-base-color leading-tight max-w-[280px]">
                          {task.displayTitle}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {task.displayProject}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isTaskSelected(task._id, task.type)}
                      onChange={() => handleTaskToggle(task._id, task.type)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 border rounded appearance-none border-table-stroke checked:bg-nav-highlight checked:border-nav-highlight cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-table-stroke">
                    <span className="text-xs text-lighter-text">
                      {task.dueDate
                        ? formatDate(task.dueDate, undefined, "No date")
                        : formatDate(task.createdAt, undefined, "No date")}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(task.status)}`}
                    >
                      {formatStatus(task.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <ModalFooter className="flex-row gap-5 mt-2 text-xs sm:justify-between h-9">
          <Button
            intent="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-table-stroke sm:w-1/2 text-base-color "
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Restore Member${selectedTaskIds.length > 0 ? ` (${selectedTaskIds.length} tasks)` : ""}`
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

