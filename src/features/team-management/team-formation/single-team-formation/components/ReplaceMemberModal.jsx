import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function ReplaceMemberModal({
  open,
  onOpenChange,
  onConfirm,
  memberToReplace,
  teamId,
}) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [pendingTasks, setPendingTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Get member ID from memberToReplace
  const oldUserId = memberToReplace?.user?._id || memberToReplace?.user?.id || memberToReplace?._id;

  // Create options for the select dropdown
  const memberOptions = availableUsers.map((user) => ({
    label: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email || "Unknown",
    value: user._id,
  }));

  // Fetch available users when modal opens
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!open || !teamId) return;

      setIsLoadingUsers(true);
      try {
        const response = await api.get(`/teams/${teamId}/available-users`);
        const users = response.data?.data || [];
        setAvailableUsers(users);
      } catch (err) {
        console.error("Failed to fetch available users:", err);
        setAvailableUsers([]);
        toast.error(
          getErrorMessage(err, "Failed to load available users. Please try again.")
        );
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchAvailableUsers();
  }, [open, teamId]);

  // Fetch pending tasks when modal opens or memberToReplace changes
  useEffect(() => {
    const fetchPendingTasks = async () => {
      if (!open || !teamId || !oldUserId) return;

      setIsLoadingTasks(true);
      try {
        const response = await api.get(
          `/teams/${teamId}/members/${oldUserId}/replaceable-tasks`
        );
        const data = response.data?.data || {};
        
        // Combine project tasks and internal tasks with type identifier
        const allTasks = [
          ...(data.projectTasks || []).map((task) => ({ ...task, type: "project" })),
          ...(data.internalTasks || []).map((task) => ({ ...task, type: "internal" })),
        ];
        
        setPendingTasks(allTasks);
        // Select all tasks by default
        setSelectedTaskIds(allTasks.map((task) => task._id));
      } catch (err) {
        console.error("Failed to fetch pending tasks:", err);
        setPendingTasks([]);
        toast.error(
          getErrorMessage(err, "Failed to load pending tasks. Please try again.")
        );
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchPendingTasks();
  }, [open, teamId, oldUserId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedMemberId("");
      setPendingTasks([]);
      setSelectedTaskIds([]);
      setAvailableUsers([]);
    }
  }, [open]);

  const handleTaskToggle = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === pendingTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(pendingTasks.map((task) => task._id));
    }
  };

  const handleConfirm = () => {
    if (!selectedMemberId) return;
    
    const selectedUser = availableUsers.find((u) => u._id === selectedMemberId);
    onConfirm(selectedUser, selectedTaskIds);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[425px] p-6 gap-2 rounded-2xl">
        <ModalHeader className="space-y-3">
          <ModalTitle className="text-xl font-semibold text-center">
            Replace Team Member
          </ModalTitle>
          {memberToReplace && (
            <p className="text-sm text-center text-lighter-text">
              Replacing: {memberToReplace.user?.firstName || memberToReplace.user?.name || "Member"}
            </p>
          )}
        </ModalHeader>

        <div className="flex flex-col py-2 space-y-2">
          <label className="text-xs font-normal text-lighter-text">
            Select New Member
          </label>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center h-10 border rounded-lg border-table-stroke">
              <Loader2 className="w-5 h-5 animate-spin text-nav-highlight" />
            </div>
          ) : (
            <AccordionSelect
              placeholder={availableUsers.length > 0 ? "Select New Member" : "No available users"}
              options={memberOptions}
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full text-base-color"
              disabled={availableUsers.length === 0}
            />
          )}
          {!isLoadingUsers && availableUsers.length === 0 && (
            <p className="text-xs text-lighter-text">
              All active users are already members of this team
            </p>
          )}
        </div>

        <div className="flex flex-col py-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-normal text-lighter-text">
              Replaceable Tasks (Pending / In Progress) ({pendingTasks.length})
            </label>
            {pendingTasks.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-nav-highlight hover:underline"
              >
                {selectedTaskIds.length === pendingTasks.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>
          <div className="h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {isLoadingTasks ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-nav-highlight" />
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-lighter-text">
                No pending tasks to reassign
              </div>
            ) : (
              pendingTasks.map((task, index) => (
                <div
                  key={task._id}
                  className="flex flex-col p-3 border border-table-stroke rounded-xl bg-background"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-lg bg-primary-shade-2 text-nav-highlight">
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-base-color leading-tight max-w-[200px]">
                          {task.title}
                        </span>
                        {task.project?.name && (
                          <span className="text-xs text-lighter-text mt-1">
                            Project: {task.project.name}
                          </span>
                        )}
                        {task.type === "internal" && (
                          <span className="text-xs text-lighter-text mt-1">
                            Type: Internal Task
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task._id)}
                      onChange={() => handleTaskToggle(task._id)}
                      className="w-5 h-5 border rounded appearance-none border-table-stroke checked:bg-nav-highlight checked:border-nav-highlight cursor-pointer shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-table-stroke">
                    <span className="text-xs text-lighter-text">
                      {task.dueDate
                        ? format(new Date(task.dueDate), "dd MMM yyyy")
                        : "No due date"}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full text-nav-highlight bg-primary-shade-2 capitalize">
                      {task.status.replace("_", " ")}
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
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
            disabled={!selectedMemberId}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
