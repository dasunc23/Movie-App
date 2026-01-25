// Import Movie model and TMDB service
const Movie = require('../models/Movie');
const tmdbService = require('../services/tmdbService');

/**
 * @desc    Search movies from TMDB
 * @route   GET /api/movies/search?query=batman&page=1
 * @access  Public
 */
exports.searchMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    // Validate search query
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    // Search movies from TMDB
    const results = await tmdbService.searchMovies(query, page);

    res.status(200).json({
      success: true,
      data: {
        page: results.page,
        totalPages: results.total_pages,
        totalResults: results.total_results,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching movies',
      error: error.message
    });
  }
};

/**
 * @desc    Get movie details by TMDB ID
 * @route   GET /api/movies/:tmdbId
 * @access  Public
 */
exports.getMovieById = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    // First, check if movie exists in our database
    let movie = await Movie.findOne({ tmdbId });

    // If not in our DB, fetch from TMDB and save it
    if (!movie) {
      const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);

      // Extract trailer key from videos
      let trailerKey = null;
      if (tmdbMovie.videos && tmdbMovie.videos.results.length > 0) {
        const trailer = tmdbMovie.videos.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        trailerKey = trailer ? trailer.key : null;
      }

      // Save movie to our database for future quick access
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

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movie details',
      error: error.message
    });
  }
};

/**
 * @desc    Get trending movies
 * @route   GET /api/movies/trending?timeWindow=week
 * @access  Public
 */
exports.getTrendingMovies = async (req, res) => {
  try {
    const { timeWindow = 'week' } = req.query; // 'day' or 'week'

    // Get trending movies from TMDB
    const results = await tmdbService.getTrendingMovies(timeWindow);

    res.status(200).json({
      success: true,
      data: {
        timeWindow,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending movies',
      error: error.message
    });
  }
};

/**
 * @desc    Get popular movies
 * @route   GET /api/movies/popular?page=1
 * @access  Public
 */
exports.getPopularMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;

    // Get popular movies from TMDB
    const results = await tmdbService.getPopularMovies(page);

    res.status(200).json({
      success: true,
      data: {
        page: results.page,
        totalPages: results.total_pages,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Get popular movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular movies',
      error: error.message
    });
  }
};

/**
 * @desc    Get top rated movies
 * @route   GET /api/movies/top-rated?page=1
 * @access  Public
 */
exports.getTopRatedMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;

    // Get top rated movies from TMDB
    const results = await tmdbService.getTopRatedMovies(page);

    res.status(200).json({
      success: true,
      data: {
        page: results.page,
        totalPages: results.total_pages,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Get top rated movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top rated movies',
      error: error.message
    });
  }
};

/**
 * @desc    Get movies by genre
 * @route   GET /api/movies/genre/:genreId?page=1
 * @access  Public
 */
exports.getMoviesByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1 } = req.query;

    // Get movies by genre from TMDB
    const results = await tmdbService.getMoviesByGenre(genreId, page);

    res.status(200).json({
      success: true,
      data: {
        genreId,
        page: results.page,
        totalPages: results.total_pages,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Get movies by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movies by genre',
      error: error.message
    });
  }
};

/**
 * @desc    Get all movie genres
 * @route   GET /api/movies/genres
 * @access  Public
 */
exports.getGenres = async (req, res) => {
  try {
    // Get genres list from TMDB
    const results = await tmdbService.getGenres();

    res.status(200).json({
      success: true,
      data: results.genres
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching genres',
      error: error.message
    });
  }
};

/**
 * @desc    Get similar movies
 * @route   GET /api/movies/:tmdbId/similar?page=1
 * @access  Public
 */
exports.getSimilarMovies = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const { page = 1 } = req.query;

    // Get similar movies from TMDB
    const results = await tmdbService.getSimilarMovies(tmdbId, page);

    res.status(200).json({
      success: true,
      data: {
        page: results.page,
        totalPages: results.total_pages,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Get similar movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching similar movies',
      error: error.message
    });
  }
};

/**
 * @desc    Get movie recommendations based on a movie
 * @route   GET /api/movies/:tmdbId/recommendations?page=1
 * @access  Public
 */
exports.getMovieRecommendations = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const { page = 1 } = req.query;

    // Get movie recommendations from TMDB
    const results = await tmdbService.getMovieRecommendations(tmdbId, page);

    res.status(200).json({
      success: true,
      data: {
        page: results.page,
        totalPages: results.total_pages,
        movies: results.results
      }
    });
  } catch (error) {
    console.error('Get movie recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movie recommendations',
      error: error.message
    });
  }
};