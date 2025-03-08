// src/api/itemStatsAPI.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1/stats'; // Adjust base URL to your stats endpoint

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // For authentication cookies if needed
});

export const itemStatsAPI = {
  // Public route for recording interactions
  recordInteraction: async (itemId, type, interactionData = {}) => {
    try {
      const response = await api.post(`/${itemId}/interaction/${type}`, {
        userAgent: navigator.userAgent, // Automatically include user agent
        ipAddress: interactionData.ipAddress || null, // Optional, could be fetched from server
        referringUrl: document.referrer || null, // Automatically include referrer
        sessionDuration: interactionData.sessionDuration || null // Optional, from frontend tracking
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Authenticated route for getting detailed item statistics
  getItemStatistics: async (itemId, filters = {}) => {
    try {
      const { startDate, endDate } = filters;
      const response = await api.get(`/item/${itemId}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin routes
  getAdminStatsDashboard: async (period = '30d') => {
    try {
      const response = await api.get('/admin/dashboard', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateGeographicData: async (itemId, geoData) => {
    try {
      const response = await api.post(`/${itemId}/geo`, geoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRealTimeStats: async () => {
    try {
      const response = await api.get('/admin/realtime');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default itemStatsAPI;