import { useMemo, useCallback } from 'react';
import { useUserPermissions } from './useUserPermissions';
import {
  canReadField as canReadFieldUtil,
  canUpdateField as canUpdateFieldUtil,
  canReadSection as canReadSectionUtil,
  canUpdateSection as canUpdateSectionUtil,
  getAllowedReadSections,
  getAllowedUpdateSections,
  getSectionFromFieldPath,
} from '@/utils/projectPermissions';

/**
 * Hook to check field-level permissions for Project
 * @returns {object} Permission checking functions and allowed sections
 */
export function useProjectFieldPermissions() {
  const { permissions, loading } = useUserPermissions();
  
  // Create a stable reference for permissions array
  const permissionsArray = useMemo(() => {
    return Array.isArray(permissions) ? permissions : [];
  }, [permissions]);

  const allowedReadSections = useMemo(() => {
    return getAllowedReadSections(permissionsArray);
  }, [permissionsArray]);

  const allowedUpdateSections = useMemo(() => {
    return getAllowedUpdateSections(permissionsArray);
  }, [permissionsArray]);

  // Memoize permission checking functions
  const canReadField = useCallback(
    (fieldPath) => canReadFieldUtil(permissionsArray, fieldPath),
    [permissionsArray]
  );

  const canUpdateField = useCallback(
    (fieldPath) => canUpdateFieldUtil(permissionsArray, fieldPath),
    [permissionsArray]
  );

  const canReadSection = useCallback(
    (section) => canReadSectionUtil(permissionsArray, section),
    [permissionsArray]
  );

  const canUpdateSection = useCallback(
    (section) => canUpdateSectionUtil(permissionsArray, section),
    [permissionsArray]
  );

  return {
    permissions: permissionsArray,
    loading,
    // Field-level checks
    canReadField,
    canUpdateField,
    // Section-level checks
    canReadSection,
    canUpdateSection,
    // Utility
    getSectionFromPath: getSectionFromFieldPath,
    // Allowed sections
    allowedReadSections,
    allowedUpdateSections,
  };
}

