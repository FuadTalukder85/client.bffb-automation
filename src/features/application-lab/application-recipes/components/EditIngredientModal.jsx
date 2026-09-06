import React, { useState, useEffect } from "react";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useBFFProductCodes } from "@/hooks/useBFFProductCodes";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";

const getPreferredProductCode = (item) =>
  item?.commercializedProductCode || item?.displayProductCode || item?.productCode || "";

const typeOptions = [
  { value: "solid", label: "Solid" },
  { value: "liquid", label: "Liquid" },
];

const processOptions = ["A", "B", "C", "D", "E"].map((value) => ({
  value,
  label: value,
}));

export default function EditIngredientModal({ isOpen, onClose, onConfirm, initialData, isConfectionary = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    type: "",
    process: "",
    ingredient: "",
    clientRate: "",
    quantity: "",
  });

  const ingredientSourceType = initialData?.ingredientSourceType || "rawMaterial";

  const { data: bffProductsData } = useBFFProductCodes({
    type: formData.type || "all",
    isActive: "true",
    searchTerm,
    page: 1,
    limit: 100,
  });

  const { data: rawMaterialsData } = useRawMaterials({
    searchTerm,
    status: "active",
    type: formData.type || "all",
    page: 1,
    limit: 100,
  });

  const ingredientOptions =
    ingredientSourceType === "bffProductCode"
      ? (bffProductsData?.data || []).map((item) => ({
          value: item._id,
          label: getPreferredProductCode(item)
            ? `${getPreferredProductCode(item)} - ${item.name}`
            : item.name,
        }))
      : (rawMaterialsData?.data || []).map((item) => ({
          value: item.id || item._id,
          label: item.name,
        }));

  // Pre-fill form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        type: initialData.type ? initialData.type.toLowerCase() : "", 
        process: initialData.process || "",
        ingredient: initialData.sourceId || "",
        clientRate:
          initialData.clientRateAtCreation !== undefined && initialData.clientRateAtCreation !== null
            ? String(initialData.clientRateAtCreation)
            : "",
        quantity: initialData.quantity ? initialData.quantity.toString() : "",
      });
      setSearchTerm("");
    }
  }, [isOpen, initialData]);

  const handleSelectChange = (id, value) => {
    setFormData((prev) => {
      if (id === "ingredient") {
        const selectedItem =
          ingredientSourceType === "bffProductCode"
            ? (bffProductsData?.data || []).find((item) => item._id === value)
            : (rawMaterialsData?.data || []).find((item) => (item.id || item._id) === value);

        const parsedRawCost = Number(String(selectedItem?.cost || "0").replace(/,/g, ""));
        const sourceCost =
          ingredientSourceType === "bffProductCode"
            ? Number(selectedItem?.standardPrice ?? 0)
            : Number.isFinite(parsedRawCost)
              ? parsedRawCost
              : 0;

        return {
          ...prev,
          ingredient: value,
          clientRate: prev.clientRate || String(sourceCost),
        };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    const selectedItem =
      ingredientSourceType === "bffProductCode"
        ? (bffProductsData?.data || []).find((item) => item._id === formData.ingredient)
        : (rawMaterialsData?.data || []).find((item) => (item.id || item._id) === formData.ingredient);

    const parsedRawCost = Number(String(selectedItem?.cost || "0").replace(/,/g, ""));
    const sourceCost =
      ingredientSourceType === "bffProductCode"
        ? Number(selectedItem?.standardPrice ?? 0)
        : Number.isFinite(parsedRawCost)
          ? parsedRawCost
          : 0;

    onConfirm?.({
      index: initialData?.index,
      role: initialData?.role || null,
      type: formData.type,
      process: isConfectionary ? formData.process : null,
      ingredientSourceType,
      sourceId: ingredientSourceType === "bffProductCode" ? formData.ingredient : (selectedItem?.id || selectedItem?._id || formData.ingredient),
      sourceName: ingredientSourceType === "bffProductCode" ? selectedItem?.name || "" : selectedItem?.name || "",
      sourceCode: ingredientSourceType === "bffProductCode" ? getPreferredProductCode(selectedItem) || null : null,
      quantity: Number(formData.quantity),
      bffRateAtCreation: sourceCost,
      clientRateAtCreation: Number(formData.clientRate),
    });
    onClose();
  };

  const isFormValid =
    formData.type &&
    (!isConfectionary || formData.process) &&
    formData.ingredient &&
    formData.quantity &&
    formData.clientRate &&
    !Number.isNaN(Number(formData.clientRate));

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-[500px] gap-0 px-6 py-6">
        <ModalHeader className="pb-4">
          <ModalTitle className="text-xl font-semibold text-center text-base-color tracking-tight">
            Edit Entry
          </ModalTitle>
        </ModalHeader>

        {/* Content */}
        <div className="space-y-5">
          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-normal text-lighter-text">Type</label>
            <AccordionSelect
              id="type"
              value={formData.type}
              onChange={(e) => handleSelectChange("type", e.target.value)}
              options={typeOptions}
              placeholder="Select Type"
              searchable={false}
              className="h-12 text-sm text-base-color bg-[#EEEBF4] border-nav-highlight/20 rounded-xl"
            />
          </div>

          {/* Ingredient */}
          <div className="space-y-2">
            <label className="text-xs font-normal text-lighter-text">Ingredient</label>
            <AccordionSelect
              id="ingredient"
              value={formData.ingredient}
              onChange={(e) => handleSelectChange("ingredient", e.target.value)}
              options={ingredientOptions}
              onSearchChange={setSearchTerm}
              placeholder="Select Ingredient"
              searchable={true}
              className="h-12 text-sm text-base-color bg-[#EEEBF4] border-nav-highlight/20 rounded-xl"
            />
          </div>

          {isConfectionary && (
            <div className="space-y-2">
              <label className="text-xs font-normal text-lighter-text">Process</label>
              <AccordionSelect
                id="process"
                value={formData.process}
                onChange={(e) => handleSelectChange("process", e.target.value)}
                options={processOptions}
                placeholder="Select Process"
                searchable={false}
                className="h-12 text-sm text-base-color bg-[#EEEBF4] border-nav-highlight/20 rounded-xl"
              />
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-normal text-lighter-text">Client Rate</label>
            <Input
              type="number"
              step="0.01"
              value={formData.clientRate}
              onChange={(e) => handleInputChange("clientRate", e.target.value)}
              placeholder="0.00"
              rightIcon={<span className="text-sm font-bold text-nav-highlight">৳</span>}
              variant="default"
              inputClassName="placeholder:text-xs"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-normal text-lighter-text">Quantity</label>
            <div className="flex items-center h-12 px-4 bg-[#EEEBF4] border border-nav-highlight/20 rounded-xl focus-within:border-nav-highlight/40 transition-all">
              <input
                type="number"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="0.00"
                className="flex-1 text-sm font-medium text-base-color bg-transparent border-none focus:outline-none placeholder:text-lighter-text/40"
              />
              <span className="text-sm font-bold text-nav-highlight ml-2">g</span>
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
