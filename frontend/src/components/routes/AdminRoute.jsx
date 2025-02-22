// components/routes/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated but not an admin, redirect to the home page
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated and an admin, render the children (admin content)
  return <Outlet />;
};

export default AdminRoute;