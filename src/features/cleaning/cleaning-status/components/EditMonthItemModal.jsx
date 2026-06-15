import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import {
  useAvailableCleaningStatusItems,
  useUpdateMonthItem,
} from "@/hooks/useCleaning";

export function EditMonthItemModal({
  open,
  onOpenChange,
  year,
  month,
  monthItemId,
  currentItemId,
  currentItemName,
  onUpdated,
}) {
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(currentItemId || "");

  const { data: availableItems, isLoading: isLoadingItems } =
    useAvailableCleaningStatusItems({ year, month, search }, open);

  const updateMonthItemMutation = useUpdateMonthItem();

  const options = useMemo(() => {
    const list = Array.isArray(availableItems)
      ? availableItems
      : availableItems?.data ?? [];

    const normalized = list.map((item) => ({
      label: item.cleaningItemName,
      value: item._id,
    }));

    // Ensure the current item is selectable even though the API filters it out.
    const hasCurrent = normalized.some((opt) => opt.value === currentItemId);
    if (currentItemId && !hasCurrent) {
      normalized.unshift({ label: currentItemName || "Current item", value: currentItemId });
    }

    return normalized;
  }, [availableItems, currentItemId, currentItemName]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedItemId(currentItemId || "");
    }
  }, [open, currentItemId]);

  const canConfirm = Boolean(selectedItemId && monthItemId);

  const handleConfirm = async () => {
    if (!canConfirm) return;

    await updateMonthItemMutation.mutateAsync({
      monthItemId,
      cleaningItemId: selectedItemId,
    });

    onUpdated?.(selectedItemId);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent showCloseButton>
        <ModalHeader>
          <ModalTitle>Edit month item</ModalTitle>
          <ModalDescription>
            Choose a different cleanliness item for this month.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Cleanliness Item
            </label>
            <AccordionSelect
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              options={options}
              placeholder={isLoadingItems ? "Loading..." : "Select item"}
              searchable
              onSearchChange={setSearch}
              disabled={isLoadingItems || options.length === 0}
              maxHeight="max-h-[220px]"
            />
            {options.length === 0 && !isLoadingItems && (
              <p className="mt-2 text-xs text-gray-500">
                No other items available. Create new items in the Cleanliness Items list.
              </p>
            )}
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || updateMonthItemMutation.isLoading}
            className="w-full sm:w-auto"
          >
            {updateMonthItemMutation.isLoading ? "Updating..." : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
