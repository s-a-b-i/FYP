// components/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated but not verified, redirect to the email verification page
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If the user is authenticated and verified, render the children (protected content)
  return <Outlet />;
};

export default ProtectedRoute;