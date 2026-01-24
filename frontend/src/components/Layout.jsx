import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]); // Re-check on route change

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Get user role for conditional navigation
  const userRole = user?.role || 'farmer';

  const navItems = user ? (
    userRole === 'authority' ? [
      { path: '/authority/dashboard', label: 'Dashboard', labelMr: 'डॅशबोर्ड' },
    ] : userRole === 'officer' ? [
      { path: '/officer/dashboard', label: 'Dashboard', labelMr: 'डॅशबोर्ड' },
    ] : [
      { path: '/dashboard', label: 'Dashboard', labelMr: 'डॅशबोर्ड' },
      { path: '/profile', label: 'Profile', labelMr: 'प्रोफाइल' },
    ]
  ) : [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <span>🌾</span>
                <span>ShetiSetu</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-green-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <NotificationBell />
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            🌾 ShetiSetu - Digital Bridge for Agricultural Governance
          </p>
          <p className="text-center text-gray-500 text-xs mt-1">
            Built with ❤️ for Maharashtra's farmers
          </p>
        </div>
      </footer>
    </div >
  );
}

export default Layout;
