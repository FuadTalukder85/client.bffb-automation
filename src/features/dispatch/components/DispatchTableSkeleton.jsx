import React from "react";
import { ProductCodeTableSkeleton } from "../../master-application-recipe-list/bff-product-code-list/components/ProductCodeTableSkeleton";

// dispatch skeleton reuses BFF table skeleton since it's generic
export function DispatchTableSkeleton({ rows = 5, columnVisibility, columnPinning, columnSizing }) {
  return (
    <ProductCodeTableSkeleton
      rows={rows}
      columnVisibility={columnVisibility}
      columnPinning={columnPinning}
      columnSizing={columnSizing}
    />
  );
}
