import React from "react";
import MobileFinalRecipeCard from "./MobileFinalRecipeCard";
import { MobileFinalRecipeCardSkeleton } from "./MobileFinalRecipeCardSkeleton";

export function MobileFinalRecipeList({
  recipes,
  currentPage,
  itemsPerPage,
  onRefresh,
  isLoading,
  selectedRowIds = [],
  onSelectChange,
}) {
  if (isLoading) {
    return (
      <div className="md:hidden">
        <MobileFinalRecipeCardSkeleton cards={itemsPerPage} />
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-center md:hidden">
        <p className="text-sm text-lighter-text">No final recipes found</p>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      {recipes.map((recipe, index) => {
        const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
        return (
          <MobileFinalRecipeCard
            key={recipe._id || index}
            recipe={recipe}
            serialNumber={serialNumber}
            onRefresh={onRefresh}
            selectedRowIds={selectedRowIds}
            onSelectChange={onSelectChange}
          />
        );
      })}
    </div>
  );
}

export default MobileFinalRecipeList;
