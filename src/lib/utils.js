import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate as formatDateFromUtils } from "@/utils/dateFormatter";

/**
 * A helper function (cn) to merge Tailwind classes.
 * This is the standard in most modern React projects.
 * It intelligently combines default classes, variant classes,
 * and custom classes passed via props, preventing conflicts.
 * * Example: cn("p-2", "p-4") => "p-4" (p-4 wins)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateInput, formatStr, fallback) =>
  formatDateFromUtils(dateInput, formatStr, fallback);

/**
 * Check if user has a permission, accounting for wildcard expansion.
 * Handles hierarchical permission matching:
 * 1. Check for exact permission match
 * 2. Check for resource:* wildcard (e.g., 'project:*')
 * 3. Check for resource:action:* pattern
 * 
 * Examples:
 * - hasPermission(['project:*'], 'project:delete') => true
 * - hasPermission(['project:read'], 'project:read') => true
 * - hasPermission(['project:delete'], 'project:update') => false
 */
export function hasPermission(permissions, requiredPermission) {
  if (!Array.isArray(permissions) || !requiredPermission) {
    return false;
  }

  // Global wildcard or exact match
  if (permissions.includes('*') || permissions.includes(requiredPermission)) {
    return true;
  }

  const parts = requiredPermission.split(':');
  const resource = parts[0];
  const action = parts[1];

  // 1. Check for resource wildcard (e.g., 'project:*')
  const resourceWildcard = `${resource}:*`;
  if (permissions.includes(resourceWildcard)) {
    return true;
  }

  // 2. Check for base action and action wildcard fallbacks
  if (action) {
    // Check if user has base action permission (e.g., has 'project:read' when checking 'project:read:@view-master-project')
    const basePermission = `${resource}:${action}`;
    if (permissions.includes(basePermission)) {
      return true;
    }

    // Check if user has action wildcard (e.g., 'project:read:*')
    const actionWildcard = `${resource}:${action}:*`;
    if (permissions.includes(actionWildcard)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate the number of days between a given date and now
 * @param {string|Date} date - The date to calculate from
 * @returns {number|null} - Number of days, or null if date is invalid
 */
export function getDaysSince(date) {
  if (!date) return null;
  
  try {
    const pastDate = new Date(date);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(pastDate.getTime())) return null;
    
    // Calculate difference in milliseconds
    const diffInMs = now - pastDate;
    
    // Convert to days and round down
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    return days >= 0 ? days : null;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts the field path from a header string formatted as "Label (path)"
 */
export const extractPathFromHeader = (header = "") => {
  const value = String(header || "").trim();
  const match = value.match(/\(([^()]+)\)\s*$/);
  return match ? match[1].trim() : "";
};

/**
 * Formats a header string for display by removing the "(path)" suffix
 */
export const formatHeaderLabel = (header = "") => {
  const value = String(header || "").trim();
  return value.replace(/\s*\([^()]*\)\s*$/, "").trim();
};

/**
 * Extracts filename from Content-Disposition header or returns fallback
 */
export const getFilenameFromResponse = (response, fallback) => {
  const disposition = response?.headers?.["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};
