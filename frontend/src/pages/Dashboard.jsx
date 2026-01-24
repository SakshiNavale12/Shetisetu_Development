import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [surveysCount, setSurveysCount] = useState(0);
  const [lossReportsCount, setLossReportsCount] = useState(0);
  const [compensation, setCompensation] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Fetch farmer profile
      const farmerRes = await fetch(`${API_URL}/farmers/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (farmerRes.ok) {
        const farmerData = await farmerRes.json();
        setFarmer(farmerData);
      }

      // Fetch crop surveys count
      const surveysRes = await fetch(`${API_URL}/crop-surveys/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        setSurveysCount(surveysData.totalResults || surveysData.results?.length || 0);
      }

      // Fetch loss reports count and compensation
      try {
        const lossRes = await fetch(`${API_URL}/loss-reports/me?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (lossRes.ok) {
          const lossData = await lossRes.json();
          console.log('Loss reports for farmer:', lossData);

          setLossReportsCount(lossData.totalResults || lossData.results?.length || 0);

          // Calculate total compensation from approved reports
          const reports = lossData.results || [];
          console.log('All reports:', reports);

          const approvedReports = reports.filter(report =>
            (report.status === 'approved' || report.status === 'verified' || report.status === 'compensation_processed') &&
            report.approvedAmount
          );
          console.log('Approved reports with compensation:', approvedReports);

          const totalCompensation = approvedReports.reduce(
            (sum, report) => sum + (report.approvedAmount || 0),
            0
          );
          console.log('Total compensation:', totalCompensation);

          setCompensation(totalCompensation);
        }
      } catch (err) {
        console.error('Failed to fetch loss reports:', err);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: '📋',
      label: 'Crop Surveys',
      labelMr: 'पीक सर्वेक्षणे',
      value: surveysCount.toString(),
      color: 'green'
    },
    {
      icon: '⚠️',
      label: 'Loss Reports',
      labelMr: 'नुकसान अहवाल',
      value: lossReportsCount.toString(),
      color: 'red'
    },
    {
      icon: '💰',
      label: 'Compensation',
      labelMr: 'भरपाई',
      value: `₹${compensation.toLocaleString('en-IN')}`,
      color: 'purple'
    },
  ];

  const quickActions = [
    {
      icon: '📋',
      title: 'Crop Surveys',
      titleMr: 'पीक सर्वेक्षणे',
      link: '/crop-survey',
      color: 'green',
      description: 'View & submit surveys'
    },
    {
      icon: '⚠️',
      title: 'Loss Reports',
      titleMr: 'नुकसान अहवाल',
      link: '/loss-report',
      color: 'red',
      description: 'View & report losses'
    },
    {
      icon: '👤',
      title: 'My Profile',
      titleMr: 'माझे प्रोफाइल',
      link: '/profile',
      color: 'blue',
      description: 'Manage your profile'
    },
    {
      icon: '📄',
      title: 'My Documents',
      titleMr: 'माझे दस्तऐवज',
      link: '/documents',
      color: 'amber',
      description: 'Upload & manage documents'
    },
  ];

  const governmentSchemes = [
    {
      id: 1,
      title: 'PM-KISAN',
      titleMr: 'पीएम-किसान',
      description: 'Direct income support of ₹6,000 per year to all farmer families',
      descriptionMr: 'सर्व शेतकरी कुटुंबांना दरवर्षी ₹6,000 थेट उत्पन्न सहाय्य',
      benefits: '₹2,000 every 4 months',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      eligibility: 'All landholding farmers',
      link: 'https://pmkisan.gov.in/'
    },
    {
      id: 2,
      title: 'Pradhan Mantri Fasal Bima Yojana',
      titleMr: 'प्रधानमंत्री फसल बीमा योजना',
      description: 'Crop insurance scheme for financial support against crop loss',
      descriptionMr: 'पीक नुकसानीविरुद्ध आर्थिक सहाय्यासाठी पीक विमा योजना',
      benefits: 'Up to 90% coverage',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
      eligibility: 'All farmers growing notified crops',
      link: 'https://pmfby.gov.in/'
    },
    {
      id: 3,
      title: 'Soil Health Card Scheme',
      titleMr: 'माती आरोग्य कार्ड योजना',
      description: 'Free soil testing and nutrient recommendations for optimal crop yield',
      descriptionMr: 'इष्टतम पीक उत्पादनासाठी मोफत मृदा चाचणी आणि पोषक शिफारसी',
      benefits: 'Free soil testing',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400',
      eligibility: 'All farmers',
      link: 'https://soilhealth.dac.gov.in/'
    },
    {
      id: 4,
      title: 'Kisan Credit Card',
      titleMr: 'किसान क्रेडिट कार्ड',
      description: 'Easy access to credit for agricultural needs at low interest rates',
      descriptionMr: 'कमी व्याजदराने कृषी गरजांसाठी कर्जाची सुलभ उपलब्धता',
      benefits: 'Loan up to ₹3 lakh at 4%',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
      eligibility: 'Farmers with land ownership',
      link: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌾</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-8 px-8 py-8 text-white rounded-b-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🌾 नमस्कार, {user?.name || 'Farmer'}!
            </h1>
            <p className="text-green-100">
              Welcome to your ShetiSetu Dashboard
            </p>
            {farmer && (
              <p className="text-green-200 text-sm mt-1">
                📍 {farmer.village}, {farmer.taluka}, {farmer.district}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="success" className="bg-green-500 text-white">
              {user?.role || 'farmer'}
            </Badge>
            {farmer?.isProfileComplete ? (
              <Badge variant="success">Profile Complete</Badge>
            ) : (
              <Badge variant="warning">Profile Incomplete</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Government Schemes - Horizontal Scrollable */}
      <div className="-mx-8">
        <div className="px-8 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            🏛️ Government Schemes / सरकारी योजना
          </h2>
        </div>
        <div className="relative">
          <div
            className="flex gap-4 overflow-x-scroll pb-4 px-8"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
          >
            {governmentSchemes.map((scheme) => (
              <Card key={scheme.id} className="flex-shrink-0 w-80 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="relative h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={scheme.image}
                      alt={scheme.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Government+Scheme';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="success" className="bg-green-600 text-white">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {scheme.title}
                    </h3>
                    <p className="text-sm text-green-600 font-medium mb-2">
                      {scheme.titleMr}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {scheme.description}
                    </p>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">💰</span>
                        <span className="font-medium text-gray-700 text-xs">{scheme.benefits}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600">✓</span>
                        <span className="text-gray-600 text-xs">{scheme.eligibility}</span>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <a
                        href={scheme.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" size="sm" fullWidth>
                          Learn More →
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!farmer?.isProfileComplete && (
        <Card className="border-l-4 border-amber-500 bg-amber-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-800">Complete Your Profile</h3>
                <p className="text-amber-700 text-sm">
                  Add your land details and bank information to submit crop surveys
                </p>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="warning" size="sm">
                Complete Now
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* eKYC Status Alert */}
      {farmer && farmer.ekycStatus === 'pending' && (
        <Card className="border-l-4 border-blue-500 bg-blue-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-bold text-blue-800">Upload Documents for eKYC</h3>
                <p className="text-blue-700 text-sm">
                  Upload your Aadhaar, PAN, 7/12, and other documents for verification
                </p>
              </div>
            </div>
            <Link to="/documents">
              <Button variant="primary" size="sm">
                Upload Now
              </Button>
            </Link>
          </div>
        </Card>
      )}
      {farmer && farmer.ekycStatus === 'submitted' && (
        <Card className="border-l-4 border-yellow-500 bg-yellow-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              <div>
                <h3 className="font-bold text-yellow-800">eKYC Verification Pending</h3>
                <p className="text-yellow-700 text-sm">
                  Your documents are under review by an officer. You'll be notified once verified.
                </p>
              </div>
            </div>
            <Badge variant="warning" className="text-lg px-4 py-2">
              PENDING
            </Badge>
          </div>
        </Card>
      )}
      {farmer && farmer.ekycStatus === 'rejected' && (
        <Card className="border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <h3 className="font-bold text-red-800">eKYC Verification Rejected</h3>
                <p className="text-red-700 text-sm">
                  {farmer.ekycRemarks || 'Your documents were rejected. Please update and resubmit.'}
                </p>
              </div>
            </div>
            <Link to="/documents">
              <Button variant="error" size="sm">
                Update Documents
              </Button>
            </Link>
          </div>
        </Card>
      )}
      {farmer && farmer.ekycStatus === 'verified' && (
        <Card className="border-l-4 border-green-500 bg-green-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="font-bold text-green-800">eKYC Verified</h3>
                <p className="text-green-700 text-sm">
                  Your documents have been verified. You can now submit loss reports and panchanama requests.
                </p>
              </div>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              VERIFIED
            </Badge>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-xs text-green-600">{stat.labelMr}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quick Actions / जलद क्रिया
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-center">
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h3 className="font-bold text-gray-800">{action.title}</h3>
                  <p className="text-green-600 text-sm">{action.titleMr}</p>
                  <p className="text-gray-500 text-xs mt-2">{action.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Land Parcels Summary */}
      {farmer?.landParcels && farmer.landParcels.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              🗺️ My Land Parcels / माझे भूखंड
            </h2>
            <Link to="/profile">
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {farmer.landParcels.slice(0, 3).map((parcel, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-800">
                  Survey No: {parcel.surveyNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {parcel.area} {parcel.unit}
                </p>
                <Badge variant={parcel.ownershipType === 'owned' ? 'success' : 'default'}>
                  {parcel.ownershipType}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
