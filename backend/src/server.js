import express from 'express';
import http from 'http';
import { Server } from 'socket.io';\
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dietRoutes from './routes/dietRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bodyAnalysisRoutes from './routes/bodyAnalysisRoutes.js';
import progressPhotoRoutes from './routes/progressPhotoRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import { seedDemoUser } from './utils/seed.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── Socket.IO Server with JWT Auth ─────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available to controllers
app.set('io', io);

// Socket.IO JWT Middleware — Authenticate sockets
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.role = decoded.role;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Configure Settings
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-fitness-coach';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// ─── Middlewares ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Rate Limiting ──────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);

// ─── Database Connection ────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Successfully connected to MongoDB Database.');
    await seedDemoUser();
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.log('⚠️ Attempting fallback to In-Memory Database...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('⚡ Connected to In-Memory MongoDB Fallback.');
      await seedDemoUser();
    } catch (fallbackErr) {
      console.error('❌ In-Memory Fallback error:', fallbackErr.message);
    }
  }
};
connectDB();

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date(),
      uptime: process.uptime(),
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      aiProvider: process.env.ACTIVE_AI_PROVIDER || 'groq',
    },
  });
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/prompts', promptRoutes);
app.use('/api/body-analysis', bodyAnalysisRoutes);
app.use('/api/progress-photos', progressPhotoRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Socket.IO Events ────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

  // Join personal room
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
    console.log(`📦 User ${socket.userId} joined room user:${socket.userId}`);
  }

  // Join admin room
  if (socket.role === 'admin') {
    socket.join('admin');
    console.log(`👑 Admin joined admin room`);
  }

  // Chat send event
  socket.on('chat:send', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('chat:message', data);
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('chat:typing', { userId: socket.userId });
  });

  // Progress update broadcast
  socket.on('progress:update', (data) => {
    io.to(`user:${socket.userId}`).emit('progress:update', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `API endpoint '${req.originalUrl}' not found.` });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
    errors: process.env.NODE_ENV === 'development' ? [err.message] : [],
  });
});

// ─── Start Server ────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 AstraFit Backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`⚡ AI Provider: ${process.env.ACTIVE_AI_PROVIDER || 'groq'}`);
});
