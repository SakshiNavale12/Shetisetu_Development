import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LanguageSwitch from '../ui/LanguageSwitch';

/**
 * FarmerLayout Component
 * Layout for farmer portal with simplified navigation
 * Focus: Easy access, large touch targets, voice assistance
 */

function FarmerLayout({ children }) {
  const location = useLocation();
  const [language, setLanguage] = useState('en');

  const navItems = [
    { path: '/farmer/dashboard', label: 'Home', labelMr: 'मुखपृष्ठ', icon: '🏠' },
    { path: '/farmer/crop-survey', label: 'Crop Survey', labelMr: 'पीक सर्वेक्षण', icon: '🌾' },
    { path: '/farmer/report-loss', label: 'Report Loss', labelMr: 'नुकसान नोंदवा', icon: '📋' },
    { path: '/farmer/track', label: 'Track Status', labelMr: 'स्थिती तपासा', icon: '📍' },
    { path: '/farmer/profile', label: 'Profile', labelMr: 'प्रोफाइल', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center text-2xl">
                🌾
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ShetiSetu</h1>
                <p className="text-xs text-gray-500">शेतीसेतु - Farmer Portal</p>
              </div>
            </div>

            {/* Language Switch */}
            <LanguageSwitch currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      {/* Bottom Navigation - Mobile Friendly */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">
                {language === 'mr' ? item.labelMr : item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:block fixed left-0 top-20 bottom-0 w-64 bg-white shadow-md overflow-y-auto z-30">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">
                {language === 'mr' ? item.labelMr : item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Help Section */}
        <div className="p-4 m-4 bg-accent-50 rounded-lg border border-accent-200">
          <h3 className="font-semibold text-accent-900 mb-2">Need Help?</h3>
          <p className="text-sm text-accent-700 mb-3">मदत हवी आहे?</p>
          <button className="w-full bg-accent-500 text-white py-2 rounded-lg hover:bg-accent-600 transition-colors">
            Call Helpline
          </button>
          <p className="text-center text-sm text-accent-900 mt-2 font-bold">1800-XXX-XXXX</p>
        </div>
      </aside>
    </div>
  );
}

export default FarmerLayout;
