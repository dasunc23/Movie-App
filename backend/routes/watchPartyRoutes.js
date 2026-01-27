// Import express and create router
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createParty,
  getPartyById,
  joinParty,
  submitPreferences,
  generateGroupRecommendation,
  updatePartyStatus,
  getMyParties,
  leaveParty,
  deleteParty
} = require('../controllers/watchPartyController');

// Import auth middleware (all routes require authentication)
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/watchparty/my-parties?status=active
 * @desc    Get all parties user is part of
 * @access  Private
 */
router.get('/my-parties', protect, getMyParties);

/**
 * @route   POST /api/watchparty
 * @desc    Create a new watch party
 * @access  Private
 */
router.post('/', protect, createParty);

/**
 * @route   POST /api/watchparty/join/:inviteCode
 * @desc    Join party using invite code
 * @access  Private
 */
router.post('/join/:inviteCode', protect, joinParty);

/**
 * @route   GET /api/watchparty/:id
 * @desc    Get party details by ID
 * @access  Private
 */
router.get('/:id', protect, getPartyById);

/**
 * @route   POST /api/watchparty/:id/preferences
 * @desc    Submit member preferences
 * @access  Private
 */
router.post('/:id/preferences', protect, submitPreferences);

/**
 * @route   POST /api/watchparty/:id/recommendations
 * @desc    Generate AI group recommendations
 * @access  Private
 */
router.post('/:id/recommendations', protect, generateGroupRecommendation);

/**
 * @route   PATCH /api/watchparty/:id/status
 * @desc    Update party status (creator only)
 * @access  Private
 */
router.patch('/:id/status', protect, updatePartyStatus);

/**
 * @route   DELETE /api/watchparty/:id/leave
 * @desc    Leave a watch party
 * @access  Private
 */
router.delete('/:id/leave', protect, leaveParty);

/**
 * @route   DELETE /api/watchparty/:id
 * @desc    Delete watch party (creator only)
 * @access  Private
 */
router.delete('/:id', protect, deleteParty);

// Export router
module.exports = router;