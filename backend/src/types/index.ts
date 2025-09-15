export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId?: string;
  type: MessageType;
  createdAt: Date;
  deliveryStatus: DeliveryStatus;
}

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  TYPING = 'typing'
}

export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}