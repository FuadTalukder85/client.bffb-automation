import { cn } from "../../lib/utils";

/**
 * A fluid, responsive container that centers its content
 * and applies a max-width (defaulting to 1920px).
 * It also adds standard horizontal padding.
 */
export function Container({ className, children, ...props }) {
  return (
    <div className={cn("w-full max-w-[1920px] mx-auto", className)} {...props}>
      {children}
    </div>
  );
}
