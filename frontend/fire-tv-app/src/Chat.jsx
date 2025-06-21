import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle } from 'lucide-react';
import './Chat.css';

// Helper to format time, e.g., "14:32"
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

function Chat({ messages, onSendMessage, currentUserId, currentUsername, userMap = {} }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const getUserDisplayName = (userId) => {
    if (userId === currentUserId) return 'You';
    return userMap[userId] || `User ${userId.slice(0, 6)}`;
  };

  const getUserInitials = (userId) => {
    const username = userMap[userId];
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const activeUsers = new Set(messages.filter(msg => !msg.special && msg.userId).map(msg => msg.userId));
  if (currentUserId) activeUsers.add(currentUserId);
  const activeUsersCount = activeUsers.size;


  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <MessageCircle size={18} />
          <span>Chat</span>
        </div>
        <div className="chat-users">
          <Users size={16} />
          <span>{activeUsersCount} user{activeUsersCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => {
          if (msg.special) {
            return (
              <div key={index} className="message-system">
                <span className="message-system-text">{msg.text}</span>
              </div>
            );
          }

          const prevMsg = messages[index - 1];
          const isOwnMessage = msg.userId === currentUserId;
          
          // A message is the start of a new group if there's no previous message,
          // or if the previous message was from a different user, or was a system message.
          const isFirstInGroup = !prevMsg || prevMsg.userId !== msg.userId || prevMsg.special;
          
          const messageClasses = [
            'message',
            isOwnMessage ? 'message-own' : 'message-other',
            isFirstInGroup ? 'is-first-in-group' : '',
          ].join(' ');

          return (
            <div key={index} className={messageClasses}>
              {!isOwnMessage && isFirstInGroup && (
                <div className="message-author">
                  {getUserDisplayName(msg.userId)}
                </div>
              )}
              <div className="message-bubble">
                {!isOwnMessage && (
                  <div className="message-avatar">
                    {/* Show avatar only for the first message in a group */}
                    { (
                      <span className="avatar-text">{getUserInitials(msg.userId)}</span>
                    )}
                  </div>
                )}
                <div className="message-content">
                  {msg.text}
                </div>
                <div className="message-time-wrapper">
                  {msg.timestamp && (
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-input"
            placeholder={`Message as ${currentUsername}...`}
            maxLength={500}
          />
          <button 
            type="submit" 
            className="chat-send-button"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;