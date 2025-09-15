# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, TypeScript, and WebSockets.

## Features

### Core Features
- User registration and JWT-based authentication
- Real-time messaging using WebSockets
- Message persistence with in-memory storage
- Rate limiting (max 10 messages per minute per user)
- Input validation and error handling
- Responsive design (mobile-friendly)
- Connection state management

### Additional Features
- Message history pagination
- Private/direct messaging
- Typing indicators
- Message delivery status
- User online/offline status
- Docker containerization

## Tech Stack

- **Frontend**: React, TypeScript, Socket.io-client
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest, React Testing Library
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/GabeHydden/realtime-chat-app.git
cd realtime-chat-app
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### Running the Application

#### Development Mode
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm start
```

#### Using Docker
```bash
docker-compose up
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### WebSocket Events
- `connection` - Client connects
- `disconnect` - Client disconnects
- `message` - Send/receive messages
- `typing` - Typing indicators
- `user-status` - Online/offline status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.