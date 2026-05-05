import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, User, Search, Settings, LogOut, Hash, ArrowLeft } from 'lucide-react';
import AuthService from './services/AuthService';
import ChatService from './services/ChatService';
import Login from './components/Login';
import OnlineUsers from './components/OnlineUsers';
import PrivateChat from './components/PrivateChat';
import MessageReactions from './components/MessageReactions';
import FileUpload from './components/FileUpload';
import SearchInterface from './components/SearchInterface';
import UserProfile from './components/UserProfile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if user is already authenticated
    if (AuthService.isAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentUser(AuthService.getCurrentUser());
      connectToChat();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectToChat = async () => {
    try {
      await ChatService.connect();
      setIsConnected(true);
      
      // Load recent messages
      const recentMessages = await ChatService.getRecentMessages();
      setMessages(recentMessages);
      
      // Wait a bit for WebSocket to be fully connected before subscribing
      setTimeout(() => {
        // Subscribe to new messages
        try {
          ChatService.subscribeToMessages((message) => {
            setMessages(prev => [...prev, message]);
          });
        } catch (error) {
          console.error('Failed to subscribe to messages:', error);
        }

        // Subscribe to online users
        try {
          ChatService.subscribeToOnlineUsers((users) => {
            // Update online users in sidebar
          });
        } catch (error) {
          console.error('Failed to subscribe to online users:', error);
        }

        // Subscribe to typing indicators
        try {
          ChatService.subscribeToTyping('public', (typingData) => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (typingData.isTyping) {
                newSet.add(typingData.username);
              } else {
                newSet.delete(typingData.username);
              }
              return newSet;
            });
          });
        } catch (error) {
          console.error('Failed to subscribe to typing:', error);
        }
      }, 500);

    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleLogin = () => {
    const user = AuthService.getCurrentUser();
    setIsAuthenticated(true);
    setCurrentUser(user);
    connectToChat();
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedUser(null);
    setMessages([]);
    ChatService.disconnect();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    try {
      await ChatService.sendMessage({
        content: newMessage.trim(),
        sender: currentUser?.username
      });
      setNewMessage('');
      handleStopTyping();
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  const handleTyping = () => {
    ChatService.startTyping('public');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    ChatService.stopTyping('public');
  };

  const handleFileUploaded = (fileData) => {
    // Send file message
    ChatService.sendMessage({
      content: `📎 File shared: ${fileData.originalFilename} (${fileData.fileUrl})`
    });
    setShowFileUpload(false);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleBackToPublic = () => {
    setSelectedUser(null);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      let date;
      if (typeof timestamp === 'string') {
        if (timestamp.includes('T')) {
          date = new Date(timestamp);
        } else {
          date = new Date(`1970-01-01T${timestamp}`);
        }
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return '';
      }
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return '';
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (selectedUser) {
    return (
      <div className="flex h-screen bg-gray-50">
        <PrivateChat
          user={selectedUser}
          onBack={handleBackToPublic}
          currentUser={currentUser}
        />
        <OnlineUsers
          onSelectUser={handleUserSelect}
          currentUser={currentUser}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                <Hash className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Public Chat</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.displayName || currentUser?.username || 'User'}
                </span>
              </div>
              
              <SearchInterface
                onMessageSelect={(message) => {
                  // Scroll to message or open private chat
                }}
                onUserSelect={handleUserSelect}
              />
              
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Upload File"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Profile"
              >
                <Users className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === currentUser?.username ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === currentUser?.username
                    ? 'bg-primary-600 text-white ml-auto'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {message.sender !== currentUser?.username && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === currentUser?.username ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                  <MessageReactions
                    messageId={message.id}
                    currentUser={currentUser}
                  />
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* File Upload */}
        {showFileUpload && (
          <div className="p-4 border-t border-gray-200">
            <FileUpload onFileUploaded={handleFileUploaded} />
          </div>
        )}

        {/* Message Input */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </footer>
      </div>

      {/* Sidebar */}
      <OnlineUsers
        onSelectUser={handleUserSelect}
        currentUser={currentUser}
      />

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <UserProfile
              currentUser={currentUser}
              onProfileUpdate={handleProfileUpdate}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
