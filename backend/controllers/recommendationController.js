// Import models and services
const Recommendation = require('../models/Recommendation');
const Movie = require('../models/Movie');
const aiService = require('../services/aiService');
const tmdbService = require('../services/tmdbService');

/**
 * @desc    Get AI movie recommendations based on user's mood
 * @route   POST /api/recommendations
 * @access  Private
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a mood/vibe description'
      });
    }

    if (prompt.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description too long. Please keep it under 500 characters.'
      });
    }

    // Get user's preferences from their profile
    const userPreferences = {
      genres: req.user.preferences?.genres || [],
      languages: req.user.preferences?.languages || []
    };

    // Generate AI recommendations
    const aiResult = await aiService.generateRecommendations(prompt, userPreferences);

    // Search for recommended movies on TMDB
    const moviePromises = aiResult.movieTitles.map(async (title) => {
      try {
        // Search movie on TMDB
        const searchResult = await tmdbService.searchMovies(title, 1);
        
        if (searchResult.results && searchResult.results.length > 0) {
          // Get the first result (most relevant)
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
              genres: tmdbMovie.genre_ids || [], //search results give IDs, not names
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

    // Wait for all movie fetches to complete
    const movieIds = (await Promise.all(moviePromises)).filter(id => id !== null);

    // Save recommendation to database
    const recommendation = await Recommendation.create({
      user: req.user.id,
      prompt,
      recommendedMovies: movieIds,
      aiResponse: aiResult.aiResponse,
      aiModel: aiResult.model
    });

    // Populate movie details
    await recommendation.populate('recommendedMovies');

    res.status(201).json({
      success: true,
      message: 'Recommendations generated successfully',
      data: {
        _id: recommendation._id,
        prompt: recommendation.prompt,
        aiResponse: recommendation.aiResponse,
        movies: recommendation.recommendedMovies,
        createdAt: recommendation.createdAt
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's recommendation history
 * @route   GET /api/recommendations?page=1&limit=10
 * @access  Private
 */
exports.getRecommendationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get recommendations with movie details
    const recommendations = await Recommendation.find({ user: req.user.id })
      .populate('recommendedMovies')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Recommendation.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get recommendation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendation history',
      error: error.message
    });
  }
};

/**
 * @desc    Get single recommendation by ID
 * @route   GET /api/recommendations/:id
 * @access  Private
 */
exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('recommendedMovies');

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Check if user owns this recommendation
    if (recommendation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this recommendation'
      });
    }

    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Get recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendation',
      error: error.message
    });
  }
};

/**
 * @desc    Add feedback to recommendation
 * @route   PATCH /api/recommendations/:id/feedback
 * @access  Private
 */
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Check ownership
    if (recommendation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recommendation'
      });
    }

    // Update feedback
    if (rating) recommendation.feedback.rating = rating;
    if (comment) recommendation.feedback.comment = comment;

    await recommendation.save();
    await recommendation.populate('recommendedMovies');

    res.status(200).json({
      success: true,
      message: 'Feedback added successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Delete recommendation
 * @route   DELETE /api/recommendations/:id
 * @access  Private
 */
exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Check ownership
    if (recommendation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recommendation'
      });
    }

    await recommendation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recommendation deleted successfully'
    });
  } catch (error) {
    console.error('Delete recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting recommendation',
      error: error.message
    });
  }
};