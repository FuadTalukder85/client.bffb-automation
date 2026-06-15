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
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function CleanlinessItemModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  mode = "create",
  className,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (item && mode === "update") {
      reset({
        name: item.name || "",
      });
    } else {
      reset({
        name: "",
      });
    }
    setError(null);
  }, [item, mode, reset, open]);

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
      setError(err.response?.data?.error || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[380px] lg:max-w-[309px] xl:max-w-[413px] 2xl:max-w-[464px] 3xl:max-w-[580px] gap-0 px-10 py-14 lg:px-8 lg:py-7 xl:px-9 2xl:py-11 3xl:py-14 rounded-2xl! shadow-2xl dark:border dark:border-nav-highlight/30",
          className
        )}
      >
        <ModalHeader className="mb-8 lg:mb-3.5 xl:mb-4.5 2xl:mb-5.5 3xl:mb-7">
          <ModalTitle className="text-2xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-center text-[#0D111A] dark:text-nav-highlight">
            {mode === "create" ? "Add List Item" : "Edit List Item"}
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-5">
          <div className="space-y-2">
             <label className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
                <p className="mt-1 lg:my-[1px] xl:my-[2px] 2xl:my-[3px] 3xl:my-1">
                  Cleanliness Item
                </p>
              </label>
            <Input
              {...register("name", { required: "Item name is required" })}
              placeholder=""
              className={cn(
                "w-full rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm",
                errors.name && "ring-1 ring-red-500/50 focus-visible:ring-red-500"
              )}
            />
            {errors.name && (
              <p className="text-[10px] lg:text-[9px] font-medium text-red-500 px-1 mt-1">{errors.name.message}</p>
            )}
          </div>

          <ModalFooter className="flex-row gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 px-4">
            <Button
              type="button"
              intent="outline"
              onClick={() => onOpenChange(false)}
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "Adding..." : "Confirming..."}
                </>
              ) : mode === "create" ? (
                "Add"
              ) : (
                "Confirm"
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
