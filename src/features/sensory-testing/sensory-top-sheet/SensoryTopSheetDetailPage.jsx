import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useSensoryTopSheetBySample, useSensoryFormSampleDetails, useCreateSensoryTopSheet, useUpdateSensoryTopSheet } from "@/hooks/useSensoryForm";
import { useIsMobile } from "@/hooks/useIsMobile";
import DesktopSensoryTopSheetDetailPage from "./components/DesktopSensoryTopSheetDetailPage";
import MobileSensoryTopSheetDetailPage from "./components/MobileSensoryTopSheetDetailPage";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useCreateProjectTask } from "@/hooks/mutations/useProjectTaskMutations";
import { AssignTaskModal, TaskAssignedModal } from "../../project-overview/components/TaskAutomationModals";

export default function SensoryTopSheetDetailPage() {
  const { sampleId } = useParams();
  const isMobile = useIsMobile();
  const { user } = useAuthStore();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [tasksToCreate, setTasksToCreate] = useState([]);
  const [assignedTasksList, setAssignedTasksList] = useState([]);
  const [taskModalTitle, setTaskModalTitle] = useState("Assign Task");
  const [pendingTopSheetData, setPendingTopSheetData] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const { data: topSheetData, isLoading: topSheetLoading, error: topSheetError } = useSensoryTopSheetBySample(sampleId);
  const { data: sampleDetailsData, isLoading: sampleDetailsLoading, error: sampleDetailsError } = useSensoryFormSampleDetails(sampleId);

  const createTopSheetMutation = useCreateSensoryTopSheet();
  const updateTopSheetMutation = useUpdateSensoryTopSheet();
  const { mutateAsync: createProjectTask } = useCreateProjectTask();

  const projectId = sampleDetailsData?.project?._id || sampleDetailsData?.project?.id;
  const { data: projectMembers = [] } = useProjectMembers(projectId);

  const isLoading = topSheetLoading || sampleDetailsLoading;
  const error = topSheetError || sampleDetailsError;

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load sensory top sheet details";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    []
  );

  const sampleDetails = useMemo(
    () =>
      sampleDetailsData
        ? {
            projectBrief: sampleDetailsData.project?.brief,
            bdCroBrief: sampleDetailsData.project?.bdOrCROBrief,
            targetCost: sampleDetailsData.project?.targetCost,
            benchmark: sampleDetailsData.project?.benchmark,
            link: sampleDetailsData.project?.link,
            recipeCode: sampleDetailsData.recipe?.recipeCode,
            recipeName: sampleDetailsData.recipe?.recipeName || sampleDetailsData.recipe?.name,
            productionDate: sampleDetailsData.productionDate || sampleDetailsData.createdAt,
            actualCostPerKg: sampleDetailsData.actualCostPerKg,
            ingredients: sampleDetailsData.recipe?.ingredientsList || [],
          }
        : null,
    [sampleDetailsData]
  );

  // Map aggregatedForms.forms → table rows (include comments/remarks)
  const evaluations = useMemo(() => {
    const forms = topSheetData?.aggregatedForms?.forms ?? [];
    return forms.map((form, idx) => ({
      ...form,
      sl: idx + 1,
      panelistName: form.panelistID?.name || "—",
    }));
  }, [topSheetData]);

  // Pre-computed averages from the API
  const aggregated = useMemo(() => topSheetData?.aggregatedForms?.aggregated ?? {}, [topSheetData]);

  // Comments and remarks from sensory forms (for the modal)
  const sensoryFormComments = useMemo(() => topSheetData?.aggregatedForms?.comments ?? [], [topSheetData]);
  const sensoryFormRemarks = useMemo(() => topSheetData?.aggregatedForms?.remarks ?? [], [topSheetData]);

  // Single top sheet data (not user-specific)
  const existingTopSheet = useMemo(() => {
    return topSheetData?.aggregatedTopSheets || null;
  }, [topSheetData]);

  const topSheetSubmitPhase = useMemo(() => {
    if (!existingTopSheet) return "initial";

    if (existingTopSheet.approveForApplicationLab) {
      return "closed";
    }

    if (existingTopSheet.approvedForShelfTesting) {
      return "closed";
    }

    if (existingTopSheet.isSubmitted) {
      return "shelfLifeOnly";
    }

    return "initial";
  }, [existingTopSheet]);

  const canSubmitTopSheet = topSheetSubmitPhase !== "closed";

  const productCodeTable = useMemo(() => {
    if (!sampleDetails?.ingredients?.length) return null;
    return (
      <div className="w-full border rounded-xl overflow-hidden border-border/60">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-3 text-left font-bold text-foreground border-r border-border/60 w-1/2">
                BFF Product Code
              </th>
              <th className="px-4 py-3 text-left font-bold text-foreground w-1/2">Dosage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sampleDetails.ingredients.map((p, i) => (
              <tr key={i} className="last:border-0">
                <td className="px-4 py-3 text-foreground/80 border-r border-border/60">{p.code}</td>
                <td className="px-4 py-3 text-foreground/80">
                  <div className="flex items-center justify-between">
                    <span>{p.quantity}</span>
                    <span className="text-[12px] font-normal opacity-50">g</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [sampleDetails]);

  const handleSubmitEvaluation = async (action, formData) => {
    try {
      const evaluation = topSheetSubmitPhase === "shelfLifeOnly"
        ? "approve"
        : (typeof action === "string" ? action : action?.evaluation);
      const sendForShelfLife =
        typeof action === "object" ? Boolean(action?.sendForShelfLife) : false;
      const dispatchSample =
        typeof action === "object" ? Boolean(action?.dispatchSample) : false;
      const reworkTask =
        typeof action === "object" ? action?.reworkTask : null;

      const submitData = {
        sampleID: sampleId,
        approvedForShelfTesting: evaluation === "approve"
          ? sendForShelfLife
          : Boolean(existingTopSheet?.approvedForShelfTesting),
        approveForApplicationLab: evaluation === "rework",
        panelistComment: formData.panelistComment,
        panelistRemarks: formData.panelistRemarks,
        isSubmitted: true,
        evaluation,
      };

      // Determine tasks to create
      const tasks = [];
      let modalTitle = "Assign Task";

      if (evaluation === "rework") {
        modalTitle = "Assign Rework Task";
        if (reworkTask === "Application Recipe") {
          tasks.push(
            {
              title: "Rework Recipe",
              responsibility: "Application Recipe",
              module: "application-lab",
              subModule: "manage-recipe",
            },
            {
              title: "Set Next Production Date",
              responsibility: "Manage Project Schedule",
              module: "project-overview",
              subModule: "master-project-schedule",
            }
          );
        } else if (reworkTask === "Sample Preparation") {
          tasks.push(
            {
              title: "Rework Sample",
              responsibility: "Prepare Samples",
              module: "application-lab",
              subModule: "sample-preparation",
            },
            {
              title: "Set Daily Production Schedule",
              responsibility: "Daily Production Schedule",
              module: "application-lab",
              subModule: "production-schedule",
            },
            {
              title: "Set Next Production Date",
              responsibility: "Manage Project Schedule",
              module: "project-overview",
              subModule: "master-project-schedule",
            }
          );
        }
      } else if (evaluation === "approve") {
        modalTitle = "Assign Task";
        if (sendForShelfLife) {
          tasks.push({
            title: "Shelf Life Testing",
            responsibility: "Shelf Life Testing",
            module: "shelf-life-testing",
            subModule: "test-records",
          });
        }
        if (dispatchSample) {
          tasks.push({
            title: "Dispatch Sample",
            responsibility: "Sample Dispatch",
            module: "dispatch",
            subModule: null,
          });
        }
      }

      if (tasks.length > 0) {
        setPendingTopSheetData({ submitData });
        setTasksToCreate(tasks);
        setTaskModalTitle(modalTitle);
        setIsAssignOpen(true);
      } else {
        // Direct save without tasks
        if (existingTopSheet?._id || existingTopSheet?.id) {
          await updateTopSheetMutation.mutateAsync({
            id: existingTopSheet?._id || existingTopSheet?.id,
            data: submitData,
          });
        } else {
          await createTopSheetMutation.mutateAsync(submitData);
        }
      }
    } catch (error) {
      console.error("Error submitting top sheet:", error);
    }
  };

  const handleAssignConfirm = async (taskAssignments) => {
    try {
      // 1. Submit the top sheet first
      const submitData = pendingTopSheetData?.submitData;
      if (submitData) {
        if (existingTopSheet?._id || existingTopSheet?.id) {
          await updateTopSheetMutation.mutateAsync({
            id: existingTopSheet?._id || existingTopSheet?.id,
            data: submitData,
          });
        } else {
          await createTopSheetMutation.mutateAsync(submitData);
        }
      }

      // 2. Create the project tasks
      const createdTasksSummary = [];
      for (const task of tasksToCreate) {
        const assignment = taskAssignments[task.title];
        if (!assignment || !Array.isArray(assignment.assignedTo) || assignment.assignedTo.length === 0) continue;

        const assigneeNames = [];
        for (const userId of assignment.assignedTo) {
          const member = projectMembers.find((m) => m.user?._id === userId);
          const assigneeName = member ? member.user.name : "Unknown User";
          assigneeNames.push(assigneeName);

          const taskPayload = {
            title: task.title,
            description: assignment.description || "",
            project: projectId,
            assignedTo: userId,
            module: task.module,
            subModule: task.subModule,
            startDate: assignment.startDate || null,
            dueDate: assignment.dueDate || null,
          };

          await createProjectTask(taskPayload);
        }

        createdTasksSummary.push({
          title: task.title,
          assigneeName: assigneeNames.join(", "),
          startDate: assignment.startDate,
          dueDate: assignment.dueDate,
        });
      }

      setAssignedTasksList(createdTasksSummary);
      setIsAssignOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Failed to complete task assignments:", error);
      alert(error.message || "Failed to complete task assignments. Please try again.");
    }
  };

  const handleAssignBack = () => {
    setIsAssignOpen(false);
    setIsSubmitModalOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setAssignedTasksList([]);
    setPendingTopSheetData(null);
  };

  const props = {
    sampleId,
    sampleDetails,
    evaluations,
    aggregated,
    existingTopSheet,
    canSubmitTopSheet,
    topSheetSubmitPhase,
    sensoryFormComments,
    sensoryFormRemarks,
    isLoading,
    today,
    productCodeTable,
    hasError,
    errorMessage,
    onSubmitEvaluation: handleSubmitEvaluation,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
  };

  return (
    <>
      {isMobile ? (
        <MobileSensoryTopSheetDetailPage {...props} />
      ) : (
        <DesktopSensoryTopSheetDetailPage {...props} />
      )}
      <AssignTaskModal
        open={isAssignOpen}
        onOpenChange={handleAssignBack}
        tasks={tasksToCreate}
        projectMembers={projectMembers}
        onConfirm={handleAssignConfirm}
        onBack={handleAssignBack}
        title={taskModalTitle}
      />
      <TaskAssignedModal
        open={isSuccessOpen}
        onClose={handleSuccessClose}
        assignedTasks={assignedTasksList}
        projectName={sampleDetails?.recipeName || "Project"}
      />
    </>
  );
}
