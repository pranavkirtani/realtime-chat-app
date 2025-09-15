import { User, UserDTO } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private usernameIndex: Map<string, string> = new Map();

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    this.usernameIndex.set(user.username.toLowerCase(), user.id);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) || null : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const userId = this.usernameIndex.get(username.toLowerCase());
    return userId ? this.users.get(userId) || null : null;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      id: user.id,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    
    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.emailIndex.set(updates.email.toLowerCase(), id);
    }
    
    if (updates.username && updates.username !== user.username) {
      this.usernameIndex.delete(user.username.toLowerCase());
      this.usernameIndex.set(updates.username.toLowerCase(), id);
    }

    return updatedUser;
  }

  toDTO(user: User): UserDTO {
    const { password: _, ...userDTO } = user;
    return userDTO;
  }

  async getAllUsers(): Promise<UserDTO[]> {
    return Array.from(this.users.values()).map(user => this.toDTO(user));
  }
}