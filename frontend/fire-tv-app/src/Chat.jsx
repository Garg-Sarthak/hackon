import React, { useState, useEffect, useRef } from 'react';

function Chat({ messages, onSendMessage, currentUserId }) {
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

  return (
    <div style={{ border: '1px solid #ccc', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <h3>Chat</h3>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px', color: msg.special ? 'gray' : 'black' }}>
            {msg.special ? (
              <em>{msg.text}</em>
            ) : (
              <span><strong>{msg.userId === currentUserId ? 'You' : msg.userId}:</strong> {msg.text}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flexGrow: 1, marginRight: '5px' }}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
// Need to define HARDCODED_USER_ID if it's not globally available or pass as prop
const HARDCODED_USER_ID = "user_" + Math.random().toString(36).substr(2, 9); // Or get from context/props

export default Chat;