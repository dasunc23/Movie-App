// Import express and create router
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getRecommendations,
  getRecommendationHistory,
  getRecommendationById,
  addFeedback,
  deleteRecommendation
} = require('../controllers/recommendationController');

// Import auth middleware (all routes require authentication)
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/recommendations
 * @desc    Get AI movie recommendations based on mood
 * @access  Private
 */
router.post('/', protect, getRecommendations);

/**
 * @route   GET /api/recommendations
 * @desc    Get user's recommendation history
 * @access  Private
 */
router.get('/', protect, getRecommendationHistory);

/**
 * @route   GET /api/recommendations/:id
 * @desc    Get single recommendation by ID
 * @access  Private
 */
router.get('/:id', protect, getRecommendationById);

/**
 * @route   PATCH /api/recommendations/:id/feedback
 * @desc    Add rating/feedback to recommendation
 * @access  Private
 */
router.patch('/:id/feedback', protect, addFeedback);

/**
 * @route   DELETE /api/recommendations/:id
 * @desc    Delete recommendation from history
 * @access  Private
 */
router.delete('/:id', protect, deleteRecommendation);

// Export router
module.exports = router;