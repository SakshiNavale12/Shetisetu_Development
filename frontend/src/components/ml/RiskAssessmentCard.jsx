import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const riskColors = {
  low: 'bg-green-100 text-green-800 border-green-500',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-500',
  high: 'bg-orange-100 text-orange-800 border-orange-500',
  very_high: 'bg-red-100 text-red-800 border-red-500',
};

const riskLabels = {
  low: { en: 'Low Risk', mr: 'कमी जोखीम' },
  moderate: { en: 'Moderate Risk', mr: 'मध्यम जोखीम' },
  high: { en: 'High Risk', mr: 'उच्च जोखीम' },
  very_high: { en: 'Very High Risk', mr: 'अत्यंत उच्च जोखीम' },
};

function RiskAssessmentCard({ cropSurvey, farmer }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/ml/predict/risk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          district: farmer?.district || 'pune',
          taluka: farmer?.taluka,
          cropName: cropSurvey?.cropName || cropSurvey?.crop,
          cropType: cropSurvey?.cropType,
          season: cropSurvey?.season || 'kharif',
          cultivatedArea: cropSurvey?.cultivatedArea || 1,
          irrigationType: cropSurvey?.irrigationType || 'rainfed',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAssessment(data.data);
      } else {
        setError(data.error || 'Assessment failed');
      }
    } catch (err) {
      setError('Failed to connect to ML service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Risk Assessment</h3>
          <p className="text-sm text-gray-500">जोखीम मूल्यांकन</p>
        </div>
        <Button onClick={fetchAssessment} disabled={loading} variant="warning" size="sm">
          {loading ? 'Loading...' : 'Assess Risk'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {assessment && (
        <div className="space-y-4">
          {/* Risk Level Badge */}
          <div className={`p-4 rounded-lg border-l-4 ${riskColors[assessment.risk_level]}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-75">Risk Level / जोखीम पातळी</p>
                <p className="text-2xl font-bold">
                  {riskLabels[assessment.risk_level]?.en}
                </p>
                <p className="text-sm">{riskLabels[assessment.risk_level]?.mr}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Score</p>
                <p className="text-2xl font-bold">{assessment.risk_score}/100</p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {assessment.risk_factors?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Risk Factors / जोखीम घटक</h4>
              <div className="space-y-2">
                {assessment.risk_factors.map((factor, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded flex items-start gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        factor.impact === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {factor.impact}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{factor.factor}</p>
                      {factor.factor_mr && (
                        <p className="text-sm text-gray-600">{factor.factor_mr}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {assessment.recommendations?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recommendations / शिफारसी</h4>
              <div className="space-y-2">
                {assessment.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded">
                    <p className="font-medium text-blue-800">{rec.action}</p>
                    {rec.action_mr && (
                      <p className="text-sm text-blue-700">{rec.action_mr}</p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">{rec.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!assessment && !error && (
        <p className="text-gray-500 text-sm">
          Click the button to get AI-powered risk assessment for this crop.
        </p>
      )}
    </Card>
  );
}

export default RiskAssessmentCard;
