import * as React from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * FloatingButton Component
 *
 * A reusable Floating Action Button (FAB) that stays fixed relative to the viewport.
 * Can be used as a link or a button.
 *
 * Props:
 * - icon: Optional icon component (e.g., from lucide-react)
 * - to: Optional URL path. If provided, renders as a Link.
 * - onClick: Optional click handler.
 * - children: Button text/content.
 * - className: Additional classes (useful for positioning overrides).
 * - ...props: Passed to the underlying Button component.
 */
export function FloatingButton({
  className,
  icon: Icon,
  children,
  onClick,
  to,
  ...props
}) {
  // Default position is bottom-right.
  // We use `rounded-full` for the pill shape typical of FABs.
  // We override `h-auto` and padding to ensure it looks good with text.
  const fabClasses = cn(
    "fixed top-25 right-5 z-50 rounded-full px-2 py-1 h-auto text-xs font-semibold flex items-center gap-1 group",
    "bg-[#552e8e] text-white shadow-[0_8px_20px_-4px_rgba(85,46,142,0.4)]",
    "transition-all duration-300 ease-in-out",
    "hover:bg-[#935ce3] hover:shadow-[3px_-3px_56px_-4px_rgba(147,_92,_227,_1)]",
    "active:scale-95",
    className,
    children ?? "gap-0"
  );

  const content = (
    <>
      {Icon && (
        <Icon className="w-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 transition-transform duration-300 group-hover:scale-110" />
      )}
      <span className="transition-transform duration-300 group-hover:scale-105">
        {children}
      </span>
    </>
  );

  if (to) {
    return (
      <Button asChild className={fabClasses} {...props}>
        <Link to={to}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button className={fabClasses} onClick={onClick} {...props}>
      {content}
    </Button>
  );
}
