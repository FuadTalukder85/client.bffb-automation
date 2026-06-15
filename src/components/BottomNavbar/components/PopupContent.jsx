import React from "react";
import { Link } from "react-router";

/**
 * PopupContent Component
 * Renders the content inside the popup modal
 * Each navigation item can have its own content configuration
 *
 * @param {string} title - The title to display at the top
 * @param {Array} items - Array of menu items to display
 */
export function PopupContent({ title, items = [] }) {
  return (
    <div className="flex flex-col h-full">
      {/* <h3 className="mb-6 text-lg font-bold text-primary">{title}</h3> */}
      <nav className="flex-1 pl-2 space-y-4">
        {items.map((item, index) => (
          <PopupMenuItem
            key={index}
            label={item.label}
            icon={item.icon}
            to={item.to}
            index={index}
          />
        ))}
      </nav>
    </div>
  );
}

/**
 * PopupMenuItem Component
 * Individual menu item within the popup
 */
function PopupMenuItem({ label, icon: Icon, to, index }) {
  return (
    <Link
      to={to}
      className="flex items-center w-full gap-3 font-normal text-left transition-colors cursor-pointer group text-foreground hover:text-primary active:text-primary"
      style={{ paddingLeft: `${index * 40}px` }}
    >
      {Icon && (
        <Icon className="w-5 h-5 transition-colors group-hover:text-primary" />
      )}
      <span className="text-sm transition-colors group-hover:text-primary">
        {label}
      </span>
    </Link>
  );
}
