import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

/**
 * NoData Component
 *
 * A component to display when no data is available
 */
export function NoData({
  message = "No data found.",
  description = "No results match your current search or filter criteria.",
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        "animate-in fade-in duration-500",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 lg:w-8 xl:w-9 2xl:w-11 3xl:w-12 lg:h-8 xl:h-9 2xl:h-11 3xl:h-12 mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4 rounded-full bg-muted/30 flex items-center justify-center">
        <Inbox className="w-6 h-6 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      <h3 className="text-base lg:text-[8.5px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-semibold text-foreground/80 mb-1">{message}</h3>
      {description && (
        <p className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base text-muted-foreground/70 max-w-[280px]">
          {description}
        </p>
      )}
    </div>
  );
}