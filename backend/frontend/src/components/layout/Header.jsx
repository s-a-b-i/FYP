// components/Header.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPinIcon, SearchIcon, MessageCircle, Bell, Menu, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import logo from "../../assets/logo.svg";

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define routes where we show minimal header
  const minimalHeaderRoutes = ['/post', '/post/attributes'];
  const shouldShowMinimalHeader = minimalHeaderRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const profileMenuItems = [
    { label: "My ads", icon: "📄", onClick: () => navigate("/my-items") },
    { label: "Favourites & Saved searches", icon: "❤️", onClick: () => navigate("/favourites") },
    { label: "Buy Discounted Packages", icon: "🏷️", onClick: () => navigate("/packages") },
    { label: "Bought Packages & Billing", icon: "💳", onClick: () => navigate("/billing") },
    { label: "Help", icon: "❓", onClick: () => navigate("/help") },
    { label: "Settings", icon: "⚙️", onClick: () => navigate("/profile/settings") },
    { label: "Logout", icon: "🚪", onClick: handleLogout },
  ];

  const ProfileContent = () => (
    <div className="bg-card">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
          <img src="/profile-icon.png" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-foreground">Hello, {user?.name}</p>
          <button
            onClick={() => {
              navigate("/profile/edit");
              setIsProfileOpen(false);
            }}
            className="mt-2 px-4 py-2 text-sm text-primary-main border border-primary-main rounded-md hover:bg-primary-light transition-colors w-full"
          >
            View and edit profile
          </button>
        </div>
      </div>
      <div className="py-2">
        {profileMenuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              setIsProfileOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center gap-3 text-foreground transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Only render minimal header for specified routes
  if (shouldShowMinimalHeader) {
    return (
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <nav className="container py-4 flex items-center gap-4">
          {/* Back Icon */}
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Re-Fashion Hub Logo"
              className="h-8 md:h-12 w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
        </nav>
      </header>
    );
  }

  // Full header for all other routes
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <nav className="container py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt="Re-Fashion Hub Logo"
            className="h-8 md:h-12 w-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Location Dropdown */}
        <div className="hidden md:block w-56">
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <select className="form-input w-full pl-10">
              <option>Pakistan</option>
              <option>Other Locations</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Find ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-6 w-6" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-border focus:ring-2 focus:ring-ring"
                >
                  <img src="/profile-icon.png" alt="Profile" className="w-full h-full object-cover" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg border border-border overflow-hidden">
                    <ProfileContent />
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border">
          <div className="container py-4">
            <div className="divide-y divide-border">
              <div className="pb-4">
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select className="form-input w-full pl-10">
                    <option>Pakistan</option>
                    <option>Other Locations</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MessageCircle className="h-6 w-6" />
                        <span>Messages</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Bell className="h-6 w-6" />
                        <span>Notifications</span>
                      </button>
                    </div>
                    <ProfileContent />
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;