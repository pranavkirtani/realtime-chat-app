import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000')
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    userService = new UserService();
    authService = new AuthService(userService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

      const result = await authService.register(registerData);

      expect(userService.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(userService.findByUsername).toHaveBeenCalledWith(registerData.username);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow('Email already registered');
    });

    it('should throw error if username already exists', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

      const result = await authService.login(loginData);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      process.env.JWT_SECRET = 'secret';
      process.env.JWT_REFRESH_SECRET = 'refresh-secret';
      (jwt.sign as jest.Mock).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const tokens = authService.generateTokens('1', 'test@example.com');

      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockPayload = { userId: '1', email: 'test@example.com' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken('invalid-token')).toThrow();
    });
  });
});