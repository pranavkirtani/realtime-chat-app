import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.ts';
import { RegisterDTO, LoginDTO } from '../types/index.ts';
import { AppError } from '../middleware/error.middleware.ts';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request<unknown, unknown, RegisterDTO>, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      if (message.includes('already')) {
        return next(new AppError(message, 409));
      }
      next(error);
    }
  };

  login = async (req: Request<unknown, unknown, LoginDTO>, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message === 'Invalid credentials') {
        return next(new AppError(message, 401));
      }
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return next(new AppError('Refresh token required', 400));
      }

      const tokens = await this.authService.refreshTokens(refreshToken);
      
      res.json({
        status: 'success',
        data: { tokens }
      });
    } catch (_error) {
      next(new AppError('Invalid refresh token', 401));
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        status: 'success',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  };
}