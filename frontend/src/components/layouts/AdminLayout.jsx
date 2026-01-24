import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

/**
 * AdminLayout Component
 * Layout for higher authorities (Taluka/District/State officers)
 * Focus: Analytics, oversight, policy decisions
 */

function AdminLayout({ children }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', category: 'main' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈', category: 'main' },
    { path: '/admin/officers', label: 'Officers', icon: '👥', category: 'management' },
    { path: '/admin/cases', label: 'All Cases', icon: '📋', category: 'management' },
    { path: '/admin/audit', label: 'Audit', icon: '🔍', category: 'compliance' },
    { path: '/admin/reports', label: 'Reports', icon: '📄', category: 'compliance' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️', category: 'system' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <span className="text-2xl">☰</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-xl">
                  🌾
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">ShetiSetu Admin</h1>
                  <p className="text-xs text-gray-500">Maharashtra Agriculture Department</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search cases, officers..."
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>

              {/* Export */}
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <span>⬇</span>
                <span className="text-sm font-medium">Export</span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  DO
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">District Officer</p>
                  <p className="text-xs text-gray-500">Pune District</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-64'
          } bg-white shadow-sm transition-all duration-300 hidden lg:block min-h-screen`}
        >
          <nav className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">
                {!sidebarCollapsed && 'Main'}
              </p>
              {navItems
                .filter((item) => item.category === 'main')
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                      isActive(item.path)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                ))}
            </div>

            {/* Management */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">
                {!sidebarCollapsed && 'Management'}
              </p>
              {navItems
                .filter((item) => item.category === 'management')
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                      isActive(item.path)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                ))}
            </div>

            {/* Compliance */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">
                {!sidebarCollapsed && 'Compliance'}
              </p>
              {navItems
                .filter((item) => item.category === 'compliance')
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                      isActive(item.path)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
