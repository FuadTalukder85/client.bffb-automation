import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook to check if multiple users are project members
 * @param {string} projectId - The project ID
 * @param {string[]} userIds - Array of user IDs to check
 * @returns {Object} Query result with member status map
 */
export function useProjectMemberStatus(projectId, userIds) {
  return useQuery({
    queryKey: [...queryKeys.projectMembers.status(projectId), userIds],
    queryFn: ({ signal }) => {
      if (!projectId || !userIds || userIds.length === 0) {
        return Promise.resolve({});
      }
      
      return api.post(`/project-members/${projectId}/members/check-batch`, 
        { userIds }, 
        { signal }
      ).then(res => res.data);
    },
    enabled: !!projectId && !!userIds && userIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      // Convert response to a Map for quick lookups: userId => isMember
      const memberStatus = new Map();
      if (data?.data?.memberStatus) {
        Object.entries(data.data.memberStatus).forEach(([userId, isMember]) => {
          memberStatus.set(userId, isMember);
        });
      }
      return memberStatus;
    }
  });
}

/**
 * Hook to check a single user's project member status
 * Uses cached batch results when available
 */
export function useProjectMemberStatusSingle(projectId, userId, memberStatusMap) {
  return useMemo(() => {
    if (!userId) return false; // Default to not member for safety
    
    // If we have batch results, use them
    if (memberStatusMap && memberStatusMap.has(userId)) {
      return memberStatusMap.get(userId);
    }
    
    // Fallback to false for safety (prevents false positives)
    return false;
  }, [memberStatusMap, userId]);
}