import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import RecipeFormatConfirmationModal from "./RecipeFormatConfirmationModal";
import { useCreateRecipe } from "@/hooks/mutations/useRecipeMutations";
import { useRecipeCloneOptions } from "@/hooks/useRecipes";
import { useDebounce } from "@/hooks/useDebounce";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";

// Map frontend format IDs to backend recipeType enum values
const RECIPE_TYPE_MAP = {
  bakery: "Bakery",
  beverage: "Beverage",
  "beverage-psd": "Beverage PSD",
  confectionery: "Confectionary",
};

const RECIPE_TYPE_TO_FORMAT_ID = {
  Bakery: "bakery",
  Beverage: "beverage",
  "Beverage PSD": "beverage-psd",
  Confectionary: "confectionery",
};

const recipeFormats = [
  {
    id: "bakery",
    name: "Bakery",
    image: "/svg-icons/bakery.svg",
  },
  {
    id: "beverage",
    name: "Beverage",
    image: "/svg-icons/beverage.svg",
  },
  {
    id: "beverage-psd",
    name: "Beverage PSD",
    image: "/svg-icons/beveragePsd.svg",
  },
  {
    id: "confectionery",
    name: "Confectionery",
    image: "/svg-icons/confectionery.svg",
  },
];

export default function CreateRecipeModal({ isOpen, onClose, project, onConfirm, isIndependentRecipe = false, preSelectedFormat = null }) {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState(preSelectedFormat);
  const [selectedExistingRecipe, setSelectedExistingRecipe] = useState("");
  const [recipeSearchTerm, setRecipeSearchTerm] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { mutateAsync: createRecipe } = useCreateRecipe();
  const debouncedRecipeSearchTerm = useDebounce(recipeSearchTerm, 300);
  const {
    data: cloneOptions = [],
    isLoading: isCloneOptionsLoading,
  } = useRecipeCloneOptions(debouncedRecipeSearchTerm, { enabled: isOpen });

  useEffect(() => {
    if (isOpen) {
      setSelectedFormat(preSelectedFormat);
    }
  }, [isOpen, preSelectedFormat]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedFormat || selectedExistingRecipe) {
      setShowConfirmationModal(true);
    }
  };

  const handleFinalConfirm = async () => {
    const projectId = project?._id || project?.id;
    if (!projectId && !isIndependentRecipe) return;

    const payload = selectedExistingRecipe
      ? {
          project: projectId || null,
          isIndependentRecipe: isIndependentRecipe ? true : undefined,
          copiedFromRecipe: selectedExistingRecipe,
        }
      : {
          recipeName: project?.projectName || project?.name || "New Independent Recipe",
          project: projectId || null,
          isIndependentRecipe: isIndependentRecipe ? true : undefined,
          recipeType: RECIPE_TYPE_MAP[selectedFormat] || "Bakery",
        };

    // Call the backend API to create the recipe
    const result = await createRecipe(payload);
    const createdRecipe = result?.data || result;
    const createdFormat =
      selectedFormat ||
      RECIPE_TYPE_TO_FORMAT_ID[createdRecipe?.recipeType] ||
      "bakery";

    onConfirm?.({
      format: createdFormat,
      existingRecipe: selectedExistingRecipe,
      project,
      recipe: createdRecipe,
    });

    // Navigate to ViewRecipePage with the new recipe ID
    const recipeId = createdRecipe?._id || createdRecipe?.id;
    const navPath = projectId 
       ? `/application-lab/application-recipes/${projectId}` 
       : `/application-lab/application-recipes/version/${recipeId}`;

    navigate(navPath, {
      state: {
        project: project || null,
        recipeId,
        format: createdFormat,
        isNewRecipe: true,
      },
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedFormat(preSelectedFormat);
    setSelectedExistingRecipe("");
    setRecipeSearchTerm("");
    setShowConfirmationModal(false);
    onClose();
  };

  const getSelectedFormatName = () => {
    if (selectedExistingRecipe) {
      return "Existing Recipe";
    }
    const format = recipeFormats.find(f => f.id === selectedFormat);
    return format ? format.name : "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-[320px] lg:max-w-[410px] xl:max-w-[545px] 2xl:max-w-[615px] 3xl:max-w-3xl mx-4 bg-gradient-to-b from-white to-[#E8E0F0] dark:from-gray-800 dark:to-gray-900 rounded-[12px] lg:rounded-[13.5px] xl:rounded-[18px] 2xl:rounded-[20px] 3xl:rounded-[25px] shadow-2xl p-5 lg:p-5.5 xl:p-7 2xl:p-8 3xl:p-10">
        {/* Header */}
        <div className="relative flex items-center justify-center pb-4 lg:pb-4.5 xl:pb-5.5 2xl:pb-6.5 3xl:pb-8">
          <h2 className="text-sm lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-gray-900 dark:text-white">
            Select Recipe Format
          </h2>
          <button
            onClick={handleClose}
            className="absolute -right-3 lg:-right-3 xl:-right-4 2xl:-right-5 3xl:-right-6 -top-3 lg:-top-3 xl:-top-4 2xl:-top-5 3xl:-top-6 p-1 lg:p-1 xl:p-1.5 2xl:p-1.5 3xl:p-2 rounded-full bg-[#EEEBF4] hover:bg-purple-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-3 lg:w-3 xl:w-3.5 2xl:w-4 3xl:w-5 h-3 lg:h-3 xl:h-3.5 2xl:h-4 3xl:h-5 text-primary dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="">
          {/* Recipe Format Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-2 xl:gap-2 2xl:gap-3 3xl:gap-4 mb-3 lg:mb-4 xl:mb-5 2xl:mb-5 3xl:mb-6">
            {recipeFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => {
                  setSelectedFormat(format.id);
                  setSelectedExistingRecipe("");
                }}
                className={cn(
                  "relative rounded-xl border-4 overflow-hidden transition-all duration-200",
                  "flex flex-col",
                  "hover:shadow-lg",
                  selectedFormat === format.id
                    ? "border-primary shadow-lg"
                    : "border-[#DCD4E7]"
                )}
              >
                {/* Image Container */}
                <div className="h-14 lg:h-[68px] xl:h-[91px] 2xl:h-[102px] 3xl:h-32 bg-white flex items-end justify-center">
                  <img 
                    src={format.image} 
                    alt={format.name}
                    className="h-14 lg:h-[68px] xl:h-[91px] 2xl:h-[102px] 3xl:h-32 w-auto object-contain"
                  />
                </div>

                {/* Label */}
                <div className={cn(
                  "py-2.5 px-4 transition-colors",
                  selectedFormat === format.id ? "bg-primary" : "bg-[#DCD4E7]"
                )}>
                  <span className={cn(
                    "font-bold text-sm transition-colors",
                    selectedFormat === format.id ? "text-white" : "text-gray-700"
                  )}>
                    {format.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="relative flex justify-center">
              <span className="text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base text-gray-400 dark:text-gray-500">
                Or
              </span>
            </div>
          </div>

          {/* Existing Recipe Dropdown */}
          <div className="mb-6">
            <label className="block mb-3 text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
              Choose from an Existing Recipe to Use as Base
            </label>
            <div className="relative w-[260px] lg:w-[344px] mx-auto">
              <AccordionSelect
                id="existingRecipe"
                value={selectedExistingRecipe}
                onChange={(e) => {
                  setSelectedExistingRecipe(e.target.value);
                  setSelectedFormat(null);
                }}
                onSearchChange={(value) => setRecipeSearchTerm(value)}
                options={cloneOptions.map((recipe) => ({
                  value: recipe._id,
                  label: `${recipe.name || "Untitled Recipe"} (${recipe.recipeCode || "No Code"}) - v${recipe.version ?? 0}`,
                }))}
                placeholder={isCloneOptionsLoading ? "Loading recipes..." : "Select"}
                searchable
                disabled={isCloneOptionsLoading}
                maxHeight="max-h-[90px]"
                className="h-6 lg:h-6.5 xl:h-7.5 2xl:h-8.5 3xl:h-11 rounded-lg border-primary/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center">
            <button
              onClick={handleConfirm}
              disabled={!selectedFormat && !selectedExistingRecipe}
              className="px-5 lg:px-6.5 xl:px-8.5 2xl:px-9.5 3xl:px-12 py-1.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-md text-white text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <RecipeFormatConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleFinalConfirm}
        formatName={getSelectedFormatName()}
      />
    </div>
  );
}
