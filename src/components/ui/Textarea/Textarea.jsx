import * as React from "react";
import { cn } from "../../../lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] lg:min-h-[43px] xl:min-h-[55px] 2xl:min-h-[64px] 3xl:min-h-[80px] w-full rounded-md border border-nav-highlight/30 bg-primary-shade-2 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-1 xl:py-1 2xl:py-1.5 3xl:py-2 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-base-color ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
