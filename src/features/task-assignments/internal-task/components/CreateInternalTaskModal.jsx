import React, { useMemo, useState } from "react";
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
import { useCreateInternalTask, useCreateBulkInternalTasks } from "@/hooks/mutations";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { useModules, useSubModules } from "@/hooks/useModules";
import { sanitizeDatePayload } from "@/utils/dateFormatter";

export function CreateInternalTaskModal({
  open,
  onOpenChange,
  onSuccess,
  className,
}) {
  const [formData, setFormData] = useState({
    task: "",
    departmentType: "",
    departmentValue: "",
    module: "",
    subModule: "",
    startDate: "",
    endDate: "",
    reoccurring: false,
    frequency: "",
  });

  const [submitError, setSubmitError] = useState("");

  const { mutateAsync: createTask, isPending: isCreating } = useCreateInternalTask();
  const { mutateAsync: createBulkTasks, isPending: isCreatingBulk } = useCreateBulkInternalTasks();
  const isSubmitting = isCreating || isCreatingBulk;
  
  const { data: employeesData } = useEmployees({ statusFilter: "active", limit: 200 });
  const { data: teamsData } = useTeams({ statusFilter: "active", limit: 200 });
  const { data: modules = [] } = useModules({ enabled: open });
  const { data: subModules = [] } = useSubModules(formData.module, { enabled: open && !!formData.module });

  // Extract arrays from query results
  const employees = employeesData?.data ?? [];
  const teams = teamsData?.data ?? [];

  const employeeOptions = useMemo(() => {
    return (employees || [])
      .map((u) => ({
        value: u?._id || u?.id,
        label: u?.name || u?.username || u?.email || "-",
      }))
      .filter((opt) => Boolean(opt.value));
  }, [employees]);

  const teamOptions = useMemo(() => {
    return (teams || [])
      .map((t) => ({
        value: t?._id || t?.id,
        label: t?.name || "-",
      }))
      .filter((opt) => Boolean(opt.value));
  }, [teams]);

  const moduleOptions = useMemo(() => {
    return (modules || [])
      .map((mod) => ({
        value: mod?.key || mod?._id || mod?.id,
        label: mod?.name || "-",
      }))
      .filter((opt) => Boolean(opt.value));
  }, [modules]);

  const subModuleOptions = useMemo(() => {
    return (subModules || [])
      .map((sub) => ({
        value: sub?.key || sub?._id || sub?.id,
        label: sub?.name || "-",
      }))
      .filter((opt) => Boolean(opt.value));
  }, [subModules]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Reset specific department if type changes
    if (id === "departmentType") {
      setFormData((prev) => ({ ...prev, departmentValue: "" }));
    }

    // Reset submodule if module changes
    if (id === "module") {
      setFormData((prev) => ({ ...prev, subModule: "" }));
    }
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
    if (!formData.departmentType) {
      setSubmitError("Please select a department type.");
      return;
    }
    if (!formData.departmentValue) {
      setSubmitError("Please select an assignee/team.");
      return;
    }

    setSubmitError("");

    const startDateIso = sanitizeDatePayload(formData.startDate);
    const dueDateIso = sanitizeDatePayload(formData.endDate);

    try {
      if (formData.departmentType === "team") {
        // Create bulk tasks for all team members
        await createBulkTasks({
          title,
          teamId: formData.departmentValue,
          module: formData.module || undefined,
          subModule: formData.subModule || undefined,
          startDate: startDateIso,
          dueDate: dueDateIso,
          isRecurring: formData.reoccurring,
          frequency: formData.reoccurring ? formData.frequency || undefined : undefined,
        });
      } else {
        // Create a single internal task for one user
        await createTask({
          title,
          assignedTo: formData.departmentValue,
          module: formData.module || undefined,
          subModule: formData.subModule || undefined,
          startDate: startDateIso,
          dueDate: dueDateIso,
          isRecurring: formData.reoccurring,
          frequency: formData.reoccurring ? formData.frequency || undefined : undefined,
        });
      }

      onOpenChange(false);
      onSuccess?.(title);

      setFormData({
        task: "",
        departmentType: "",
        departmentValue: "",
        module: "",
        subModule: "",
        startDate: "",
        endDate: "",
        reoccurring: false,
        frequency: "",
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create task";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock Options
  const departmentTypes = [
    { value: "individual", label: "Individual(s)" },
    { value: "team", label: "Team" },
  ];

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
            Add Task
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

          {/* Department */}
          <div className="space-y-1">
            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Department</p>
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
              <AccordionSelect
                id="departmentType"
                value={formData.departmentType}
                onChange={handleSelectChange}
                options={departmentTypes}
                placeholder="Select"
                className="text-base-color "
              />
              <AccordionSelect
                id="departmentValue"
                value={formData.departmentValue}
                onChange={handleSelectChange}
                options={
                  formData.departmentType === "team" ? teamOptions : employeeOptions
                }
                placeholder="Select"
                disabled={!formData.departmentType}
                className="text-base-color "
              />
            </div>
          </div>

          {/* Module and Sub-module */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
            <div className="space-y-1">
              <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Module</p>
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
            <div className="space-y-1">
              <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Sub-module</p>
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
          <div className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 mt-1">
            <label className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text">
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">Status:</p>
            </label>
            <span className="px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium rounded-full bg-primary-shade-2 text-nav-highlight">
              pending
            </span>
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
          <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 mt-1">
            <input
              type="checkbox"
              id="reoccurring"
              checked={formData.reoccurring}
              onChange={handleCheckboxChange}
              className="w-6 lg:w-3.5 xl:w-4.5 2xl:w-5 3xl:w-6 h-4 lg:h-2 xl:h-3 2xl:h-3.5 3xl:h-4 border-gray-300 rounded cursor-pointer accent-primary"
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
                className="text-base-color "
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
