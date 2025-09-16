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


     /**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: User Registration
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 */

  router.post('/register', validateBody(registerSchema), authController.register);
    /**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
  router.post('/login', validateBody(loginSchema), authController.login);

 /**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh Token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refresh successful
 */

  router.post('/refresh', authController.refresh);

 /**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: My info
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details of logged in user
 */

  router.get('/me', authenticate, authController.me);

  return router;
};