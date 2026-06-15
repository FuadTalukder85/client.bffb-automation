import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function DesktopBreadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("hidden md:flex items-center", className)}>
      <ol className="flex items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-6 h-6 xl:w-8 xl:h-8 3xl:w-10 3xl:h-10 text-muted-foreground" />
              )}
              {isLast ? (
                <span className="text-2xl lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl font-semibold xl:font-bold text-primary">
                  {item.label}
                </span>
              ) : item.link ? (
                <Link
                  to={item.link}
                  className="text-2xl lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl font-semibold xl:font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className="text-2xl lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl font-semibold xl:font-bold text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
