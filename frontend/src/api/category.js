import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1/category';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const categoryAPI = {
  uploadCategoryImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('icon', imageFile);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/', categoryData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/${categoryId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/${categoryId}`, categoryData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteCategory: async (categoryId, forceDelete = false) => {
    try {
      const response = await api.delete(`/${categoryId}`, {
        data: { forceDelete },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  toggleCategoryStatus: async (categoryId) => {
    try {
      const response = await api.patch(`/${categoryId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  reorderCategories: async (orders) => {
    try {
      const response = await api.patch('/reorder', { orders });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCategoryStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPopularCategories: async (limit = 6) => {
    try {
      const response = await api.get(`/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPopularCategoriesWithItems: async (categoryLimit = 4, itemLimit = 5) => {
    try {
      const response = await api.get(`/popular-with-items?categoryLimit=${categoryLimit}&itemLimit=${itemLimit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
