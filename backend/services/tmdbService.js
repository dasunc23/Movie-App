// Import axios for making HTTP requests
const axios = require('axios');

// TMDB API configuration from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL;

/**
 * HELPER: Create axios instance with base configuration
 */
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY // This gets added to every request automatically
  }
});

/**
 * Search movies by query
 * @param {String} query - Search term
 * @param {Number} page - Page number (default: 1)
 * @returns {Object} - Search results from TMDB
 */
exports.searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
        page,
        include_adult: false // Filter out adult content
      }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB search error:', error.message);
    throw new Error('Failed to search movies from TMDB');
  }
};

/**
 * Get movie details by TMDB ID
 * @param {Number} tmdbId - TMDB movie ID
 * @returns {Object} - Movie details
 */
exports.getMovieDetails = async (tmdbId) => {
  try {
    // Get movie details with additional data (videos, credits)
    const response = await tmdbApi.get(`/movie/${tmdbId}`, {
      params: {
        append_to_response: 'videos,credits,watch/providers'
      }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB get movie error:', error.message);
    throw new Error('Failed to get movie details from TMDB');
  }
};

/**
 * Get trending movies
 * @param {String} timeWindow - 'day' or 'week'
 * @returns {Object} - Trending movies
 */
exports.getTrendingMovies = async (timeWindow = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data;
  } catch (error) {
    console.error('TMDB trending error:', error.message);
    throw new Error('Failed to get trending movies from TMDB');
  }
};

/**
 * Get popular movies
 * @param {Number} page - Page number
 * @returns {Object} - Popular movies
 */
exports.getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB popular error:', error.message);
    throw new Error('Failed to get popular movies from TMDB');
  }
};

/**
 * Get top rated movies
 * @param {Number} page - Page number
 * @returns {Object} - Top rated movies
 */
exports.getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB top rated error:', error.message);
    throw new Error('Failed to get top rated movies from TMDB');
  }
};

/**
 * Get movies by genre
 * @param {Number} genreId - Genre ID
 * @param {Number} page - Page number
 * @returns {Object} - Movies in that genre
 */
exports.getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB genre error:', error.message);
    throw new Error('Failed to get movies by genre from TMDB');
  }
};

/**
 * Get all available genres
 * @returns {Object} - List of genres
 */
exports.getGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  } catch (error) {
    console.error('TMDB genres error:', error.message);
    throw new Error('Failed to get genres from TMDB');
  }
};

/**
 * Get similar movies
 * @param {Number} tmdbId - Movie ID
 * @param {Number} page - Page number
 * @returns {Object} - Similar movies
 */
exports.getSimilarMovies = async (tmdbId, page = 1) => {
  try {
    const response = await tmdbApi.get(`/movie/${tmdbId}/similar`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB similar error:', error.message);
    throw new Error('Failed to get similar movies from TMDB');
  }
};

/**
 * Get movie recommendations based on a movie
 * @param {Number} tmdbId - Movie ID
 * @param {Number} page - Page number
 * @returns {Object} - Recommended movies
 */
exports.getMovieRecommendations = async (tmdbId, page = 1) => {
  try {
    const response = await tmdbApi.get(`/movie/${tmdbId}/recommendations`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB recommendations error:', error.message);
    throw new Error('Failed to get movie recommendations from TMDB');
  }
};

/**
 * HELPER: Format movie poster URL
 * @param {String} posterPath - Poster path from TMDB
 * @param {String} size - Image size (w200, w300, w500, original)
 * @returns {String} - Full poster URL
 */
exports.formatPosterUrl = (posterPath, size = 'w500') => {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
};

/**
 * HELPER: Format backdrop URL
 * @param {String} backdropPath - Backdrop path from TMDB
 * @param {String} size - Image size (w780, w1280, original)
 * @returns {String} - Full backdrop URL
 */
exports.formatBackdropUrl = (backdropPath, size = 'w1280') => {
  if (!backdropPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
};