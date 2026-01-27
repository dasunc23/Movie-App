import api from './api';

/**
 * Create a new watch party
 */
export const createParty = async (name, scheduledFor = null) => {
  const response = await api.post('/watchparty', {
    name,
    scheduledFor
  });
  return response.data;
};

/**
 * Get party by ID
 */
export const getPartyById = async (id) => {
  const response = await api.get(`/watchparty/${id}`);
  return response.data;
};

/**
 * Join party using invite code
 */
export const joinParty = async (inviteCode, guestName = null) => {
  const response = await api.post(`/watchparty/join/${inviteCode}`, {
    guestName
  });
  return response.data;
};

/**
 * Submit preferences for watch party
 */
export const submitPreferences = async (id, genres, moods, avoid = []) => {
  const response = await api.post(`/watchparty/${id}/preferences`, {
    genres,
    moods,
    avoid
  });
  return response.data;
};

/**
 * Generate group recommendations
 */
export const generateGroupRecommendation = async (id) => {
  const response = await api.post(`/watchparty/${id}/recommendations`);
  return response.data;
};

/**
 * Update party status
 */
export const updatePartyStatus = async (id, status) => {
  const response = await api.patch(`/watchparty/${id}/status`, {
    status
  });
  return response.data;
};

/**
 * Get all parties user is part of
 */
export const getMyParties = async (status = null) => {
  const params = {};
  if (status) params.status = status;
  
  const response = await api.get('/watchparty/my-parties', { params });
  return response.data;
};

/**
 * Leave a watch party
 */
export const leaveParty = async (id) => {
  const response = await api.delete(`/watchparty/${id}/leave`);
  return response.data;
};

/**
 * Delete watch party
 */
export const deleteParty = async (id) => {
  const response = await api.delete(`/watchparty/${id}`);
  return response.data;
};