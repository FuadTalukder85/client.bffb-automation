import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentService } from "@/services/commentService";
import { queryKeys } from "@/lib/queryKeys";
import { useSocketComments } from "./useSocketComments";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook to fetch comments for a project with infinite scroll
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID for socket real-time comments
 * @param {Object} options - Query options
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Object} TanStack Query infinite result
 */
export function useProjectCommentsInfinite(projectId, userId, options = {}) {
  const { limit = 20, search, startDate, endDate, userIds } = options;

  // Enable real-time updates via socket
  useSocketComments(projectId, userId);

  return useInfiniteQuery({
    queryKey: queryKeys.comments.list(projectId, { limit, search, startDate, endDate, userIds }),
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await commentService.getCommentsByProject(
        projectId,
        { page: pageParam, limit, search, startDate, endDate, userIds },
        { signal }
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // For chat: load older pages when scrolling up
      // If we got a full page, there might be more older comments
      if (lastPage.data && lastPage.data.length === limit) {
        return allPages.length + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      // For chat: load newer pages when needed (though typically we start with newest)
      // This is not used in current implementation but kept for completeness
      return undefined;
    },
    enabled: !!projectId,
    staleTime: 30000, // Keep data fresh for 30 seconds (socket handles real-time updates)
  });
}

/**
 * Hook to fetch comments for a project (paginated)
 * @param {string} projectId - The project ID
 * @param {string} userId - The user ID for socket real-time comments
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Object} TanStack Query result
 */
export function useProjectComments(projectId, userId, options = {}) {
  const { page = 1, limit = 20 } = options;

  // Enable real-time updates via socket
  useSocketComments(projectId, userId);

  return useQuery({
    queryKey: queryKeys.comments.list(projectId, { page, limit }),
    queryFn: async ({ signal }) => {
      const response = await commentService.getCommentsByProject(
        projectId,
        { page, limit },
        { signal }
      );
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 30000, // Keep data fresh for 30 seconds (socket handles real-time updates)
  });
}

/**
 * Hook to create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData) => commentService.createComment(commentData),
    onSuccess: (response, variables) => {
      // Invalidate and refetch comments for this project
      queryClient.invalidateQueries({
        queryKey: ['comments', 'list', variables.projectId],
      });
      toast.success(getSuccessMessage(response, "Comment posted successfully"));
    },
  });
}

/**
 * Hook to update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...commentData }) =>
      commentService.updateComment(id, commentData),
    onMutate: async ({ id, projectId, content }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['comments', 'list', projectId],
      });

      // Snapshot the previous values for all matching queries
      const previousComments = queryClient.getQueriesData({
        queryKey: ['comments', 'list', projectId],
      });

      // Optimistically update to the new value across all matching lists
      queryClient.setQueriesData({ queryKey: ['comments', 'list', projectId] }, (old) => {
        if (!old) return old;

        const updateComment = (comment) =>
          comment._id === id
            ? { ...comment, content, updatedAt: new Date().toISOString() }
            : comment;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data?.map(updateComment) || []
            }))
          };
        } else {
          return {
            ...old,
            data: old.data?.map(updateComment) || []
          };
        }
      });

      return { previousComments, projectId };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSuccess: (response) => {
      toast.success(getSuccessMessage(response, "Comment updated successfully"));
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({
        queryKey: ['comments', 'list', variables.projectId],
      });
    },
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }) => commentService.deleteComment(id),
    onMutate: async ({ id, projectId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['comments', 'list', projectId],
      });

      // Snapshot previous values
      const previousComments = queryClient.getQueriesData({
        queryKey: ['comments', 'list', projectId],
      });

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['comments', 'list', projectId] }, (old) => {
        if (!old) return old;

        const updateComment = (comment) =>
          comment._id === id
            ? { ...comment, isDeleted: true, deletedAt: new Date().toISOString() }
            : comment;

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data?.map(updateComment) || []
            }))
          };
        } else {
          return {
            ...old,
            data: old.data?.map(updateComment) || []
          };
        }
      });

      return { previousComments, projectId };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous values on error
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSuccess: (response) => {
      toast.success(getSuccessMessage(response, "Comment deleted successfully"));
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({
        queryKey: ['comments', 'list', variables.projectId],
      });
    },
  });
}

/**
 * Hook to get a single comment by ID
 */
export function useComment(commentId) {
  return useQuery({
    queryKey: queryKeys.comments.detail(commentId),
    queryFn: async ({ signal }) => {
      const response = await commentService.getCommentById(commentId, { signal });
      return response.data;
    },
    enabled: !!commentId,
  });
}
