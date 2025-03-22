import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGeolocated } from "react-geolocated";
import { State } from "country-state-city";
import {
  MapPinIcon,
  SearchIcon,
  MessageCircle,
  Bell,
  Menu,
  X,
  ArrowLeft,
  FileText,
  Heart,
  Tag,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import logo from "../../assets/logo.svg";

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, profile, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("Pakistan");

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    const pakistanProvinces = State.getStatesOfCountry("PK");
    setProvinces(pakistanProvinces);
  }, []);

  const minimalHeaderRoutes = ["/post", "/post/attributes"];
  const shouldShowMinimalHeader = minimalHeaderRoutes.some((route) =>
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

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsLocationDropdownOpen(false);
  };

  const profileMenuItems = [
    { label: "My ads", icon: <FileText className="h-4 w-4" />, onClick: () => navigate("/my-items") },
    { label: "Favourites & Saved searches", icon: <Heart className="h-4 w-4" />, onClick: () => navigate("/favourites") },
    { label: "Buy Discounted Packages", icon: <Tag className="h-4 w-4" />, onClick: () => navigate("/packages") },
    { label: "Bought Packages & Billing", icon: <CreditCard className="h-4 w-4" />, onClick: () => navigate("/billing") },
    { label: "Help", icon: <HelpCircle className="h-4 w-4" />, onClick: () => navigate("/help") },
    { label: "Settings", icon: <Settings className="h-4 w-4" />, onClick: () => navigate("/profile/settings") },
    { label: "Logout", icon: <LogOut className="h-4 w-4" />, onClick: handleLogout },
  ];

  const ProfileContent = () => (
    <div className="bg-card">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
          <img
            src={profile?.profilePhoto || "/profile-icon.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">
            Hello, {profile?.name || user?.name}
          </p>
          <button
            onClick={() => {
              navigate("/profile/edit");
              setIsProfileOpen(false);
            }}
            className="mt-1 px-3 py-1 text-xs text-primary-main border border-primary-main rounded-md hover:bg-primary-light transition-colors w-full"
          >
            View and edit profile
          </button>
        </div>
      </div>
      <div className="py-1">
        {profileMenuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              setIsProfileOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 text-foreground transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const LocationDropdown = () => (
    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-50 h-64 overflow-y-auto">
      <div className="p-3 border-b hover:bg-gray-50 transition-colors">
        <button 
          onClick={() => handleLocationSelect("Current Location")}
          className="w-full flex items-center gap-2 text-blue-500"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
            <MapPinIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">Use current location</div>
            <div className="text-gray-500 text-xs">User denied Geolocation</div>
          </div>
        </button>
      </div>
      
      <div className="p-3 border-b hover:bg-gray-50 transition-colors">
        <button 
          onClick={() => handleLocationSelect("Pakistan")}
          className="w-full flex items-center gap-2"
        >
          <div className="w-8 h-8 flex items-center justify-center text-gray-500">
            <MapPinIcon className="h-5 w-5" />
          </div>
          <span className="font-medium text-sm">See ads in all Pakistan</span>
        </button>
      </div>
      
      <div className="px-3 py-2 text-gray-400 uppercase text-xs font-medium">
        Choose Region
      </div>
      
      {provinces.map((province) => (
        <div key={province.isoCode} className="px-3 py-2 border-t hover:bg-gray-50 transition-colors">
          <button
            onClick={() => handleLocationSelect(province.name)}
            className="w-full flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-500">
              <MapPinIcon className="h-5 w-5" />
            </div>
            <span className="font-medium text-sm">{province.name}, Pakistan</span>
          </button>
        </div>
      ))}
    </div>
  );

  if (shouldShowMinimalHeader) {
    return (
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <nav className="container py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
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

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <nav className="container py-4 flex items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt="Re-Fashion Hub Logo"
            className="h-8 md:h-12 w-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="hidden md:block w-72 relative">
          <button
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-700" />
              <span className="font-medium text-sm text-gray-800 truncate">{selectedLocation}</span>
            </div>
            <ChevronUp className={`h-4 w-4 transition-transform ${isLocationDropdownOpen ? '' : 'rotate-180'}`} />
          </button>
          
          {isLocationDropdownOpen && <LocationDropdown />}
        </div>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background text-sm"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-6 w-6" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-border focus:ring-2 focus:ring-ring"
                >
                  <img
                    src={profile?.profilePhoto || "/profile-icon.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
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
              className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
            >
              Login
            </button>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border">
          <div className="container py-4">
            <div className="divide-y divide-border">
              <div className="pb-4">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-700" />
                    <span className="font-medium text-sm text-gray-800 truncate">{selectedLocation}</span>
                  </div>
                  <ChevronUp className={`h-4 w-4 transition-transform ${isLocationDropdownOpen ? '' : 'rotate-180'}`} />
                </button>
                
                {isLocationDropdownOpen && <LocationDropdown />}
              </div>
              <div className="pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">Messages</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="text-sm">Notifications</span>
                      </button>
                    </div>
                    <ProfileContent />
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors text-sm"
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