import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onPasswordModalOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onPasswordModalOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const colors = [
    'text-yellow-400',
    'text-cyan-400',
    'text-orange-400',
    'text-emerald-400',
    'text-pink-400',
    'text-violet-400',
    'text-lime-400',
    'text-amber-400'
  ];

  const visionText = "Trust you can take a year to build but a minute to destroy";

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, 2000); // Slower color change for better readability

    return () => {
      clearInterval(colorInterval);
    };
  }, [colors.length]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Animated Vision Text */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 py-3 fixed top-0 left-0 right-0 z-50 overflow-hidden border-b-2 border-blue-600/30 shadow-lg">
        <div className="animate-marquee whitespace-nowrap animate-pulse-text">
          <span
            className={`inline-block px-6 text-base font-extrabold uppercase tracking-wider transition-all duration-1000 ${
              colors[currentColorIndex]
            }`}
            style={{
              textShadow: '0 0 12px currentColor, 0 0 20px currentColor, 0 2px 4px rgba(0,0,0,0.8)',
              filter: 'brightness(1.2) saturate(1.3)',
            }}
          >
            {visionText}
          </span>
          <span
            className={`inline-block px-6 text-base font-extrabold uppercase tracking-wider transition-all duration-1000 ${
              colors[(currentColorIndex + 1) % colors.length]
            }`}
            style={{
              textShadow: '0 0 12px currentColor, 0 0 20px currentColor, 0 2px 4px rgba(0,0,0,0.8)',
              filter: 'brightness(1.2) saturate(1.3)',
            }}
          >
            {visionText}
          </span>
          <span
            className={`inline-block px-6 text-base font-extrabold uppercase tracking-wider transition-all duration-1000 ${
              colors[(currentColorIndex + 2) % colors.length]
            }`}
            style={{
              textShadow: '0 0 12px currentColor, 0 0 20px currentColor, 0 2px 4px rgba(0,0,0,0.8)',
              filter: 'brightness(1.2) saturate(1.3)',
            }}
          >
            {visionText}
          </span>
          <span
            className={`inline-block px-6 text-base font-extrabold uppercase tracking-wider transition-all duration-1000 ${
              colors[(currentColorIndex + 3) % colors.length]
            }`}
            style={{
              textShadow: '0 0 12px currentColor, 0 0 20px currentColor, 0 2px 4px rgba(0,0,0,0.8)',
              filter: 'brightness(1.2) saturate(1.3)',
            }}
          >
            {visionText}
          </span>
        </div>
      </div>

      <nav className="bg-gray-800 text-white shadow-lg fixed top-12 left-0 right-0 z-40">

      <div className="container-fluid px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="navbar-brand app-brand demo d-none d-xl-flex py-0 me-4">
              <a href="#" className="app-brand-link gap-2 flex items-center space-x-3">
                <img 
                  src="/assets/images/superdoll_logo.jpeg" 
                  width="150" 
                  alt="STM Logo" 
                  className="h-8"
                />
                <span className="app-brand-text text-white text-sm" style={{ fontSize: '25px' }}>Sales Budgeting & Rolling Forecast</span>
              </a>
            </div>
            
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-md hover:bg-gray-700 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right side menu */}
          <div className="navbar-nav-right flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="nav-link p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {isSearchOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div className="navbar-search-wrapper search-input-wrapper p-4">
                    <input
                      type="text"
                      className="form-control search-input border-0 w-full px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                      placeholder="Search..."
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="nav-link p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div className="dropdown-menu-header border-b border-gray-200 p-4">
                    <div className="dropdown-header flex items-center justify-between">
                      <h5 className="text-gray-900 mb-0 font-semibold">Notification</h5>
                      <button className="text-gray-600 hover:text-gray-800">
                        <i className="bx fs-4 bx-envelope-open"></i>
                      </button>
                    </div>
                  </div>
                  <div className="dropdown-notifications-list p-4">
                    <p className="text-center text-gray-600 py-8">No new notifications</p>
                  </div>
                  <div className="dropdown-menu-footer border-t border-gray-200 p-4">
                    <button className="btn btn-primary w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="nav-link dropdown-toggle hide-arrow flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <div className="avatar avatar-online">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <span className="mx-1 text-sm font-medium hidden md:block">{user?.name || 'User'}</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onPasswordModalOpen();
                        setIsUserMenuOpen(false);
                      }}
                      className="dropdown-item flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
