# Advanced Real-time Chat Application

A feature-rich real-time chat application built with Spring Boot backend and React frontend, supporting advanced messaging features.

## Tech Stack

### Backend
- **Spring Boot 3.2.5**
- **WebSocket with STOMP messaging**
- **JWT Authentication**
- **H2 Database** (in-memory)
- **Spring Data JPA**
- **Maven**
- **Spring Security**

### Frontend
- **React 18**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **STOMP.js** (WebSocket client)
- **Lucide React** (icons)

## Features

### 🔐 Authentication
- ✅ JWT-based login/register system
- ✅ User profile management
- ✅ Session persistence
- ✅ Secure API endpoints

### 💬 Chat Features
- ✅ Real-time public chat
- ✅ Private one-to-one messaging
- ✅ Message reactions with emoji support
- ✅ Typing indicators
- ✅ Message history
- ✅ File/image sharing
- ✅ Search functionality (messages & users)

### 👥 User Management
- ✅ Online users presence
- ✅ User profiles with avatars
- ✅ User status (Available, Busy, Away)
- ✅ Last seen tracking

### 🎨 UI/UX
- ✅ Modern responsive design
- ✅ Dark/light theme support
- ✅ Real-time notifications
- ✅ Mobile-friendly interface

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. **Register** a new account or **Login** with existing credentials
4. Explore the features:
   - **Public Chat**: Send messages to everyone
   - **Private Messages**: Click on users to start private conversations
   - **Online Users**: See who's currently online
   - **Profile Management**: Update your display name, bio, and status
   - **File Sharing**: Upload and share images/documents
   - **Search**: Find messages and users
   - **Reactions**: Add emoji reactions to messages
   - **Typing Indicators**: See when others are typing

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Chat & Messages
- `GET /api/messages` - Get recent messages (last 50)
- `GET /api/private/messages/{username}` - Get private messages
- `POST /api/private/send` - Send private message

### User Management
- `GET /api/presence/online-users` - Get online users
- `GET /api/presence/all-users` - Get all users with presence
- `GET /api/profile/{username}` - Get user profile
- `PUT /api/profile/{username}` - Update user profile

### Search & Files
- `GET /api/search/messages` - Search messages
- `GET /api/search/users` - Search users
- `POST /api/files/upload` - Upload files

### Reactions & Typing
- `POST /api/reactions` - Add/remove message reactions
- `POST /api/typing/start` - Start typing indicator
- `POST /api/typing/stop` - Stop typing indicator

### WebSocket Endpoints
- WebSocket endpoint: `/ws` (with SockJS fallback)
- Message destination: `/app/sendMessage`
- Private message destination: `/app/sendPrivateMessage`
- Typing destinations: `/app/startTyping`, `/app/stopTyping`
- Message subscription: `/topic/messages`
- Private message subscription: `/topic/private/{username}`
- Online users subscription: `/topic/online-users`
- Typing subscription: `/topic/typing/{room}`

## Database

The application uses H2 in-memory database. You can access the H2 console at:
`http://localhost:8080/h2-console`

- **JDBC URL**: `jdbc:h2:mem:chatdb`
- **Username**: `sa`
- **Password**: (empty)

## Project Structure

```
chat_Application/
├── backend/
│   ├── src/main/java/com/chat/backend/
│   │   ├── config/          # WebSocket configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── model/          # JPA entities
│   │   └── repository/     # JPA repositories
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── services/       # WebSocket service
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `ChatController.java`
2. **Frontend**: Add new components in `src/components/`
3. **Styling**: Modify `tailwind.config.js` for custom themes

### Environment Variables

Create `.env` files for different environments:

**Backend** (`backend/.env`):
```
SERVER_PORT=8080
DB_URL=jdbc:h2:mem:chatdb
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure backend is running on port 8080
   - Check browser console for errors
   - Verify CORS configuration

2. **Messages Not Loading**
   - Check H2 database connection
   - Verify API endpoint accessibility

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Maven cache: `mvn clean install`

## Performance

- Messages are limited to last 50 for performance
- WebSocket connection uses heartbeat for reliability
- Frontend uses virtual scrolling for large message lists

## Security

- Input validation on both frontend and backend
- XSS protection through React's built-in escaping
- CORS configured for development
- WebSocket connections validated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
