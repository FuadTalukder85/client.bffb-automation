import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

/**
 * The Button Component
 * - forwardRef: Allows us to pass a ref to the <button>
 * - asChild: (from Radix Slot) A boolean prop. If true,
 * the button will merge its styles with its direct child.
 * This is what lets you wrap a <Link> and have it look
 * like a button: <Button asChild><Link to="/">Home</Link></Button>
 */
const Button = React.forwardRef(
  (
    {
      className,
      intent = "primary",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    // If `asChild` is true, we render a <Slot> component which
    // passes its props down to the immediate child.
    const Comp = asChild ? Slot : "button";

    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      intent: {
        primary: "bg-primary text-white hover:bg-opacity-90",
        secondary:
          "bg-primary-shade-2 text-foreground hover:bg-primary-shade-3 dark:hover:bg-primary-shade-3/80",
        destructive: "bg-status-6-bg text-status-6-text hover:bg-opacity-90",
        outline:
          "border border-table-stroke bg-background hover:bg-primary-shade-2",
        ghost: "hover:bg-primary-shade-2 dark:hover:bg-primary-shade-3/80",
        link: "text-primary underline-offset-4 ",
      },
      size: {
        default: "h-full px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2",
        sm: "h-full rounded-md px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3",
        lg: "h-full rounded-md px-4 lg:px-4.5 xl:px-6 2xl:px-7 3xl:px-8",
        icon: "h-full w-full", 
      },
    };

    // We use our `cn` helper to merge the variants
    // with any custom `className` prop you pass in.
    return (
      <Comp
        className={cn(
          baseStyles,
          variants.intent[intent],
          variants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button };
export default Button;
