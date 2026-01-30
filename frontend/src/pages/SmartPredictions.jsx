import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { YieldPredictionCard, RiskAssessmentCard, LossProbabilityCard } from '../components/ml';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

function SmartPredictions() {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [lossReports, setLossReports] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedLossReport, setSelectedLossReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mlStatus, setMlStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('yield');

  useEffect(() => {
    fetchData();
    checkMLHealth();
  }, []);

  const checkMLHealth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/ml/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMlStatus(data.status === 'healthy' ? 'online' : 'offline');
    } catch {
      setMlStatus('offline');
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const [farmerRes, surveysRes, lossRes] = await Promise.all([
        fetch(`${API_URL}/farmers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_URL}/crop-surveys/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_URL}/loss-reports/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (farmerRes?.ok) {
        setFarmer(await farmerRes.json());
      }
      if (surveysRes?.ok) {
        const data = await surveysRes.json();
        setSurveys(data.results || data || []);
      }
      if (lossRes?.ok) {
        const data = await lossRes.json();
        setLossReports(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🤖</div>
          <p className="text-gray-600">Loading Smart Predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smart Predictions</h1>
            <p className="text-purple-100 text-lg">स्मार्ट अंदाज</p>
            <p className="text-purple-200 mt-2">
              AI-powered insights for better farming decisions
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              mlStatus === 'online'
                ? 'bg-green-400 text-green-900'
                : mlStatus === 'offline'
                ? 'bg-red-400 text-red-900'
                : 'bg-yellow-400 text-yellow-900'
            }`}
          >
            ML Service: {mlStatus === 'checking' ? 'Checking...' : mlStatus.toUpperCase()}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div
            className={`bg-white/20 rounded-lg p-4 text-center cursor-pointer transition-all ${
              activeTab === 'yield' ? 'ring-2 ring-white bg-white/30' : 'hover:bg-white/25'
            }`}
            onClick={() => setActiveTab('yield')}
          >
            <p className="text-3xl mb-2">🌾</p>
            <p className="font-medium">Yield Prediction</p>
            <p className="text-sm text-purple-200">उत्पादन अंदाज</p>
          </div>
          <div
            className={`bg-white/20 rounded-lg p-4 text-center cursor-pointer transition-all ${
              activeTab === 'risk' ? 'ring-2 ring-white bg-white/30' : 'hover:bg-white/25'
            }`}
            onClick={() => setActiveTab('risk')}
          >
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-medium">Risk Assessment</p>
            <p className="text-sm text-purple-200">जोखीम मूल्यांकन</p>
          </div>
          <div
            className={`bg-white/20 rounded-lg p-4 text-center cursor-pointer transition-all ${
              activeTab === 'loss' ? 'ring-2 ring-white bg-white/30' : 'hover:bg-white/25'
            }`}
            onClick={() => setActiveTab('loss')}
          >
            <p className="text-3xl mb-2">📊</p>
            <p className="font-medium">Loss Analysis</p>
            <p className="text-sm text-purple-200">नुकसान विश्लेषण</p>
          </div>
        </div>
      </div>

      {/* Yield & Risk Predictions */}
      {(activeTab === 'yield' || activeTab === 'risk') && (
        <>
          {/* Survey Selection */}
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Select a Crop Survey / पीक सर्वेक्षण निवडा
            </h2>
            {surveys.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surveys.slice(0, 6).map((survey) => (
                  <div
                    key={survey._id || survey.id}
                    onClick={() => setSelectedSurvey(survey)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSurvey?._id === survey._id || selectedSurvey?.id === survey.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-bold text-gray-800">
                      {survey.cropName || survey.crop || 'Crop'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {survey.cultivatedArea} {survey.cultivatedAreaUnit || 'ha'} |{' '}
                      {survey.season}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {survey.irrigationType || 'Rainfed'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No crop surveys found. Create a survey to get predictions.
                </p>
                <Button onClick={() => navigate('/crop-survey/new')} variant="primary">
                  Create Crop Survey
                </Button>
              </div>
            )}
          </Card>

          {/* Predictions */}
          {selectedSurvey && (
            <div className="grid md:grid-cols-2 gap-6">
              {activeTab === 'yield' && (
                <YieldPredictionCard cropSurvey={selectedSurvey} farmer={farmer} />
              )}
              {activeTab === 'risk' && (
                <RiskAssessmentCard cropSurvey={selectedSurvey} farmer={farmer} />
              )}
            </div>
          )}
        </>
      )}

      {/* Loss Analysis */}
      {activeTab === 'loss' && (
        <>
          {/* Loss Report Selection */}
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Select a Loss Report / नुकसान अहवाल निवडा
            </h2>
            {lossReports.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lossReports.slice(0, 6).map((report) => (
                  <div
                    key={report._id || report.id}
                    onClick={() => setSelectedLossReport(report)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLossReport?._id === report._id ||
                      selectedLossReport?.id === report.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <p className="font-bold text-gray-800">
                      {report.cropName || report.crop || 'Crop'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Loss Type: {report.lossType || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Area: {report.affectedArea} {report.affectedAreaUnit || 'ha'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No loss reports found. You can still analyze potential losses.
                </p>
                <Button onClick={() => navigate('/loss-report/new')} variant="error">
                  Create Loss Report
                </Button>
              </div>
            )}
          </Card>

          {/* Loss Prediction */}
          {(selectedLossReport || lossReports.length === 0) && (
            <LossProbabilityCard
              lossReport={selectedLossReport || { cropName: 'wheat', lossType: 'drought' }}
              farmer={farmer}
            />
          )}
        </>
      )}

      {/* Help Section */}
      <Card className="bg-gray-50">
        <h3 className="font-bold text-gray-800 mb-3">How to Use / कसे वापरावे</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-1">🌾 Yield Prediction</p>
            <p>
              Get estimated crop yield based on your location, crop type, season, and irrigation
              method.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">⚠️ Risk Assessment</p>
            <p>
              Understand cultivation risks and get recommendations to protect your crops.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">📊 Loss Analysis</p>
            <p>Analyze potential crop losses and get preventive measures and insurance guidance.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SmartPredictions;
