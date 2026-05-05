import React, { useState, useEffect } from 'react';
import { Users, Circle, MessageCircle, Search } from 'lucide-react';
import ChatService from '../services/ChatService';

const OnlineUsers = ({ onSelectUser, currentUser }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    subscribeToOnlineUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [online, all] = await Promise.all([
        ChatService.getOnlineUsers(),
        ChatService.getAllUsers()
      ]);
      setOnlineUsers(online);
      setAllUsers(all);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOnlineUsers = () => {
    ChatService.subscribeToOnlineUsers((users) => {
      setOnlineUsers(users);
    });
  };

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserItem = ({ user, isOnline }) => (
    <div
      onClick={() => onSelectUser(user)}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="relative">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-10 h-10 rounded-full" />
          ) : (
            <span className="text-gray-600 font-semibold">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {isOnline && (
          <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.displayName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          @{user.username}
        </p>
      </div>
      <div className="flex items-center space-x-1">
        {isOnline && (
          <span className="text-xs text-green-600">Online</span>
        )}
        <MessageCircle className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {onlineUsers.length}
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {onlineUsers.length > 0 && (
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Online Now
            </h3>
            <div className="space-y-1">
              {onlineUsers
                .filter(user => user.username !== currentUser?.username)
                .map(user => (
                  <UserItem key={user.username} user={user} isOnline={true} />
                ))}
            </div>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            All Users
          </h3>
          <div className="space-y-1">
            {filteredUsers
              .filter(user => user.username !== currentUser?.username)
              .filter(user => !onlineUsers.some(online => online.username === user.username))
              .map(user => (
                <UserItem key={user.username} user={user} isOnline={false} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;
