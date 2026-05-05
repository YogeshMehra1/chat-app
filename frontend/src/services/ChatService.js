import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import AuthService from './AuthService';
import { API_BASE_URL, WS_BASE_URL, API_ENDPOINTS, WS_TOPICS, WS_DESTINATIONS } from '../config/api';

class ChatService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(WS_BASE_URL);
      
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });

      this.client.onConnect = (frame) => {
                this.connected = true;
        this.setupSubscriptions();
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        this.connected = false;
        reject(frame);
      };

      this.client.onDisconnect = () => {
        console.log('Disconnected from WebSocket');
        this.connected = false;
      };

      this.client.activate();
    });
  }

  setupSubscriptions() {
    // These will be set up when needed
  }

  async disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  async sendMessage(message) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: '/app/sendMessage',
      body: JSON.stringify(message),
    });
  }

  async sendPrivateMessage(message) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: '/app/sendPrivateMessage',
      body: JSON.stringify(message),
    });
  }

  subscribeToMessages(callback) {
    if (!this.client || !this.connected) {
      console.warn('Not connected to WebSocket, will retry subscription');
      // Retry subscription after connection
      setTimeout(() => {
        if (this.connected) {
          this.subscribeToMessages(callback);
        }
      }, 1000);
      return null;
    }

    try {
      const subscription = this.client.subscribe('/topic/messages', (message) => {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      });
      
      this.subscriptions.set('messages', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to messages:', error);
      return null;
    }
  }

  subscribeToPrivateMessages(username, callback) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    const subscription = this.client.subscribe(`/topic/private/${username}`, (message) => {
      const parsedMessage = JSON.parse(message.body);
      callback(parsedMessage);
    });
    
    this.subscriptions.set(`private_${username}`, subscription);
    return subscription;
  }

  subscribeToOnlineUsers(callback) {
    if (!this.client || !this.connected) {
      console.warn('Not connected to WebSocket, will retry subscription');
      setTimeout(() => {
        if (this.connected) {
          this.subscribeToOnlineUsers(callback);
        }
      }, 1000);
      return null;
    }

    try {
      const subscription = this.client.subscribe('/topic/online-users', (message) => {
        const users = JSON.parse(message.body);
        callback(users);
      });
      
      this.subscriptions.set('onlineUsers', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to online users:', error);
      return null;
    }
  }

  subscribeToTyping(room, callback) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    const subscription = this.client.subscribe(`/topic/typing/${room}`, (message) => {
      const typingData = JSON.parse(message.body);
      callback(typingData);
    });
    
    this.subscriptions.set(`typing_${room}`, subscription);
    return subscription;
  }

  subscribeToPrivateTyping(username, callback) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    const subscription = this.client.subscribe(`/topic/typing/private/${username}`, (message) => {
      const typingData = JSON.parse(message.body);
      callback(typingData);
    });
    
    this.subscriptions.set(`private_typing_${username}`, subscription);
    return subscription;
  }

  subscribeToReactions(messageId, callback) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    const subscription = this.client.subscribe(`/topic/reactions/${messageId}`, (message) => {
      const reaction = JSON.parse(message.body);
      callback(reaction);
    });
    
    this.subscriptions.set(`reactions_${messageId}`, subscription);
    return subscription;
  }

  async startTyping(room) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: '/app/startTyping',
      body: JSON.stringify({ room }),
    });
  }

  async stopTyping(room) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: '/app/stopTyping',
      body: JSON.stringify({ room }),
    });
  }

  async addReaction(messageId, emoji) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: '/app/addReaction',
      body: JSON.stringify({ messageId, emoji }),
    });
  }

  async removeReaction(messageId) {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: '/app/removeReaction',
      body: JSON.stringify(messageId),
    });
  }

  async getRecentMessages() {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT.MESSAGES);
      if (!response.ok) {
        throw new Error('Failed to fetch recent messages');
      }
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      return [];
    }
  }

  async getPrivateConversation(username) {
    try {
      const response = await fetch(`http://localhost:8080/api/private/conversation/${username}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch private messages');
      }
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error fetching private messages:', error);
      return [];
    }
  }

  async getOnlineUsers() {
    try {
      const token = AuthService.getToken();
      if (!token) {
        console.warn('No authentication token found');
        return [];
      }
      
      const response = await fetch(API_ENDPOINTS.USERS.ONLINE, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Authentication failed, token may be expired');
          AuthService.logout();
          window.location.reload();
        }
        throw new Error('Failed to fetch online users');
      }
      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  }

  async getAllUsers() {
    try {
      const token = AuthService.getToken();
      if (!token) {
        console.warn('No authentication token found');
        return [];
      }
      
      const response = await fetch(API_ENDPOINTS.USERS.ALL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Authentication failed, token may be expired');
          AuthService.logout();
          window.location.reload();
        }
        throw new Error('Failed to fetch all users');
      }
      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async searchMessages(query, page = 0) {
    try {
      const response = await fetch(`http://localhost:8080/api/search/messages?query=${query}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to search messages');
      }
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getUserProfile(username) {
    try {
      const response = await fetch(API_ENDPOINTS.USERS.PROFILE(username), {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateMyProfile(profileData) {
    try {
      const response = await fetch('http://localhost:8080/api/profile/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  isConnected() {
    return this.connected;
  }

  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }
}

export default new ChatService();
