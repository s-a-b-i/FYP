import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1/item';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const itemAPI = {
  // Public routes
  getItems: async (params = {}) => {
    try {
      const { category, sort, limit = 10, city, minPrice, maxPrice, type } = params;
      const response = await api.get('/', {
        params: {
          category,
          sort,
          limit,
          city,
          minPrice,
          maxPrice,
          type,
        },
      });
      console.log('API Request Query:', response.config.params); // Debug log
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  searchItems: async (query, category, type, minPrice, maxPrice, condition, location) => {
    try {
      const response = await api.get('/search', {
        params: { query, category, type, minPrice, maxPrice, condition, location },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getFeaturedItems: async () => {
    try {
      const response = await api.get('/featured');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getItemById: async (itemId) => {
    try {
      const response = await api.get(`/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRelatedItems: async (itemId) => {
    try {
      const response = await api.get(`/${itemId}/related`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  incrementItemStats: async (itemId, type) => {
    try {
      const response = await api.patch(`/${itemId}/stats/${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  checkItemStatus: async (itemId) => {
    try {
      const response = await api.get(`/${itemId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Authenticated user routes
  getUserItems: async (status) => {
    try {
      const response = await api.get('/user/items', {
        params: { status },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUserItemStats: async (period = '30d') => {
    try {
      const response = await api.get('/user/stats', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createItem: async (itemData) => {
    try {
      const response = await api.post('/', itemData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Override default JSON header
        },
      });
      console.log('API response images:', response.data.data.images.length); // Debug log
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateItem: async (itemId, itemData) => {
    try {
      const response = await api.put(`/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteItem: async (itemId) => {
    try {
      const response = await api.delete(`/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  toggleItemStatus: async (itemId) => {
    try {
      const response = await api.patch(`/${itemId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markItemAsSold: async (itemId) => {
    try {
      const response = await api.patch(`/${itemId}/sold`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  extendItemVisibility: async (itemId, days) => {
    try {
      const response = await api.patch(`/${itemId}/extend`, { days });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  uploadItemImages: async (itemId, imageFiles) => {
    try {
      const formData = new FormData();
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }
      const response = await api.post(`/${itemId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateItemImages: async (itemId, imagesData) => {
    try {
      const response = await api.put(`/${itemId}/images`, { images: imagesData });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteItemImage: async (itemId, imageId) => {
    try {
      const response = await api.delete(`/${itemId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin routes
  getItemsPendingModeration: async (page = 1, limit = 10, category) => {
    try {
      const response = await api.get('/admin/pending', {
        params: { page, limit, category },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getItemForModeration: async (itemId) => {
    try {
      const response = await api.get(`/admin/moderation/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModerationStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModeratedItems: async (
    page = 1,
    limit = 10,
    status = '',
    moderator = '',
    startDate = '',
    endDate = '',
    search = ''
  ) => {
    try {
      const response = await api.get('/admin/moderated', {
        params: { page, limit, status, moderator, startDate, endDate, search },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  moderateItem: async (itemId, moderationData) => {
    try {
      const response = await api.put(`admin/moderate/${itemId}`, moderationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  bulkModerateItems: async (bulkData) => {
    try {
      const response = await api.post('/admin/bulk-moderate', bulkData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  reviseModeration: async (itemId, revisionData) => {
    try {
      const response = await api.patch(`/admin/revise/${itemId}`, revisionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAdminDashboardStats: async (period = '30d') => {
    try {
      const response = await api.get('/admin/dashboard-stats', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};