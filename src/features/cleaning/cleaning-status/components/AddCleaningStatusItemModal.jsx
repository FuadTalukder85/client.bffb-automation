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
import { useAvailableCleaningStatusItems, useAddItemToCleaningMonth } from "@/hooks/useCleaning";

export function AddCleaningStatusItemModal({
  open,
  onOpenChange,
  year,
  month,
  onAdded,
}) {
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");

  const { data: availableItems, isLoading: isLoadingItems } =
    useAvailableCleaningStatusItems(
      { year, month, searchTerm: search },
      open
    );

  const addItemMutation = useAddItemToCleaningMonth();

  const options = useMemo(() => {
    const list = Array.isArray(availableItems)
      ? availableItems
      : availableItems?.data ?? [];
    return list.map((item) => ({
      label: item.cleaningItemName,
      value: item._id,
    }));
  }, [availableItems]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedItemId("");
    }
  }, [open]);

  const canConfirm = Boolean(selectedItemId);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await addItemMutation.mutateAsync({
      year,
      month,
      cleaningItemId: selectedItemId,
    });
    onAdded?.();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent showCloseButton>
        <ModalHeader>
          <ModalTitle>Add Item to Month</ModalTitle>
          <ModalDescription>
            Select a cleanliness item to include for {month}/{year}.
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
                No available items. Create new items in the Cleanliness Items list.
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
            disabled={!canConfirm || addItemMutation.isLoading}
            className="w-full sm:w-auto"
          >
            {addItemMutation.isLoading ? "Submitting..." : "Submit"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
