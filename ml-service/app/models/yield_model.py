import joblib
import numpy as np
import os


class YieldPredictionModel:
    """Wrapper for crop yield prediction model"""

    def __init__(self, model_path=None):
        self.model = None
        self.scaler = None
        self.model_path = model_path or os.path.join('data', 'models', 'yield_model.joblib')
        self.scaler_path = self.model_path.replace('.joblib', '_scaler.joblib')
        self.load_model()

    def load_model(self):
        """Load trained model and scaler from disk"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
        except Exception as e:
            print(f"Warning: Could not load yield model: {e}")
            self.model = None
            self.scaler = None

    def predict(self, features):
        """
        Predict crop yield

        Args:
            features: dict with preprocessed features from FeatureEngineer

        Returns:
            dict with predicted_yield, confidence_interval, total_expected
        """
        # If model not loaded, use rule-based fallback
        if self.model is None:
            return self._rule_based_prediction(features)

        feature_array = np.array([[
            features['district_code'],
            features['crop_code'],
            features['season_code'],
            features['area_hectares'],
            features['irrigation_type'],
            features['sowing_month'],
            features.get('historical_yield_avg', 25),
            features.get('rainfall_deviation', 0),
        ]])

        if self.scaler:
            feature_array = self.scaler.transform(feature_array)

        prediction = self.model.predict(feature_array)[0]

        # Calculate confidence interval
        if hasattr(self.model, 'estimators_'):
            predictions = [tree.predict(feature_array)[0] for tree in self.model.estimators_]
            std = np.std(predictions)
            confidence_lower = max(0, prediction - 1.96 * std)
            confidence_upper = prediction + 1.96 * std
        else:
            confidence_lower = prediction * 0.85
            confidence_upper = prediction * 1.15

        return {
            'predicted_yield': round(float(prediction), 2),
            'unit': 'quintals/hectare',
            'confidence_interval': {
                'lower': round(float(confidence_lower), 2),
                'upper': round(float(confidence_upper), 2)
            },
            'total_expected': round(float(prediction * features['area_hectares']), 2),
            'model_type': 'ml_model'
        }

    def _rule_based_prediction(self, features):
        """Fallback rule-based prediction when ML model not available"""

        # Base yields for different crops (quintals/hectare) - Maharashtra averages
        base_yields = {
            1: 22,   # rice
            2: 28,   # wheat
            3: 12,   # jowar
            4: 10,   # bajra
            5: 25,   # maize
            6: 800,  # sugarcane
            7: 4,    # cotton
            8: 15,   # soybean
            9: 12,   # groundnut
            10: 180, # onion
            11: 120, # grapes
        }

        # Irrigation multipliers
        irrigation_multipliers = {
            0: 0.7,   # rainfed
            1: 1.1,   # canal
            2: 1.0,   # well
            3: 1.05,  # borewell
            4: 1.2,   # drip
            5: 1.15,  # sprinkler
            6: 1.1,   # mixed
        }

        # Season adjustments
        season_adjustments = {
            1: 1.0,   # kharif
            2: 1.05,  # rabi
            3: 0.9,   # summer
            4: 1.0,   # perennial
        }

        crop_code = features.get('crop_code', 1)
        base_yield = base_yields.get(crop_code, 20)

        irrigation_mult = irrigation_multipliers.get(features.get('irrigation_type', 0), 1.0)
        season_adj = season_adjustments.get(features.get('season_code', 1), 1.0)

        predicted = base_yield * irrigation_mult * season_adj

        # Add some variance based on rainfall
        rainfall_dev = features.get('rainfall_deviation', 0)
        if rainfall_dev < -20:
            predicted *= 0.8
        elif rainfall_dev > 20:
            predicted *= 1.1

        return {
            'predicted_yield': round(predicted, 2),
            'unit': 'quintals/hectare',
            'confidence_interval': {
                'lower': round(predicted * 0.8, 2),
                'upper': round(predicted * 1.2, 2)
            },
            'total_expected': round(predicted * features['area_hectares'], 2),
            'model_type': 'rule_based'
        }
