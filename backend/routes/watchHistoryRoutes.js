// Import express and create router
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  addToWatchHistory,
  getWatchHistory,
  updateWatchStatus,
  removeFromWatchHistory,
  getWatchStats,
  toggleFavorite
} = require('../controllers/watchHistoryController');

// Import auth middleware (all routes require authentication)
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/watchhistory/stats
 * @desc    Get user's watch statistics
 * @access  Private
 */
router.get('/stats', protect, getWatchStats);

/**
 * @route   POST /api/watchhistory
 * @desc    Add movie to watch history (watchlist/watching/watched)
 * @access  Private
 */
router.post('/', protect, addToWatchHistory);

/**
 * @route   GET /api/watchhistory?status=watchlist&page=1
 * @desc    Get user's watch history with filters
 * @access  Private
 */
router.get('/', protect, getWatchHistory);

/**
 * @route   PATCH /api/watchhistory/:id
 * @desc    Update watch status, rating, or review
 * @access  Private
 */
router.patch('/:id', protect, updateWatchStatus);

/**
 * @route   DELETE /api/watchhistory/:id
 * @desc    Remove movie from watch history
 * @access  Private
 */
router.delete('/:id', protect, removeFromWatchHistory);

/**
 * @route   PATCH /api/watchhistory/:id/favorite
 * @desc    Toggle favorite status
 * @access  Private
 */
router.patch('/:id/favorite', protect, toggleFavorite);

// Export router
module.exports = router;