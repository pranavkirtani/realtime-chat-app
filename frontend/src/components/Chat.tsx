import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import { ConnectionStatus } from './ConnectionStatus';
import '../styles/chat.css';

export const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    messages, 
    users, 
    connectionStatus, 
    selectedUserId,
    selectConversation,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    error
  } = useChat();

  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedUser = users.find(u => u.id === selectedUserId);
  const conversationMessages = selectedUserId
    ? messages.filter(m => 
        (m.senderId === selectedUserId && m.recipientId === user?.id) ||
        (m.senderId === user?.id && m.recipientId === selectedUserId)
      )
    : messages.filter(m => !m.recipientId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const handleSendMessage = (content: string) => {
    sendMessage(content, selectedUserId || undefined);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <button 
            className="menu-button"
            onClick={() => setShowUserList(!showUserList)}
          >
            ☰
          </button>
          <h1>Real-Time Chat</h1>
          {selectedUser && (
            <span className="conversation-title">
              - {selectedUser.username}
              {selectedUser.isOnline && <span className="online-indicator">●</span>}
            </span>
          )}
        </div>
        <div className="header-right">
          <ConnectionStatus status={connectionStatus} />
          <div className="user-info">
            <span>{user?.username}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="chat-body">
        <div className={`user-list-container ${showUserList ? 'show' : ''}`}>
          <UserList
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={selectConversation}
            currentUserId={user?.id || ''}
          />
        </div>

        <div className="chat-main">
          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}

          <MessageList
            messages={conversationMessages}
            currentUserId={user?.id || ''}
            users={users}
          />
          <div ref={messagesEndRef} />

          {Array.from(typingUsers.entries())
            .filter(([userId]) => userId !== user?.id && (!selectedUserId || userId === selectedUserId))
            .map(([userId]) => {
              const typingUser = users.find(u => u.id === userId);
              return typingUser ? (
                <div key={userId} className="typing-indicator">
                  {typingUser.username} is typing...
                </div>
              ) : null;
            })}

          <MessageInput
            onSendMessage={handleSendMessage}
            onStartTyping={() => startTyping(selectedUserId || undefined)}
            onStopTyping={() => stopTyping(selectedUserId || undefined)}
            disabled={connectionStatus !== 'connected'}
          />
        </div>
      </div>
    </div>
  );
};