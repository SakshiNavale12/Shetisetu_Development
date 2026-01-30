import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

function YieldPredictionCard({ cropSurvey, farmer }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/ml/predict/yield`, {
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
          unit: cropSurvey?.cultivatedAreaUnit || 'hectare',
          irrigationType: cropSurvey?.irrigationType || 'rainfed',
          sowingDate: cropSurvey?.sowingDate || new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPrediction(data.data);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to connect to ML service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Yield Prediction
          </h3>
          <p className="text-sm text-gray-500">उत्पादन अंदाज</p>
        </div>
        <Button onClick={fetchPrediction} disabled={loading} variant="success" size="sm">
          {loading ? 'Loading...' : 'Get Prediction'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {prediction && (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Predicted Yield / अंदाजित उत्पादन</p>
            <p className="text-3xl font-bold text-green-700">
              {prediction.predicted_yield} <span className="text-lg">{prediction.unit}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Range: {prediction.confidence_interval?.lower} - {prediction.confidence_interval?.upper}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">Total Expected / एकूण अपेक्षित</p>
              <p className="text-lg font-bold text-blue-700">
                {prediction.total_expected} quintals
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-xs text-gray-600">Model Type</p>
              <p className="text-lg font-bold text-purple-700 capitalize">
                {prediction.model_type?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {!prediction && !error && (
        <p className="text-gray-500 text-sm">
          Click the button to get AI-powered yield prediction for this crop survey.
        </p>
      )}
    </Card>
  );
}

export default YieldPredictionCard;
