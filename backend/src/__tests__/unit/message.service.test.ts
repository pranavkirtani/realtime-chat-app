import { MessageService } from '../../services/message.service';
import { MessageType, DeliveryStatus } from '../../types';

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('MessageService', () => {
  let messageService: MessageService;
  let mockIdCounter = 0;

  beforeEach(() => {
    messageService = new MessageService();
    jest.clearAllMocks();
    mockIdCounter = 0;
    (require('uuid').v4 as jest.Mock).mockImplementation(() => `test-message-id-${++mockIdCounter}`);
  });

  describe('create', () => {
    it('should create a text message successfully', async () => {
      const messageData = {
        content: 'Hello, world!',
        senderId: 'user1',
        recipientId: 'user2'
      };

      const message = await messageService.create(messageData);

      expect(message).toMatchObject({
        id: 'test-message-id-1',
        content: 'Hello, world!',
        senderId: 'user1',
        recipientId: 'user2',
        type: MessageType.TEXT,
        deliveryStatus: DeliveryStatus.SENT
      });
      expect(message.createdAt).toBeInstanceOf(Date);
    });

    it('should create a broadcast message without recipientId', async () => {
      const messageData = {
        content: 'Hello everyone!',
        senderId: 'user1'
      };

      const message = await messageService.create(messageData);

      expect(message.recipientId).toBeUndefined();
      expect(message.type).toBe(MessageType.TEXT);
    });

    it('should create a system message', async () => {
      const messageData = {
        content: 'User joined the chat',
        senderId: 'system',
        type: MessageType.SYSTEM
      };

      const message = await messageService.create(messageData);

      expect(message.type).toBe(MessageType.SYSTEM);
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update message delivery status', async () => {
      const message = await messageService.create({
        content: 'Test message',
        senderId: 'user1',
        recipientId: 'user2'
      });

      const updated = await messageService.updateDeliveryStatus(message.id, DeliveryStatus.DELIVERED);

      expect(updated?.deliveryStatus).toBe(DeliveryStatus.DELIVERED);
    });

    it('should return null for non-existent message', async () => {
      const result = await messageService.updateDeliveryStatus('non-existent-id', DeliveryStatus.READ);
      expect(result).toBeNull();
    });
  });

  describe('getMessages', () => {
    beforeEach(async () => {
      // Create test messages
      await messageService.create({ content: 'Message 1', senderId: 'user1' });
      await messageService.create({ content: 'Message 2', senderId: 'user1', recipientId: 'user2' });
      await messageService.create({ content: 'Message 3', senderId: 'user2', recipientId: 'user1' });
      await messageService.create({ content: 'Message 4', senderId: 'user3' });
    });

    it('should get all messages when no filter provided', async () => {
      const messages = await messageService.getMessages({});
      expect(messages).toHaveLength(4);
    });

    it('should filter messages by userId', async () => {
      const messages = await messageService.getMessages({ userId: 'user1' });
      expect(messages).toHaveLength(3); // user1 sent 2 and received 1
    });

    it('should apply pagination', async () => {
      const messages = await messageService.getMessages({ limit: 2, offset: 1 });
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Message 2');
      expect(messages[1].content).toBe('Message 3');
    });
  });

  describe('getConversation', () => {
    beforeEach(async () => {
      await messageService.create({ content: 'Hi', senderId: 'user1', recipientId: 'user2' });
      await messageService.create({ content: 'Hello', senderId: 'user2', recipientId: 'user1' });
      await messageService.create({ content: 'How are you?', senderId: 'user1', recipientId: 'user2' });
      await messageService.create({ content: 'Other conversation', senderId: 'user1', recipientId: 'user3' });
    });

    it('should get messages between two users', async () => {
      const messages = await messageService.getConversation('user1', 'user2');
      expect(messages).toHaveLength(3);
      expect(messages.every(m => 
        (m.senderId === 'user1' && m.recipientId === 'user2') ||
        (m.senderId === 'user2' && m.recipientId === 'user1')
      )).toBe(true);
    });

    it('should return same conversation regardless of user order', async () => {
      const messages1 = await messageService.getConversation('user1', 'user2');
      const messages2 = await messageService.getConversation('user2', 'user1');
      expect(messages1).toEqual(messages2);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message successfully', async () => {
      const message = await messageService.create({
        content: 'To be deleted',
        senderId: 'user1'
      });

      const result = await messageService.deleteMessage(message.id);
      expect(result).toBe(true);

      const messages = await messageService.getMessages({ userId: 'user1' });
      expect(messages).toHaveLength(0);
    });

    it('should return false for non-existent message', async () => {
      const result = await messageService.deleteMessage('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread messages for a user', async () => {
      const msg1 = await messageService.create({ content: 'Read message', senderId: 'user1', recipientId: 'user2' });
      const msg2 = await messageService.create({ content: 'Unread 1', senderId: 'user1', recipientId: 'user2' });
      await messageService.create({ content: 'Unread 2', senderId: 'user3', recipientId: 'user2' });
      
      // Mark first two messages as read
      await messageService.updateDeliveryStatus(msg1.id, DeliveryStatus.READ);
      await messageService.updateDeliveryStatus(msg2.id, DeliveryStatus.READ);

      const count = await messageService.getUnreadCount('user2');
      expect(count).toBe(1); // Only one unread message (the third one)
    });

    it('should return 0 for user with no messages', async () => {
      const count = await messageService.getUnreadCount('non-existent-user');
      expect(count).toBe(0);
    });
  });
});