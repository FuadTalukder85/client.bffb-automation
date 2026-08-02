import React, { useEffect, useState } from "react";
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
import FieldError from "@/components/Error/field-error";
import { getApiErrorMessage } from "@/utils/apiError";

export function TaxonomyFormModal({
  open,
  onOpenChange,
  onSubmit,
  item = null,
  label = "Item",
  className,
}) {
  const isEdit = Boolean(item);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ name: item?.name || "" });
      setError(null);
    }
  }, [item, open, reset]);

  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
      setError(null);
      if (!isOpen) reset();
    }
  };

  const submit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(data);
      handleClose(false);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          `Failed to ${isEdit ? "update" : "add"} ${label.toLowerCase()}`
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[380px] lg:max-w-[309px] xl:max-w-[413px] 2xl:max-w-[464px] 3xl:max-w-[580px] gap-0 px-10 py-14 lg:px-8 lg:py-7 xl:px-9 2xl:py-11 3xl:py-14 rounded-2xl! shadow-2xl dark:border dark:border-nav-highlight/30 max-h-[85vh] overflow-y-auto",
          className
        )}
      >
        <ModalHeader className="mb-8 lg:mb-3.5 xl:mb-4.5 2xl:mb-5.5 3xl:mb-7">
          <ModalTitle className="text-2xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-center text-[#0D111A] dark:text-nav-highlight">
            {isEdit ? `Edit ${label}` : `Add ${label}`}
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-2 mb-2 text-xs lg:text-[10px] text-red-600 border border-red-200 rounded-md bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-6 lg:space-y-5">
          <div className="space-y-2">
            <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
              <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                {label} <span className="text-red-500">*</span>
              </p>
            </label>
            <Input
              {...register("name", { required: `${label} name is required` })}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="w-full rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              inputClassName="placeholder:text-sm lg:placeholder:text-[8px] lg:text-[8px] xl:placeholder:text-[10px] xl:text-[10px] 2xl:placeholder:text-xs 2xl:text-xs 3xl:placeholder:text-sm 3xl:text-sm"
            />
          </div>

          {Object.keys(errors).length > 0 && (
            <FieldError error="Please fill in all required fields." />
          )}

          <ModalFooter className="flex-row gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 px-4">
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
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {isEdit ? "Saving..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Save"
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
