import React from "react";
import MobileInDevelopmentRecipeCard from "./MobileInDevelopmentRecipeCard";
import { MobileInDevelopmentRecipeCardSkeleton } from "./MobileInDevelopmentRecipeCardSkeleton";

export function MobileInDevelopmentRecipeList({
  recipes,
  currentPage,
  itemsPerPage,
  onRefresh,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="md:hidden">
        <MobileInDevelopmentRecipeCardSkeleton cards={itemsPerPage} />
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-center md:hidden">
        <p className="text-sm text-lighter-text">
          No in-development recipes found
        </p>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      {recipes?.map((recipe, index) => {
        const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
        return (
          <MobileInDevelopmentRecipeCard
            key={recipe._id || index}
            recipe={recipe}
            serialNumber={serialNumber}
            onRefresh={onRefresh}
          />
        );
      })}
    </div>
  );
}

export default MobileInDevelopmentRecipeList;
