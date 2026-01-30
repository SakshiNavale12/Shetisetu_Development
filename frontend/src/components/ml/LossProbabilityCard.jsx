import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

const probabilityColors = {
  unlikely: 'bg-green-100 text-green-800',
  possible: 'bg-yellow-100 text-yellow-800',
  likely: 'bg-orange-100 text-orange-800',
  highly_likely: 'bg-red-100 text-red-800',
  almost_certain: 'bg-red-200 text-red-900',
};

const probabilityLabels = {
  unlikely: { en: 'Unlikely', mr: 'अशक्य' },
  possible: { en: 'Possible', mr: 'शक्य' },
  likely: { en: 'Likely', mr: 'संभाव्य' },
  highly_likely: { en: 'Highly Likely', mr: 'अत्यंत संभाव्य' },
  almost_certain: { en: 'Almost Certain', mr: 'जवळजवळ निश्चित' },
};

function LossProbabilityCard({ lossReport, farmer }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/ml/predict/loss`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          district: farmer?.district || 'pune',
          cropName: lossReport?.cropName || lossReport?.crop || 'wheat',
          lossType: lossReport?.lossType || 'drought',
          growthStage: lossReport?.growthStage || 'vegetative',
          affectedArea: lossReport?.affectedArea || 1,
          unit: lossReport?.affectedAreaUnit || 'hectare',
          currentMonthRainfall: lossReport?.currentMonthRainfall,
          temperatureDeviation: lossReport?.temperatureDeviation,
          daysSinceSowing: lossReport?.daysSinceSowing,
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
    <Card className="border-l-4 border-red-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Loss Analysis</h3>
          <p className="text-sm text-gray-500">नुकसान विश्लेषण</p>
        </div>
        <Button onClick={fetchPrediction} disabled={loading} variant="error" size="sm">
          {loading ? 'Analyzing...' : 'Analyze Loss'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
      )}

      {prediction && (
        <div className="space-y-4">
          {/* Probability Gauge */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Loss Probability / नुकसान शक्यता</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  probabilityColors[prediction.probability_category]
                }`}
              >
                {probabilityLabels[prediction.probability_category]?.en}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-4 rounded-full transition-all"
                style={{ width: `${prediction.loss_probability}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">
                {probabilityLabels[prediction.probability_category]?.mr}
              </span>
              <span className="text-2xl font-bold text-gray-800">
                {prediction.loss_probability}%
              </span>
            </div>
          </div>

          {/* Damage Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-3 rounded">
              <p className="text-xs text-gray-600">Estimated Severity / तीव्रता</p>
              <p className="text-lg font-bold text-orange-700 capitalize">
                {prediction.estimated_severity}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-xs text-gray-600">Est. Damage / अंदाजित नुकसान</p>
              <p className="text-lg font-bold text-red-700">
                {prediction.estimated_damage_percentage}%
              </p>
            </div>
          </div>

          {/* Contributing Factors */}
          {prediction.contributing_factors?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Contributing Factors / योगदान देणारे घटक
              </h4>
              <div className="space-y-2">
                {prediction.contributing_factors.map((factor, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        factor.severity === 'primary'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {factor.severity}
                    </span>
                    <div>
                      <span className="text-sm text-gray-800">{factor.factor}</span>
                      {factor.factor_mr && (
                        <span className="text-xs text-gray-500 ml-2">({factor.factor_mr})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preventive Measures */}
          {prediction.preventive_measures?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Preventive Measures / प्रतिबंधात्मक उपाय
              </h4>
              <ul className="space-y-2">
                {prediction.preventive_measures.map((measure, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-blue-50 p-2 rounded">
                    <span className="text-blue-600">✓</span>
                    <div>
                      <span className="text-sm text-gray-700">{measure.measure}</span>
                      {measure.measure_mr && (
                        <p className="text-xs text-gray-500">{measure.measure_mr}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!prediction && !error && (
        <p className="text-gray-500 text-sm">
          Click the button to get AI-powered loss probability analysis.
        </p>
      )}
    </Card>
  );
}

export default LossProbabilityCard;
