import React from "react";
import {
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export function ViewProductDetailsModalMobile({
  displayProductCode,
  displayName,
  displaySegment,
  displayStatus,
  remarks,
  recipes,
  isLoading,
  onClose,
  className,
}) {
  const navigate = useNavigate();
  return (
    <ModalContent
      className={cn(
        "w-[92vw] max-w-[420px] rounded-[15px] p-4 bg-gray-50 dark:bg-background",
        className,
      )}
    >
      <div className="flex flex-col max-h-[603px]!">
        <ModalHeader className="text-center pb-3">
          <ModalTitle className="text-sm font-semibold text-foreground">
            View Product Details
          </ModalTitle>
          <ModalDescription className="sr-only">
            View product code details, remarks and recipe list
          </ModalDescription>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
          <div className="space-y-3">
            <div className="rounded-[6px] border border-[#EEEBF4] dark:border-nav-highlight/35 bg-white dark:bg-background shadow-sm px-3 py-4">
            <div className="" />
              <div className="flex items-center justify-between border-b border-primary py-2.5">
                <span className="text-[13px] text-[#A0A0A1] whitespace-nowrap pr-1.5">Product Code:</span>
                <span className="text-[13px] font-semibold text-nav-highlight">
                  {displayProductCode}
                </span>
              </div>
            <div className="" />
              <div className="flex items-center justify-between border-b border-primary py-2.5">
                <span className="text-[13px] text-[#A0A0A1] whitespace-nowrap pr-1.5">Product Name:</span>
                <span className="text-[13px] font-semibold text-nav-highlight">
                  {displayName}
                </span>
              </div>
              <div className="" />
              <div className="flex items-center justify-between border-b border-primary py-2.5">
                <span className="text-[13px] text-[#A0A0A1]">Segment:</span>
                <span className="text-[13px] font-semibold text-nav-highlight">
                  {displaySegment}
                </span>
              </div>
              <div className="" />
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-[#A0A0A1]">Status:</span>
                <span className="px-3 py-1 text-[12px] text-[#4230AC] font-semibold text-nav-highlight bg-[#E0E7FF] rounded-full">
                  {displayStatus}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-semibold text-foreground">Remarks</h3>
              <p className="text-[12px] text-[#A0A0A1]">
                Showing remarks for {displayName}
              </p>
              <div className="mt-3 rounded-xl border border-[#ECE8F5] dark:border-nav-highlight/35 bg-white dark:bg-background px-4 py-3 text-left">
                <p className="text-[13px] text-muted-foreground dark:text-nav-highlight">
                  {remarks?.trim().length > 0
                    ? remarks
                    : "No remarks available."}
                </p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-semibold text-foreground">
                Recipe List
              </h3>
              <p className="text-[12px] text-[#A0A0A1]">
                View recipes using the Product Code
              </p>

              <div className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-[13px] text-muted-foreground">Loading recipes...</p>
                  </div>
                ) : recipes?.length > 0 ? (
                  recipes.map((recipe, index) => (
                    <div
                      key={recipe.id || `${recipe.recipeCode}-${index}`}
                      className="text-left"
                    >
                      <div className="p-4 rounded-[6px] border border-[#ECE8F5] dark:border-nav-highlight/35 bg-white dark:bg-background ">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] dark:border dark:border-nav-highlight/35 bg-[#EEE9F7] dark:bg-background text-[12px] font-semibold text-nav-highlight">
                            {index + 1}
                          </span>
                          <span className="text-[13px] font-semibold text-foreground">
                            {recipe.recipeCode}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[12px] text-[#A0A0A1]">
                            Recipe Name
                          </span>
                          <span className="text-[13px] font-semibold text-foreground">
                            {recipe.recipeName}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-2.5 w-full rounded-lg border border-primary/40 bg-[#F1EEF6] dark:border-nav-highlight/35 dark:bg-background py-1.5 text-[14px] font-semibold text-primary dark:text-nav-highlight"
                        onClick={() => {
                          onClose(false);
                          navigate(`/application-lab/application-recipes/${recipe.id}`);
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-[#ECE8F5] bg-white px-4 py-6">
                    <p className="text-[13px] text-muted-foreground">
                      No recipes found using this product.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto sticky bottom-0 left-0 right-0 z-10 py-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="w-[194px] rounded-lg bg-[#5B2D90] py-3 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </ModalContent>
  );
}
