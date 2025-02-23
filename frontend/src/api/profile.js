import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1/profile';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const profileAPI = {
  createProfile: async (profileData) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'profilePhoto') {
          if (typeof profileData[key] === 'object') {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      // Append profile photo if exists
      if (profileData.profilePhoto) {
        formData.append('profilePhoto', profileData.profilePhoto);
      }

      const response = await api.post('/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/me');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Return null for new users without a profile
      }
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'profilePhoto') {
          if (typeof profileData[key] === 'object') {
            // Ensure objects are properly stringified
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });
  
      // Append profile photo if exists
      if (profileData.profilePhoto instanceof File) {
        formData.append('profilePhoto', profileData.profilePhoto);
      }
  
      const response = await api.patch('/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  uploadProfilePhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await api.patch('/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true // Add this if using cookies for auth
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSocialConnections: async (platform, connected) => {
    try {
      const response = await api.patch('/social-connections', {
        platform,
        connected
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete('/delete-account');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};