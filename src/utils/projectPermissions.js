/**
 * Frontend utilities for Project field-level permissions
 * 
 * Uses the unified permission constants from @/constants/permissions.js
 * Keep in sync with: server/src/utils/projectPermissions.js
 * 
 * Permission Hierarchy:
 * 1. resource:* (wildcard - all actions, all fields)
 * 2. resource:action (base permission - all fields for action)
 * 3. resource:action:@group (group permission - fields in group)
 * 4. resource:action:section (section permission - all fields in section)
 * 5. resource:action:section.field (individual field permission)
 */

import {
  RESOURCES,
  ACTIONS,
  PROJECT_SECTIONS,
  PROJECT_SECTION_NAMES,
  PROJECT_GROUPS,
  PROJECT_GROUP_SECTIONS,
  PROJECT_FIELDS,
  PROJECT_FINANCIAL_FIELDS,
  getAllProjectFields,
  getSectionFields,
  getGroupFields,
  getFieldSection,
  isValidSection,
  isValidGroup,
  parsePermission,
  PermissionBuilder,
} from '@/constants/permissions';
import { hasPermission } from '@/lib/utils';

/**
 * Resolve field permissions from user's permission strings
 * @param {string[]} userPermissions - Array of permission strings
 * @param {string} action - 'read' or 'update'
 * @returns {string[]} Array of allowed field paths
 */
export function resolveProjectFieldPermissions(userPermissions, action = 'read') {
  if (!userPermissions || !Array.isArray(userPermissions)) return [];
  
  const allowedFields = new Set();
  const resource = RESOURCES.PROJECT;
  
  // Check for wildcard permission (grants all fields for all actions)
  if (hasPermission(userPermissions, `${resource}:*`)) {
    return getAllProjectFields();
  }

  // Check for base permission (grants all fields for specific action)
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return getAllProjectFields();
  }

  // Check group, section, and field permissions
  for (const perm of userPermissions) {
    if (!perm.startsWith(`${resource}:${action}:`)) continue;
    
    const parsed = parsePermission(perm);
    if (!parsed.scope) continue;
    
    // Group permission: @basic, @technical, @business, @financials
    if (parsed.isGroup && isValidGroup(parsed.scope)) {
      const groupFields = getGroupFields(parsed.scope);
      groupFields.forEach(field => allowedFields.add(field));
    }
    // Section permission: masterProject, common, etc.
    else if (parsed.isSection && isValidSection(parsed.scope)) {
      const sectionFields = getSectionFields(parsed.scope);
      sectionFields.forEach(field => allowedFields.add(field));
    }
    // Field permission: masterProject.code, common.segment, etc.
    else if (parsed.isField) {
      allowedFields.add(parsed.scope);
    }
  }

  return Array.from(allowedFields);
}

/**
 * Check if user has permission to read a section
 * @param {string[]} userPermissions - Array of user's permission keys
 * @param {string} section - Section name in camelCase (e.g., "masterProject")
 * @returns {boolean}
 */
export function canReadSection(userPermissions, section) {
  if (!userPermissions || !section) return false;
  
  const resource = RESOURCES.PROJECT;
  const action = ACTIONS.READ;
  
  // Check for full access
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return true;
  }
  
  // Check for exact section-level permission
  if (hasPermission(userPermissions, `${resource}:${action}:${section}`)) {
    return true;
  }
  
  // Check for group permissions that include this section
  for (const [groupName, groupSections] of Object.entries(PROJECT_GROUP_SECTIONS)) {
    if (groupSections.includes(section)) {
      if (hasPermission(userPermissions, `${resource}:${action}:${groupName}`)) {
        return true;
      }
    }
  }
  
  // Check if user has ANY field in this section (indicates partial access)
  const hasAnyFieldInSection = userPermissions.some(perm => 
    perm.startsWith(`${resource}:${action}:${section}.`)
  );
  
  return hasAnyFieldInSection;
}

/**
 * Check if user has permission to update a section
 * @param {string[]} userPermissions - Array of user's permission keys
 * @param {string} section - Section name in camelCase
 * @returns {boolean}
 */
export function canUpdateSection(userPermissions, section) {
  if (!userPermissions || !section) return false;
  
  const resource = RESOURCES.PROJECT;
  const action = ACTIONS.UPDATE;
  
  // Check for full access
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return true;
  }
  
  // Check for exact section-level permission
  if (hasPermission(userPermissions, `${resource}:${action}:${section}`)) {
    return true;
  }
  
  // Check for group permissions that include this section
  for (const [groupName, groupSections] of Object.entries(PROJECT_GROUP_SECTIONS)) {
    if (groupSections.includes(section)) {
      if (hasPermission(userPermissions, `${resource}:${action}:${groupName}`)) {
        return true;
      }
    }
  }
  
  // Check if user has ANY field in this section
  const hasAnyFieldInSection = userPermissions.some(perm => 
    perm.startsWith(`${resource}:${action}:${section}.`)
  );
  
  return hasAnyFieldInSection;
}

/**
 * Check if user can read a specific field
 * @param {string[]} userPermissions - Array of user's permission keys
 * @param {string} fieldPath - Field path (e.g., "masterProject.title")
 * @returns {boolean}
 */
export function canReadField(userPermissions, fieldPath) {
  if (!userPermissions || !fieldPath) return false;
  
  const resource = RESOURCES.PROJECT;
  const action = ACTIONS.READ;
  
  // Check for full access
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return true;
  }
  
  // Check for exact field-level permission
  if (hasPermission(userPermissions, `${resource}:${action}:${fieldPath}`)) {
    return true;
  }
  
  // Check for section-level permission
  const section = getFieldSection(fieldPath);
  if (section) {
    // Direct section permission
    if (hasPermission(userPermissions, `${resource}:${action}:${section}`)) {
      return true;
    }
    
    // Group permission that includes this section
    for (const [groupName, groupSections] of Object.entries(PROJECT_GROUP_SECTIONS)) {
      if (groupSections.includes(section)) {
        if (hasPermission(userPermissions, `${resource}:${action}:${groupName}`)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Check if user can update a specific field
 * @param {string[]} userPermissions - Array of user's permission keys
 * @param {string} fieldPath - Field path (e.g., "masterProject.title")
 * @returns {boolean}
 */
export function canUpdateField(userPermissions, fieldPath) {
  if (!userPermissions || !fieldPath) return false;
  
  const resource = RESOURCES.PROJECT;
  const action = ACTIONS.UPDATE;
  
  // Check for full access
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return true;
  }
  
  // Check for exact field-level permission
  if (hasPermission(userPermissions, `${resource}:${action}:${fieldPath}`)) {
    return true;
  }
  
  // Check for section-level permission
  const section = getFieldSection(fieldPath);
  if (section) {
    // Direct section permission
    if (hasPermission(userPermissions, `${resource}:${action}:${section}`)) {
      return true;
    }
    
    // Group permission that includes this section
    for (const [groupName, groupSections] of Object.entries(PROJECT_GROUP_SECTIONS)) {
      if (groupSections.includes(section)) {
        if (hasPermission(userPermissions, `${resource}:${action}:${groupName}`)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Get all sections user can read
 * @param {string[]} userPermissions - Array of user's permission keys
 * @returns {string[]} Array of section names
 */
export function getAllowedReadSections(userPermissions) {
  if (!userPermissions) return [];
  
  const resource = RESOURCES.PROJECT;
  const action = ACTIONS.READ;
  
  // Check for full access
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return [...PROJECT_SECTION_NAMES];
  }
  
  const allowedSections = new Set();
  
  // Check group permissions
  for (const [groupName, groupSections] of Object.entries(PROJECT_GROUP_SECTIONS)) {
    if (hasPermission(userPermissions, `${resource}:${action}:${groupName}`)) {
      groupSections.forEach(section => allowedSections.add(section));
    }
  }
  
  // Check section permissions
  for (const section of PROJECT_SECTION_NAMES) {
    if (hasPermission(userPermissions, `${resource}:${action}:${section}`)) {
      allowedSections.add(section);
    }
  }
  
  // Check field-level permissions (any field grants section access)
  for (const perm of userPermissions) {
    if (perm.startsWith(`${resource}:${action}:`) && perm.includes('.')) {
      const section = perm.split(':')[2].split('.')[0];
      if (PROJECT_SECTION_NAMES.includes(section)) {
        allowedSections.add(section);
      }
    }
  }
  
  return Array.from(allowedSections);
}

/**
 * Get all sections user can update
 * @param {string[]} userPermissions - Array of user's permission keys
 * @returns {string[]} Array of section names
 */
export function getAllowedUpdateSections(userPermissions) {
  if (!userPermissions) return [];
  
  const resource = RESOURCES.PROJECT;
  const action = ACTIONS.UPDATE;
  
  // Check for full access
  if (hasPermission(userPermissions, `${resource}:${action}`)) {
    return [...PROJECT_SECTION_NAMES];
  }
  
  const allowedSections = new Set();
  
  // Check group permissions
  for (const [groupName, groupSections] of Object.entries(PROJECT_GROUP_SECTIONS)) {
    if (hasPermission(userPermissions, `${resource}:${action}:${groupName}`)) {
      groupSections.forEach(section => allowedSections.add(section));
    }
  }
  
  // Check section permissions
  for (const section of PROJECT_SECTION_NAMES) {
    if (hasPermission(userPermissions, `${resource}:${action}:${section}`)) {
      allowedSections.add(section);
    }
  }
  
  // Check field-level permissions (any field grants section access)
  for (const perm of userPermissions) {
    if (perm.startsWith(`${resource}:${action}:`) && perm.includes('.')) {
      const section = perm.split(':')[2].split('.')[0];
      if (PROJECT_SECTION_NAMES.includes(section)) {
        allowedSections.add(section);
      }
    }
  }
  
  return Array.from(allowedSections);
}

/**
 * Get section name from a field path
 * @param {string} fieldPath - Field path (e.g., "masterProject.title")
 * @returns {string|null} Section name or null
 */
export function getSectionFromFieldPath(fieldPath) {
  return getFieldSection(fieldPath);
}

// Re-export for convenience
export {
  RESOURCES,
  ACTIONS,
  PROJECT_SECTIONS,
  PROJECT_SECTION_NAMES,
  PROJECT_GROUPS,
  PROJECT_GROUP_SECTIONS,
  PROJECT_FIELDS,
  getAllProjectFields,
  getSectionFields,
  getGroupFields,
  getFieldSection,
  isValidSection,
  isValidGroup,
  parsePermission,
};

