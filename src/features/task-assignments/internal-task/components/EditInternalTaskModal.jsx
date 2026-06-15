import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { cn } from "@/lib/utils";
import { useUpdateInternalTask } from "@/hooks/mutations";
import { sanitizeDatePayload } from "@/utils/dateFormatter";

export function EditInternalTaskModal({
  open,
  onOpenChange,
  task,
  onSuccess,
  className,
}) {
  const [formData, setFormData] = useState({
    task: "",
    status: "pending",
    startDate: "",
    endDate: "",
    reoccurring: false,
    frequency: "",
  });

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const { mutateAsync: updateTask, isPending: isSubmitting } = useUpdateInternalTask();
  const [submitError, setSubmitError] = useState("");

  // Helpers to map display values (from normalized tasks) back to internal option values
  const mapStatusDisplayToValue = (status) => {
    if (!status) return undefined;
    const s = `${status}`.toLowerCase().trim();
    if (s === "not started") return "pending";
    if (s === "in progress" || s === "in-progress") return "in_progress";
    if (s === "pending") return "pending";
    if (s === "completed" || s === "complete") return "completed";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    // Fallback: replace spaces/hyphens with underscore
    return s.replace(/[\s-]+/g, "_");
  };

  // Initialize form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        task: task.title || task.task || "",
        // task.status might come as a display label (e.g., "In Progress") from the list, so map it
        status: mapStatusDisplayToValue(task.status) || task.status || "pending",
        startDate: task.startDate || "",
        endDate: task.dueDate || task.endDate || "",
        reoccurring: task.isRecurring === true || task.reoccurring === "Yes",
        frequency: task.frequency && task.frequency !== "-" ? task.frequency.toLowerCase() : "",
      });
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormData((prev) => ({ ...prev, [id]: checked }));

    // Reset frequency if reoccurring is unchecked
    if (id === "reoccurring" && !checked) {
      setFormData((prev) => ({ ...prev, frequency: "" }));
    }
  };

  const handleSubmit = async () => {
    const title = formData.task.trim();
    if (!title) {
      setSubmitError("Task name is required.");
      return;
    }

    const taskId = task?._id || task?.id;
    if (!taskId) {
      setSubmitError("Unable to determine task to update.");
      return;
    }

    setSubmitError("");

    const startDateIso = sanitizeDatePayload(formData.startDate);
    const dueDateIso = sanitizeDatePayload(formData.endDate);

    try {
      const payload = {
        title,
        status: formData.status,
        startDate: startDateIso,
        dueDate: dueDateIso,
        isRecurring: formData.reoccurring,
        frequency: formData.reoccurring ? formData.frequency || undefined : undefined,
      };

      await updateTask({ id: taskId, data: payload });
      onOpenChange(false);
      onSuccess?.(formData);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update task";
      setSubmitError(message);
    }
  };

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "max-w-[380px] lg:max-w-[300px] xl:max-w-[400px] 2xl:max-w-[448px] 3xl:max-w-[560px] gap-0 px-5 lg:px-4 xl:px-5 py-4 lg:py-3 xl:py-4 rounded-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <ModalHeader className="mb-2">
          <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
            Edit Task
          </ModalTitle>
        </ModalHeader>

        <div className="grid gap-2 py-1 md:gap-3 lg:gap-4 md:py-2">
          {/* Task Name */}
          <div className="space-y-1">
            <label
              htmlFor="task"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Task</p>
            </label>
            <Input
              id="task"
              placeholder="Enter task name"
              value={formData.task}
              onChange={handleInputChange}
              className="border-none rounded-md"
              inputClassName="placeholder:text-xs lg:placeholder:text-[6.5px] xl:placeholder:text-[8.5px] 2xl:placeholder:text-[9.5px] 3xl:placeholder:text-xs text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Status</p>
            </label>
            <AccordionSelect
              id="status"
              value={formData.status}
              onChange={handleSelectChange}
              options={statusOptions}
              placeholder="Select Status"
              className="text-base-color bg-primary-shade-2/20"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label
              htmlFor="startDate"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Start Date</p>
            </label>
            <DatePicker
              id="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              position="top"
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label
              htmlFor="endDate"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">End Date</p>
            </label>
            <DatePicker
              id="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              position="top"
              className="w-full"
              placeholder="-"
            />
          </div>

          {/* Reoccurring Checkbox */}
          <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
            <input
              type="checkbox"
              id="reoccurring"
              checked={formData.reoccurring}
              onChange={handleCheckboxChange}
              className="w-6 h-4 border-gray-300 rounded cursor-pointer accent-primary"
            />
            <label
              htmlFor="reoccurring"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal cursor-pointer text-lighter-text"
            >
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Reoccurring</p>
            </label>
          </div>

          {/* Frequency - Only show if reoccurring is checked */}
          {formData.reoccurring && (
            <div className="space-y-1">
              <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Frequency</p>
              </label>
              <AccordionSelect
                id="frequency"
                value={formData.frequency}
                onChange={handleSelectChange}
                options={frequencies}
                placeholder="Select Frequency"
                className="text-base-color bg-primary-shade-2/20"
              />
            </div>
          )}

          {submitError && (
            <div className="p-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-red-600 border border-red-200 rounded-md bg-red-50">
              {submitError}
            </div>
          )}
        </div>

        <ModalFooter className="flex-row gap-3 mt-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9 md:gap-4 md:mt-3">
          <Button
            intent="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-table-stroke text-base-color "
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full text-white bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
