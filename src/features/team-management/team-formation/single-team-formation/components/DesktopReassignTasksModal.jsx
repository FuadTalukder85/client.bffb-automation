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
import { Select } from "@/components/ui/Select/Select";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Loader2, Save } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { ConfirmReassignTasksModal } from "./ConfirmReassignTasksModal";
import { toast } from "sonner";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function DesktopReassignTasksModal({
  open,
  onOpenChange,
  onConfirm,
  memberToReplace,
  existingMemberIds = [],
  className,
}) {
  const { teamId } = useParams();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch all active employees
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    statusFilter: "active",
    limit: 100,
  });
  const employees = employeesData?.data ?? [];

  // Filter out users who are already team members
  const availableUsers = useMemo(() => {
    const existingIds = existingMemberIds?.map((id) => id?.toString());
    return employees?.filter((emp) => {
      const empId = (emp._id || emp.id)?.toString();
      return !existingIds.includes(empId);
    });
  }, [employees, existingMemberIds]);

  // Transform to options for select
 const userOptions = useMemo(() => {
     return availableUsers?.map((user, index) => {
       const name = user.name || user.username || "Unknown";
       const email = user.email || "";
       const employeeId = user.employeeId || "?";
 
       return {
         label: (
           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6 text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-medium rounded-full bg-primary-shade-2 text-primary shrink-0 border border-primary">
               {/* {employeeId} */}
               {index + 1}
             </div>
             <div className="flex flex-col text-left">
               <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium leading-none">{name}</span>
               {email && (
                 <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-muted-foreground leading-none">
                   {email}
                 </span>
               )}
             </div>
           </div>
         ),
         value: user._id || user.id,
       };
     });
   }, [availableUsers]);

  // Fetch pending tasks when modal opens
  useEffect(() => {
    const fetchPendingTasks = async () => {
      const oldUserId =
        memberToReplace?.user?._id ||
        memberToReplace?.user?.id ||
        memberToReplace?._id;

      if (!open || !teamId || !oldUserId) return;

      setIsLoadingTasks(true);
      setError(null);

      try {
        const response = await api.get(
          `/teams/${teamId}/members/${oldUserId}/pending-tasks`
        );
        const data = response.data?.data || {};

        // Combine project tasks and internal tasks with type identifier
        const allTasks = [
          ...(data.projectTasks || []).map((task) => ({
            ...task,
            type: "project",
            displayTitle: task.title,
            displayProject: task.project?.name || "No Project",
          })),
          ...(data.internalTasks || []).map((task) => ({
            ...task,
            type: "internal",
            displayTitle: task.title,
            displayProject: "Internal Task",
          })),
        ];

        setPendingTasks(allTasks);
        // Select all tasks by default
        setSelectedTaskIds(allTasks.map((task) => `${task.type}:${task._id}`));
      } catch (err) {
        console.error("Failed to fetch pending tasks:", err);
        const message = getErrorMessage(err, "Failed to load pending tasks");
        setError(message);
        toast.error(message);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchPendingTasks();
  }, [open, teamId, memberToReplace]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedUserId("");
      setSelectedTaskIds([]);
      setPendingTasks([]);
      setError(null);
      setSearchTerm("");
      setShowConfirmModal(false);
    }
  }, [open]);

  // Filter tasks based on search term
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return pendingTasks;
    const lowerTerm = searchTerm.toLowerCase();
    return pendingTasks.filter(
      (task) =>
        task.displayTitle.toLowerCase().includes(lowerTerm) ||
        task.displayProject.toLowerCase().includes(lowerTerm)
    );
  }, [pendingTasks, searchTerm]);

  const handleTaskToggle = (taskId, taskType) => {
    const key = `${taskType}:${taskId}`;
    setSelectedTaskIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const isTaskSelected = (taskId, taskType) => {
    return selectedTaskIds.includes(`${taskType}:${taskId}`);
  };

  const handleSaveClick = () => {
    const oldUserId =
      memberToReplace?.user?._id ||
      memberToReplace?.user?.id ||
      memberToReplace?._id;
    if (!selectedUserId || !teamId || !oldUserId) return;
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    const oldUserId =
      memberToReplace?.user?._id ||
      memberToReplace?.user?.id ||
      memberToReplace?._id;

    if (!selectedUserId || !teamId || !oldUserId) return;

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

      await api.post(`/teams/${teamId}/members/replace`, {
        oldUserId,
        newUserId: selectedUserId,
        projectTaskIds,
        internalTaskIds,
      });

      onConfirm?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to replace member:", err);
      const message = getErrorMessage(err, "Failed to replace member");
      setError(message);
      toast.error(message);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStatus = (status) => {
    return (
      status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Unknown"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Modal open={open && !showConfirmModal} onOpenChange={onOpenChange}>
        <ModalContent
          className={cn(
            "max-w-[1000px] lg:max-w-[616px] xl:max-w-[822px] 2xl:max-w-[924px] 3xl:max-w-[1156px] lg:min-h-[324px] xl:min-h-[432px] 2xl:min-h-[486px] 3xl:min-h-[608px] gap-0 px-7 lg:px-8 xl:px-10 2xl:px-12 3xl:px-14 py-8 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 rounded-3xl lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-white dark:bg-[#07020D] border border-nav-highlight/50 flex flex-col",
            className
          )}
        >
          {/* Header & Controls Row */}
          <div className="flex items-center justify-between gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 mb-4 lg:mb-4.5 xl:mb-5.5 2xl:mb-6.5 3xl:mb-8">
            {/* Left: Header */}
            <div>
              <ModalTitle className="text-2xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-base-color">
                Reassign Tasks
              </ModalTitle>
              <p className="mt-1 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text w-[150px] lg:w-[168px] xl:w-[224px] 2xl:w-[252px] 3xl:w-[315px]">
                Please choose which tasks to carry forward to the replacement
                team member.
              </p>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
              <div className="w-full lg:w-[133px] xl:w-[177px] 2xl:w-[200px] 3xl:w-[250px] bg-nav-highlight/10 rounded-lg border border-gray-200 dark:border-white/10">
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  options={userOptions}
                  placeholder={
                    isLoadingEmployees ? "Loading..." : "Select Replacement"
                  }
                  className="w-full h-8 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-transparent border-none text-lighter-text focus:ring-0"
                  disabled={isLoadingEmployees}
                />
              </div>
              <div className="w-full lg:w-[133px] xl:w-[177px] 2xl:w-[200px] 3xl:w-[250px]">
                <SearchInput
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 bg-white dark:bg-[#12121A]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {/* Tasks Table Container */}
          <div className="flex flex-col h-[450px] lg:h-[240px] xl:h-[320px] 2xl:h-[360px] 3xl:h-[450px] mb-4 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4 border border-gray-200 dark:border-white/10 rounded-3xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl">
            {/* Table Header */}
            <div className="grid grid-cols-[3fr_1.5fr_1.5fr_1fr] gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 px-10 lg:px-12 xl:px-16 2xl:px-18 3xl:px-23 py-4 lg:py-1.5 xl:py-2 2xl:py-3 3xl:py-4 mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-muted-foreground bg-[#F8F6FC] dark:bg-[#12121A] rounded-t-3xl lg:rounded-t-lg xl:rounded-t-xl 2xl:rounded-t-2xl 3xl:rounded-t-3xl">
              <div>Task</div>
              <div>Date</div>
              <div className="text-center">Status</div>
              <div className="text-right">Transfer</div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 animate-spin text-primary" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No pending tasks to reassign.</p>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <div
                    key={`${task.type}-${task._id}`}
                    className="grid grid-cols-[3fr_1.5fr_1.5fr_1fr] gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 items-center p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-white dark:bg-[#12121A]"
                  >
                    {/* Task Info */}
                    <div className="flex items-center min-w-0 gap-4">
                      <div className="flex items-center justify-center w-10 lg:w-5 xl:w-7 2xl:w-8 3xl:w-10 h-8 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium rounded-full bg-primary/10 text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium truncate text-base-color">
                          {task.displayTitle}
                        </span>
                        <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold truncate text-foreground">
                          {task.displayProject}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
                      {task.dueDate
                        ? formatDate(task.dueDate)
                        : formatDate(task.createdAt)}
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <span
                        className={cn(
                          "px-4 py-1 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium rounded-full text-nav-highlight bg-primary-shade-2"
                        )}
                      >
                        {formatStatus(task.status)}
                      </span>
                    </div>

                    {/* Transfer Checkbox */}
                    <div className="flex justify-end pr-2">
                      <input
                        type="checkbox"
                        checked={isTaskSelected(task._id, task.type)}
                        onChange={() => handleTaskToggle(task._id, task.type)}
                        className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 border-2 rounded-md cursor-pointer accent-primary dark:accent-white dark:checked:bg-primary bg-primary"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <ModalFooter className="flex justify-end gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
            <Button
              intent="outline"
              onClick={() => onOpenChange(false)}
              className="px-8 lg:px-4.5 xl:px-6 2xl:px-7 3xl:px-8 py-2 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2 border border-gray-200 rounded-full lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-full dark:border-white/20 text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="mr-2">×</span> Cancel
            </Button>
            <Button
              intent="primary"
              onClick={handleSaveClick}
              disabled={!selectedUserId || isSubmitting}
              className="px-8 lg:px-4.5 xl:px-6 2xl:px-7 3xl:px-8 py-2 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2 text-foreground bg-[#EEEBF4] border border-gray-200 dark:border-nav-highlight rounded-full lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-full hover:bg-gray-50 dark:bg-primary/35 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 lg:w-3 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-3 xl:h-3 2xl:h-3.5 3xl:h-4 mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2 animate-spin" />
              ) : (
                <Save className="w-4 lg:w-3 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-3 xl:h-3 2xl:h-3.5 3xl:h-4 mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2" />
              )}
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmReassignTasksModal
        open={open && showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={handleFinalConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
