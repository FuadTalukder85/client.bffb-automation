import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { motion as Motion } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { cn } from "@/lib/utils";

import { ACTION_TASKS_MAP } from "@/config/taskAutomation";
import { TaskAssignmentList } from "@/components/ui/TaskAssignment/TaskAssignmentList";

export function AssignTaskModal({
  open,
  onOpenChange,
  tasks = [],
  projectMembers = [],
  onConfirm,
  onBack,
}) {
  const [taskData, setTaskData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
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

  useEffect(() => {
    if (open && tasks.length > 0) {
      const initial = {};
      const todayISO = new Date().toISOString();
      tasks.forEach((task) => {
        // Find matching project members who have the relevant responsibility
        const filtered = projectMembers.filter((m) =>
          (m.responsibilities || []).includes(task.responsibility)
        );

        initial[task.title] = {
          assignedTo: filtered.map((m) => m.user?._id),
          description: "",
          startDate: todayISO,
          dueDate: "",
        };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTaskData(initial);
    }
  }, [open, tasks, projectMembers]);

  const handleFieldChange = (taskTitle, field, val) => {
    setTaskData((prev) => ({
      ...prev,
      [taskTitle]: {
        ...prev[taskTitle],
        [field]: val,
      },
    }));
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm?.(taskData);
    } catch (err) {
      console.error("Failed to confirm task assignments:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  const allTasksHaveNoMembers = tasks.every((task) => {
    const filtered = projectMembers.filter((m) =>
      (m.responsibilities || []).includes(task.responsibility)
    );
    return filtered.length === 0;
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[500px] lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[540px] 3xl:max-w-[620px] p-6 lg:p-4 xl:p-5 2xl:p-6 rounded-2xl gap-0 flex flex-col max-h-[90vh] overflow-hidden">
        <ModalHeader className="mb-4 lg:mb-2 xl:mb-3 2xl:mb-4 flex flex-row items-center justify-between">
          <ModalTitle className="text-lg lg:text-xs xl:text-sm 2xl:text-base 3xl:text-lg font-semibold">
            Assign Task
          </ModalTitle>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isConfirming}
            className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh members list"
          >
            <RefreshCw className={cn("w-4 h-4 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4", isRefreshing && "animate-spin")} />
          </button>
        </ModalHeader>

        <div className="flex flex-col gap-6 lg:gap-4 xl:gap-5 2xl:gap-6 py-2 overflow-y-auto max-h-[60vh] custom-scrollbar pr-1">
          <TaskAssignmentList
            tasksToCreate={tasks}
            projectMembers={projectMembers}
            getTaskValues={(taskTitle) => taskData[taskTitle] || { description: "", startDate: "", dueDate: "" }}
            onTaskChange={handleFieldChange}
          />
        </div>

        <ModalFooter className="flex-row gap-4 mt-6 lg:mt-3 xl:mt-4 2xl:mt-6 h-8 lg:h-6 xl:h-7.5 2xl:h-8.5 sm:justify-between">
          <Button
            intent="outline"
            onClick={onBack}
            disabled={isConfirming}
            className="w-full w-[120px] lg:w-[64px] xl:w-[85px] 2xl:w-[96px] 3xl:w-[120px] border-border text-foreground hover:bg-muted"
          >
            Back
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={allTasksHaveNoMembers || isConfirming}
            className="w-full w-[120px] lg:w-[64px] xl:w-[85px] 2xl:w-[96px] 3xl:w-[120px] text-white bg-primary hover:bg-primary/90 flex items-center justify-center"
          >
            {isConfirming && (
              <Loader2 className="w-4 lg:w-3 xl:w-3.5 2xl:w-4 h-4 lg:h-3 xl:h-3.5 2xl:h-4 mr-2 animate-spin" />
            )}
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function TaskAssignedModal({ open, onClose, assignedTasks = [], projectName = "" }) {
  const formatDateValue = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-[400px] lg:max-w-[320px] xl:max-w-[380px] 2xl:max-w-[440px] 3xl:max-w-[500px] p-6 lg:p-4 xl:p-5 2xl:p-6 rounded-2xl gap-0 flex flex-col max-h-[90vh] overflow-hidden">
        <ModalHeader className="mb-4 lg:mb-2 xl:mb-3 2xl:mb-4">
          <ModalTitle className="text-lg lg:text-xs xl:text-sm 2xl:text-base 3xl:text-lg font-semibold text-center text-base-color">
            Task Assigned
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6">
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex items-center justify-center w-16 lg:w-11 xl:w-13 2xl:w-16 3xl:w-20 h-16 lg:h-11 xl:h-13 2xl:h-16 3xl:h-20 text-white rounded-full bg-primary"
          >
            <CheckCircle2 className="w-8 lg:w-5.5 xl:w-6.5 2xl:w-8 3xl:w-10 h-8 lg:h-5.5 xl:h-6.5 2xl:h-8 3xl:h-10 text-white" />
          </Motion.div>

          <p className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-center text-lighter-text leading-relaxed">
            The following tasks have been successfully assigned for <span className="font-semibold text-foreground">{projectName}</span>:
          </p>

          <div className="w-full flex flex-col gap-3 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 overflow-y-auto max-h-[40vh] custom-scrollbar pr-1">
            {assignedTasks.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 p-3.5 lg:p-2.5 xl:p-3 2xl:p-3.5 rounded-xl border border-table-stroke bg-background"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
                    {t.title}
                  </span>
                </div>
                <div className="flex flex-col gap-1 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 text-[11px] lg:text-[7.5px] xl:text-[9px] 2xl:text-[11px] 3xl:text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">Assigned to:</span>
                    <span>{t.assigneeName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">Schedule:</span>
                    <span>
                      {formatDateValue(t.startDate)}
                      {t.dueDate ? ` - ${formatDateValue(t.dueDate)}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ModalFooter className="flex-row justify-center mt-6 lg:mt-3 xl:mt-4 2xl:mt-6 h-8 lg:h-6 xl:h-7.5 2xl:h-8.5">
          <Button
            intent="outline"
            onClick={onClose}
            className="w-full sm:w-[120px] border-border text-foreground hover:bg-muted"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
