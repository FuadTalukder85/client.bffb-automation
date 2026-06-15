import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.eventListeners = new Map();
    this.currentUserId = null;
    this.currentProjectId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  async connect(userId) {
    if (this.socket?.connected && this.currentUserId === userId) {
      console.log('🔄 Socket already connected for user:', userId);
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('⏳ Socket connection in progress, waiting...');
      // Wait for connection to complete
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;
    this.currentUserId = userId;

    // Get JWT token from auth store
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('❌ No authentication token available');
      this.isConnecting = false;
      throw new Error('Authentication required');
    }

    // Use the API URL but remove /api/v1 if present
    let serverUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    if (serverUrl.endsWith('/api/v1')) {
      serverUrl = serverUrl.replace('/api/v1', '');
    }

    console.log('🔌 Attempting to connect to socket server:', serverUrl, 'with userId:', userId);

    // Disconnect existing socket if user changed
    if (this.socket && this.currentUserId !== userId) {
      console.log('🔌 Disconnecting existing socket for user change');
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(serverUrl, {
      auth: {
        token, // Send JWT token for authentication
      },
      transports: ['websocket', 'polling'],
      autoConnect: false, // We'll manually connect
      timeout: 10000,
      forceNew: true, // Force new connection
    });

    console.log('🔌 Socket.io client created, manually connecting...');

    // Set up event handlers before connecting
    this.setupEventHandlers();

    // Manually connect
    this.socket.connect();

    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('❌ Socket connection timeout after 10s');
          this.isConnecting = false;
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      // Listen for successful connection
      const onConnect = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Socket connected successfully to server for user:', userId);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        resolve(this.socket);
      };

      // Listen for connection errors
      const onConnectError = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ Socket connection error:', error);
        this.isConnected = false;
        this.isConnecting = false;
        reject(error);
      };

      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onConnectError);
    });
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Automatically re-join current project if it exists (e.g., after reconnection)
      if (this.currentProjectId) {
        console.log('🔄 Re-joining project after connection/reconnection:', this.currentProjectId);
        this.joinProject(this.currentProjectId, this.currentUserId);
      }

      // Attach all pending event listeners
      this.attachPendingListeners();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;

      // Attempt reconnection if not intentional disconnect
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        this.attemptReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
      this.isConnecting = false;
      this.attemptReconnection();
    });

    // Handle authentication errors
    this.socket.on('auth_error', (data) => {
      console.error('🔐 Socket authentication error:', data);
      this.disconnect();
    });

    this.socket.on('auth_required', (data) => {
      console.warn('🔐 Socket authentication required:', data);
    });

    this.socket.on('connection_limit_exceeded', (data) => {
      console.warn('🚫 Connection limit exceeded:', data);
      this.disconnect();
    });

    this.socket.on('rate_limited', (data) => {
      console.warn('🐌 Rate limited:', data);
    });

    this.socket.on('permission_denied', (data) => {
      console.warn('🚫 Permission denied:', data);
    });

    this.socket.on('error', (data) => {
      console.error('❌ Socket error:', data);
    });
  }

  attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.currentUserId && !this.isConnected && !this.isConnecting) {
        this.connect(this.currentUserId).catch(error => {
          console.error('❌ Reconnection failed:', error);
        });
      }
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
    }
  }

  joinProject(projectId, userId) {
    this.currentProjectId = projectId;
    if (this.socket && this.isConnected) {
      console.log('📨 Joining project:', projectId);
      this.socket.emit('joinProject', projectId, (response) => {
        if (response?.success) {
          console.log('✅ Successfully joined project:', projectId);
        } else {
          console.error('❌ Failed to join project:', projectId, response);
        }
      });
    } else {
      console.warn('⚠️ Cannot join project: socket not connected. Saved project ID for auto-join.');
    }
  }

  leaveProject(projectId) {
    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
    if (this.socket && this.isConnected) {
      console.log('📤 Leaving project:', projectId);
      this.socket.emit('leaveProject', projectId);
    }
  }

  // Ping to check connection health
  ping() {
    return new Promise((resolve) => {
      if (this.socket && this.isConnected) {
        const start = Date.now();
        this.socket.emit('ping', (response) => {
          const latency = Date.now() - start;
          console.log('🏓 Ping response:', latency, 'ms');
          resolve({ latency, ...response });
        });

        // Timeout after 5 seconds
        setTimeout(() => resolve({ timeout: true }), 5000);
      } else {
        resolve({ connected: false });
      }
    });
  }

  // Attach all registered listeners to the socket
  attachPendingListeners() {
    if (!this.socket) return;

    console.log('🔗 Attaching pending event listeners');
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
        console.log('✅ Attached listener for event:', event);
      });
    });
  }

  // Listen for comment events
  onNewComment(callback) {
    this.addEventListener('newComment', callback);
  }

  onCommentUpdated(callback) {
    this.addEventListener('commentUpdated', callback);
  }

  onCommentDeleted(callback) {
    this.addEventListener('commentDeleted', callback);
  }

  // Typing indicator methods
  startTyping(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('startTyping', projectId);
    }
  }

  stopTyping(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', projectId);
    }
  }

  onUserStartedTyping(callback) {
    this.addEventListener('userStartedTyping', callback);
  }

  onUserStoppedTyping(callback) {
    this.addEventListener('userStoppedTyping', callback);
  }

  // User presence methods
  sendActivity(projectId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('userActivity', projectId);
    }
  }

  onUserJoined(callback) {
    this.addEventListener('userJoined', callback);
  }

  onUserLeft(callback) {
    this.addEventListener('userLeft', callback);
  }

  onUserActivity(callback) {
    this.addEventListener('userActivity', callback);
  }

  onActiveUsersList(callback) {
    this.addEventListener('activeUsersList', callback);
  }

  // Generic event listener management
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    // Avoid duplicate listeners
    if (!this.eventListeners.get(event).includes(callback)) {
      this.eventListeners.get(event).push(callback);

      // Attach immediately if socket is connected
      if (this.socket && this.isConnected) {
        this.socket.on(event, callback);
        console.log('✅ Immediately attached listener for event:', event);
      }
    }
  }

  removeEventListener(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        if (this.socket) {
          this.socket.off(event, callback);
        }
      }
    }
  }

  removeAllListeners(event) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      if (this.socket) {
        listeners.forEach(callback => {
          this.socket.off(event, callback);
        });
      }
      this.eventListeners.delete(event);
    }
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      userId: this.currentUserId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
