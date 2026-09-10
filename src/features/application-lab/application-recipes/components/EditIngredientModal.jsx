import React, { useState, useEffect } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";

export default function EditIngredientModal({ isOpen, onClose, onConfirm, initialData }) {
  const [formData, setFormData] = useState({
    quantity: "",
    clientRate: "",
    bffRate: "",
  });

  // Pre-fill form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      const initClientRate =
        initialData.clientRate !== undefined && initialData.clientRate !== null && initialData.clientRate !== ""
          ? String(initialData.clientRate)
          : initialData.clientRateAtCreation !== undefined && initialData.clientRateAtCreation !== null && initialData.clientRateAtCreation !== ""
            ? String(initialData.clientRateAtCreation)
            : "";

      const initBffRate =
        initialData.bffRate !== undefined && initialData.bffRate !== null && initialData.bffRate !== ""
          ? String(initialData.bffRate)
          : initialData.bffRateAtCreation !== undefined && initialData.bffRateAtCreation !== null && initialData.bffRateAtCreation !== ""
            ? String(initialData.bffRateAtCreation)
            : "";

      setFormData({
        quantity:
          initialData.quantity !== undefined && initialData.quantity !== null
            ? String(initialData.quantity)
            : "",
        clientRate: initClientRate,
        bffRate: initBffRate,
      });
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({
      quantity: "0",
      clientRate: "0",
      bffRate: "0",
    });
  };

  const handleConfirm = () => {
    onConfirm?.({
      ...initialData,
      quantity: Number(formData.quantity),
      clientRateAtCreation: Number(formData.clientRate),
      clientRate: Number(formData.clientRate),
      bffRateAtCreation: Number(formData.bffRate),
      bffRate: Number(formData.bffRate),
    });
    onClose();
  };

  const isFormValid =
    formData.quantity !== "" &&
    !Number.isNaN(Number(formData.quantity)) &&
    Number(formData.quantity) >= 0 &&
    formData.clientRate !== "" &&
    !Number.isNaN(Number(formData.clientRate)) &&
    Number(formData.clientRate) >= 0 &&
    formData.bffRate !== "" &&
    !Number.isNaN(Number(formData.bffRate)) &&
    Number(formData.bffRate) >= 0;

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-[460px] gap-0 px-6 py-6">
        <ModalHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
          <ModalTitle className="text-xl font-semibold text-left text-base-color tracking-tight">
            Edit Ingredient
          </ModalTitle>
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-1 rounded-full border border-purple-200 dark:border-primary/40 bg-white dark:bg-[#1E192B] text-[#7C3AED] dark:text-purple-300 hover:bg-[#F7F5FA] dark:hover:bg-primary/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </ModalHeader>

        {/* Content */}
        <div className="space-y-4">
          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Quantity
            </label>
            <div className="flex items-center h-12 px-4 bg-[#EEEBF4] dark:bg-[#1E192B] border border-nav-highlight/20 rounded-xl focus-within:border-nav-highlight/40 transition-all">
              <input
                type="number"
                step="any"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="0.00"
                className="flex-1 text-sm font-medium text-base-color bg-transparent border-none focus:outline-none placeholder:text-lighter-text/40"
              />
              <span className="text-sm font-bold text-nav-highlight ml-2">g</span>
            </div>
          </div>

          {/* Client Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Client Rate
            </label>
            <div className="flex items-center h-12 px-4 bg-[#EEEBF4] dark:bg-[#1E192B] border border-nav-highlight/20 rounded-xl focus-within:border-nav-highlight/40 transition-all">
              <input
                type="number"
                step="any"
                value={formData.clientRate}
                onChange={(e) => handleInputChange("clientRate", e.target.value)}
                placeholder="0.00"
                className="flex-1 text-sm font-medium text-base-color bg-transparent border-none focus:outline-none placeholder:text-lighter-text/40"
              />
              <span className="text-sm font-bold text-nav-highlight ml-2">৳</span>
            </div>
          </div>

          {/* BFF Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              BFF Rate
            </label>
            <div className="flex items-center h-12 px-4 bg-[#EEEBF4] dark:bg-[#1E192B] border border-nav-highlight/20 rounded-xl focus-within:border-nav-highlight/40 transition-all">
              <input
                type="number"
                step="any"
                value={formData.bffRate}
                onChange={(e) => handleInputChange("bffRate", e.target.value)}
                placeholder="0.00"
                className="flex-1 text-sm font-medium text-base-color bg-transparent border-none focus:outline-none placeholder:text-lighter-text/40"
              />
              <span className="text-sm font-bold text-nav-highlight ml-2">৳</span>
            </div>
          </div>
        </div>

        <ModalFooter className="flex flex-row gap-4 mt-6 sm:justify-between">
          <Button
            intent="outline"
            onClick={onClose}
            className="w-full sm:w-1/2 h-12 border-table-stroke text-base-color rounded-xl"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="w-full sm:w-1/2 h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
