import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createAuthRoutes } from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rate-limit.middleware';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

dotenv.config();

export const createApp = (userService?: UserService, authService?: AuthService): Application => {
  const app = express();

  // Services - use provided services or create new ones
  const _userService = userService || new UserService();
  const _authService = authService || new AuthService(_userService);

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', apiRateLimiter);

  // Routes
  app.use('/api/auth', createAuthRoutes(_authService, _userService));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(errorHandler);

  return app;
};