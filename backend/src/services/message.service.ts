import { Message, MessageType, DeliveryStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateMessageDTO {
  content: string;
  senderId: string;
  recipientId?: string;
  type?: MessageType;
}

export interface MessageFilter {
  userId?: string;
  conversationId?: string;
  limit?: number;
  offset?: number;
}

export class MessageService {
  private messages: Map<string, Message> = new Map();
  private userMessages: Map<string, Set<string>> = new Map();
  private conversationMessages: Map<string, Set<string>> = new Map();

  async create(data: CreateMessageDTO): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      content: data.content,
      senderId: data.senderId,
      recipientId: data.recipientId,
      type: data.type || MessageType.TEXT,
      createdAt: new Date(),
      deliveryStatus: DeliveryStatus.SENT
    };

    this.messages.set(message.id, message);
    
    // Index by sender
    if (!this.userMessages.has(message.senderId)) {
      this.userMessages.set(message.senderId, new Set());
    }
    this.userMessages.get(message.senderId)!.add(message.id);
    
    // Index by recipient if it's a private message
    if (message.recipientId) {
      if (!this.userMessages.has(message.recipientId)) {
        this.userMessages.set(message.recipientId, new Set());
      }
      this.userMessages.get(message.recipientId)!.add(message.id);
      
      // Create conversation index
      const conversationId = this.getConversationId(message.senderId, message.recipientId);
      if (!this.conversationMessages.has(conversationId)) {
        this.conversationMessages.set(conversationId, new Set());
      }
      this.conversationMessages.get(conversationId)!.add(message.id);
    }

    return message;
  }

  async updateDeliveryStatus(messageId: string, status: DeliveryStatus): Promise<Message | null> {
    const message = this.messages.get(messageId);
    if (!message) return null;
    
    message.deliveryStatus = status;
    return message;
  }

  async getMessages(filter: MessageFilter): Promise<Message[]> {
    let messageIds: string[] = [];
    
    if (filter.conversationId) {
      const conversationSet = this.conversationMessages.get(filter.conversationId);
      if (conversationSet) {
        messageIds = Array.from(conversationSet);
      }
    } else if (filter.userId) {
      const userSet = this.userMessages.get(filter.userId);
      if (userSet) {
        messageIds = Array.from(userSet);
      }
    } else {
      messageIds = Array.from(this.messages.keys());
    }
    
    // Get messages and sort by date
    const messages = messageIds
      .map(id => this.messages.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Apply pagination
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    
    return messages.slice(offset, offset + limit);
  }

  async getConversation(userId1: string, userId2: string, limit = 50, offset = 0): Promise<Message[]> {
    const conversationId = this.getConversationId(userId1, userId2);
    return this.getMessages({ conversationId, limit, offset });
  }

  private getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join(':');
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const message = this.messages.get(messageId);
    if (!message) return false;
    
    // Remove from indexes
    this.userMessages.get(message.senderId)?.delete(messageId);
    if (message.recipientId) {
      this.userMessages.get(message.recipientId)?.delete(messageId);
      const conversationId = this.getConversationId(message.senderId, message.recipientId);
      this.conversationMessages.get(conversationId)?.delete(messageId);
    }
    
    // Remove message
    this.messages.delete(messageId);
    return true;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userMessageIds = this.userMessages.get(userId);
    if (!userMessageIds) return 0;
    
    let count = 0;
    for (const messageId of userMessageIds) {
      const message = this.messages.get(messageId);
      if (message && 
          message.recipientId === userId && 
          message.deliveryStatus !== DeliveryStatus.READ) {
        count++;
      }
    }
    
    return count;
  }
}