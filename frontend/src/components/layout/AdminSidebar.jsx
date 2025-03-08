import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  AlertTriangle,
  FileText,
  Target,
  X,
  BarChart2
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/items', label: 'Items', icon: Package },
    { path:'/admin/moderated-items' , label: 'Moderated Items', icon: Package },
    { path: '/admin/moderation-stats', label: 'Moderation Stats', icon: BarChart2 },
    { path: '/admin/categories', label: 'Categories', icon: Package },
    { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/promotions', label: 'Promotions', icon: Target },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-20 lg:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-admin-sidebar shadow-sm
          border-r border-admin-border dark:bg-admin-sidebarDark dark:border-admin-borderDark 
          z-30 transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-admin-border dark:border-admin-borderDark">
          <h2 className="text-xl font-bold text-admin-text-primary dark:text-admin-textDark-primary">
            Admin Panel
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-admin-hover dark:hover:bg-admin-hoverDark rounded-lg"
          >
            <X className="h-5 w-5 text-admin-text-secondary dark:text-admin-textDark-secondary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-admin-accent-light dark:bg-admin-accentDark-light text-admin-accent-primary dark:text-admin-accentDark-primary'
                      : 'text-admin-text-secondary dark:text-admin-textDark-secondary hover:bg-admin-hover dark:hover:bg-admin-hoverDark'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-admin-border dark:border-admin-borderDark">
          <div className="flex items-center space-x-3 px-3 py-2 text-admin-text-secondary dark:text-admin-textDark-secondary">
            <div className="text-sm">
              <p className="font-medium">Admin Portal</p>
              <p className="text-admin-text-muted dark:text-admin-textDark-muted text-xs">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;