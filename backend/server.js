// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS - allows frontend to communicate with backend
// This permits requests from different origins (e.g., React dev server on port 3000)
app.use(cors());

// Parse JSON request bodies
// This allows us to access req.body in our routes
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Root endpoint - test if API is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Moovie API is running!',
    version: '1.0.0',
    status: 'active'
  });
});

// Health check endpoint - useful for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// API ROUTES (will be added as we build)
// ============================================

// Authentication routes (login, register, etc.)
// app.use('/api/auth', require('./routes/auth'));

// Movie routes (search, get details, etc.)
// app.use('/api/movies', require('./routes/movies'));

// Recommendation routes (AI-powered suggestions)
// app.use('/api/recommendations', require('./routes/recommendations'));

// Watch history routes (user's watched movies)
// app.use('/api/watchhistory', require('./routes/watchHistory'));

// Watch party routes (group recommendations)
// app.use('/api/watchparty', require('./routes/watchParty'));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - catches requests to undefined routes
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Global error handler - catches all errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only show error stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

// Get port from environment variable or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start listening for requests
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});