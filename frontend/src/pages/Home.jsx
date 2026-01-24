import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const farmerFeatures = [
    {
      icon: '📋',
      title: 'E-Pik Pahani',
      titleMr: 'ई-पिक पहाणी',
      description: 'Digital crop survey with geo-tagged photos',
      link: '/crop-survey',
    },
    {
      icon: '🌧️',
      title: 'Loss Reporting',
      titleMr: 'नुकसान अहवाल',
      description: 'Report crop damage with evidence',
      link: '/loss-report',
    },
    {
      icon: '📊',
      title: 'Track Status',
      titleMr: 'स्थिती ट्रॅक करा',
      description: 'Monitor your application status',
      link: '/dashboard',
    },
    {
      icon: '💰',
      title: 'Compensation',
      titleMr: 'भरपाई',
      description: 'Check compensation status & history',
      link: '/compensation',
    },
  ];

  const officerFeatures = [
    {
      icon: '📊',
      title: 'Dashboard',
      titleMr: 'डॅशबोर्ड',
      description: 'Overview of pending cases and stats',
      link: '/officer/dashboard',
    },
    {
      icon: '📋',
      title: 'New Panchanama',
      titleMr: 'नवीन पंचनामा',
      description: 'Conduct digital field inspection',
      link: '/officer/panchanama/new',
    },
    {
      icon: '📍',
      title: 'Field Visits',
      titleMr: 'क्षेत्र भेटी',
      description: 'Scheduled visits and maps',
      link: '/officer/dashboard',
    },
    {
      icon: '📑',
      title: 'Reports',
      titleMr: 'अहवाल',
      description: 'Generate district level reports',
      link: '/officer/reports',
    },
  ];

  const authorityFeatures = [
    {
      icon: '🏛️',
      title: 'Dashboard',
      titleMr: 'डॅशबोर्ड',
      description: 'State level overview and metrics',
      link: '/authority/dashboard',
    },
    {
      icon: '📈',
      title: 'Analytics',
      titleMr: 'बिक्री',
      description: 'District stats and trends',
      link: '/authority/dashboard',
    },
    {
      icon: '👥',
      title: 'Officers',
      titleMr: 'अधिकारी',
      description: 'Monitor officer performance',
      link: '/authority/dashboard',
    },
    {
      icon: '📑',
      title: 'Reports',
      titleMr: 'अहवाल',
      description: 'Export system reports',
      link: '/authority/dashboard',
    },
  ];

  let features = farmerFeatures;
  if (user?.role === 'officer') features = officerFeatures;
  if (user?.role === 'authority') features = authorityFeatures;

  const getDashboardLink = () => {
    if (user?.role === 'officer') return '/officer/dashboard';
    if (user?.role === 'authority') return '/authority/dashboard';
    return '/dashboard';
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-green-50 to-green-100 -mx-8 px-8 rounded-2xl">
        <div className="text-6xl mb-4">🌾</div>
        <h1 className="text-5xl font-bold text-green-700 mb-2">
          ShetiSetu
        </h1>
        <p className="text-2xl text-green-600 mb-4">शेतीसेतू</p>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A Digital Bridge Between Farmers and Agricultural Officers
          <br />
          <span className="text-lg text-gray-500">
            शेतकरी आणि कृषि अधिकाऱ्यांमधील डिजिटल सेतू
          </span>
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome, <strong>{user.name}</strong>!
              <span className="ml-2 px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm capitalize">
                {user.role}
              </span>
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to={getDashboardLink()}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
              >
                {user.role === 'farmer' ? 'Go to Dashboard' : 'Dashboard'}
              </Link>

              {user.role === 'officer' && (
                <Link
                  to="/officer/panchanama/new"
                  className="bg-white hover:bg-gray-50 text-green-700 font-bold py-3 px-8 rounded-lg transition-colors border-2 border-green-600"
                >
                  New Inspection
                </Link>
              )}

              {user.role === 'farmer' && (
                <Link
                  to="/profile"
                  className="bg-white hover:bg-gray-50 text-green-700 font-bold py-3 px-8 rounded-lg transition-colors border-2 border-green-600"
                >
                  My Profile
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
            >
              Login / लॉगिन
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-50 text-green-700 font-bold py-3 px-8 rounded-lg transition-colors border-2 border-green-600"
            >
              Register / नोंदणी करा
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Our Services / आमच्या सेवा
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={index} to={feature.link}>
              <Card className="text-center hover:shadow-xl transition-shadow cursor-pointer group h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {feature.title}
                </h3>
                <p className="text-green-600 font-medium mb-2">{feature.titleMr}</p>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 -mx-8 px-8 py-12 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          How It Works / हे कसे कार्य करते
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Register', titleMr: 'नोंदणी', desc: 'Create your farmer account' },
            { step: '2', title: 'Add Crops', titleMr: 'पीक जोडा', desc: 'Submit crop survey (E-Pik Pahani)' },
            { step: '3', title: 'Report Loss', titleMr: 'नुकसान कळवा', desc: 'Report damage with photos' },
            { step: '4', title: 'Get Help', titleMr: 'मदत मिळवा', desc: 'Receive compensation' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
              <p className="text-green-600 font-medium text-sm">{item.titleMr}</p>
              <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact/Support */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Need Help? / मदत हवी आहे?
        </h2>
        <p className="text-gray-600 mb-4">
          Contact your local agriculture office or call our helpline
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="tel:1800-180-1551" className="flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-lg font-medium">
            📞 1800-180-1551 (Toll Free)
          </a>
        </div>
      </section>
    </div>
  );
}

export default Home;
