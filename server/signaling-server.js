import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Enhanced CORS configuration for production
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://your-project-name.vercel.app', // Your Vercel frontend URL
      // Add more production URLs as needed
    ];
  } else {
    return [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ];
  }
};

const allowedOrigins = getCorsOrigins();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow local network access
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://192.168.')) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));

// Add express.json middleware for potential future API routes
app.use(express.json());

const server = http.createServer(app);

// Enhanced Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  // Production optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8 // 100MB max buffer size for large messages
});

// Store room data for tracking
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Total connections:', io.engine.clientsCount);

  // Join a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    
    const room = roomUsers.get(roomId);
    room.add(socket.id);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id);
    
    // Send existing users to the new user
    const otherUsers = Array.from(room).filter(id => id !== socket.id);
    socket.emit('existing-users', otherUsers);
    
    console.log(`User ${socket.id} joined room ${roomId}. Room size: ${room.size}`);
  });

  // WebRTC signaling events
  socket.on('offer', (data) => {
    console.log(`Offer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    console.log(`Answer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Code collaboration events
  socket.on('code-change', (data) => {
    console.log(`Code change in room ${data.roomId} from ${socket.id}`);
    socket.to(data.roomId).emit('code-change', {
      content: data.content,
      sender: socket.id,
      roomId: data.roomId,
      timestamp: data.timestamp
    });
  });

  socket.on('language-change', (data) => {
    console.log(`Language change to ${data.language} in room ${data.roomId} from ${socket.id}`);
    socket.to(data.roomId).emit('language-change', {
      language: data.language,
      sender: socket.id,
      roomId: data.roomId,
      timestamp: data.timestamp
    });
  });

  // Handle user ready for peer connection
  socket.on('ready', (roomId) => {
    console.log(`User ${socket.id} is ready in room ${roomId}`);
    socket.to(roomId).emit('user-ready', socket.id);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    
    // Remove user from all rooms and notify others
    for (const [roomId, users] of roomUsers.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        
        console.log(`User ${socket.id} removed from room ${roomId}. Remaining: ${users.size}`);
        
        // Clean up empty rooms
        if (users.size === 0) {
          roomUsers.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error for user', socket.id, ':', error);
  });

  // Heartbeat/ping (optional)
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    rooms: Array.from(roomUsers.entries()).map(([roomId, users]) => ({
      roomId,
      userCount: users.size
    })),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PS24 Signaling Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      websocket: '/socket.io/'
    }
  });
});

// 404 handler - FIXED: Use proper express 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PS24 Signaling Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🎯 Allowed origins:`, allowedOrigins);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});