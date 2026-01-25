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
// IMPORT ROUTES
// ============================================
const loginRoutes = require('./routes/loginRoutes');
const movieRoutes = require('./routes/movieRoutes');
// const recommendationRoutes = require('./routes/recommendationRoutes');
const watchHistoryRoutes = require('./routes/watchHistoryRoutes');
// const watchPartyRoutes = require('./routes/watchPartyRoutes');

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS - allows frontend to communicate with backend
app.use(cors());

// Parse JSON request bodies
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

// API ROUTES
app.use('/api/login', loginRoutes);
app.use('/api/movies', movieRoutes);

// Recommendation routes
// app.use('/api/recommendations', recommendationRoutes);
app.use('/api/watchhistory', watchHistoryRoutes);

// Watch party routes
// app.use('/api/watchparty', watchPartyRoutes);

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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});