// Import express and create router
const express = require('express');
const router = express.Router();

// Import controller functions from loginController
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/loginController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/login/register
 * @desc    Register a new user
 * @access  Public (anyone can register)
 */
router.post('/register', register);

/**
 * @route   POST /api/login
 * @desc    Login user and get token
 * @access  Public (anyone can login)
 */
router.post('/', login);

/**
 * @route   POST /api/login/logout
 * @desc    Logout user
 * @access  Private (must be logged in)
 */
router.post('/logout', protect, logout);

/**
 * @route   GET /api/login/profile
 * @desc    Get current user's profile
 * @access  Private (requires authentication token)
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/login/profile
 * @desc    Update user profile (name, avatar, preferences)
 * @access  Private
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   PUT /api/login/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', protect, changePassword);

// Export router to use in server.js
module.exports = router;