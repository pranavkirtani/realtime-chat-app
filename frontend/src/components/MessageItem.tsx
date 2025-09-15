import React from 'react';
import type { Message } from '../types';
import { MessageType, DeliveryStatus } from '../types';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, senderName }) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDeliveryIcon = () => {
    if (!isOwn || message.type === MessageType.SYSTEM) return null;
    
    switch (message.deliveryStatus) {
      case DeliveryStatus.SENT:
        return <span className="delivery-icon">✓</span>;
      case DeliveryStatus.DELIVERED:
        return <span className="delivery-icon delivered">✓✓</span>;
      case DeliveryStatus.READ:
        return <span className="delivery-icon read">✓✓</span>;
      default:
        return null;
    }
  };

  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="message-item system">
        <span className="system-message">{message.content}</span>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    );
  }

  return (
    <div className={`message-item ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && <span className="message-sender">{senderName}</span>}
      <div className="message-bubble">
        <p className="message-content">{message.content}</p>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {getDeliveryIcon()}
        </div>
      </div>
    </div>
  );
};