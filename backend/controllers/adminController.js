const User = require('../models/User');
const Movie = require('../models/Movie');
const Recommendation = require('../models/Recommendation');
const WatchHistory = require('../models/WatchHistory');
const WatchParty = require('../models/WatchParty');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalRecommendations,
      totalWatchHistory,
      totalWatchParties,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Recommendation.countDocuments(),
      WatchHistory.countDocuments(),
      WatchParty.countDocuments(),
      User.find().sort('-createdAt').limit(5).select('name email createdAt')
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMovies,
          totalRecommendations,
          totalWatchHistory,
          totalWatchParties
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};