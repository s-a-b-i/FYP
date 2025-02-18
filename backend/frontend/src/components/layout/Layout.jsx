// components/layout/Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  // Define routes where the footer should not be shown
  const noFooterRoutes = ['/post', '/post/attributes'];

  // Check if the current route is in the noFooterRoutes array
  const shouldShowFooter = !noFooterRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

export default Layout;