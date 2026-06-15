import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton Component
 * 
 * A loading placeholder component that shows animated shimmer effect
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-primary-shade-2",
        className
      )}
      {...props}
    />
  );
}

