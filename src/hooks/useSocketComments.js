import { useEffect, useCallback, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import socketService from '@/services/socketService';
import api from '@/lib/api';

// Hook to get global active users
export function useGlobalActiveUsers() {
  return useQuery({
    queryKey: ['globalActiveUsers'],
    queryFn: async ({ signal }) => {
      const response = await api.get('/socket/global-active-users', { signal });
      return response.data || [];
    },
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useSocketComments(projectId, userId) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]); // Array of user IDs currently typing
  const [activeUsers, setActiveUsers] = useState([]); // Array of active user objects

  const handleNewComment = useCallback((comment) => {
    console.log('📨 New comment received:', comment);

    // For infinite queries, invalidate the cache to ensure proper pagination
    // This prevents pagination issues when new comments are added
    queryClient.invalidateQueries({
      queryKey: ['comments', 'list', projectId],
    });
  }, [queryClient, projectId]);

  const handleCommentUpdated = useCallback((updatedComment) => {
    console.log('📝 Comment updated:', updatedComment);

    // Update regular paginated queries optimistically, invalidate infinite queries
    queryClient.setQueriesData(
      { queryKey: ['comments', 'list', projectId] },
      (oldData) => {
        if (!oldData || oldData.pages) {
          // For infinite queries, invalidate to ensure consistency
          queryClient.invalidateQueries({
            queryKey: ['comments', 'list', projectId],
          });
          return oldData;
        }

        // For regular queries, update optimistically
        const updateCommentInData = (comments) =>
          comments.map((comment) =>
            comment._id === updatedComment._id ? updatedComment : comment
          );

        return {
          ...oldData,
          data: updateCommentInData(oldData.data),
        };
      }
    );
  }, [queryClient, projectId]);

  const handleCommentDeleted = useCallback((deletedData) => {
    console.log('🗑️ Comment deleted:', deletedData);

    // Update regular paginated queries optimistically, invalidate infinite queries
    queryClient.setQueriesData(
      { queryKey: ['comments', 'list', projectId] },
      (oldData) => {
        if (!oldData || oldData.pages) {
          // For infinite queries, invalidate to ensure consistency
          queryClient.invalidateQueries({
            queryKey: ['comments', 'list', projectId],
          });
          return oldData;
        }

        // For regular queries, update optimistically
        const removeCommentFromData = (comments) =>
          comments.map((comment) =>
            comment._id === deletedData.id
              ? { ...comment, isDeleted: true, deletedAt: new Date().toISOString() }
              : comment
          );

        return {
          ...oldData,
          data: removeCommentFromData(oldData.data),
        };
      }
    );
  }, [queryClient, projectId]);

  const handleUserStartedTyping = useCallback((data) => {
    console.log('💬 User started typing:', data);
    setTypingUsers(prev => {
      if (!prev.includes(data.userId)) {
        return [...prev, data.userId];
      }
      return prev;
    });
  }, []);

  const handleUserStoppedTyping = useCallback((data) => {
    console.log('🤐 User stopped typing:', data);
    setTypingUsers(prev => prev.filter(userId => userId !== data.userId));
  }, []);

  const handleUserJoined = useCallback((data) => {
    console.log('👋 User joined:', data);
    setActiveUsers(prev => {
      const existingIndex = prev.findIndex(user => user.userId === data.userId);
      if (existingIndex >= 0) {
        // Update existing user
        const updated = [...prev];
        updated[existingIndex] = { 
          ...data.userInfo, 
          userId: data.userId, 
          joinedAt: data.timestamp,
          lastActivity: data.timestamp,
          isActive: true // New join means they're active
        };
        return updated;
      } else {
        // Add new user
        return [...prev, { 
          ...data.userInfo, 
          userId: data.userId, 
          joinedAt: data.timestamp,
          lastActivity: data.timestamp,
          isActive: true // New join means they're active
        }];
      }
    });
  }, []);

  const handleUserLeft = useCallback((data) => {
    console.log('👋 User left:', data);
    setActiveUsers(prev => prev.filter(user => user.userId !== data.userId));
    // Also remove from typing users if they were typing
    setTypingUsers(prev => prev.filter(userId => userId !== data.userId));
  }, []);

  const handleUserActivity = useCallback((data) => {
    console.log('🏃 User activity:', data);
    setActiveUsers(prev => prev.map(user =>
      user.userId === data.userId
        ? { ...user, lastActivity: data.timestamp, isActive: true }
        : user
    ));
  }, []);

  const handleActiveUsersList = useCallback((data) => {
    console.log('👥 Received active users list:', data);
    setActiveUsers(data.activeUsers || []);
  }, []);

  useEffect(() => {
    if (!projectId || !userId) {
      setConnectionStatus('disconnected');
      setError('Missing projectId or userId');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    console.log('🔌 useSocketComments: Connecting to socket for project:', projectId, 'user:', userId);

    const handleConnect = () => {
      console.log('🔌 useSocketComments: Socket connected or reconnected');
      setConnectionStatus('connected');
      setError(null);
    };

    const handleDisconnect = (reason) => {
      console.log('🔌 useSocketComments: Socket disconnected:', reason);
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (err) => {
      console.error('🔌 useSocketComments: Socket connection error:', err);
      setConnectionStatus('error');
      setError(err.message || 'Connection error');
    };

    // Connect to socket asynchronously
    socketService.connect(userId).then(() => {
      console.log('✅ useSocketComments: Socket connected initial sequence, joining project:', projectId);
      setConnectionStatus('connected');

      // Join project room after connection
      socketService.joinProject(projectId, userId);

      // Register event listeners
      socketService.onNewComment(handleNewComment);
      socketService.onCommentUpdated(handleCommentUpdated);
      socketService.onCommentDeleted(handleCommentDeleted);
      socketService.onUserStartedTyping(handleUserStartedTyping);
      socketService.onUserStoppedTyping(handleUserStoppedTyping);
      socketService.onUserJoined(handleUserJoined);
      socketService.onUserLeft(handleUserLeft);
      socketService.onUserActivity(handleUserActivity);
      socketService.onActiveUsersList(handleActiveUsersList);
      
      socketService.addEventListener('connect', handleConnect);
      socketService.addEventListener('disconnect', handleDisconnect);
      socketService.addEventListener('connect_error', handleConnectError);

      console.log('✅ useSocketComments: Event listeners registered');
    }).catch((error) => {
      console.error('❌ useSocketComments: Failed to connect to socket:', error);
      setConnectionStatus('error');
      setError(error.message);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket listeners for project:', projectId);
      socketService.removeEventListener('newComment', handleNewComment);
      socketService.removeEventListener('commentUpdated', handleCommentUpdated);
      socketService.removeEventListener('commentDeleted', handleCommentDeleted);
      socketService.removeEventListener('userStartedTyping', handleUserStartedTyping);
      socketService.removeEventListener('userStoppedTyping', handleUserStoppedTyping);
      socketService.removeEventListener('userJoined', handleUserJoined);
      socketService.removeEventListener('userLeft', handleUserLeft);
      socketService.removeEventListener('userActivity', handleUserActivity);
      socketService.removeEventListener('activeUsersList', handleActiveUsersList);
      socketService.removeEventListener('connect', handleConnect);
      socketService.removeEventListener('disconnect', handleDisconnect);
      socketService.removeEventListener('connect_error', handleConnectError);
      socketService.leaveProject(projectId);
    };
  }, [projectId, userId, handleNewComment, handleCommentUpdated, handleCommentDeleted, handleUserStartedTyping, handleUserStoppedTyping, handleUserJoined, handleUserLeft, handleUserActivity, handleActiveUsersList]);

  // Periodic update of active users status
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        isActive: Date.now() - user.lastActivity < 60000 // Active within last minute
      })));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Typing indicator functions
  const startTyping = useCallback(() => {
    socketService.startTyping(projectId);
  }, [projectId]);

  const stopTyping = useCallback(() => {
    socketService.stopTyping(projectId);
  }, [projectId]);

  // Activity tracking
  const sendActivity = useCallback(() => {
    socketService.sendActivity(projectId);
  }, [projectId]);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    error,
    typingUsers,
    activeUsers,
    startTyping,
    stopTyping,
    sendActivity,
  };
}
