import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { useCreateProjectTask, useCreateBulkProjectTasks } from "@/hooks/mutations";
import { useTeams } from "@/hooks/useTeams";
import { useEmployees } from "@/hooks/useEmployees";
import { useModules, useSubModules } from "@/hooks/useModules";
import { sanitizeDatePayload } from "@/utils/dateFormatter";
import { getApiErrorMessage } from "@/utils/apiError";

export function CreateTaskModal({ open, onOpenChange, onSuccess, projectId, className }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToType: "",
    assignedToValue: "",
    module: "",
    subModule: "",
    startDate: "",
    dueDate: "",
  });
  const [error, setError] = useState(null);

  // Mutations
  const { mutateAsync: createTask, isPending: isCreating } = useCreateProjectTask();
  const { mutateAsync: createBulkTasks, isPending: isCreatingBulk } = useCreateBulkProjectTasks();
  const isSubmitting = isCreating || isCreatingBulk;

  // Fetch teams and employees
  const { data: teamsData } = useTeams({ statusFilter: "active", limit: 100 });
  const { data: employeesData } = useEmployees({ statusFilter: "active", limit: 100 });

  // Extract arrays from query results
  const teams = teamsData?.data ?? [];
  const employees = employeesData?.data ?? [];

  // Fetch modules with TanStack Query
  const { data: modules = [] } = useModules({ enabled: open });
  const { data: subModules = [] } = useSubModules(formData.module, { enabled: open && !!formData.module });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Reset specific assignment if type changes
    if (id === "assignedToType") {
      setFormData((prev) => ({ ...prev, assignedToValue: "" }));
    }
    // Reset submodule if module changes
    if (id === "module") {
      setFormData((prev) => ({ ...prev, subModule: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!formData.assignedToValue) {
      setError("Please select who to assign the task to");
      return;
    }

    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        project: projectId,
        module: formData.module || undefined,
        subModule: formData.subModule || undefined,
      };

      // Only include dates if they have values, and convert to ISO format
      const startDateISO = sanitizeDatePayload(formData.startDate);
      const dueDateISO = sanitizeDatePayload(formData.dueDate);
      if (startDateISO) payload.startDate = startDateISO;
      if (dueDateISO) payload.dueDate = dueDateISO;

      if (formData.assignedToType === "team") {
        // Create bulk tasks for team
        payload.teamId = formData.assignedToValue;
        await createBulkTasks(payload);
      } else {
        // Create single task for individual
        payload.assignedTo = formData.assignedToValue;
        await createTask(payload);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Failed to create task:", err);
      setError(getApiErrorMessage(err, "Failed to create task. Please try again."));
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      assignedToType: "",
      assignedToValue: "",
      module: "",
      subModule: "",
      startDate: "",
      dueDate: "",
    });
    setError(null);
    onOpenChange(false);
  };

  // Transform data for dropdowns
  const assignmentTypes = [
    { value: "individual", label: "Individual(s)" },
    { value: "team", label: "Team" },
  ];

  const teamOptions = teams?.map((team) => ({
    value: team._id || team.id,
    label: team.name,
  })) || [];

  const employeeOptions = employees?.map((emp) => ({
    value: emp._id || emp.id,
    label: emp.name || emp.username || emp.email,
  })) || [];

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
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[380px] lg:max-w-[200px] xl:max-w-[270px] 2xl:max-w-[300px] 3xl:max-w-[380px] gap-0 px-5 lg:px-2.5 xl:px-3.5 2xl:px-4 3xl:px-5 py-4 lg:py-2 xl:py-2 2xl:py-3 3xl:py-4 rounded-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <ModalHeader className="mb-0">
          <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
            Add Task
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
             <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Task Title <span className="text-red-500">*</span></p>
            </label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleInputChange}
              className="rounded-md"
              inputClassName="placeholder:text-xs placeholder:lg:text-[6.5px] placeholder:xl:text-[8.5px] placeholder:2xl:text-[9.5px] placeholder:3xl:text-xs text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Description</p>
            </label>
            <Input
              id="description"
              type="textarea"
              placeholder="Enter description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              className="border-none rounded-md bg-primary-shade-2/20"
              inputClassName="placeholder:text-xs placeholder:lg:text-[6.5px] placeholder:xl:text-[8.5px] placeholder:2xl:text-[9.5px] placeholder:3xl:text-xs text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs min-h-[80px] lg:min-h-[43px] xl:min-h-[55px] 2xl:min-h-[64px] 3xl:min-h-[80px]"
            />
          </div>

          {/* Assigned To */}
          <div className="space-y-1">
            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Assigned to <span className="text-red-500">*</span></p>
            </label>
            <div className="space-y-2">
              <AccordionSelect
                id="assignedToType"
                value={formData.assignedToType}
                onChange={handleSelectChange}
                options={assignmentTypes}
                placeholder="Select Type"
                className="text-base-color "
              />
              <AccordionSelect
                id="assignedToValue"
                value={formData.assignedToValue}
                onChange={handleSelectChange}
                options={
                  formData.assignedToType === "team" ? teamOptions : employeeOptions
                }
                placeholder="Select"
                disabled={!formData.assignedToType}
                className="text-base-color "
              />
            </div>
          </div>

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

          {/* Status */}
          <div className="flex items-center gap-3 mt-1">
            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
              Status:
            </label>
            <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium rounded-full bg-primary-shade-2 text-nav-highlight">
              Pending
            </span>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label
              htmlFor="startDate"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Start Date</p>
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
              <p className="my-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Due Date</p>
            </label>
            <DatePicker
              id="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              position="top"
              className="w-full"
            />
          </div>
        </div>

        <ModalFooter className="flex-row gap-3 mt-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
          <Button
            intent="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full border-table-stroke text-base-color "
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.assignedToValue}
            className="w-full text-white bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
