import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import devicesRoutes from './routes/devicesRoutes.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'Too many requests, try again later.' }
});
app.use('/api/auth', authLimiter);

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route (includes DB status)
import mongoose from 'mongoose';
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    dbState
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', devicesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`\n✅ API Endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - History: http://localhost:${PORT}/api/history`);
  console.log(`   - Settings: http://localhost:${PORT}/api/settings`);
  console.log(`   - Alerts: http://localhost:${PORT}/api/alerts\n`);
});

export default app;
