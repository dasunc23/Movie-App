// Import mongoose
const mongoose = require('mongoose');

/**
 * WATCH HISTORY SCHEMA
 * Tracks movies user has watched, is watching, or wants to watch
 */
const watchHistorySchema = new mongoose.Schema(
  {
    // Reference to the user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Reference to the movie
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },

    // Status of the movie for this user
    status: {
      type: String,
      enum: ['watchlist', 'watching', 'watched'], // Only these 3 values allowed
      default: 'watchlist',
      required: true
    },

    // User's personal rating (1-5 stars)
    userRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null // Null if user hasn't rated yet
    },

    // User's personal review/notes (optional)
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default: null
    },

    // When user marked this movie as watched
    watchedAt: {
      type: Date,
      default: null
    },

    // Is this a favorite movie?
    isFavorite: {
      type: Boolean,
      default: false
    },

    // How many times user rewatched this movie
    rewatchCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true // When added to watchlist/history
  }
);

/**
 * COMPOUND INDEX: Ensure user can't add same movie twice
 * (user + movie combination must be unique)
 */
watchHistorySchema.index({ user: 1, movie: 1 }, { unique: true });

/**
 * INDEX: Find all movies for a specific user with specific status
 */
watchHistorySchema.index({ user: 1, status: 1, createdAt: -1 });

// Export the WatchHistory model
module.exports = mongoose.model('WatchHistory', watchHistorySchema);