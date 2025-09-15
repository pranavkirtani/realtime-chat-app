import { io, Socket } from 'socket.io-client';
import type { Message, TypingIndicator } from '../types';

export type SocketCallback<T = any> = (response: { success?: boolean; error?: string; [key: string]: any }) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    
    this.socket = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      this.emit('connection-status', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.emit('connection-error', { error: error.message });
    });

    this.socket.on('message:received', (message: Message) => {
      this.emit('message:received', message);
    });

    this.socket.on('typing:update', (data: TypingIndicator) => {
      this.emit('typing:update', data);
    });

    this.socket.on('user:status', (data: { userId: string; isOnline: boolean }) => {
      this.emit('user:status', data);
    });

    this.socket.on('message:status', (data: { messageId: string; status: string }) => {
      this.emit('message:status', data);
    });
  }

  sendMessage(content: string, recipientId?: string, callback?: SocketCallback) {
    if (!this.socket?.connected) {
      callback?.({ error: 'Not connected' });
      return;
    }

    this.socket.emit('message:send', { content, recipientId }, callback);
  }

  startTyping(recipientId?: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:start', { recipientId });
  }

  stopTyping(recipientId?: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:stop', { recipientId });
  }

  markMessageDelivered(messageId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:delivered', messageId);
  }

  markMessageRead(messageId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('message:read', messageId);
  }

  fetchMessages(limit = 50, offset = 0, callback?: SocketCallback) {
    if (!this.socket?.connected) {
      callback?.({ error: 'Not connected' });
      return;
    }

    this.socket.emit('messages:fetch', { limit, offset }, callback);
  }

  fetchConversation(recipientId: string, limit = 50, offset = 0, callback?: SocketCallback) {
    if (!this.socket?.connected) {
      callback?.({ error: 'Not connected' });
      return;
    }

    this.socket.emit('conversation:fetch', { recipientId, limit, offset }, callback);
  }

  fetchUsers(callback?: SocketCallback) {
    if (!this.socket?.connected) {
      callback?.({ error: 'Not connected' });
      return;
    }

    this.socket.emit('users:list', callback);
  }

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Function) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();