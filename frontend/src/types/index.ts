export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  recipientId?: string;
  type: MessageType;
  createdAt: string;
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
  isTyping: boolean;
  timestamp: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}