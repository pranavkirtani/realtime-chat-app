import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { validateBody } from '../middleware/validation.middleware.ts';
import { registerSchema, loginSchema } from '../utils/validation.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { AuthService } from '../services/auth.service.ts';
import { UserService } from '../services/user.service.ts';

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