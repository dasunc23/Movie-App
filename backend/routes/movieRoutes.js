// Import express and create router
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  searchMovies,
  getMovieById,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMoviesByGenre,
  getGenres,
  getSimilarMovies,
  getMovieRecommendations
} = require('../controllers/movieController');

// Import optional auth middleware
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/movies/search?query=batman&page=1
 * @desc    Search movies by query
 * @access  Public
 */
router.get('/search', searchMovies);

/**
 * @route   GET /api/movies/trending?timeWindow=week
 * @desc    Get trending movies (day or week)
 * @access  Public
 */
router.get('/trending', getTrendingMovies);

/**
 * @route   GET /api/movies/popular?page=1
 * @desc    Get popular movies
 * @access  Public
 */
router.get('/popular', getPopularMovies);

/**
 * @route   GET /api/movies/top-rated?page=1
 * @desc    Get top rated movies
 * @access  Public
 */
router.get('/top-rated', getTopRatedMovies);

/**
 * @route   GET /api/movies/genres
 * @desc    Get all movie genres
 * @access  Public
 */
router.get('/genres', getGenres);

/**
 * @route   GET /api/movies/genre/:genreId?page=1
 * @desc    Get movies by genre ID
 * @access  Public
 */
router.get('/genre/:genreId', getMoviesByGenre);

/**
 * @route   GET /api/movies/:tmdbId/similar?page=1
 * @desc    Get similar movies
 * @access  Public
 */
router.get('/:tmdbId/similar', getSimilarMovies);

/**
 * @route   GET /api/movies/:tmdbId/recommendations?page=1
 * @desc    Get TMDB recommendations for a movie
 * @access  Public
 */
router.get('/:tmdbId/recommendations', getMovieRecommendations);

/**
 * @route   GET /api/movies/:tmdbId
 * @desc    Get movie details by TMDB ID
 * @access  Public
 */
router.get('/:tmdbId', getMovieById);

// Export router
module.exports = router;