import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
const PROFILE_URL = "http://localhost:5000/api/v1/profile";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  profile: null, // Add profile state
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

    // Fetch profile data
    fetchProfile: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${PROFILE_URL}/me`);
        set({ profile: response.data.data, isLoading: false });
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          set({ profile: null, isLoading: false }); // No profile exists for the user
        } else {
          set({ error: "Failed to fetch profile", isLoading: false });
        }
        throw error;
      }
    },


      // Update profile data
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.patch(`${PROFILE_URL}/update`, profileData);
      set({ profile: response.data.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: "Failed to update profile", isLoading: false });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isLoading: false,
      });
      throw error;
    }
  },

  // Login and fetch profile
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      // Fetch profile after login
      await useAuthStore.getState().fetchProfile();
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: "Error logging out",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  // Check auth and fetch profile
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      // Fetch profile after checking auth
      await useAuthStore.getState().fetchProfile();
      return response.data;
    } catch (error) {
      set({
        error: null,
        isCheckingAuth: false,
        isAuthenticated: false,
      });
    }
  },

  
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({
        isLoading: false,
        message: response.data.message,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error sending password reset email",
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
      set({ message: response.data.msg, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.msg || "Error resetting password",
      });
      throw error;
    }
  }
}));
