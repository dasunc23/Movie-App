import api from './api';

/**
 * Get AI movie recommendations based on mood
 */
export const getRecommendations = async (prompt) => {
  const response = await api.post('/recommendations', {
    prompt
  });
  return response.data;
};

/**
 * Get recommendation history
 */
export const getRecommendationHistory = async (page = 1, limit = 10) => {
  const response = await api.get('/recommendations', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Get single recommendation by ID
 */
export const getRecommendationById = async (id) => {
  const response = await api.get(`/recommendations/${id}`);
  return response.data;
};

/**
 * Add feedback to recommendation
 */
export const addFeedback = async (id, rating, comment) => {
  const response = await api.patch(`/recommendations/${id}/feedback`, {
    rating,
    comment
  });
  return response.data;
};

/**
 * Delete recommendation
 */
export const deleteRecommendation = async (id) => {
  const response = await api.delete(`/recommendations/${id}`);
  return response.data;
};