const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// All admin routes require authentication AND admin role
router.use(protect);
router.use(isAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', getAllUsers);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private (Admin)
 */
router.delete('/users/:id', deleteUser);

module.exports = router;