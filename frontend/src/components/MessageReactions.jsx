import React, { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';
import ChatService from '../services/ChatService';

const MessageReactions = ({ messageId, currentUser, onReactionUpdate }) => {
  const [reactions, setReactions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [myReaction, setMyReaction] = useState(null);

  useEffect(() => {
    loadReactions();
    subscribeToReactions();
    loadMyReaction();
  }, [messageId]);

  const loadReactions = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reactions/message/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${ChatService.getToken?.() || localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReactions(data);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const loadMyReaction = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reactions/my-reaction/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${ChatService.getToken?.() || localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.username) {
          setMyReaction(data);
        }
      }
    } catch (error) {
      console.error('Error loading my reaction:', error);
    }
  };

  const subscribeToReactions = () => {
    ChatService.subscribeToReactions(messageId, (reaction) => {
      if (reaction.emoji === null) {
        // Reaction removed
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
        if (myReaction && myReaction.id === reaction.id) {
          setMyReaction(null);
        }
      } else {
        // Reaction added or updated
        setReactions(prev => {
          const filtered = prev.filter(r => r.username !== reaction.username);
          return [...filtered, reaction];
        });
        
        if (reaction.username === currentUser?.username) {
          setMyReaction(reaction);
        }
      }
      onReactionUpdate?.();
    });
  };

  const addReaction = async (emoji) => {
    try {
      await ChatService.addReaction(messageId, emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async () => {
    try {
      await ChatService.removeReaction(messageId);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const getReactionCounts = () => {
    const counts = {};
    reactions.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const getReactionUsers = (emoji) => {
    return reactions.filter(r => r.emoji === emoji);
  };

  const reactionCounts = getReactionCounts();

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👎', '🎉', '🔥', '✨', '💯', '🙏', '👌', '🤝', '💪', '🎯', '🚀', '💡', '🌟', '⭐'];

  if (reactions.length === 0 && !myReaction) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="grid grid-cols-5 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addReaction(emoji)}
                  className="text-lg hover:bg-gray-100 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 mt-2">
      {Object.entries(reactionCounts).map(([emoji, count]) => {
        const users = getReactionUsers(emoji);
        const isMyReaction = myReaction?.emoji === emoji;
        
        return (
          <button
            key={emoji}
            onClick={() => {
              if (isMyReaction) {
                removeReaction();
              } else {
                addReaction(emoji);
              }
            }}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-colors ${
              isMyReaction 
                ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={users.map(u => u.displayName).join(', ')}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
      
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>
        
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="grid grid-cols-5 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addReaction(emoji)}
                  className="text-lg hover:bg-gray-100 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
