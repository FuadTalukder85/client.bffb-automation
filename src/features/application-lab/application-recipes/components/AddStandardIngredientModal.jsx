import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { useMemo, useState } from "react";
import { useRawMaterials } from "@/hooks/useRawMaterials";

const typeOptions = [
  { value: "solid", label: "Solid" },
  { value: "liquid", label: "Liquid" },
];

const processOptions = ["A", "B", "C", "D", "E"].map((value) => ({
  value,
  label: value,
}));

export default function AddStandardIngredientModal({ isOpen, onClose, onConfirm, isConfectionary = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    type: "",
    process: "",
    ingredient: "",
    clientRate: "",
    quantity: "",
  });

  const { data: rawMaterialsData } = useRawMaterials({
    searchTerm,
    status: "active",
    type: formData.type || "all",
    page: 1,
    limit: 100,
  });

  const ingredientOptions = useMemo(() => {
    const items = rawMaterialsData?.data || [];
    return items.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [rawMaterialsData]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      if (field === "type") {
        return { ...prev, type: value, ingredient: "", clientRate: "" };
      }
      if (field === "ingredient") {
        const selectedIngredient = (rawMaterialsData?.data || []).find((item) => item.id === value);
        const parsedCost = Number(String(selectedIngredient?.cost || "0").replace(/,/g, ""));

        return {
          ...prev,
          ingredient: value,
          clientRate: Number.isFinite(parsedCost) ? String(parsedCost) : prev.clientRate,
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleConfirm = () => {
    if (formData.type && formData.ingredient && formData.quantity) {
      const selectedIngredient = (rawMaterialsData?.data || []).find(
        (item) => item.id === formData.ingredient
      );
      const parsedCost = Number(String(selectedIngredient?.cost || "0").replace(/,/g, ""));

      onConfirm?.({
        role: null,
        type: formData.type,
        process: isConfectionary ? formData.process : null,
        quantity: Number(formData.quantity),
        ingredientSourceType: "rawMaterial",
        sourceId: formData.ingredient,
        sourceName: selectedIngredient?.name || "",
        sourceCode: null,
        bffRateAtCreation: Number.isFinite(parsedCost) ? parsedCost : 0,
        clientRateAtCreation: Number(formData.clientRate),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      type: "",
      process: "",
      ingredient: "",
      clientRate: "",
      quantity: "",
    });
    setSearchTerm("");
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
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-[500px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 px-5 py-5 rounded-2xl">
        <ModalHeader className="">
          <ModalTitle className="text-lg text-xs xl:text-sm 2xl:text-md 3xl:text-lg font-semibold text-center">
            Add Standard Ingredient
          </ModalTitle>
          <ModalDescription className="sr-only">
            Add a new standard ingredient to the recipe.
          </ModalDescription>
        </ModalHeader>

        <div className="grid gap-2 lg:gap-1 xl:gap-3 2xl:gap-4 3xl:gap-5 py-2">
          {/* Type Dropdown */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Type</label>
            <AccordionSelect
              id="type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              options={typeOptions}
              placeholder="Select type"
              searchable={false}
              maxHeight="max-h-[90px]"
              className="text-base-color h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
            />
          </div>

          {/* Ingredient Dropdown */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Ingredient</label>
            <AccordionSelect
              id="ingredient"
              value={formData.ingredient}
              onChange={(e) => handleChange("ingredient", e.target.value)}
              options={ingredientOptions}
              onSearchChange={setSearchTerm}
              placeholder="Select ingredient"
              searchable={true}
              maxHeight="max-h-[90px]"
              className="text-base-color h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
            />
          </div>

          {isConfectionary && (
            <div className="space-y-2">
              <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Process</label>
              <AccordionSelect
                id="process"
                value={formData.process}
                onChange={(e) => handleChange("process", e.target.value)}
                options={processOptions}
                placeholder="Select process"
                searchable={false}
                maxHeight="max-h-[90px]"
                className="text-base-color h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
              />
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Client Rate</label>
            <Input
              type="number"
              step="0.01"
              value={formData.clientRate}
              onChange={(e) => handleChange("clientRate", e.target.value)}
              placeholder="0.00"
              rightIcon={<span className="flex items-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-nav-highlight">৳</span>}
              variant="default"
              inputClassName="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
              className="h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8"
            />
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Quantity</label>
            <Input
              type="number"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="0.00"
              rightIcon={<span className="flex items-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-nav-highlight">g</span>}
              variant="default"
              inputClassName="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
              className="h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8"
            />
          </div>
        </div>

        <ModalFooter className="flex-row gap-5 lg:gap-2 xl:gap-3 2xl:gap-3.5 3xl:gap-5 mt-2 sm:justify-between h-9 lg:h-5 xl:h-6.5 2xl:h-7.5 3xl:h-9">
          <Button
            intent="outline"
            onClick={handleClose}
            className="w-full border-table-stroke sm:w-1/2 text-base-color text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
