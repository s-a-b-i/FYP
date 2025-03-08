import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1/notifications';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const notificationAPI = {
  getUserNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.patch('/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};