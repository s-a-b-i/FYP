import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import ItemDetails from './pages/items/ItemDetail';
import Profile from './pages/profile/Profile';
import Settings from './pages/profile/Settings';
import CreateItem from './pages/items/CreateItem';
import EditItem from './pages/items/EditItem';
import MyItems from './pages/items/MyItems.jsx';
import Transactions from './pages/transactions/Transactions';
import SaleTransaction from './pages/transactions/SaleTransaction';
import RentalTransaction from './pages/transactions/RentalTransaction';
import ExchangeTransaction from './pages/transactions/ExchangeTransaction';
import Messages from './pages/messages/Messages';
import ChatRoom from './pages/messages/ChatRoom';
import Reviews from './pages/reviews/Reviews';
import CreateReview from './pages/reviews/CreateReview';
import EditReview from './pages/reviews/EditReview';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ItemModeration from './pages/admin/ItemModeration';
import TransactionOverview from './pages/admin/TransactionOverview';
import DisputeManagement from './pages/admin/DisputeManagement';
import Reports from './pages/admin/Reports';
import PromotionManagement from './pages/admin/PromotionManagement';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import PostCategories from './pages/post/PostCategories';
import PostAttributes from './pages/post/PostAttributes';
import AdsByCategory from './pages/items/AdsByCategory'; // Ensure this is imported
import { ThemeProvider } from './context/ThemeContext';
import CategoriesMamagment from './pages/admin/CategoriesMamagment';
import ModeratedItems from './pages/admin/ModeratedItems';
import ModerationGraph from './pages/admin/ModerationGraph';

function AppContent() {
  const location = useLocation();
  const authPages = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.some(page => location.pathname.startsWith(page));
  const isAdminPage = location.pathname.startsWith('/admin');
  const showAddItemButton = !isAuthPage && !isAdminPage && 
                            !location.pathname.startsWith('/post') &&
                            location.pathname !== '/404';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  if (isAdminPage) {
    return (
      <ThemeProvider>
        <AdminLayout>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/items" element={<ItemModeration />} />
              <Route path="/admin/moderated-items" element={<ModeratedItems />} />
              <Route path="/admin/moderation-stats" element={<ModerationGraph />} />
              <Route path="/admin/categories" element={<CategoriesMamagment />} />
              <Route path="/admin/transactions" element={<TransactionOverview />} />
              <Route path="/admin/disputes" element={<DisputeManagement />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/promotions" element={<PromotionManagement />} />
            </Route>
          </Routes>
        </AdminLayout>
      </ThemeProvider>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/ads/category/:categoryId" element={<AdsByCategory />} /> {/* Ensure this route exists */}

        <Route element={<ProtectedRoute />}>
          <Route path="/profile/edit" element={<Profile />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/items/create" element={<CreateItem />} />
          <Route path="/items/edit/:id" element={<EditItem />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/sale/:id" element={<SaleTransaction />} />
          <Route path="/transactions/rental/:id" element={<RentalTransaction />} />
          <Route path="/transactions/exchange/:id" element={<ExchangeTransaction />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<ChatRoom />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/create/:transactionId" element={<CreateReview />} />
          <Route path="/reviews/edit/:id" element={<EditReview />} />
          
          {/* Updated Post routes with proper structure */}
          <Route path="/post" element={<PostCategories />} />
          <Route path="/post/attributes/:categoryId" element={<PostAttributes />} />
          <Route path="/post/create/:type/:categoryId" element={<CreateItem />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      {/* {showAddItemButton && <AddItemButton />} */}
    </Layout>
  );
}

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    // <Router>
    <>
      <AppContent />
      <Toaster />
      </>
    // </Router>
  );
}

export default App;