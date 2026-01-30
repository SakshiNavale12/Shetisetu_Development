import joblib
import numpy as np
import os


class LossProbabilityModel:
    """Wrapper for loss probability prediction model"""

    LOSS_TYPES = ['drought', 'flood', 'hailstorm', 'pest', 'disease',
                  'unseasonal_rain', 'frost', 'fire', 'other']

    PROBABILITY_CATEGORIES = ['unlikely', 'possible', 'likely', 'highly_likely', 'almost_certain']

    def __init__(self, model_path=None):
        self.model = None
        self.scaler = None
        self.model_path = model_path or os.path.join('data', 'models', 'loss_model.joblib')
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
            print(f"Warning: Could not load loss model: {e}")
            self.model = None
            self.scaler = None

    def predict(self, features):
        """
        Predict loss probability

        Args:
            features: dict with preprocessed features

        Returns:
            dict with loss_probability, severity_estimate, contributing_factors
        """
        if self.model is None:
            return self._rule_based_prediction(features)

        feature_array = np.array([[
            features['district_code'],
            features['crop_code'],
            features.get('loss_type_code', 8),
            features.get('growth_stage', 1),
            features['area_hectares'],
            features.get('rainfall_current_month', 50),
            features.get('temperature_deviation', 0),
            features.get('days_since_sowing', 60),
        ]])

        if self.scaler:
            feature_array = self.scaler.transform(feature_array)

        loss_probability = self.model.predict_proba(feature_array)[0][1]
        severity = self._estimate_severity(features, loss_probability)
        damage_percentage = self._estimate_damage(features, loss_probability)
        contributing_factors = self._get_contributing_factors(features)
        preventive_measures = self._get_preventive_measures(features)

        return {
            'loss_probability': round(loss_probability * 100, 1),
            'probability_category': self._categorize_probability(loss_probability),
            'estimated_severity': severity,
            'estimated_damage_percentage': damage_percentage,
            'contributing_factors': contributing_factors,
            'preventive_measures': preventive_measures,
            'model_type': 'ml_model'
        }

    def _rule_based_prediction(self, features):
        """Fallback rule-based loss prediction"""
        base_probability = 0.3

        # Loss type impacts
        loss_type_impacts = {
            0: 0.25,  # drought
            1: 0.2,   # flood
            2: 0.15,  # hailstorm
            3: 0.15,  # pest
            4: 0.15,  # disease
            5: 0.1,   # unseasonal_rain
            6: 0.1,   # frost
            7: 0.05,  # fire
            8: 0.1,   # other
        }

        loss_type_code = features.get('loss_type_code', 8)
        base_probability += loss_type_impacts.get(loss_type_code, 0.1)

        # Growth stage impacts (higher probability at critical stages)
        growth_stage = features.get('growth_stage', 1)
        if growth_stage == 2:  # flowering
            base_probability += 0.15
        elif growth_stage == 3:  # maturity
            base_probability += 0.1

        # Weather deviations
        rainfall = features.get('rainfall_current_month', 50)
        if rainfall < 20:
            base_probability += 0.2
        elif rainfall > 200:
            base_probability += 0.15

        temp_dev = features.get('temperature_deviation', 0)
        if abs(temp_dev) > 5:
            base_probability += 0.1

        # Cap probability
        loss_probability = min(0.95, base_probability)

        severity = self._estimate_severity(features, loss_probability)
        damage_percentage = self._estimate_damage(features, loss_probability)
        contributing_factors = self._get_contributing_factors(features)
        preventive_measures = self._get_preventive_measures(features)

        return {
            'loss_probability': round(loss_probability * 100, 1),
            'probability_category': self._categorize_probability(loss_probability),
            'estimated_severity': severity,
            'estimated_damage_percentage': damage_percentage,
            'contributing_factors': contributing_factors,
            'preventive_measures': preventive_measures,
            'model_type': 'rule_based'
        }

    def _categorize_probability(self, prob):
        """Categorize probability into human-readable category"""
        if prob < 0.2:
            return 'unlikely'
        elif prob < 0.4:
            return 'possible'
        elif prob < 0.6:
            return 'likely'
        elif prob < 0.8:
            return 'highly_likely'
        else:
            return 'almost_certain'

    def _estimate_severity(self, features, probability):
        """Estimate loss severity level"""
        if probability < 0.3:
            return 'mild'
        elif probability < 0.5:
            return 'moderate'
        elif probability < 0.7:
            return 'severe'
        else:
            return 'total'

    def _estimate_damage(self, features, probability):
        """Estimate damage percentage"""
        base_damage = probability * 100

        # Adjust based on loss type severity
        loss_type_code = features.get('loss_type_code', 8)
        severe_types = [0, 1, 2]  # drought, flood, hailstorm
        if loss_type_code in severe_types:
            base_damage *= 1.2

        return min(100, round(base_damage))

    def _get_contributing_factors(self, features):
        """Identify factors contributing to loss risk"""
        factors = []

        loss_type_code = features.get('loss_type_code', 8)
        loss_type_names = {
            0: ('Drought conditions', 'दुष्काळ परिस्थिती'),
            1: ('Flood risk', 'पूर धोका'),
            2: ('Hailstorm damage', 'गारपीट नुकसान'),
            3: ('Pest infestation', 'कीड प्रादुर्भाव'),
            4: ('Crop disease', 'पीक रोग'),
            5: ('Unseasonal rain', 'अवकाळी पाऊस'),
            6: ('Frost damage', 'दंव नुकसान'),
            7: ('Fire damage', 'आग नुकसान'),
            8: ('Other factors', 'इतर घटक'),
        }

        name, name_mr = loss_type_names.get(loss_type_code, ('Unknown', 'अज्ञात'))
        factors.append({
            'factor': name,
            'factor_mr': name_mr,
            'severity': 'primary'
        })

        rainfall = features.get('rainfall_current_month', 50)
        if rainfall < 20:
            factors.append({
                'factor': 'Low rainfall this month',
                'factor_mr': 'या महिन्यात कमी पाऊस',
                'severity': 'contributing'
            })
        elif rainfall > 200:
            factors.append({
                'factor': 'Excessive rainfall',
                'factor_mr': 'जास्त पाऊस',
                'severity': 'contributing'
            })

        temp_dev = features.get('temperature_deviation', 0)
        if temp_dev > 5:
            factors.append({
                'factor': 'Higher than normal temperature',
                'factor_mr': 'सामान्यपेक्षा जास्त तापमान',
                'severity': 'contributing'
            })
        elif temp_dev < -5:
            factors.append({
                'factor': 'Lower than normal temperature',
                'factor_mr': 'सामान्यपेक्षा कमी तापमान',
                'severity': 'contributing'
            })

        return factors

    def _get_preventive_measures(self, features):
        """Suggest preventive measures based on loss type"""
        measures = []
        loss_type_code = features.get('loss_type_code', 8)

        # General measures
        measures.append({
            'measure': 'Document crop condition with geo-tagged photos',
            'measure_mr': 'जिओ-टॅग फोटोंसह पीक स्थिती नोंदवा'
        })

        # Specific measures based on loss type
        if loss_type_code == 0:  # drought
            measures.extend([
                {'measure': 'Implement mulching to retain soil moisture', 'measure_mr': 'आच्छादन करून जमिनीतील ओलावा टिकवा'},
                {'measure': 'Use drip irrigation if available', 'measure_mr': 'उपलब्ध असल्यास ठिबक सिंचन वापरा'},
            ])
        elif loss_type_code == 1:  # flood
            measures.extend([
                {'measure': 'Ensure proper drainage in fields', 'measure_mr': 'शेतात योग्य निचरा सुनिश्चित करा'},
                {'measure': 'Shift to raised bed cultivation if possible', 'measure_mr': 'शक्य असल्यास वाफे पद्धती वापरा'},
            ])
        elif loss_type_code in [3, 4]:  # pest/disease
            measures.extend([
                {'measure': 'Apply recommended pesticides/fungicides', 'measure_mr': 'शिफारस केलेली कीटकनाशके/बुरशीनाशके वापरा'},
                {'measure': 'Contact local agriculture officer', 'measure_mr': 'स्थानिक कृषी अधिकाऱ्यांशी संपर्क साधा'},
            ])

        # Insurance recommendation
        measures.append({
            'measure': 'File claim under PMFBY if insured',
            'measure_mr': 'विमा असल्यास PMFBY अंतर्गत दावा दाखल करा'
        })

        return measures
