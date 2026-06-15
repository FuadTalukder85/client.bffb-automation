import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { BackButton } from "@/components/ui/BackButton";
import { TaskAssignmentList } from "@/components/ui/TaskAssignment/TaskAssignmentList";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import FieldError from "@/components/Error/field-error";
import { getApiErrorMessage } from "@/utils";
import { Select } from "@/components/ui/Select/Select";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { useCreateProjectTask } from "@/hooks/mutations/useProjectTaskMutations";
import { getSensoryAutomationTasks } from "@/config/taskAutomation";

const sensoryApprovalOptions = [
  { value: "Approved", label: "Approved" },
  { value: "Rework", label: "Rework Send to Application Lab" },
];

const reworkTaskOptions = [
  { value: "", label: "Select" },
  { value: "Application Recipe", label: "Application Recipe" },
  { value: "Sample Preparation", label: "Sample Preparation" },
];


export function EditRecordModal({
  open,
  onOpenChange,
  onEdit,
  item,
  projectMembers = [],
  projectId,
  className,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [step2Data, setStep2Data] = useState({});
  const [sharedStartDate, setSharedStartDate] = useState("");
  const [sharedDueDate, setSharedDueDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const { mutateAsync: createProjectTask } = useCreateProjectTask();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      suggestions: "",
      hodStatus: false,
      hodEvaluation: "",
      sensoryApproval: "Approved",
      reworkTask: "",
    },
  });

  const watchSensoryApproval = watch("sensoryApproval");
  const watchReworkTask = watch("reworkTask");
  const isRework = watchSensoryApproval === "Rework";

  useEffect(() => {
    if (item && open) {
      reset({
        suggestions: item.suggestions || "",
        hodStatus: item.hodStatus?.toLowerCase() === "approved",
        hodEvaluation: item.hodEvaluation || "",
        sensoryApproval: item.sensoryApproval === "Rework" ? "Rework" : (item.sensoryApproval?.toLowerCase() === "approved" ? "Approved" : "Rework"),
        reworkTask: "",
      });
      setStep(1);
      setStep2Data({});
      setSharedStartDate("");
      setSharedDueDate("");
    }
  }, [item, open, reset]);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
      if (!isOpen) {
        reset();
        setStep(1);
        setStep2Data({});
        setSharedStartDate("");
        setSharedDueDate("");
      }
    }
  };

  const handleStep2FieldChange = (taskTitle, field, val) => {
    setStep2Data((prev) => {
      const newData = {
        ...prev,
        [taskTitle]: {
          ...prev[taskTitle],
          [field]: val,
        },
      };

      if (taskTitle === "Rework Sample" && prev["Set Daily Production Schedule"]) {
        newData["Set Daily Production Schedule"] = {
          ...newData["Set Daily Production Schedule"],
          [field]: val,
        };
      } else if (taskTitle === "Set Daily Production Schedule" && prev["Rework Sample"]) {
        newData["Rework Sample"] = {
          ...newData["Rework Sample"],
          [field]: val,
        };
      }

      return newData;
    });
  };

  const onSubmitForm = async (data) => {
    if (step === 1) {
      if (data.sensoryApproval === "Rework" && !data.reworkTask) {
        setError("Please select a rework task category");
        return;
      }
      setError(null);

      const todayISO = new Date().toISOString();
      if (data.sensoryApproval === "Rework") {
        const tasks = data.reworkTask === "Application Recipe" ? [
          "Rework Recipe",
          "Set Next Production Date"
        ] : [
          "Rework Sample",
          "Set Daily Production Schedule",
          "Set Next Production Date"
        ];
        const initial = {};
        tasks.forEach((taskTitle) => {
          initial[taskTitle] = {
            description: "",
            startDate: todayISO,
            dueDate: "",
          };
        });
        setStep2Data(initial);
      } else {
        // Sensory approved path
        const tasks = ["Sensory Form", "Sensory Topsheet"];
        const initial = {};
        tasks.forEach((taskTitle) => {
          initial[taskTitle] = {
            description: "",
          };
        });
        setStep2Data(initial);
        setSharedStartDate(todayISO);
        setSharedDueDate("");
      }
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Update HOD Status & Sensory Approval
      const formattedData = {
        ...item,
        suggestions: data.suggestions,
        hodStatus: data.hodStatus ? "Approved" : "Not Approved",
        hodEvaluation: data.hodEvaluation,
        sensoryApproval: data.sensoryApproval,
        reworkTask: data.reworkTask,
      };
      await onEdit(formattedData);

      // 2. Automate creation of Tasks
      const tasks = getSensoryAutomationTasks(data.sensoryApproval, data.reworkTask);

      for (const task of tasks) {
        const filteredMembers = projectMembers.filter((m) =>
          (m.responsibilities || []).includes(task.responsibility)
        );

        if (filteredMembers.length === 0) {
          console.log(`[TASK] No members found with responsibility: ${task.responsibility}`);
          continue;
        }

        const assignment = step2Data[task.title] || {};
        const startDate = data.sensoryApproval === "Approved" ? sharedStartDate : (assignment.startDate || new Date().toISOString());
        const dueDate = data.sensoryApproval === "Approved" ? sharedDueDate : (assignment.dueDate || null);
        const description = assignment.description || "";

        for (const member of filteredMembers) {
          const taskPayload = {
            title: task.title,
            description: description,
            project: projectId || item.project?._id || item.project || item.projectId,
            assignedTo: member.user?._id || member.user,
            module: task.module,
            subModule: task.subModule,
            startDate: startDate,
            dueDate: dueDate || null,
          };

          await createProjectTask(taskPayload);
        }
      }

      handleClose(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "An error occurred while updating the record"));
    } finally {
      setIsLoading(false);
    }
  };

  const tasksToCreate = getSensoryAutomationTasks(watchSensoryApproval, watchReworkTask);

  const allTasksHaveNoMembers = tasksToCreate.every((task) => {
    const filtered = projectMembers.filter((m) =>
      (m.responsibilities || []).includes(task.responsibility)
    );
    return filtered.length === 0;
  });

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          step === 1
            ? "max-w-[480px] lg:max-w-[255px] xl:max-w-[341px] 2xl:max-w-[385px] 3xl:max-w-[480px] gap-0 px-6 lg:px-3.5 xl:px-4 2xl:px-4.5 3xl:px-6 py-6 lg:py-3.5 xl:py-4 2xl:py-4.5 3xl:py-6 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
            : "max-w-[540px] lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[540px] 3xl:max-w-[620px] gap-0 px-6 lg:px-4 xl:px-5 2xl:px-6 py-6 lg:py-4 xl:py-5 2xl:py-6 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden",
          className
        )}
      >
        <ModalHeader className="mb-4 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4 flex flex-row items-center justify-between">
          <ModalTitle className="text-lg lg:text-xs xl:text-sm 2xl:text-md 3xl:text-lg font-bold text-center text-base-color">
            {step === 1 ? "Edit Record" : (isRework ? "Assign Rework Task" : "Assign Task")}
          </ModalTitle>
          {step === 2 && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              title="Refresh members list"
            >
              <RefreshCw className={cn("w-4 h-4 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4", isRefreshing && "animate-spin")} />
            </button>
          )}
        </ModalHeader>

        {error && (
          <div className="p-2 mb-4 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-600 border border-red-200 rounded-xl bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col min-h-0 overflow-hidden space-y-6 lg:space-y-3.5 xl:space-y-4 2xl:space-y-4.5 3xl:space-y-6">
          {step === 1 ? (
            <div className="grid grid-cols-[140px,1fr] gap-x-2 lg:gap-x-2 xl:gap-x-3.5 2xl:gap-x-3.5 3xl:gap-x-4 gap-y-2 lg:gap-y-2 xl:gap-y-3.5 2xl:gap-y-3.5 3xl:gap-y-4 items-start overflow-y-auto max-h-[55vh] pr-1 py-1 custom-scrollbar">
              {/* Application Suggestions */}
              <label className="text-[11px] lg:text-[7.5px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-bold text-base-color uppercase tracking-tight px-0.5 mt-2">
                Application Suggestions
              </label>
              <div className="space-y-1">
                <Textarea
                  {...register("suggestions")}
                  placeholder="Flavour profile matches benchmark."
                  className="min-h-[65px] lg:min-h-[43px] xl:min-h-[55px] 2xl:min-h-[64px] 3xl:min-h-[80px] bg-primary-shade-2/20 border-nav-highlight/20 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium"
                />
                {errors.suggestions && <FieldError error="Suggestions are required" />}
              </div>

              {/* HOD Status */}
              <label className="text-[11px] lg:text-[7.5px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-bold text-base-color uppercase tracking-tight px-0.5 self-center">
                HOD Status
              </label>
              <label className="flex items-center gap-2.5 lg:gap-1.5 xl:gap-2 2xl:gap-2 3xl:gap-2.5 cursor-pointer group w-fit">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("hodStatus")}
                    className="sr-only peer"
                  />
                  <div className="w-9 lg:w-6 xl:w-7 2xl:w-8 3xl:w-9 h-5 lg:h-3.5 xl:h-4 2xl:h-[18px] 3xl:h-5 bg-muted-foreground/30 peer-checked:bg-primary bg-gray-100 dark:bg-primary/45 peer-checked:border-transparent rounded-full transition-all duration-200 ease-in-out" />
                  <div className="absolute top-0.5 left-0.5 lg:top-[3px] lg:left-[3px] xl:top-[3px] xl:left-[3px] 2xl:top-[3px] 2xl:left-[3px] 3xl:top-0.5 3xl:left-0.5 w-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-4 lg:peer-checked:translate-x-2.5 xl:peer-checked:translate-x-3 2xl:peer-checked:translate-x-3.5 3xl:peer-checked:translate-x-4" />
                </div>
                <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-bold text-base-color group-hover:text-primary transition-colors select-none">
                  {watch("hodStatus") ? "Approved" : "Not Approved"}
                </span>
              </label>

              {/* HOD Evaluation */}
              <label className="text-[11px] lg:text-[7.5px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-bold text-base-color uppercase tracking-tight px-0.5 mt-2">
                HOD Evaluation
              </label>
              <div className="space-y-1">
                <Textarea
                  {...register("hodEvaluation")}
                  placeholder="Good enough, push to sensory."
                  className="min-h-[65px] lg:min-h-[43px] xl:min-h-[55px] 2xl:min-h-[64px] 3xl:min-h-[80px] bg-primary-shade-2/20 border-nav-highlight/20 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium"
                />
                {errors.hodEvaluation && <FieldError error="Evaluation is required" />}
              </div>

              {/* Approval for Sensory */}
              <label className="text-[11px] lg:text-[7.5px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-bold text-base-color uppercase tracking-tight px-0.5 self-center">
                Approval for Sensory
              </label>
              <div className="space-y-1">
                <Select
                  options={sensoryApprovalOptions}
                  value={watchSensoryApproval}
                  onChange={(e) => setValue("sensoryApproval", e.target.value)}
                  className="w-full text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-base-color h-10 lg:h-6 xl:h-8 2xl:h-9"
                />
              </div>

              {/* Rework Task Category (only visible when sensoryApproval is "Rework") */}
              {watchSensoryApproval === "Rework" && (
                <>
                  <label className="text-[11px] lg:text-[7.5px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-bold text-base-color uppercase tracking-tight px-0.5 self-center">
                    Rework Task
                  </label>
                  <div className="space-y-1">
                    <Select
                      options={reworkTaskOptions}
                      value={watchReworkTask}
                      onChange={(e) => setValue("reworkTask", e.target.value)}
                      className="w-full text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-base-color h-10 lg:h-6 xl:h-8 2xl:h-9"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-2 overflow-y-auto max-h-[55vh] custom-scrollbar pr-1">
              <TaskAssignmentList
                tasksToCreate={tasksToCreate}
                projectMembers={projectMembers}
                getTaskValues={(taskTitle) => step2Data[taskTitle] || { description: "", startDate: "", dueDate: "" }}
                onTaskChange={handleStep2FieldChange}
                showDatesPerTask={isRework}
                getPlaceholder={(title) => {
                  if (title === "Rework Sample") return "e.g., Flavour profile matches, initiate taste tests";
                  if (title === "Set Daily Production Schedule") return "e.g., Flavour profile matches, initiate taste tests";
                  return `Task instructions for ${title}`;
                }}
              />

              {/* Shared Dates Row at the bottom (Approved path only) */}
              {!isRework && (
                <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-border">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-[7.5px] xl:text-[9.5px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-normal">
                      Start Date
                    </label>
                    <DatePicker
                      value={sharedStartDate}
                      onChange={(e) => setSharedStartDate(e.target.value)}
                      disabled={allTasksHaveNoMembers}
                      addProject={true}
                      className="w-full h-8 lg:h-6 xl:h-7.5 2xl:h-8.5"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-[7.5px] xl:text-[9.5px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-normal">
                      End Date <span className="text-[10px] lg:text-[6px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] text-muted-foreground/60">(Optional)</span>
                    </label>
                    <DatePicker
                      value={sharedDueDate}
                      onChange={(e) => setSharedDueDate(e.target.value)}
                      disabled={allTasksHaveNoMembers}
                      addProject={true}
                      className="w-full h-8 lg:h-6 xl:h-7.5 2xl:h-8.5"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <ModalFooter className="flex-row gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 mt-6 lg:mt-3.5 xl:mt-4.5 2xl:mt-5 3xl:mt-6 text-foreground">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  intent="outline"
                  onClick={() => handleClose(false)}
                  className="w-full text-xs font-semibold"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  intent="primary"
                  disabled={isLoading}
                  className="w-full text-xs font-semibold text-white bg-primary hover:bg-primary/90"
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  intent="outline"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-semibold"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  intent="primary"
                  disabled={isLoading}
                  className="w-full text-xs font-semibold text-white bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
