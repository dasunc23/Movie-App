import api from './api';

/**
 * Search movies by query
 */
export const searchMovies = async (query, page = 1) => {
  const response = await api.get('/movies/search', {
    params: { query, page }
  });
  return response.data;
};

/**
 * Get movie details by TMDB ID
 */
export const getMovieById = async (tmdbId) => {
  const response = await api.get(`/movies/${tmdbId}`);
  return response.data;
};

/**
 * Get trending movies
 */
export const getTrendingMovies = async (timeWindow = 'week') => {
  const response = await api.get('/movies/trending', {
    params: { timeWindow }
  });
  return response.data;
};

/**
 * Get popular movies
 */
export const getPopularMovies = async (page = 1) => {
  const response = await api.get('/movies/popular', {
    params: { page }
  });
  return response.data;
};

/**
 * Get top rated movies
 */
export const getTopRatedMovies = async (page = 1) => {
  const response = await api.get('/movies/top-rated', {
    params: { page }
  });
  return response.data;
};

/**
 * Get all movie genres
 */
export const getGenres = async () => {
  const response = await api.get('/movies/genres');
  return response.data;
};

/**
 * Get movies by genre
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  const response = await api.get(`/movies/genre/${genreId}`, {
    params: { page }
  });
  return response.data;
};

/**
 * Get similar movies
 */
export const getSimilarMovies = async (tmdbId, page = 1) => {
  const response = await api.get(`/movies/${tmdbId}/similar`, {
    params: { page }
  });
  return response.data;
};

/**
 * Get movie recommendations
 */
export const getMovieRecommendations = async (tmdbId, page = 1) => {
  const response = await api.get(`/movies/${tmdbId}/recommendations`, {
    params: { page }
  });
  return response.data;
};