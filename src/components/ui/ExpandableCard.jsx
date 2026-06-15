import React, { useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

/**
 * ExpandableCard - A simple, composable card with expand/collapse functionality
 *
 * Structure:
 * - ExpandableCard (root)
 *   - ExpandableCard.Header (optional - any content)
 *   - ExpandableCard.Content (main content with height control)
 *   - ExpandableCard.Footer (split into left actions + right toggle)
 *     - ExpandableCard.FooterLeft (dynamic actions - no default styles)
 *     - ExpandableCard.FooterRight (contains ToggleButton with default styles)
 */

// Context for sharing expand state
const ExpandableCardContext = createContext(null);

const useExpandableCard = () => {
  const context = useContext(ExpandableCardContext);
  if (!context) {
    throw new Error(
      "ExpandableCard components must be used within ExpandableCard"
    );
  }
  return context;
};

// ============================================
// ROOT COMPONENT
// ============================================
const ExpandableCard = ({
  children,
  className,
  defaultExpanded = false,
  onExpandChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  return (
    <ExpandableCardContext.Provider value={{ isExpanded, toggleExpand }}>
      <div className={cn("w-full", className)}>{children}</div>
    </ExpandableCardContext.Provider>
  );
};

// ============================================
// HEADER COMPONENT
// ============================================
const Header = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

// ============================================
// CONTENT COMPONENT
// ============================================
/**
 * Content - Container with customizable initial visible height
 *
 * @param {number} initialHeight - Height in px to show initially (default: auto/full)
 * @param {React.ReactNode} children - Any content (tables, custom components, etc.)
 *
 * Pass your content from where the card is used.
 * The initial height is customizable, and expands fully on "See more".
 */
const Content = ({
  children,
  className,
  initialHeight, // Height in px for collapsed state
}) => {
  const { isExpanded } = useExpandableCard();

  // If no initialHeight, show all content
  if (typeof initialHeight !== "number") {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={{
        height: isExpanded ? "auto" : initialHeight,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================
const Footer = ({ children, className }) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {children}
    </div>
  );
};

// Footer Left - For dynamic action buttons (NO default styles)
const FooterLeft = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

// Footer Right - For toggle button
const FooterRight = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

// ============================================
// TOGGLE BUTTON (with default styles)
// ============================================
const ToggleButton = ({
  className,
  expandedText = "See less",
  collapsedText = "See more",
}) => {
  const { isExpanded, toggleExpand } = useExpandableCard();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleExpand}
      className={cn(
        "w-[7rem] text-nav-highlight hover:bg-primary/10 flex items-center gap-1 h-9 px-3 text-sm font-medium bg-primary-shade-2 rounded-md",
        className
      )}
    >
      {isExpanded ? (
        <span className="flex items-center gap-2">
          <ChevronUp className="w-6 h-6" />
          <span className="font-semibold">{expandedText}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <ChevronDown className="w-6 h-6" />
          <span className="font-semibold">{collapsedText}</span>
        </span>
      )}
    </Button>
  );
};

// ============================================
// ATTACH COMPOUND COMPONENTS
// ============================================
ExpandableCard.Header = Header;
ExpandableCard.Content = Content;
ExpandableCard.Footer = Footer;
ExpandableCard.FooterLeft = FooterLeft;
ExpandableCard.FooterRight = FooterRight;
ExpandableCard.ToggleButton = ToggleButton;

export { ExpandableCard };
