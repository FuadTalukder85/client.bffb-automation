import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input.jsx";
import { Select } from "@/components/ui/Select/Select";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { cn } from "@/lib/utils";
import { Loader2, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import { useRecipes } from "@/hooks/useRecipes";
import { useEmployees } from "@/hooks/useEmployees";
import {
  DISPATCH_TYPES,
  SAMPLE_DELIVERY_STATUSES,
} from "@/constants/dispatchConstants";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AiFillThunderbolt } from "react-icons/ai";

export function DispatchModal({
  open,
  onOpenChange,
  dispatch,
  onConfirm,
  mode = "create",
  className,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // project dropdown data
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    isActive: "true",
  });

  const projectOptions = (projectsData?.data || []).map((p) => ({
    label:
      `${p.masterProject?.code || ""} ${p.masterProject?.title || ""}`.trim(),
    value: p._id,
  }));

  const dispatchTypeOptions = Object.values(DISPATCH_TYPES).map((v) => ({
    label: v,
    value: v,
  }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  // recipes depend on project selection
  const watchProject = watch("project");
  // fetch a generous number of recipes for the selected project so dropdown isn't artificially limited
  const { data: recipesData, isLoading: recipesLoading } = useRecipes({
    isActive: "true",
    project: watchProject,
    limit: 1000,
  });
  const recipeOptions = (recipesData?.data || []).map((r) => ({
    label: `${r.recipeCode || ""} ${r.name || ""}`.trim(),
    value: r._id,
  }));

  useEffect(() => {
    if (dispatch && mode === "update") {
      const projectId = dispatch.recipe?.project?._id || "";
      reset({
        dispatchType: dispatch.dispatchType,
        project: projectId,
        recipe: dispatch.recipe?._id || "",
        requisitionDate: dispatch.requisitionDate
          ? new Date(dispatch.requisitionDate).toISOString().slice(0, 10)
          : "",
        requisitionBy: dispatch.requisitionBy?._id || "",
        sendTo: dispatch.sendTo || "",
        productionDate: dispatch.productionDate
          ? new Date(dispatch.productionDate).toISOString().slice(0, 10)
          : "",
        quantity: dispatch.quantity || 0,
        pieces: dispatch.pieces || 0,
        sampleDeliveryStatus: dispatch.sampleDeliveryStatus,
        remark: dispatch.remark || "",
        clientFeedback: dispatch.clientFeedback || "",
      });
    } else {
      reset({
        dispatchType: "",
        project: "",
        recipe: "",
        quantity: 0,
        pieces: 0,
        sendTo: "",
        remark: "",
        clientFeedback: "",
      });
    }
    setError(null);
  }, [dispatch, mode, reset, open]);

  // clear recipe whenever project selection changes
  useEffect(() => {
    setValue("recipe", "");
  }, [watchProject, setValue]);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(data);
      handleClose(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Error saving dispatch record",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-4 md:px-6 md:py-5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className,
        )}
      >
        <ModalHeader className="mb-2 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4">
          <ModalTitle className="text-lg lg:text-xs xl:text-sm 2xl:text-md 3xl:text-lg font-semibold text-center">
            {mode === "create"
              ? "Create Sample Delivery"
              : "Edit Sample Delivery"}
          </ModalTitle>
          <ModalDescription className="sr-only">
            {mode === "create"
              ? "Create a new dispatch record"
              : "Update dispatch record"}
          </ModalDescription>
        </ModalHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-2 py-1 lg:gap-1.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4"
        >
          {/* dispatch type picker */}
          <div className="space-y-1 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
              Dispatch Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dispatchType"
              control={control}
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={dispatchTypeOptions}
                  placeholder="Select Type"
                  className="h-8 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm!"
                />
              )}
            />
            {errors.dispatchType && (
              <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">
                {errors.dispatchType.message}
              </p>
            )}
          </div>

          {/* project filter */}
          <div className="space-y-1 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
              Project <span className="text-red-500">*</span>
            </label>
            <Controller
              name="project"
              control={control}
              rules={{ required: "Project is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={projectOptions}
                  searchable={true}
                  placeholder={
                    projectsLoading ? "Loading projects..." : "Select Project"
                  }
                  disabled={projectsLoading}
                  className="h-8 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm!"
                />
              )}
            />
            {errors.project && (
              <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.project.message}</p>
            )}
          </div>

          {/* recipe picker filtered by project */}
          <div className="space-y-1 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
              Recipe <span className="text-red-500">*</span>
            </label>
            <Controller
              name="recipe"
              control={control}
              rules={{ required: "Recipe is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={recipeOptions}
                  searchable={true}
                  placeholder={
                    recipesLoading ? "Loading recipes..." : "Select Recipe"
                  }
                  disabled={recipesLoading || !watchProject}
                  className="h-8 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm!"
                />
              )}
            />
            {errors.recipe && (
              <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">{errors.recipe.message}</p>
            )}
          </div>

          {/* additional fields for update mode */}
          {mode === "update" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-nav-highlight">
                  Requisition Date
                </label>
                <Input
                  type="date"
                  {...register("requisitionDate")}
                  className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md"
                  inputClassName="text-xs"
                />
              </div>

              {dispatch?.requisitionBy && (
                <div className="space-y-1">
                  <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
                    Requisition By
                  </label>
                  <Input
                    value={dispatch.requisitionBy.name}
                    disabled
                    className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md bg-primary-shade-2"
                    inputClassName="text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
                  Send To
                </label>
                <Input
                  {...register("sendTo")}
                  placeholder="Enter recipient"
                  className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md"
                  inputClassName="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
                  Production Date
                </label>
                <Input
                  type="date"
                  {...register("productionDate")}
                  className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md"
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
                  Sample Delivery Status
                </label>
                <Controller
                  name="sampleDeliveryStatus"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={Object.values(SAMPLE_DELIVERY_STATUSES).map(
                        (v) => ({ value: v, label: v }),
                      )}
                      placeholder="Select Status"
                      className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs"
                    />
                  )}
                />
              </div>
            </>
          )}

          {/* rest of form continues */}

          {error && (
            <div className="p-3 text-sm lg:text-[8px] xl:text-[9px] 2xl:text-[11px] 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
            <Button
              type="button"
              intent="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              intent="primary"
              disabled={isLoading}
              className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "create" ? (
                "Proceed"
              ) : (
                "Update"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

// separate modal used when editing a dispatch record
export function UpdateDispatchModal({
  open,
  onOpenChange,
  dispatch,
  onConfirm,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  // employees for requisitionBy
  const { data: employeesData } = useEmployees({
    isActive: "true",
    limit: 1000,
  });
  const employeeOptions = (employeesData?.data || []).map((e) => ({
    value: e._id,
    label: e.name,
  }));

  const dispatchTypeOptions = Object.values(DISPATCH_TYPES).map((v) => ({
    label: v,
    value: v,
  }));

  useEffect(() => {
    if (dispatch) {
      reset({
        dispatchType: dispatch.dispatchType || "",
        requisitionDate: dispatch.requisitionDate
          ? new Date(dispatch.requisitionDate).toISOString().slice(0, 10)
          : "",
        requisitionBy: dispatch.requisitionBy?._id || "",
        sendTo: dispatch.sendTo || "",
        productionDate: dispatch.productionDate
          ? new Date(dispatch.productionDate).toISOString().slice(0, 10)
          : "",
        sampleDeliveryStatus: dispatch.sampleDeliveryStatus || "",
        quantity: dispatch.quantity || 0,
        pieces: dispatch.pieces || 0,
        remark: dispatch.remark || "",
        clientFeedback: dispatch.clientFeedback || "",
      });
    } else {
      reset({
        dispatchType: "",
        requisitionDate: "",
        requisitionBy: "",
        sendTo: "",
        productionDate: "",
        sampleDeliveryStatus: "",
        quantity: 0,
        pieces: 0,
        remark: "",
        clientFeedback: "",
      });
    }
    setError(null);
  }, [dispatch, reset, open]);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(data);
      handleClose(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Error updating dispatch",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-[800px] lg:max-w-[430px] xl:max-w-[570px] 2xl:max-w-[640px] 3xl:max-w-[800px] gap-0 px-5 py-4 md:px-6 md:py-5 rounded-2xl overflow-y-auto max-h-[55vh] custom-scrollbar">
        <ModalHeader className="mb-2">
          <ModalTitle className="text-lg lg:text-xs xl:text-sm 2xl:text-md 3xl:text-lg font-semibold text-center">
            Edit Sample Delivery
          </ModalTitle>
        </ModalHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-2 py-1 md:gap-4 md:py-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 md:gap-y-4">
            <div>
              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight">
                  Dispatch Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="dispatchType"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={dispatchTypeOptions}
                      placeholder="Select Type"
                      className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs"
                    />
                  )}
                />
                {errors.dispatchType && (
                  <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">
                    {errors.dispatchType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Requisition Date
                </label>
                <Input
                  type="date"
                  {...register("requisitionDate")}
                  className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md"
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Requisition By
                </label>
                <Controller
                  name="requisitionBy"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AccordionSelect
                      {...field}
                      options={employeeOptions}
                      placeholder="Select employee"
                      className="text-base-color"
                    />
                  )}
                />
                {errors.requisitionBy && (
                  <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-500">Required</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Send To
                </label>
                <Input
                  {...register("sendTo")}
                  placeholder="Enter recipient"
                  className="h-8 border-none rounded-md"
                  inputClassName="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Production Date
                </label>
                <Input
                  type="date"
                  {...register("productionDate")}
                  className="h-8 border-none rounded-md"
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                />
              </div>
            </div>

            <div>
              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Quantity
                </label>
                <Input
                  {...register("quantity", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md"
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Pieces
                </label>
                <Input
                  {...register("pieces", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 border-none rounded-md"
                  inputClassName="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Sample Delivery Status
                </label>
                <Controller
                  name="sampleDeliveryStatus"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={Object.values(SAMPLE_DELIVERY_STATUSES).map(
                        (v) => ({
                          value: v,
                          label: v,
                        }),
                      )}
                      placeholder="Select Status"
                      className="h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary-shade-2 border-nav-highlight/30 rounded-md focus:ring-1 focus:ring-primary text-xs"
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Remark
                </label>
                <Textarea
                  {...register("remark")}
                  placeholder="Optional comment"
                  className="h-8 border-none rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-lighter-text">
                  Client Feedback
                </label>
                <Textarea
                  {...register("clientFeedback")}
                  placeholder="Optional feedback"
                  className="h-8 border-none rounded-md"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <ModalFooter className="w-full flex-row gap-3 mt-4 text-xs md:gap-4 md:mt-3 md:text-sm h-9 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10">
            <Button
              type="button"
              intent="outline"
              onClick={() => onOpenChange(false)}
              className="w-full border-table-stroke text-base-color "
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function ArchiveDispatchModal({ open, onOpenChange, onConfirm, className, item }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onConfirm(item);
      handleClose(false);
    } catch (err) {
      setError(err.message || "An error occurred while archiving the entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className,
        )}
      >
        <ModalHeader className="pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            Archive Entry
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex items-center justify-center w-16 md:w-10 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-10 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-white rounded-full bg-primary"
          >
            <Archive className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-base-color">
              Are you sure you want to archive this entry?
            </p>
            <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-lighter-text">
              Make sure to only perform this function with proper authorization.
            </p>
          </div>

          {error && (
            <div className="w-full p-3 text-sm lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}
        </div>

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 lg:w-2.5! xl:w-3! 2xl:w-3.5! 3xl:w-4! h-4 lg:h-2.5! xl:h-3! 2xl:h-3.5! 3xl:h-4! mr-2 animate-spin" />
                Archiving...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function RestoreDispatchModal({ open, onOpenChange, onConfirm, item, className }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
    }
  };

  const handleConfirm = async () => {
    if (!item) return;
    setError(null);
    setIsLoading(true);
    try {
      await onConfirm(item);
      handleClose(false);
    } catch (err) {
      setError(err.message || "An error occurred while restoring the entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[600px] sm:max-w-[400px] lg:max-w-[320px]! xl:max-w-[425px]! 2xl:max-w-[480px]! 3xl:max-w-[600px]! gap-0 px-5 py-5 md:px-5.5 lg:px-6.5! xl:px-8.5! 2xl:px-9.5! 3xl:px-12! md:py-5 lg:py-5.5! xl:py-7! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className,
        )}
      >
        <ModalHeader className="pb-4 md:pb-3 lg:pb-3.5! xl:pb-4.5! 2xl:pb-5! 3xl:pb-6!">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            Restore Entry
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col items-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex items-center justify-center w-16 md:w-11 lg:w-13! xl:w-17! 2xl:w-19! 3xl:w-24! h-16 md:h-11 lg:h-13! xl:h-17! 2xl:h-19! 3xl:h-24! text-white rounded-full bg-primary"
          >
            <AiFillThunderbolt className="w-8 md:w-5 lg:w-5.5! xl:w-7! 2xl:w-8! 3xl:w-10! h-8 md:h-5 lg:h-5.5! xl:h-7! 2xl:h-8! 3xl:h-10!" />
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! font-medium text-base-color">
              Are you sure you want to restore this entry?
            </p>
            <p className="px-4 md:px-4 lg:px-4.5! xl:px-5.5! 2xl:px-6.5! 3xl:px-8! text-center text-xs md:text-[7px] lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-lighter-text">
              Make sure to only perform this function with proper authorization.
            </p>
          </div>

          {error && (
            <div className="w-full p-3 text-sm lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}
        </div>

        <ModalFooter className="flex flex-row justify-center mt-6 md:mt-4 lg:mt-4.5! xl:mt-5.5! 2xl:mt-6.5! 3xl:mt-8! gap-3 md:gap-3 lg:gap-3! xl:gap-4! 2xl:gap-5! 3xl:gap-6!">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 max-w-[140px] md:max-w-[140px] lg:max-w-[106px]! xl:max-w-[142px]! 2xl:max-w-[160px]! 3xl:max-w-[200px]! md:h-12 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
