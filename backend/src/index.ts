import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.ts';
import { SocketHandler } from './socket/socket.handler.ts';
import { AuthService } from './services/auth.service.ts';
import { MessageService } from './services/message.service.ts';
import { UserService } from './services/user.service.ts';

const PORT = process.env.PORT || 3001;

// Initialize services
const userService = new UserService();
const authService = new AuthService(userService);
const messageService = new MessageService();

// Create app with shared services
const app = createApp(userService, authService);
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Initialize socket handler
new SocketHandler(io, authService, messageService, userService);

// Export services for use in app
export { userService, authService, messageService };

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});