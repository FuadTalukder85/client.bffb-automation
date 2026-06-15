import api from "@/lib/api";

export const commentService = {
  // Get comments for a project
  getCommentsByProject: async (projectId, filters = {}, config = {}) => {
    const response = await api.post(`/comments/project/${projectId}`, filters, config);
    return response.data;
  },

  // Create a new comment
  createComment: async (commentData) => {
    const response = await api.post("/comments", commentData);
    return response.data;
  },

  // Update a comment
  updateComment: async (id, commentData) => {
    const response = await api.patch(`/comments/${id}`, commentData);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  // Get comment by ID
  getCommentById: async (id, config = {}) => {
    const response = await api.get(`/comments/${id}`, config);
    return response.data;
  },
};
