import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import {
  Menu,
  ChevronDown,
  UserCircle,
  LogOut,
  Settings,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

const AdminHeader = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <header className="bg-admin-header border-b border-admin-border h-16 flex items-center px-4 shadow-sm dark:bg-admin-headerDark dark:border-admin-borderDark">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 hover:bg-admin-hover rounded-lg dark:hover:bg-admin-hoverDark"
      >
        <Menu className="h-6 w-6 text-admin-text-secondary dark:text-admin-textDark-secondary" />
      </button>
      
      <div className="flex-1 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-admin-text-primary dark:text-admin-textDark-primary">
          Admin Dashboard
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-admin-hover rounded-full dark:hover:bg-admin-hoverDark">
            <Bell className="h-5 w-5 text-admin-text-secondary dark:text-admin-textDark-secondary" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-admin-hover rounded-full dark:hover:bg-admin-hoverDark"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-admin-text-secondary dark:text-admin-textDark-secondary" />
            ) : (
              <Moon className="h-5 w-5 text-admin-text-secondary dark:text-admin-textDark-secondary" />
            )}
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 hover:bg-admin-hover rounded-lg dark:hover:bg-admin-hoverDark"
            >
              <div className="w-8 h-8 rounded-full bg-admin-accent-light dark:bg-admin-accentDark-light flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-admin-accent-primary" />
              </div>
              <span className="hidden md:block text-sm font-medium text-admin-text-secondary dark:text-admin-textDark-secondary">
                {user?.name || 'Admin'}
              </span>
              <ChevronDown className="h-4 w-4 text-admin-text-secondary dark:text-admin-textDark-secondary" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-admin-border dark:bg-admin-cardDark dark:border-admin-borderDark">
                <button className="w-full px-4 py-2 text-sm text-admin-text-secondary hover:bg-admin-hover flex items-center dark:text-admin-textDark-secondary dark:hover:bg-admin-hoverDark">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-sm text-admin-text-secondary hover:bg-admin-hover flex items-center dark:text-admin-textDark-secondary dark:hover:bg-admin-hoverDark"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;