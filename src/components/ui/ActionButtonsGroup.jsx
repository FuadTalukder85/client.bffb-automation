import React from "react";
import { cn } from "@/lib/utils";

export function ActionButtonsGroup({ actions, className }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center bg-[#552E8E] rounded-xl lg:rounded-full px-1 py-0",
        className
      )}
    >
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "p-1.5 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 text-white transition-colors focus:outline-none focus:ring-0 flex items-center justify-center",
              (action.showLabel ?? false) && "gap-1 lg:gap-0.5 xl:gap-0.5 2xl:gap-[3px] 3xl:gap-1",
              action.disabled && "opacity-50 cursor-not-allowed",
              action.loading && "animate-pulse"
            )}
            title={action.label}
          >
            {action.icon}
            {(action.showLabel ?? false) && (
              <span className="hidden md:inline text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium">
                {action.label}
              </span>
            )}
          </button>
          {index < actions.length - 1 && (
            <div className="w-[1px] h-5 lg:h-4 xl:h-4 bg-white/30 mx-0.5 xl:mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
