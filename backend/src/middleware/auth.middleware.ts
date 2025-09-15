import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { TokenPayload } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload & { id: string };
  }
}

export const authMiddleware = (authService: AuthService, userService: UserService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.substring(7);
      
      try {
        const payload = authService.verifyToken(token);
        const user = await userService.findById(payload.userId);
        
        if (!user) {
          res.status(401).json({ error: 'User not found' });
          return;
        }

        req.user = {
          ...payload,
          id: payload.userId
        };
        
        next();
      } catch (_error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    } catch (_error) {
      res.status(500).json({ error: 'Authentication error' });
      return;
    }
  };
};