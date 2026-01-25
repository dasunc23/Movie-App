// Import models
const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');
const tmdbService = require('../services/tmdbService');

/**
 * @desc    Add movie to watchlist or update status
 * @route   POST /api/watchhistory
 * @access  Private
 */
exports.addToWatchHistory = async (req, res) => {
  try {
    const { tmdbId, status = 'watchlist', userRating, review } = req.body;

    // Validate required fields
    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie TMDB ID'
      });
    }

    // Validate status
    const validStatuses = ['watchlist', 'watching', 'watched'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be: watchlist, watching, or watched'
      });
    }

    // Check if movie exists in our database, if not fetch from TMDB
    let movie = await Movie.findOne({ tmdbId });

    if (!movie) {
      // Fetch movie details from TMDB
      const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);

      // Extract trailer key
      let trailerKey = null;
      if (tmdbMovie.videos && tmdbMovie.videos.results.length > 0) {
        const trailer = tmdbMovie.videos.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        trailerKey = trailer ? trailer.key : null;
      }

      // Save movie to database
      movie = await Movie.create({
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        genres: tmdbMovie.genres.map((g) => g.name),
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        runtime: tmdbMovie.runtime,
        originalLanguage: tmdbMovie.original_language,
        trailerKey: trailerKey,
        adult: tmdbMovie.adult,
        popularity: tmdbMovie.popularity
      });
    }

    // Check if user already has this movie in their history
    let watchHistory = await WatchHistory.findOne({
      user: req.user.id,
      movie: movie._id
    });

    if (watchHistory) {
      // Update existing record
      watchHistory.status = status;
      if (userRating) watchHistory.userRating = userRating;
      if (review) watchHistory.review = review;
      if (status === 'watched' && !watchHistory.watchedAt) {
        watchHistory.watchedAt = new Date();
      }

      await watchHistory.save();

      // Populate movie details
      await watchHistory.populate('movie');

      return res.status(200).json({
        success: true,
        message: 'Watch history updated successfully',
        data: watchHistory
      });
    }

    // Create new watch history record
    watchHistory = await WatchHistory.create({
      user: req.user.id,
      movie: movie._id,
      status,
      userRating: userRating || null,
      review: review || null,
      watchedAt: status === 'watched' ? new Date() : null
    });

    // Populate movie details
    await watchHistory.populate('movie');

    res.status(201).json({
      success: true,
      message: 'Added to watch history successfully',
      data: watchHistory
    });
  } catch (error) {
    console.error('Add to watch history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to watch history',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's watch history (with filters)
 * @route   GET /api/watchhistory?status=watchlist&page=1&limit=20
 * @access  Private
 */
exports.getWatchHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = '-createdAt' } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get watch history with movie details
    const watchHistory = await WatchHistory.find(query)
      .populate('movie')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await WatchHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        watchHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watch history',
      error: error.message
    });
  }
};

/**
 * @desc    Update watch status
 * @route   PATCH /api/watchhistory/:id
 * @access  Private
 */
exports.updateWatchStatus = async (req, res) => {
  try {
    const { status, userRating, review, isFavorite } = req.body;

    // Find watch history item
    let watchHistory = await WatchHistory.findById(req.params.id);

    if (!watchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Watch history item not found'
      });
    }

    // Check if user owns this record
    if (watchHistory.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    // Update fields
    if (status) {
      watchHistory.status = status;
      if (status === 'watched' && !watchHistory.watchedAt) {
        watchHistory.watchedAt = new Date();
      }
    }
    if (userRating !== undefined) watchHistory.userRating = userRating;
    if (review !== undefined) watchHistory.review = review;
    if (isFavorite !== undefined) watchHistory.isFavorite = isFavorite;

    await watchHistory.save();
    await watchHistory.populate('movie');

    res.status(200).json({
      success: true,
      message: 'Watch history updated successfully',
      data: watchHistory
    });
  } catch (error) {
    console.error('Update watch status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating watch status',
      error: error.message
    });
  }
};

/**
 * @desc    Remove movie from watch history
 * @route   DELETE /api/watchhistory/:id
 * @access  Private
 */
exports.removeFromWatchHistory = async (req, res) => {
  try {
    const watchHistory = await WatchHistory.findById(req.params.id);

    if (!watchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Watch history item not found'
      });
    }

    // Check if user owns this record
    if (watchHistory.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

    await watchHistory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Removed from watch history successfully'
    });
  } catch (error) {
    console.error('Remove from watch history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from watch history',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's watch statistics
 * @route   GET /api/watchhistory/stats
 * @access  Private
 */
exports.getWatchStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total counts for each status
    const totalWatchlist = await WatchHistory.countDocuments({
      user: userId,
      status: 'watchlist'
    });

    const totalWatching = await WatchHistory.countDocuments({
      user: userId,
      status: 'watching'
    });

    const totalWatched = await WatchHistory.countDocuments({
      user: userId,
      status: 'watched'
    });

    // Get total favorites
    const totalFavorites = await WatchHistory.countDocuments({
      user: userId,
      isFavorite: true
    });

    // Get watched movies with movie details for genre analysis
    const watchedMovies = await WatchHistory.find({
      user: userId,
      status: 'watched'
    }).populate('movie');

    // Calculate total runtime (in hours)
    let totalRuntime = 0;
    const genreCount = {};

    watchedMovies.forEach((item) => {
      if (item.movie && item.movie.runtime) {
        totalRuntime += item.movie.runtime;
      }

      // Count genres
      if (item.movie && item.movie.genres) {
        item.movie.genres.forEach((genre) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    // Find favorite genre (most watched)
    let favoriteGenre = null;
    let maxCount = 0;
    Object.entries(genreCount).forEach(([genre, count]) => {
      if (count > maxCount) {
        favoriteGenre = genre;
        maxCount = count;
      }
    });

    // Calculate average rating
    const ratedMovies = watchedMovies.filter((item) => item.userRating);
    const averageRating =
      ratedMovies.length > 0
        ? ratedMovies.reduce((sum, item) => sum + item.userRating, 0) /
          ratedMovies.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        counts: {
          watchlist: totalWatchlist,
          watching: totalWatching,
          watched: totalWatched,
          favorites: totalFavorites,
          total: totalWatchlist + totalWatching + totalWatched
        },
        watchedStats: {
          totalMovies: totalWatched,
          totalHours: Math.round(totalRuntime / 60),
          totalMinutes: totalRuntime,
          averageRating: Math.round(averageRating * 10) / 10,
          favoriteGenre,
          genreBreakdown: genreCount
        }
      }
    });
  } catch (error) {
    console.error('Get watch stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watch statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle favorite status
 * @route   PATCH /api/watchhistory/:id/favorite
 * @access  Private
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const watchHistory = await WatchHistory.findById(req.params.id);

    if (!watchHistory) {
      return res.status(404).json({
        success: false,
        message: 'Watch history item not found'
      });
    }

    // Check if user owns this record
    if (watchHistory.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    // Toggle favorite
    watchHistory.isFavorite = !watchHistory.isFavorite;
    await watchHistory.save();
    await watchHistory.populate('movie');

    res.status(200).json({
      success: true,
      message: watchHistory.isFavorite
        ? 'Added to favorites'
        : 'Removed from favorites',
      data: watchHistory
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
};