import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Message, User, TypingIndicator } from '../types';
import { socketService } from '../services/socket.service';
import { useAuth } from './AuthContext';

interface ChatContextType {
  messages: Message[];
  users: User[];
  typingUsers: Map<string, boolean>;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  sendMessage: (content: string, recipientId?: string) => void;
  startTyping: (recipientId?: string) => void;
  stopTyping: (recipientId?: string) => void;
  loadMoreMessages: () => void;
  selectConversation: (userId: string | null) => void;
  selectedUserId: string | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageOffset, setMessageOffset] = useState(0);

  useEffect(() => {
    const handleConnectionStatus = ({ connected }: { connected: boolean }) => {
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      if (connected) {
        loadInitialData();
      }
    };

    const handleMessageReceived = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark as delivered if recipient
      if (message.recipientId === user?.id) {
        socketService.markMessageDelivered(message.id);
      }
    };

    const handleTypingUpdate = (data: TypingIndicator) => {
      setTypingUsers(prev => {
        const updated = new Map(prev);
        if (data.isTyping) {
          updated.set(data.userId, true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(p => {
              const u = new Map(p);
              u.delete(data.userId);
              return u;
            });
          }, 3000);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    };

    const handleUserStatus = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isOnline } : u
      ));
    };

    const handleMessageStatus = ({ messageId, status }: { messageId: string; status: string }) => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, deliveryStatus: status as any } : msg
      ));
    };

    socketService.on('connection-status', handleConnectionStatus);
    socketService.on('message:received', handleMessageReceived);
    socketService.on('typing:update', handleTypingUpdate);
    socketService.on('user:status', handleUserStatus);
    socketService.on('message:status', handleMessageStatus);

    return () => {
      socketService.off('connection-status', handleConnectionStatus);
      socketService.off('message:received', handleMessageReceived);
      socketService.off('typing:update', handleTypingUpdate);
      socketService.off('user:status', handleUserStatus);
      socketService.off('message:status', handleMessageStatus);
    };
  }, [user]);

  const loadInitialData = useCallback(() => {
    // Load users
    socketService.fetchUsers((response) => {
      if (response.success && response.users) {
        setUsers(response.users.filter((u: User) => u.id !== user?.id));
      }
    });

    // Load initial messages
    if (selectedUserId) {
      socketService.fetchConversation(selectedUserId, 50, 0, (response) => {
        if (response.success && response.messages) {
          setMessages(response.messages);
          setMessageOffset(response.messages.length);
          setHasMore(response.messages.length === 50);
        }
      });
    } else {
      socketService.fetchMessages(50, 0, (response) => {
        if (response.success && response.messages) {
          setMessages(response.messages);
          setMessageOffset(response.messages.length);
          setHasMore(response.messages.length === 50);
        }
      });
    }
  }, [selectedUserId, user]);

  const sendMessage = useCallback((content: string, recipientId?: string) => {
    setError(null);
    socketService.sendMessage(content, recipientId || selectedUserId || undefined, (response) => {
      if (response.error) {
        setError(response.error);
      }
    });
  }, [selectedUserId]);

  const startTyping = useCallback((recipientId?: string) => {
    socketService.startTyping(recipientId || selectedUserId || undefined);
  }, [selectedUserId]);

  const stopTyping = useCallback((recipientId?: string) => {
    socketService.stopTyping(recipientId || selectedUserId || undefined);
  }, [selectedUserId]);

  const loadMoreMessages = useCallback(() => {
    if (!hasMore || loading) return;

    setLoading(true);
    const fetchFn = selectedUserId
      ? () => socketService.fetchConversation(selectedUserId, 50, messageOffset, handleLoadMore)
      : () => socketService.fetchMessages(50, messageOffset, handleLoadMore);

    const handleLoadMore = (response: any) => {
      if (response.success && response.messages) {
        setMessages(prev => [...response.messages, ...prev]);
        setMessageOffset(prev => prev + response.messages.length);
        setHasMore(response.messages.length === 50);
      }
      setLoading(false);
    };

    fetchFn();
  }, [hasMore, loading, selectedUserId, messageOffset]);

  const selectConversation = useCallback((userId: string | null) => {
    setSelectedUserId(userId);
    setMessages([]);
    setMessageOffset(0);
    setHasMore(true);
    
    if (userId) {
      socketService.fetchConversation(userId, 50, 0, (response) => {
        if (response.success && response.messages) {
          setMessages(response.messages);
          setMessageOffset(response.messages.length);
          setHasMore(response.messages.length === 50);
        }
      });
    } else {
      loadInitialData();
    }
  }, [loadInitialData]);

  useEffect(() => {
    // Mark visible messages as read
    const unreadMessages = messages.filter(
      msg => msg.recipientId === user?.id && msg.deliveryStatus !== 'read'
    );
    
    unreadMessages.forEach(msg => {
      socketService.markMessageRead(msg.id);
    });
  }, [messages, user]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        typingUsers,
        connectionStatus,
        sendMessage,
        startTyping,
        stopTyping,
        loadMoreMessages,
        selectConversation,
        selectedUserId,
        hasMore,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};