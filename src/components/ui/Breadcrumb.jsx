import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function Breadcrumb({ items, className, maxLabelLength }) {
  const displayItems =
    items.length > 3
      ? [
          {
            label: "...",
            link: items[items.length - 4]?.link,
            onClick: items[items.length - 4]?.onClick,
          },
          ...items.slice(-3),
        ]
      : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const label = (!isLast && maxLabelLength && item.label.length > maxLabelLength)
            ? item.label.slice(0, maxLabelLength) + "..."
            : item.label;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className={cn("w-4 h-4", isLast ? "text-nav-highlight" : "text-base-color")}
                />
              )}
              {isLast ? (
                <span className="text-xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-bold leading-tight text-nav-highlight">
                  {label}
                </span>
              ) : item.link ? (
                <Link
                  to={item.link}
                  className="text-lg lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-medium leading-none transition-colors text-base-color hover:text-primary whitespace-nowrap"
                >
                  {label}
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className={cn(
                    "text-lg lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-medium leading-none transition-colors text-base-color hover:text-heading whitespace-nowrap",
                    !item.onClick && "cursor-default hover:text-base-color"
                  )}
                  type="button"
                >
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
