import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from './user.service';
import { RegisterDTO, LoginDTO, AuthTokens, TokenPayload, UserDTO } from '../types';

export class AuthService {
  constructor(private userService: UserService) {}

  async register(data: RegisterDTO): Promise<{ user: UserDTO; tokens: AuthTokens }> {
    const existingEmail = await this.userService.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const existingUsername = await this.userService.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.userService.create({
      ...data,
      password: hashedPassword
    });

    const userDTO = this.userService.toDTO(user);
    const tokens = this.generateTokens(user.id, user.email);

    return { user: userDTO, tokens };
  }

  async login(data: LoginDTO): Promise<{ user: UserDTO; tokens: AuthTokens }> {
    const user = await this.userService.findByEmail(data.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const userDTO = this.userService.toDTO(user);
    const tokens = this.generateTokens(user.id, user.email);

    return { user: userDTO, tokens };
  }

  generateTokens(userId: string, email: string): AuthTokens {
    const payload: TokenPayload = { userId, email };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '15m' } as jwt.SignOptions
    );
    
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string, isRefreshToken = false): TokenPayload {
    const secret = isRefreshToken 
      ? (process.env.JWT_REFRESH_SECRET || 'refresh-secret')
      : (process.env.JWT_SECRET || 'secret');
    
    return jwt.verify(token, secret) as TokenPayload;
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.verifyToken(refreshToken, true);
      const user = await this.userService.findById(payload.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user.id, user.email);
    } catch (_error) {
      throw new Error('Invalid refresh token');
    }
  }
}