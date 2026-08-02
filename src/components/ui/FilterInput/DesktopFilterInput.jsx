import { cn } from "@/lib/utils";

export function DesktopFilterPills({ value, options, onChange, variant = "pills" }) {
  // Tabs variant - bottom border style
  if (variant === "tabs") {
    return (
      <div className="flex items-center gap-2 border-b border-border">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px",
                isSelected
                  ? ""
                  : "border-transparent text-lighter-text hover:text-foreground"
              )}
              style={{
                color: isSelected ? option.textColor : undefined,
                borderBottomColor: isSelected ? option.textColor : "transparent"
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Pills variant - rounded pill style (default)
  return (
    <div className="w-fit flex items-center gap-0.5 lg:gap-1 xl:gap-2 rounded-full border border-table-stroke/70 bg-desktop-filter-bg p-0.5 lg:p-0.5 text-[6.5px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px]">
      {options.map((option) => {
        const isSelected = value === option.value;
        const hasCustomColors = option.bgColor && option.textColor;

        // Custom style for options with bgColor and textColor
        const customStyle = hasCustomColors && isSelected
          ? {
            backgroundColor: option.bgColor,
            color: option.textColor
          }
          : {};

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={customStyle}
            className={cn(
              "rounded-full flex items-center justify-center px-1.5 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 3xl:py-1.5 2xl:py-1 xl:py-1 lg:py-1 py-0.5 transition-all",
              isSelected
                ? hasCustomColors
                  ? "font-semibold"
                  : "bg-desktop-filter-active-bg font-semibold"
                : "text-lighter-text hover:bg-primary/10"
            )}
          >
            <span
              className={cn(
                isSelected
                  ? "rounded-full w-1 h-1 2xl:w-2 2xl:h-2 bg-primary inline-block mr-1.5 2xl:mr-2"
                  : "rounded-full w-1 h-1 2xl:w-2 2xl:h-2 bg-white dark:bg-transparent inline-block mr-1.5 2xl:mr-2 border border-foreground"
              )}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
