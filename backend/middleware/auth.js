// Import required packages
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * MIDDLEWARE: Protect routes - verify JWT token
 * This middleware checks if user is authenticated before accessing protected routes
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, user is not authenticated
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
      });
    }

    try {
      // Verify token using JWT_SECRET from .env
      // This decodes the token and checks if it's valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database using ID from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user still exists in database
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      // Check if user account is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // User is authenticated, proceed to next middleware/controller
      next();
    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * MIDDLEWARE: Optional authentication
 * Doesn't block request if no token, but sets req.user if token exists
 * Useful for routes that work both for logged-in and guest users
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If token exists, try to authenticate
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, but don't block the request
        req.user = null;
      }
    }

    // Continue regardless of authentication status
    next();
  } catch (error) {
    // Continue even if error occurs
    next();
  }
};