import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import FarmerProfile from './pages/FarmerProfile';
import CropSurvey from './pages/CropSurvey';
import CropSurveyDetail from './pages/CropSurveyDetail';
import LossReport from './pages/LossReport';
import LossReportDetail from './pages/LossReportDetail';
import Documents from './pages/Documents';
import Login from './pages/Login';
import Register from './pages/Register';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerFarmerDetail from './pages/OfficerFarmerDetail';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Panchanama from './pages/Panchanama';
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import NotFound from './pages/NotFound';

// Home redirect component
function HomeRedirect() {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(user);

  if (userData.role === 'officer') {
    return <Navigate to="/officer/dashboard" replace />;
  }

  if (userData.role === 'authority') {
    return <Navigate to="/authority/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  const location = useLocation();
  const isDesignSystemPage = location.pathname === '/design-system';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {isDesignSystemPage ? (
        <Routes>
          <Route path="/design-system" element={<DesignSystemShowcase />} />
        </Routes>
      ) : isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<FarmerProfile />} />
            <Route path="/crop-survey" element={<CropSurvey />} />
            <Route path="/crop-survey/:surveyId" element={<CropSurveyDetail />} />
            <Route path="/crop-survey/new" element={<CropSurvey />} />
            <Route path="/loss-report" element={<LossReport />} />
            <Route path="/loss-report/new" element={<LossReport />} />
            <Route path="/loss-report/:reportId" element={<LossReportDetail />} />
            <Route path="/documents" element={<Documents />} />
            {/* Officer Routes */}
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/farmer/:farmerId" element={<OfficerFarmerDetail />} />
            <Route path="/officer/panchanama/new" element={<Panchanama />} />
            <Route path="/officer/panchanama/:id" element={<Panchanama />} />
            {/* Authority Routes */}
            <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

export default App;
