import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { seedDatabase } from './utils/seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for seamless development and deployment
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for developer transparency
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'TaskPlanet Mini Social API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TaskPlanet Mini Social Post Application Backend API is running.',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Database connection logic with automatic MongoMemoryServer fallback
const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  try {
    if (mongoUri) {
      console.log('Connecting to provided MONGO_URI...');
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB via MONGO_URI');
    } else {
      console.log('⚠️ No MONGO_URI found in environment. Initializing MongoMemoryServer for instant zero-config setup...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ Connected to In-Memory MongoDB Server at: ${mongoUri}`);
    }

    // Auto-seed initial demo content if database is empty
    await seedDatabase();

  } catch (error) {
    console.error('Failed to connect to primary MongoDB, attempting fallback in-memory server:', error.message);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ Fallback: Connected to In-Memory MongoDB Server at: ${mongoUri}`);
      await seedDatabase();
    } catch (fallbackError) {
      console.error('❌ Critical MongoDB connection failure:', fallbackError);
      process.exit(1);
    }
  }
};

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TaskPlanet Social Server running on http://localhost:${PORT}`);
  });
});
