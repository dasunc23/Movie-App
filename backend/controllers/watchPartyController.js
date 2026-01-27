// Import models and services
const WatchParty = require('../models/WatchParty');
const Movie = require('../models/Movie');
const aiService = require('../services/aiService');
const tmdbService = require('../services/tmdbService');

/**
 * @desc    Create a new watch party
 * @route   POST /api/watchparty
 * @access  Private
 */
exports.createParty = async (req, res) => {
  try {
    const { name, scheduledFor } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a party name'
      });
    }

    // Generate unique invite code
    const inviteCode = generateInviteCode();

    // Create watch party
    const party = await WatchParty.create({
      name,
      createdBy: req.user.id,
      members: [
        {
          user: req.user.id,
          hasResponded: false,
          joinedAt: new Date()
        }
      ],
      scheduledFor: scheduledFor || null,
      inviteCode,
      status: 'active'
    });

    // Populate creator details
    await party.populate('createdBy', 'name email avatar');
    await party.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Watch party created successfully',
      data: party
    });
  } catch (error) {
    console.error('Create party error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating watch party',
      error: error.message
    });
  }
};

/**
 * @desc    Get party by ID
 * @route   GET /api/watchparty/:id
 * @access  Private
 */
exports.getPartyById = async (req, res) => {
  try {
    const party = await WatchParty.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('groupRecommendation.movies');

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    // Check if user is a member of this party
    const isMember = party.members.some(
      (member) => member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this party'
      });
    }

    res.status(200).json({
      success: true,
      data: party
    });
  } catch (error) {
    console.error('Get party error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching party details',
      error: error.message
    });
  }
};

/**
 * @desc    Join party using invite code
 * @route   POST /api/watchparty/join/:inviteCode
 * @access  Private
 */
exports.joinParty = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { guestName } = req.body; // Optional for non-registered users

    // Find party by invite code
    const party = await WatchParty.findOne({ inviteCode, status: 'active' });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code or party no longer active'
      });
    }

    // Check if user is already a member
    const alreadyMember = party.members.some(
      (member) => member.user && member.user.toString() === req.user.id
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this party'
      });
    }

    // Add user to members
    party.members.push({
      user: req.user.id,
      guestName: guestName || null,
      hasResponded: false,
      joinedAt: new Date()
    });

    await party.save();

    // Populate details
    await party.populate('createdBy', 'name email avatar');
    await party.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Joined party successfully',
      data: party
    });
  } catch (error) {
    console.error('Join party error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining party',
      error: error.message
    });
  }
};

/**
 * @desc    Submit preferences for watch party
 * @route   POST /api/watchparty/:id/preferences
 * @access  Private
 */
exports.submitPreferences = async (req, res) => {
  try {
    const { genres, moods, avoid } = req.body;

    const party = await WatchParty.findById(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    // Check if user is a member
    const memberIndex = party.members.findIndex(
      (member) => member.user.toString() === req.user.id
    );

    if (memberIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this party'
      });
    }

    // Update member's response status
    party.members[memberIndex].hasResponded = true;

    // Add preferences to party
    if (genres && genres.length > 0) {
      party.preferences.genres = [
        ...new Set([...party.preferences.genres, ...genres])
      ];
    }

    if (moods && moods.length > 0) {
      party.preferences.moods = [
        ...new Set([...party.preferences.moods, ...moods])
      ];
    }

    if (avoid && avoid.length > 0) {
      party.preferences.avoid = [
        ...new Set([...party.preferences.avoid, ...avoid])
      ];
    }

    await party.save();

    // Populate details
    await party.populate('createdBy', 'name email avatar');
    await party.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Preferences submitted successfully',
      data: party
    });
  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Generate group recommendations using AI
 * @route   POST /api/watchparty/:id/recommendations
 * @access  Private
 */
exports.generateGroupRecommendation = async (req, res) => {
  try {
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    // Check if user is the creator or a member
    const isMember = party.members.some(
      (member) => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this party'
      });
    }

    // Check if all members have responded
    const allResponded = party.members.every((member) => member.hasResponded);

    if (!allResponded) {
      return res.status(400).json({
        success: false,
        message: 'Not all members have submitted their preferences yet'
      });
    }

    // Prepare preferences for AI
    const memberPreferences = [
      {
        genres: party.preferences.genres,
        moods: party.preferences.moods
      }
    ];

    // Generate group recommendations using AI
    const aiResult = await aiService.generateGroupRecommendations(
      memberPreferences
    );

    // Search for recommended movies on TMDB
    const moviePromises = aiResult.movieTitles.map(async (title) => {
      try {
        const searchResult = await tmdbService.searchMovies(title, 1);

        if (searchResult.results && searchResult.results.length > 0) {
          const tmdbMovie = searchResult.results[0];

          // Check if movie exists in our DB
          let movie = await Movie.findOne({ tmdbId: tmdbMovie.id });

          // If not, create it
          if (!movie) {
            movie = await Movie.create({
              tmdbId: tmdbMovie.id,
              title: tmdbMovie.title,
              overview: tmdbMovie.overview,
              releaseDate: tmdbMovie.release_date,
              genres: tmdbMovie.genre_ids || [],
              posterPath: tmdbMovie.poster_path,
              backdropPath: tmdbMovie.backdrop_path,
              voteAverage: tmdbMovie.vote_average,
              voteCount: tmdbMovie.vote_count,
              originalLanguage: tmdbMovie.original_language,
              adult: tmdbMovie.adult,
              popularity: tmdbMovie.popularity
            });
          }

          return movie._id;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching movie "${title}":`, error.message);
        return null;
      }
    });

    // Wait for all movie fetches
    const movieIds = (await Promise.all(moviePromises)).filter(
      (id) => id !== null
    );

    // Update party with recommendations
    party.groupRecommendation = {
      movies: movieIds,
      explanation: aiResult.aiResponse
    };

    await party.save();

    // Populate all details
    await party.populate('createdBy', 'name email avatar');
    await party.populate('members.user', 'name email avatar');
    await party.populate('groupRecommendation.movies');

    res.status(200).json({
      success: true,
      message: 'Group recommendations generated successfully',
      data: party
    });
  } catch (error) {
    console.error('Generate group recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating group recommendations',
      error: error.message
    });
  }
};

/**
 * @desc    Update party status
 * @route   PATCH /api/watchparty/:id/status
 * @access  Private (Creator only)
 */
exports.updatePartyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be: active, completed, or cancelled'
      });
    }

    const party = await WatchParty.findById(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    // Check if user is the creator
    if (party.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the party creator can update status'
      });
    }

    party.status = status;
    await party.save();

    await party.populate('createdBy', 'name email avatar');
    await party.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Party status updated successfully',
      data: party
    });
  } catch (error) {
    console.error('Update party status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating party status',
      error: error.message
    });
  }
};

/**
 * @desc    Get all parties user is part of
 * @route   GET /api/watchparty/my-parties
 * @access  Private
 */
exports.getMyParties = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    const query = {
      'members.user': req.user.id
    };

    if (status) {
      query.status = status;
    }

    const parties = await WatchParty.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        parties,
        total: parties.length
      }
    });
  } catch (error) {
    console.error('Get my parties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parties',
      error: error.message
    });
  }
};

/**
 * @desc    Leave a watch party
 * @route   DELETE /api/watchparty/:id/leave
 * @access  Private
 */
exports.leaveParty = async (req, res) => {
  try {
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    // Check if user is the creator
    if (party.createdBy.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Party creator cannot leave. Delete the party instead.'
      });
    }

    // Remove user from members
    party.members = party.members.filter(
      (member) => member.user.toString() !== req.user.id
    );

    await party.save();

    res.status(200).json({
      success: true,
      message: 'Left party successfully'
    });
  } catch (error) {
    console.error('Leave party error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving party',
      error: error.message
    });
  }
};

/**
 * @desc    Delete watch party
 * @route   DELETE /api/watchparty/:id
 * @access  Private (Creator only)
 */
exports.deleteParty = async (req, res) => {
  try {
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    // Check if user is the creator
    if (party.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the party creator can delete the party'
      });
    }

    await party.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Watch party deleted successfully'
    });
  } catch (error) {
    console.error('Delete party error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting party',
      error: error.message
    });
  }
};

/**
 * Helper function to generate unique invite code
 */
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}