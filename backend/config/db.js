// Import mongoose for MongoDB connection
const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * This function handles the database connection with error handling
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using connection string from .env
    // Note: useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log successful connection with host information
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    // Log error details if connection fails
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Exit process with failure code
    // This stops the server from running without a database connection
    process.exit(1);
  }
};

// Export the function so it can be used in server.js
module.exports = connectDB;