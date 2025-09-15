import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      handleStopTyping();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      onStartTyping();
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={handleChange}
        onBlur={handleStopTyping}
        placeholder={disabled ? "Connecting..." : "Type a message..."}
        className="message-input"
        disabled={disabled}
        maxLength={1000}
      />
      <button
        type="submit"
        className="send-button"
        disabled={disabled || !message.trim()}
      >
        Send
      </button>
    </form>
  );
};