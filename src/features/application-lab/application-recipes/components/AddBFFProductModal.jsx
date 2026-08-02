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
import { useBFFProductCodes } from "@/hooks/useBFFProductCodes";

const getPreferredProductCode = (item) =>
  item?.commercializedProductCode || item?.displayProductCode || item?.productCode || "";

const roleOptions = [
  { value: "coat", label: "Coating" },
  { value: "body", label: "Body" },
  { value: "fill", label: "Filling" },
  { value: "color", label: "Color" },
  { value: "ingredient", label: "Ingredient" },
];

const typeOptions = [
  { value: "solid", label: "Solid" },
  { value: "liquid", label: "Liquid" },
];

const processOptions = ["A", "B", "C", "D", "E"].map((value) => ({
  value,
  label: value,
}));

export default function AddBFFProductModal({ isOpen, onClose, onConfirm, isConfectionary = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    role: "",
    type: "",
    process: "",
    ingredient: "",
    clientRate: "",
    quantity: "",
  });

  const { data: bffProductsData } = useBFFProductCodes({
    type: formData.type || "all",
    isActive: "true",
    searchTerm,
    page: 1,
    limit: 100,
  });

  const ingredientOptions = useMemo(() => {
    const items = bffProductsData?.data || [];
    return items.map((item) => ({
      value: item._id,
      label: getPreferredProductCode(item)
        ? `${getPreferredProductCode(item)} - ${item.name}`
        : item.name,
    }));
  }, [bffProductsData]);

  const handleSelectChange = (id, value) => {
    setFormData(prev => {
      if (id === "type") {
        return { ...prev, type: value, ingredient: "", clientRate: "" };
      }
      if (id === "ingredient") {
        const selectedIngredient = (bffProductsData?.data || []).find((item) => item._id === value);
        return {
          ...prev,
          ingredient: value,
          clientRate:
            selectedIngredient?.standardPrice !== undefined && selectedIngredient?.standardPrice !== null
              ? String(selectedIngredient.standardPrice)
              : selectedIngredient?.cost !== undefined && selectedIngredient?.cost !== null
                ? String(selectedIngredient.cost)
                : prev.clientRate,
        };
      }
      return { ...prev, [id]: value };
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (formData.role && formData.type && formData.ingredient && formData.quantity) {
      const selectedIngredient = (bffProductsData?.data || []).find((item) => item._id === formData.ingredient);

      onConfirm?.({
        role: formData.role,
        type: formData.type,
        process: isConfectionary ? formData.process : null,
        quantity: Number(formData.quantity),
        ingredientSourceType: "bffProductCode",
        sourceId: formData.ingredient,
        sourceName: selectedIngredient?.name || "",
        sourceCode: getPreferredProductCode(selectedIngredient),
        bffRateAtCreation: selectedIngredient?.standardPrice ?? selectedIngredient?.cost ?? 0,
        clientRateAtCreation: Number(formData.clientRate),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      role: "",
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
    formData.role &&
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
            Add BFF Product
          </ModalTitle>
          <ModalDescription className="sr-only">
            Add a new BFF product to the recipe.
          </ModalDescription>
        </ModalHeader>

        <div className="grid gap-2 lg:gap-1 xl:gap-3 2xl:gap-4 3xl:gap-5 py-2">
          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Role</label>
            <AccordionSelect
              id="role"
              value={formData.role}
              onChange={(e) => handleSelectChange("role", e.target.value)}
              options={roleOptions}
              placeholder="Select role"
              searchable={false}
              maxHeight="max-h-[90px]"
              className="text-base-color h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 placeholder:text-[5px]"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Type</label>
            <AccordionSelect
              id="type"
              value={formData.type}
              onChange={(e) => handleSelectChange("type", e.target.value)}
              options={typeOptions}
              placeholder="Select type"
              searchable={false}
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
                onChange={(e) => handleSelectChange("process", e.target.value)}
                options={processOptions}
                placeholder="Select process"
                searchable={false}
                maxHeight="max-h-[90px]"
                className="text-base-color h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
              />
            </div>
          )}

          {/* Ingredient */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Ingredient</label>
            <AccordionSelect
              id="ingredient"
              value={formData.ingredient}
              onChange={(e) => handleSelectChange("ingredient", e.target.value)}
              options={ingredientOptions}
              onSearchChange={setSearchTerm}
              placeholder="Select ingredient"
              searchable={true}
              maxHeight="max-h-[90px]"
              className="text-base-color h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Client Rate</label>
            <Input
              type="number"
              step="0.01"
              value={formData.clientRate}
              onChange={(e) => handleInputChange("clientRate", e.target.value)}
              placeholder="0.00"
              rightIcon={<span className="flex items-center text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-nav-highlight">৳</span>}
              variant="default"
              inputClassName="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-xs"
              className="h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-xs font-normal text-lighter-text">Quantity</label>
            <Input
              type="number"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
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
