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
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SaveChangesModal } from "./SaveChangesModal";
import { useUpdateProjectTask } from "@/hooks/mutations";
import { sanitizeDatePayload } from "@/utils/dateFormatter";
import { getApiErrorMessage } from "@/utils/apiError";
import { useModules, useSubModules } from "@/hooks/useModules";

// Helper to format status for display
const formatStatus = (status) => {
  if (!status) return "Pending";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export function EditTaskModal({ open, onOpenChange, task, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    module: "",
    subModule: "",
    startDate: "",
    dueDate: "",
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [error, setError] = useState(null);

// Fetch modules with TanStack Query
  const { data: modules = [] } = useModules({ enabled: open });
  const { data: subModules = [] } = useSubModules(formData.module, { enabled: open && !!formData.module });

  const { mutateAsync: updateTask, isPending: isSubmitting } = useUpdateProjectTask();

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Initialize form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || task.task || "",
        description: task.description || "",
        status: task.status || "pending",
        module: task.module || "",
        subModule: task.subModule || "",
        startDate: task.startDate || "",
        dueDate: task.dueDate || "",
      });
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
      ...(id === "module" ? { subModule: "" } : {}),
    }));
  };

  const handleSubmit = () => {
    // Close EditTaskModal and open SaveChangesModal
    onOpenChange(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setError(null);

    try {
      const taskId = task._id || task.id;
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        module: formData.module || undefined,
        subModule: formData.subModule || undefined,
      };

      // Only include dates if they have values, and convert to ISO format
      const startDateISO = sanitizeDatePayload(formData.startDate);
      const dueDateISO = sanitizeDatePayload(formData.dueDate);
      if (startDateISO) payload.startDate = startDateISO;
      if (dueDateISO) payload.dueDate = dueDateISO;

      await updateTask({ id: taskId, data: payload });

      setIsConfirmModalOpen(false);
      onSuccess?.(formData);
    } catch (err) {
      console.error("Failed to update task:", err);
      setError(getApiErrorMessage(err, "Failed to update task"));
      setIsConfirmModalOpen(false);
      onOpenChange(true);
    }
  };

  const handleCancelSave = () => {
    // Close SaveChangesModal and reopen EditTaskModal
    setIsConfirmModalOpen(false);
    onOpenChange(true);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };
   const moduleOptions = modules
    ?.filter((mod) => !mod.isInternalOnly)
    .map((mod) => ({
      value: mod.key || mod._id,
      label: mod.name,
    })) || [];

  const subModuleOptions = subModules?.map((sub) => ({
    value: sub.key || sub._id,
    label: sub.name,
  })) || [];


  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[380px] lg:max-w-[200px] xl:max-w-[270px] 2xl:max-w-[300px] 3xl:max-w-[380px] gap-0 px-5 lg:px-2.5 xl:px-3.5 2xl:px-4 3xl:px-5 py-4 lg:py-2 xl:py-2 2xl:py-3 3xl:py-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader className="mb-2">
          <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
            Edit Task
          </ModalTitle>
        </ModalHeader>

        <div className="grid gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 py-1">
          {/* Error message */}
          {error && (
            <div className="p-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-red-600 border border-red-200 rounded-md bg-red-50">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div className="space-y-1">
            <label
              htmlFor="title"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                Task Title
              </p>
            </label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleInputChange}
              className="rounded-md"
              inputClassName="placeholder:text-xs lg:placeholder:text-[6.5px] xl:placeholder:text-[8.5px] 2xl:placeholder:text-[9.5px] 3xl:placeholder:text-xs text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                Description
              </p>
            </label>
            <Input
              id="description"
               type="textarea"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              className="border-none rounded-md bg-primary-shade-2/20"
              inputClassName="placeholder:text-xs lg:placeholder:text-[6.5px] xl:placeholder:text-[8.5px] 2xl:placeholder:text-[9.5px] 3xl:placeholder:text-xs text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs min-h-[80px] lg:min-h-[43px] xl:min-h-[55px] 2xl:min-h-[64px] 3xl:min-h-[80px]"
            />
          </div>
          
          <div className="space-y-1">
             {/* Module */}
              <div className="space-y-1">
                <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
                  <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Module</p>
                </label>
                <AccordionSelect
                  id="module"
                  value={formData.module}
                  onChange={handleSelectChange}
                  options={moduleOptions}
                  placeholder="Select Module"
                  className="text-base-color "
                  />
                </div>
            
                      {/* Sub-module */}
              <div className="space-y-1">
                <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
                  <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Sub-module</p>
                </label>
                <AccordionSelect
                  id="subModule"
                  value={formData.subModule}
                  onChange={handleSelectChange}
                  options={subModuleOptions}
                  placeholder="Select Sub-module"
                  disabled={!formData.module}
                  className="text-base-color "
                />
              </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Status</p>
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
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                Start Date
              </p>
            </label>
            <DatePicker
              id="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              position="top"
              className="w-full"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label
              htmlFor="dueDate"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                Due Date
              </p>
            </label>
            <DatePicker
              id="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              position="top"
              className="w-full"
              placeholder="-"
            />
          </div>
        </div>

        <ModalFooter className="flex-row gap-3 mt-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
          <Button
            intent="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full border-table-stroke text-base-color "
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
            className="w-full text-white bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Save Changes Confirmation Modal */}
      <SaveChangesModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </Modal>
  );
}
