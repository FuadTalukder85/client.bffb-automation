import React from "react";
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
import { Pagination } from "@/components/ui/Pagination";

export function ExportModal({
  open,
  onOpenChange,
  title = "Export",
  description = "Select how many items to export based on the current filters.",
  selectedLimit = 20,
  onLimitChange,
  selectedPage = 1,
  onPageChange,
  totalItems = 0,
  onConfirm,
  isLoading = false,
  confirmLabel = "Export",
  cancelLabel = "Cancel",
  itemsPerPageOptions = [20, 50, 100, { label: "All", value: "all" }],
  className,
}) {
  const handleClose = (isOpen) => {
    if (!isLoading) {
      onOpenChange(isOpen);
    }
  };

  const handleConfirm = async () => {
    if (isLoading) return;
    await onConfirm?.();
  };

  const totalPages =
    selectedLimit === "all"
      ? 1
      : Math.ceil(totalItems / (parseInt(selectedLimit) || 20)) || 1;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-130 sm:max-w-105 lg:max-w-85! xl:max-w-115! 2xl:max-w-130! 3xl:max-w-160! px-5 py-5 md:px-6 lg:px-7! xl:px-8! 2xl:px-9! 3xl:px-11! md:py-6 lg:py-6.5! xl:py-7.5! 2xl:py-8! 3xl:py-10! rounded-2xl md:rounded-md lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
          className,
        )}
      >
        <ModalHeader className="pb-2">
          <ModalTitle className="text-lg lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg! font-semibold text-center">
            {title}
          </ModalTitle>
          <ModalDescription className="text-center text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! text-muted-foreground">
            {description}
          </ModalDescription>
        </ModalHeader>

        <div className="flex flex-col gap-2 py-7 lg:py-8.5 xl:py-11 2xl:py-13 3xl:py-16">
          <Pagination
            currentPage={selectedPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={selectedLimit}
            onItemsPerPageChange={(val) => {
              onLimitChange(val);
              onPageChange(1);
            }}
            itemsPerPageOptions={itemsPerPageOptions}
            staticPosition={true}
            disabled={selectedLimit === "all"}
          />
        </div>

        <ModalFooter className="flex flex-row justify-center gap-3">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 max-w-40 md:max-w-35 lg:max-w-30! xl:max-w-37.5! 2xl:max-w-42.5! 3xl:max-w-52.5! md:h-11 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! border-table-stroke text-nav-highlight hover:bg-primary-shade-2 disabled:opacity-50"
          >
            {cancelLabel}
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 max-w-40 md:max-w-35 lg:max-w-30! xl:max-w-37.5! 2xl:max-w-42.5! 3xl:max-w-52.5! md:h-11 lg:h-6.5! xl:h-8.5! 2xl:h-9.5! 3xl:h-12! text-sm md:text-[8px] lg:text-[8.5px]! xl:text-[11.5px]! 2xl:text-[13px]! 3xl:text-base! bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
          >
            {isLoading ? `${confirmLabel}...` : confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
