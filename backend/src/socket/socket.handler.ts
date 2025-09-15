import { Server } from 'socket.io';
import { AuthService } from '../services/auth.service.ts';
import { MessageService } from '../services/message.service.ts';
import { UserService } from '../services/user.service.ts';
import { MessageType, DeliveryStatus } from '../types/index.ts';

interface SocketData {
  userId: string;
  email: string;
}

interface SendMessageData {
  content: string;
  recipientId?: string;
}

interface TypingData {
  recipientId?: string;
  isTyping: boolean;
}

export class SocketHandler {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();

  constructor(
    io: Server,
    private authService: AuthService,
    private messageService: MessageService,
    private userService: UserService
  ) {
    this.io = io;
    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const payload = this.authService.verifyToken(token);
        const user = await this.userService.findById(payload.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data = {
          userId: payload.userId,
          email: payload.email
        } as SocketData;

        next();
      } catch (_error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      
      // Track user connections
      this.addUserSocket(userId, socket.id);
      socket.join(`user:${userId}`);
      
      // Notify others that user is online
      this.broadcastUserStatus(userId, true);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        this.removeUserSocket(userId, socket.id);
        
        // If user has no more connections, mark as offline
        if (!this.userSockets.has(userId) || this.userSockets.get(userId)!.size === 0) {
          this.broadcastUserStatus(userId, false);
        }
      });

      // Handle sending messages
      socket.on('message:send', async (data: SendMessageData, callback) => {
        try {
          // Apply rate limiting
          const rateLimitKey = userId;
          const isRateLimited = await this.checkRateLimit(rateLimitKey);
          
          if (isRateLimited) {
            return callback({ error: 'Too many messages, please slow down' });
          }

          // Validate message
          if (!data.content || data.content.trim().length === 0) {
            return callback({ error: 'Message content cannot be empty' });
          }

          if (data.content.length > 1000) {
            return callback({ error: 'Message too long (max 1000 characters)' });
          }

          // Create message
          const message = await this.messageService.create({
            content: data.content,
            senderId: userId,
            recipientId: data.recipientId,
            type: MessageType.TEXT
          });

          // Send to sender
          socket.emit('message:received', message);

          // Send to recipient(s)
          if (data.recipientId) {
            // Private message
            this.io.to(`user:${data.recipientId}`).emit('message:received', message);
          } else {
            // Broadcast to all except sender
            socket.broadcast.emit('message:received', message);
          }

          callback({ success: true, message });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send message';
          callback({ error: message });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data: TypingData) => {
        const typingData = {
          userId,
          isTyping: true,
          timestamp: new Date()
        };

        if (data.recipientId) {
          this.io.to(`user:${data.recipientId}`).emit('typing:update', typingData);
        } else {
          socket.broadcast.emit('typing:update', typingData);
        }
      });

      socket.on('typing:stop', (data: TypingData) => {
        const typingData = {
          userId,
          isTyping: false,
          timestamp: new Date()
        };

        if (data.recipientId) {
          this.io.to(`user:${data.recipientId}`).emit('typing:update', typingData);
        } else {
          socket.broadcast.emit('typing:update', typingData);
        }
      });

      // Handle message status updates
      socket.on('message:delivered', async (messageId: string) => {
        await this.messageService.updateDeliveryStatus(messageId, DeliveryStatus.DELIVERED);
      });

      socket.on('message:read', async (messageId: string) => {
        const message = await this.messageService.updateDeliveryStatus(messageId, DeliveryStatus.READ);
        if (message && message.senderId !== userId) {
          this.io.to(`user:${message.senderId}`).emit('message:status', {
            messageId,
            status: DeliveryStatus.READ
          });
        }
      });

      // Handle fetching message history
      socket.on('messages:fetch', async (filter: { limit?: number; offset?: number }, callback) => {
        try {
          const messages = await this.messageService.getMessages({
            userId,
            limit: filter.limit || 50,
            offset: filter.offset || 0
          });
          callback({ success: true, messages });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch messages';
          callback({ error: message });
        }
      });

      // Handle fetching conversation
      socket.on('conversation:fetch', async (data: { recipientId: string, limit?: number, offset?: number }, callback) => {
        try {
          const messages = await this.messageService.getConversation(
            userId,
            data.recipientId,
            data.limit || 50,
            data.offset || 0
          );
          callback({ success: true, messages });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch conversation';
          callback({ error: message });
        }
      });

      // Handle user list request
      socket.on('users:list', async (callback) => {
        try {
          const users = await this.userService.getAllUsers();
          const onlineUsers = Array.from(this.userSockets.keys());
          
          const usersWithStatus = users.map(user => ({
            ...user,
            isOnline: onlineUsers.includes(user.id)
          }));
          
          callback({ success: true, users: usersWithStatus });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch users';
          callback({ error: message });
        }
      });
    });
  }

  private addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, userId);
  }

  private removeUserSocket(userId: string, socketId: string) {
    this.userSockets.get(userId)?.delete(socketId);
    this.socketUsers.delete(socketId);
    
    if (this.userSockets.get(userId)?.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  private broadcastUserStatus(userId: string, isOnline: boolean) {
    this.io.emit('user:status', { userId, isOnline, timestamp: new Date() });
  }

  private rateLimitStore = new Map<string, number[]>();
  
  private async checkRateLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, []);
    }
    
    const timestamps = this.rateLimitStore.get(key)!;
    const recentTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (recentTimestamps.length >= maxRequests) {
      return true;
    }
    
    recentTimestamps.push(now);
    this.rateLimitStore.set(key, recentTimestamps);
    
    return false;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}