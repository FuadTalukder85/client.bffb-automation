import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select/Select";
import FieldError from "@/components/Error/field-error";

export function AddRawMaterialModal({
  open,
  onOpenChange,
  onAdd,
  className,
  isLoading = false,
}) {
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      type: "",
      cost: "",
    },
  });

  const selectedType = watch("type");

  const typeOptions = [
    { label: "Solid", value: "Solid" },
    { label: "Liquid", value: "Liquid" },
  ];

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
      if (!isOpen) reset();
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    try {
      await onAdd(data);
      handleClose(false);
    } catch (err) {
      setError(err.message || "An error occurred while adding the item");
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[500px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 px-5 py-5 rounded-2xl max-h-[85vh] overflow-y-auto",
          className
        )}
      >
        <ModalHeader className="mb-4 lg:mb-1 xl:mb-2 2xl:mb-3 3xl:mb-4">
          <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
            Add List Item
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-2 mb-2 text-xs lg:text-[10px] text-red-600 border border-red-200 rounded-md bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                  Raw Material Name <span className="text-red-500">*</span>
                </p>
              </label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="Coconut Oil"
                className="w-full rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                  Type <span className="text-red-500">*</span>
                </p>
              </label>
              <Select
                options={typeOptions}
                value={selectedType}
                onChange={(e) => setValue("type", e.target.value, { shouldValidate: true })}
                placeholder="Select"
                className="w-full h-10 lg:h-6 xl:h-7 2xl:h-8 3xl:h-10 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                  Cost <span className="text-red-500">*</span>
                </p>
              </label>
              <Input
                {...register("cost", { required: "Cost is required" })}
                placeholder="24.5"
                leftIcon={<span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-foreground">৳</span>}
                rightIcon={<span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text">/kg</span>}
                className="w-full rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              />
            </div>

            {Object.keys(errors).length > 0 && (
              <FieldError error="Please fill in all required fields." />
            )}
          </div>

          <ModalFooter className="flex-row gap-5 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 mt-2 text-xs lg:text-[10px] sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
            <Button
              type="button"
              intent="outline"
              onClick={() => handleClose(false)}
              className="w-full sm:w-1/2 h-10 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 rounded-lg border-table-stroke text-base-color"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              intent="primary"
              disabled={isLoading}
              className="w-full sm:w-1/2 h-10 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
