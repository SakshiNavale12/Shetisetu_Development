import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LanguageSwitch from '../ui/LanguageSwitch';

/**
 * OfficerLayout Component
 * Layout for agriculture officer portal
 * Focus: Task management, field work, productivity
 */

function OfficerLayout({ children }) {
  const location = useLocation();
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(8);

  const navItems = [
    { path: '/officer/dashboard', label: 'Dashboard', labelMr: 'डॅशबोर्ड', icon: '📊' },
    { path: '/officer/pending', label: 'Pending Cases', labelMr: 'प्रलंबित प्रकरणे', icon: '⏳', badge: 12 },
    { path: '/officer/field-visits', label: 'Field Visits', labelMr: 'शेत पाहणी', icon: '🚜' },
    { path: '/officer/completed', label: 'Completed', labelMr: 'पूर्ण झालेले', icon: '✅' },
    { path: '/officer/reports', label: 'Reports', labelMr: 'अहवाल', icon: '📝' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-full px-4 lg:px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo & Officer Info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-xl">
                🌾
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ShetiSetu Officer Portal</h1>
                <p className="text-xs text-gray-500">Agriculture Officer Dashboard</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <span className="text-2xl">🔔</span>
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Language */}
              <LanguageSwitch currentLanguage={language} onLanguageChange={setLanguage} />

              {/* Profile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                  AO
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Officer Name</p>
                  <p className="text-xs text-gray-500">Taluka XYZ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Content Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">
                    {language === 'mr' ? item.labelMr : item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    isActive(item.path) ? 'bg-white text-primary-700' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="p-4 m-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">Today's Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-gray-900">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-bold text-green-600">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Field Visits</span>
                <span className="font-bold text-accent-600">5</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.badge && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default OfficerLayout;
