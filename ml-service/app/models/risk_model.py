import joblib
import numpy as np
import os


class RiskAssessmentModel:
    """Wrapper for cultivation risk assessment model"""

    RISK_LEVELS = ['low', 'moderate', 'high', 'very_high']

    def __init__(self, model_path=None):
        self.model = None
        self.scaler = None
        self.model_path = model_path or os.path.join('data', 'models', 'risk_model.joblib')
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
            print(f"Warning: Could not load risk model: {e}")
            self.model = None
            self.scaler = None

    def predict(self, features):
        """
        Assess cultivation risk

        Args:
            features: dict with preprocessed features

        Returns:
            dict with risk_level, risk_score, risk_factors, recommendations
        """
        if self.model is None:
            return self._rule_based_prediction(features)

        feature_array = np.array([[
            features['district_code'],
            features['crop_code'],
            features['season_code'],
            features['irrigation_type'],
            features['area_hectares'],
            features.get('historical_loss_rate', 0),
            features.get('drought_prone_score', 0.5),
            features.get('flood_prone_score', 0.3),
            features.get('pest_history_score', 0.2),
        ]])

        if self.scaler:
            feature_array = self.scaler.transform(feature_array)

        probabilities = self.model.predict_proba(feature_array)[0]
        risk_class = np.argmax(probabilities)
        risk_score = self._calculate_risk_score(probabilities)
        risk_factors = self._identify_risk_factors(features)
        recommendations = self._get_recommendations(risk_class, risk_factors)

        return {
            'risk_level': self.RISK_LEVELS[risk_class],
            'risk_score': round(risk_score, 2),
            'probability_distribution': {
                level: round(prob * 100, 1)
                for level, prob in zip(self.RISK_LEVELS, probabilities)
            },
            'risk_factors': risk_factors,
            'recommendations': recommendations,
            'model_type': 'ml_model'
        }

    def _rule_based_prediction(self, features):
        """Fallback rule-based risk assessment"""
        risk_score = 20  # Base score

        # Irrigation factor
        if features.get('irrigation_type', 0) == 0:  # rainfed
            risk_score += 25

        # District drought/flood prone scores
        drought_score = features.get('drought_prone_score', 0.5)
        flood_score = features.get('flood_prone_score', 0.3)
        risk_score += drought_score * 20 + flood_score * 15

        # Historical loss rate
        loss_rate = features.get('historical_loss_rate', 0)
        risk_score += loss_rate * 30

        # Pest history
        pest_score = features.get('pest_history_score', 0.2)
        risk_score += pest_score * 10

        # Cap at 100
        risk_score = min(100, risk_score)

        # Determine risk level
        if risk_score < 30:
            risk_class = 0  # low
        elif risk_score < 50:
            risk_class = 1  # moderate
        elif risk_score < 70:
            risk_class = 2  # high
        else:
            risk_class = 3  # very_high

        risk_factors = self._identify_risk_factors(features)
        recommendations = self._get_recommendations(risk_class, risk_factors)

        # Create probability distribution
        probs = [0.1, 0.1, 0.1, 0.1]
        probs[risk_class] = 0.7

        return {
            'risk_level': self.RISK_LEVELS[risk_class],
            'risk_score': round(risk_score, 2),
            'probability_distribution': {
                level: round(prob * 100, 1)
                for level, prob in zip(self.RISK_LEVELS, probs)
            },
            'risk_factors': risk_factors,
            'recommendations': recommendations,
            'model_type': 'rule_based'
        }

    def _calculate_risk_score(self, probabilities):
        """Calculate weighted risk score (0-100)"""
        weights = [0, 33, 66, 100]
        return sum(p * w for p, w in zip(probabilities, weights))

    def _identify_risk_factors(self, features):
        """Identify top risk factors"""
        factors = []

        if features.get('irrigation_type', 0) == 0:
            factors.append({
                'factor': 'Rainfed cultivation',
                'factor_mr': 'पावसावर अवलंबून शेती',
                'impact': 'high',
                'description': 'No irrigation backup increases drought risk'
            })

        if features.get('drought_prone_score', 0) > 0.6:
            factors.append({
                'factor': 'Drought-prone region',
                'factor_mr': 'दुष्काळप्रवण प्रदेश',
                'impact': 'high',
                'description': 'District has high historical drought incidence'
            })

        if features.get('flood_prone_score', 0) > 0.6:
            factors.append({
                'factor': 'Flood-prone region',
                'factor_mr': 'पूरप्रवण प्रदेश',
                'impact': 'high',
                'description': 'District susceptible to flooding'
            })

        if features.get('historical_loss_rate', 0) > 0.3:
            factors.append({
                'factor': 'Historical losses',
                'factor_mr': 'पूर्वीचे नुकसान',
                'impact': 'moderate',
                'description': 'Previous crop losses recorded in this area'
            })

        if features.get('pest_history_score', 0) > 0.5:
            factors.append({
                'factor': 'Pest/Disease history',
                'factor_mr': 'कीड/रोग इतिहास',
                'impact': 'moderate',
                'description': 'Area has history of pest or disease outbreaks'
            })

        return factors

    def _get_recommendations(self, risk_class, risk_factors):
        """Generate actionable recommendations"""
        recommendations = []

        if risk_class >= 2:  # high or very_high
            recommendations.append({
                'priority': 'high',
                'action': 'Consider crop insurance under PMFBY',
                'action_mr': 'PMFBY अंतर्गत पीक विमा घ्या',
                'benefit': 'Financial protection against losses'
            })

        for factor in risk_factors:
            if factor['factor'] == 'Rainfed cultivation':
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Explore drip or sprinkler irrigation',
                    'action_mr': 'ठिबक किंवा तुषार सिंचन वापरा',
                    'benefit': 'Reduces water dependency on rainfall'
                })
            if 'Drought' in factor['factor']:
                recommendations.append({
                    'priority': 'high',
                    'action': 'Select drought-resistant crop varieties',
                    'action_mr': 'दुष्काळ-प्रतिरोधक वाण निवडा',
                    'benefit': 'Better survival in low rainfall conditions'
                })
            if 'Pest' in factor['factor']:
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Implement integrated pest management',
                    'action_mr': 'एकात्मिक कीड व्यवस्थापन करा',
                    'benefit': 'Reduces pest damage risk'
                })

        return recommendations
