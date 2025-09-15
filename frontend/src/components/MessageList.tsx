import React from 'react';
import { Message, User } from '../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  users: User[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, users }) => {
  const getUserName = (userId: string): string => {
    if (userId === currentUserId) return 'You';
    const user = users.find(u => u.id === userId);
    return user?.username || 'Unknown User';
  };

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          senderName={getUserName(message.senderId)}
        />
      ))}
    </div>
  );
};