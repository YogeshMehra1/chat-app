// Base API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || '/ws';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
  
  // Chat & Messages
  CHAT: {
    MESSAGES: `${API_BASE_URL}/api/messages`,
    SEND_MESSAGE: `${API_BASE_URL}/api/messages`,
  },
  
  // Private Messages
  PRIVATE: {
    MESSAGES: (username) => `${API_BASE_URL}/api/private/messages/${username}`,
    SEND: `${API_BASE_URL}/api/private/send`,
  },
  
  // User Management
  USERS: {
    ONLINE: `${API_BASE_URL}/api/presence/online-users`,
    ALL: `${API_BASE_URL}/api/presence/all-users`,
    PROFILE: (username) => `${API_BASE_URL}/api/profile/${username}`,
  },
  
  // Search & Files
  SEARCH: {
    MESSAGES: `${API_BASE_URL}/api/search/messages`,
    USERS: `${API_BASE_URL}/api/search/users`,
  },
  FILES: {
    UPLOAD: `${API_BASE_URL}/api/files/upload`,
  },
  
  // Reactions & Typing
  REACTIONS: `${API_BASE_URL}/api/reactions`,
  TYPING: {
    START: `${API_BASE_URL}/api/typing/start`,
    STOP: `${API_BASE_URL}/api/typing/stop`,
  },
};

// WebSocket Topics
export const WS_TOPICS = {
  MESSAGES: '/topic/messages',
  PRIVATE_MESSAGE: (username) => `/topic/private/${username}`,
  ONLINE_USERS: '/topic/online-users',
  TYPING: (room) => `/topic/typing/${room}`,
};

// WebSocket Destinations
export const WS_DESTINATIONS = {
  SEND_MESSAGE: '/app/sendMessage',
  SEND_PRIVATE: '/app/sendPrivateMessage',
  START_TYPING: '/app/startTyping',
  STOP_TYPING: '/app/stopTyping',
};
