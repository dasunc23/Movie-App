// Import mongoose
const mongoose = require('mongoose');

/**
 * MOVIE SCHEMA
 * Stores movie information (fetched from TMDB API and cached here)
 */
const movieSchema = new mongoose.Schema(
  {
    // TMDB movie ID (unique identifier from The Movie Database API)
    tmdbId: {
      type: Number,
      required: true,
      unique: true
    },

    // Movie title
    title: {
      type: String,
      required: [true, 'Movie must have a title'],
      trim: true
    },

    // Movie description/plot
    overview: {
      type: String,
      default: 'No overview available'
    },

    // Release year
    releaseDate: {
      type: Date
    },

    // Movie genres (Action, Drama, Comedy, etc.)
    genres: [
      {
        type: String,
        trim: true
      }
    ],

    // Movie poster image URL
    posterPath: {
      type: String,
      default: null
    },

    // Backdrop/banner image URL
    backdropPath: {
      type: String,
      default: null
    },

    // TMDB rating (0-10)
    voteAverage: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },

    // Number of votes on TMDB
    voteCount: {
      type: Number,
      default: 0
    },

    // Movie runtime in minutes
    runtime: {
      type: Number,
      default: 0
    },

    // Original language of the movie
    originalLanguage: {
      type: String,
      default: 'en'
    },

    // Streaming platforms where movie is available
    streamingPlatforms: [
      {
        name: String, // e.g., 'Netflix', 'Prime Video'
        link: String, // Optional link to the platform
        logo: String  // Platform logo URL
      }
    ],

    // Movie trailer/teaser video key (YouTube)
    trailerKey: {
      type: String,
      default: null
    },

    // Is the movie for adults only?
    adult: {
      type: Boolean,
      default: false
    },

    // Movie popularity score (from TMDB)
    popularity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true // Track when movie was added to our database
  }
);

/**
 * INDEX: For faster searches
 * Creates an index on title for quick text search
 */
movieSchema.index({ title: 'text' });

/**
 * INDEX: For filtering by TMDB ID
 */
movieSchema.index({ tmdbId: 1 });

// Export the Movie model
module.exports = mongoose.model('Movie', movieSchema);