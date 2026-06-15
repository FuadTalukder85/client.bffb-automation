import React from "react";
import { Loader2 } from "lucide-react";
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/Modal";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { useUserProfile, TASK_MODAL_TYPES } from "../../UserProfileContext";
import { 
  PROJECT_TASK_UPDATE_STATUS_OPTIONS, 
  INTERNAL_TASK_UPDATE_STATUS_OPTIONS,
  normalizeStatus 
} from "../../utils";
import { toast } from "sonner";

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

const TaskStatusUpdateModal = () => {
  const {
    statusModalState,
    setStatusModalState,
    updateProjectTaskStatus,
    isUpdatingProjectTaskStatus,
    updateInternalTaskStatus,
    isUpdatingInternalTaskStatus,
    queryClient,
    userId,
  } = useUserProfile();

  const isSubmitting = isUpdatingProjectTaskStatus || isUpdatingInternalTaskStatus;
  const statusModalOptions =
    statusModalState.taskType === TASK_MODAL_TYPES.PROJECT
      ? PROJECT_TASK_UPDATE_STATUS_OPTIONS
      : INTERNAL_TASK_UPDATE_STATUS_OPTIONS;

  const handleCloseStatusModal = () => {
    setStatusModalState((previous) => ({
      ...previous,
      open: false,
      error: "",
    }));
  };

  const handleStatusValueChange = (event) => {
    const { value } = event.target;
    setStatusModalState((previous) => ({
      ...previous,
      status: value,
      error: "",
    }));
  };

  const handleConfirmStatusUpdate = async () => {
    const taskId = statusModalState.task?._id || statusModalState.task?.id;
    if (!taskId) {
      setStatusModalState((previous) => ({
        ...previous,
        error: "Task information is missing",
      }));
      return;
    }

    try {
      let response;
      if (statusModalState.taskType === TASK_MODAL_TYPES.PROJECT) {
        response = await updateProjectTaskStatus({
          id: taskId,
          status: statusModalState.status,
        });
        queryClient.invalidateQueries({ queryKey: ["profile", "project-tasks", "count", userId] });
      } else {
        response = await updateInternalTaskStatus({
          id: taskId,
          status: statusModalState.status,
        });
        queryClient.invalidateQueries({ queryKey: ["profile", "internal-tasks", "count", userId] });
      }

      toast.success(getResponseMessage(response, "Task status updated successfully"));
      handleCloseStatusModal();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update task status";
      setStatusModalState((previous) => ({
        ...previous,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  return (
    <Modal open={statusModalState.open} onOpenChange={(open) => !open && handleCloseStatusModal()}>
      <ModalContent className="max-w-[380px] lg:max-w-[309px] xl:max-w-[413px] 2xl:max-w-[464px]3xl:max-w-[580px] rounded-[28px] p-8 lg:p-4.5 xl:p-5.5 2xl:p-6.5 3xl:p-8">
        <ModalHeader>
          <ModalTitle className="text-center text-xl lg:text-[19px] xl:text-[22px] 2xl:text-[24px] 3xl:text-3xl font-semibold">Report Task Status</ModalTitle>
        </ModalHeader>

        <div className="">
          <label className="text-sm 3xl:text-base 2xl:text-xs xl:text-[11.5px] lg:text-[8.5px] text-lighter-text">Status</label>
          <AccordionSelect
            id="status"
            value={statusModalState.status}
            onChange={handleStatusValueChange}
            options={statusModalOptions}
            placeholder="Select Status"
            className="dark:text-white"
            searchable={false}
          />
          {statusModalState.error ? <p className="text-xs md:text-sm text-destructive">{statusModalState.error}</p> : null}
        </div>

        <ModalFooter className="mt-3 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6">
          <div className="flex gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4">
            <button
            type="button"
            onClick={handleCloseStatusModal}
            disabled={isSubmitting}
            className="w-32 lg:w-17 xl:w-22 2xl:w-25 3xl:w-32 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 rounded-lg lg:rounded-xs xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg border border-nav-highlight/50 text-sm text-[10px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] font-medium text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmStatusUpdate}
            disabled={isSubmitting}
            className="w-32 lg:w-17 xl:w-22 2xl:w-25 3xl:w-32 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 rounded-lg lg:rounded-xs xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg bg-nav-highlight text-sm text-[10px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] font-medium text-white hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Confirm
          </button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskStatusUpdateModal;
