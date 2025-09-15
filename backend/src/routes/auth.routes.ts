import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../utils/validation';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const createAuthRoutes = (authService: AuthService, userService: UserService): Router => {
  const router = Router();
  const authController = new AuthController(authService);
  const authenticate = authMiddleware(authService, userService);

  router.post('/register', validateBody(registerSchema), authController.register);
  router.post('/login', validateBody(loginSchema), authController.login);
  router.post('/refresh', authController.refresh);
  router.get('/me', authenticate, authController.me);

  return router;
};