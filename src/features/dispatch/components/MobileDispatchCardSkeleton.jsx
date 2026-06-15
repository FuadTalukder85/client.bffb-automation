import React from "react";
import { MobileProductCodeCardSkeleton } from "../../master-application-recipe-list/bff-product-code-list/components/MobileProductCodeCardSkeleton";

// reuse skeleton
export function MobileDispatchCardSkeleton({ count = 3 }) {
  return <MobileProductCodeCardSkeleton count={count} />;
}
