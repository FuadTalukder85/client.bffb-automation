import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Loader2, ChevronLeft } from "lucide-react";
import { ProjectDetailsStep } from "./ProjectDetailsStep";
import { AddMembersStep } from "./AddMembersStep";
import FieldError from "@/components/Error/field-error";
import { getApiErrorMessage } from "@/utils";
import { getObjectiveByPurpose } from "../../constants/projectOptions";
import { useAuthStore } from "@/store/useAuthStore";

export function ProjectModal({
  open,
  onOpenChange,
  project,
  onConfirm,
  mode = "create",
  className,
}) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raisedDate, setRaisedDate] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedPurpose = watch("purpose");

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      // Transition from closed to open
      if (project && mode === "update") {
        const projectData = {
          projectTitle: project.masterProject?.title || "",
          projectBrief: project.masterProject?.brief || "",
          purpose: project.masterProject?.purpose || "",
          purposeDetails: project.masterProject?.purposeDetails || "",
          objective: project.masterProject?.objective || "",
          objectiveDetails: project.masterProject?.objectiveDetails || "",
          raisedBy: project.masterProject?.raisedBy || "",
          targetCost: project.masterProject?.targetCost || "",
          raisedDate: project.masterProject?.raisedDate || "",
        };
        reset(projectData);
        setRaisedDate(project.masterProject?.raisedDate || "");
        setSelectedMembers([]);
      } else {
        reset({
          projectTitle: "",
          projectBrief: "",
          purpose: "",
          purposeDetails: "",
          objective: "",
          objectiveDetails: "",
          raisedBy: "",
          targetCost: "",
          raisedDate: "",
        });
        setRaisedDate("");
        if (user) {
          setSelectedMembers([
            {
              ...user,
              responsibility: "Project Overview"
            }
          ]);
        } else {
          setSelectedMembers([]);
        }
      }
      setError(null);
      setCurrentStep(1);
      setProjectData(null);
    } else if (!open && wasOpenRef.current) {
      // Transition from open to closed
      setSelectedMembers([]);
    }
    wasOpenRef.current = open;
  }, [project, mode, reset, open, user]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    const derivedObjective = getObjectiveByPurpose(selectedPurpose);
    setValue("objective", derivedObjective, { shouldDirty: false });
  }, [mode, selectedPurpose, setValue]);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
      setCurrentStep(1);
      setSelectedMembers([]);
      setProjectData(null);
    }
  };

  const onSubmitStep1 = async (data) => {
    // For update mode, submit directly
    if (mode === "update") {
      setIsLoading(true);
      setError(null);
      try {
        const formData = {
          ...data,
          raisedDate: data.raisedDate,
        };
        await onConfirm(formData);
        handleClose(false);
      } catch (err) {
        setError(getApiErrorMessage(err, "An error occurred while saving the project"));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For create mode, go to step 2
    setProjectData({
      ...data,
      raisedDate: data.raisedDate,
    });
    setCurrentStep(2);
    setError(null);
  };

  const onSubmitStep2 = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Group by userId
      const grouped = {};
      selectedMembers.forEach((m) => {
        const id = m._id || m.id;
        if (!grouped[id]) {
          grouped[id] = [];
        }
        if (m.responsibility && !grouped[id].includes(m.responsibility)) {
          grouped[id].push(m.responsibility);
        }
      });
      const members = Object.keys(grouped).map((userId) => ({
        userId,
        responsibilities: grouped[userId],
      }));
      const memberIds = Object.keys(grouped);

      // Pass both project data, selected member IDs, and members structure to the parent
      await onConfirm({
        projectData,
        memberIds,
        members,
      });
      handleClose(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "An error occurred while creating the project"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError(null);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "sm:max-w-[380px] gap-0 px-5 py-4 rounded-2xl max-h-[65vh] overflow-y-auto",
          currentStep === 2 && "sm:max-w-[500px]",
          className
        )}
      >
        <ModalHeader className="mb-2">
          <ModalTitle className="text-lg font-semibold text-center">
            {mode === "create"
              ? currentStep === 1
                ? "Add Project"
                : "Add Project Members"
              : "Update Project"}
          </ModalTitle>
          {mode === "create" && (
            <ModalDescription className="text-xs text-center text-lighter-text mt-1">
              Step {currentStep} of 2
            </ModalDescription>
          )}
        </ModalHeader>

        {error && (
          <div className="p-2 mb-2 text-xs text-red-600 border border-red-200 rounded-md bg-red-50">
            {error}
          </div>
        )}

        {currentStep === 1 ? (
          <form onSubmit={handleSubmit(onSubmitStep1)}>
            <ProjectDetailsStep
              register={register}
              errors={errors}
              raisedDate={raisedDate}
              setRaisedDate={setRaisedDate}
              control={control}
              autoObjectiveEnabled={mode === "create"}
            />

            {Object.keys(errors).length > 0 && (
              <FieldError
                error={
                   "Please fill in all required fields."
                }
              />
            )}

            <ModalFooter className="flex-row gap-3 mt-3 text-xs h-9">
              <Button
                type="button"
                intent="outline"
                onClick={() => onOpenChange(false)}
                className="w-full border-table-stroke text-base-color "
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                intent="primary"
                disabled={isLoading}
                className="w-full text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    {mode === "create" ? "Processing..." : "Saving..."}
                  </>
                ) : mode === "create" ? (
                  "Next"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </ModalFooter>
          </form>
        ) : (
          <div>
            <AddMembersStep
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              isSubmitting={isLoading}
            />

            <ModalFooter className="flex-row gap-3 mt-4 text-xs h-9">
              <Button
                type="button"
                intent="outline"
                onClick={handleBack}
                className="border-table-stroke text-base-color "
                disabled={isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                type="button"
                intent="primary"
                onClick={onSubmitStep2}
                disabled={isLoading}
                className="flex-1 text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : selectedMembers.length > 0 ? (
                  `Create Project & Add ${selectedMembers.length} Member${
                    selectedMembers.length > 1 ? "s" : ""
                  }`
                ) : (
                  "Create Project"
                )}
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
