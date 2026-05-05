import React, { useState, useEffect } from 'react';
import { Search, X, MessageCircle, User, Calendar } from 'lucide-react';
import ChatService from '../services/ChatService';

const SearchInterface = ({ onMessageSelect, onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState({
    publicMessages: [],
    privateMessages: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults({ publicMessages: [], privateMessages: [], users: [] });
      setShowResults(false);
    }
  }, [query, searchType]);

  const performSearch = async (pageNum = 0) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      if (searchType === 'all') {
        const response = await ChatService.searchMessages(query, pageNum);
        if (pageNum === 0) {
          setResults({
            publicMessages: response.publicMessages || [],
            privateMessages: response.privateMessages || [],
            users: []
          });
        } else {
          setResults(prev => ({
            ...prev,
            publicMessages: [...prev.publicMessages, ...(response.publicMessages || [])],
            privateMessages: [...prev.privateMessages, ...(response.privateMessages || [])]
          }));
        }
        setHasMore(response.hasMorePublic || false);
      } else if (searchType === 'public') {
        const messages = await ChatService.searchMessages(query, pageNum);
        setResults(prev => ({
          ...prev,
          publicMessages: pageNum === 0 ? messages : [...prev.publicMessages, ...messages]
        }));
        setHasMore(messages.length === 20);
      } else if (searchType === 'users') {
        const users = await ChatService.getAllUsers();
        const filteredUsers = users.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.displayName.toLowerCase().includes(query.toLowerCase())
        );
        setResults(prev => ({ ...prev, users: filteredUsers }));
      }
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(nextPage);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const MessageResult = ({ message, isPrivate = false }) => (
    <div
      className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
        isPrivate ? 'bg-blue-50' : ''
      }`}
      onClick={() => onMessageSelect?.(message, isPrivate)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {message.senderDisplayName || message.sender}
            </span>
            {isPrivate && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Private
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">
            {message.content}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const UserResult = ({ user }) => (
    <div
      className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => onUserSelect?.(user)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full" />
          ) : (
            <span className="text-gray-600 text-sm font-semibold">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
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
          {user.isOnline && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
          <MessageCircle className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages, users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Type Selector */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="users">Users</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Search Results
              {loading && <span className="ml-2 text-gray-500">Loading...</span>}
            </p>
          </div>

          <div className="overflow-y-auto max-h-80">
            {/* Public Messages */}
            {results.publicMessages.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Public Messages ({results.publicMessages.length})
                  </p>
                </div>
                {results.publicMessages.map((message, index) => (
                  <MessageResult key={`public-${index}`} message={message} />
                ))}
              </div>
            )}

            {/* Private Messages */}
            {results.privateMessages.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-blue-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase">
                    Private Messages ({results.privateMessages.length})
                  </p>
                </div>
                {results.privateMessages.map((message, index) => (
                  <MessageResult key={`private-${index}`} message={message} isPrivate={true} />
                ))}
              </div>
            )}

            {/* Users */}
            {results.users.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Users ({results.users.length})
                  </p>
                </div>
                {results.users.map((user) => (
                  <UserResult key={user.username} user={user} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && results.publicMessages.length === 0 && 
             results.privateMessages.length === 0 && 
             results.users.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No results found for "{query}"</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 text-sm"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
