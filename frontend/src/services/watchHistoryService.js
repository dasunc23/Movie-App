import api from './api';

/**
 * Add movie to watch history
 */
export const addToWatchHistory = async (tmdbId, status = 'watchlist', userRating = null, review = null) => {
  const response = await api.post('/watchhistory', {
    tmdbId,
    status,
    userRating,
    review
  });
  return response.data;
};

/**
 * Get watch history with filters
 */
export const getWatchHistory = async (status = null, page = 1, limit = 20) => {
  const params = { page, limit };
  if (status) params.status = status;
  
  const response = await api.get('/watchhistory', { params });
  return response.data;
};

/**
 * Update watch status
 */
export const updateWatchStatus = async (id, status, userRating = null, review = null, isFavorite = null) => {
  const data = { status };
  if (userRating !== null) data.userRating = userRating;
  if (review !== null) data.review = review;
  if (isFavorite !== null) data.isFavorite = isFavorite;
  
  const response = await api.patch(`/watchhistory/${id}`, data);
  return response.data;
};

/**
 * Remove from watch history
 */
export const removeFromWatchHistory = async (id) => {
  const response = await api.delete(`/watchhistory/${id}`);
  return response.data;
};

/**
 * Get watch statistics
 */
export const getWatchStats = async () => {
  const response = await api.get('/watchhistory/stats');
  return response.data;
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (id) => {
  const response = await api.patch(`/watchhistory/${id}/favorite`);
  return response.data;
};