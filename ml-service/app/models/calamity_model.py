import joblib
import numpy as np
import os
from datetime import datetime


class CalamityVerificationModel:
    """
    ML model wrapper for verifying whether a claimed calamity
    (drought/flood/hailstorm/pest/etc.) actually occurred at
    a given geo-location and time in Maharashtra.
    """

    # Same codes as feature_engineering.py
    LOSS_TYPE_CODES = {
        'drought': 0, 'flood': 1, 'hailstorm': 2, 'pest': 3,
        'disease': 4, 'unseasonal_rain': 5, 'frost': 6, 'fire': 7, 'other': 8,
    }

    DISTRICT_CODES = {
        'ahmednagar': 1, 'akola': 2, 'amravati': 3, 'aurangabad': 4,
        'beed': 5, 'bhandara': 6, 'buldhana': 7, 'chandrapur': 8,
        'dhule': 9, 'gadchiroli': 10, 'gondia': 11, 'hingoli': 12,
        'jalgaon': 13, 'jalna': 14, 'kolhapur': 15, 'latur': 16,
        'mumbai': 17, 'mumbai suburban': 18, 'nagpur': 19, 'nanded': 20,
        'nandurbar': 21, 'nashik': 22, 'osmanabad': 23, 'palghar': 24,
        'parbhani': 25, 'pune': 26, 'raigad': 27, 'ratnagiri': 28,
        'sangli': 29, 'satara': 30, 'sindhudurg': 31, 'solapur': 32,
        'thane': 33, 'wardha': 34, 'washim': 35, 'yavatmal': 36,
    }

    DROUGHT_SCORES = {
        1: 0.70, 2: 0.60, 3: 0.50, 4: 0.80, 5: 0.85, 6: 0.20, 7: 0.60,
        8: 0.30, 9: 0.60, 10: 0.20, 11: 0.20, 12: 0.70, 13: 0.65, 14: 0.75,
        15: 0.20, 16: 0.80, 17: 0.10, 18: 0.10, 19: 0.40, 20: 0.70, 21: 0.50,
        22: 0.50, 23: 0.85, 24: 0.20, 25: 0.75, 26: 0.40, 27: 0.15, 28: 0.10,
        29: 0.60, 30: 0.40, 31: 0.10, 32: 0.90, 33: 0.15, 34: 0.50, 35: 0.65,
        36: 0.60,
    }
    FLOOD_SCORES = {
        1: 0.20, 2: 0.30, 3: 0.30, 4: 0.20, 5: 0.15, 6: 0.60, 7: 0.25,
        8: 0.50, 9: 0.30, 10: 0.70, 11: 0.65, 12: 0.20, 13: 0.35, 14: 0.20,
        15: 0.70, 16: 0.15, 17: 0.80, 18: 0.75, 19: 0.40, 20: 0.30, 21: 0.40,
        22: 0.40, 23: 0.15, 24: 0.60, 25: 0.25, 26: 0.50, 27: 0.65, 28: 0.70,
        29: 0.50, 30: 0.55, 31: 0.60, 32: 0.10, 33: 0.70, 34: 0.35, 35: 0.25,
        36: 0.35,
    }

    # Human-readable evidence messages (en / mr)
    EVIDENCE_TEXTS = {
        0: ('Drought', 'दुष्काळ', 'Historical IMD rainfall records show below-normal precipitation in this district during reported period.', 'या जिल्ह्यात नोंदवलेल्या कालावधीत सामान्यपेक्षा कमी पर्जन्यमान आढळले.'),
        1: ('Flood', 'पूर', 'Monsoon river overflow and waterlogging events historically confirmed in this region during the reported month.', 'या प्रदेशात नोंदवलेल्या महिन्यात ऐतिहासिकदृष्ट्या पूरपरिस्थिती नोंदवली गेली आहे.'),
        2: ('Hailstorm', 'गारपीठ', 'Convective storm activity and hailstorm events are historically recorded in this district during March-April and November.', 'मार्च-एप्रिल व नोव्हेंबर दरम्यान या जिल्ह्यात गारपीट घटना नोंदवल्या गेल्या आहेत.'),
        3: ('Pest Attack', 'कीड प्रादुर्भाव', 'Cotton bollworm and other pest infestations are historically prevalent in Vidarbha-Marathwada belt during kharif season.', 'खरीप हंगामात विदर्भ-मराठवाड्यात कीड प्रादुर्भाव ऐतिहासिकदृष्ट्या आढळतो.'),
        4: ('Crop Disease', 'पीक रोग', 'Fungal/bacterial disease outbreaks are common across Maharashtra during high-humidity kharif months.', 'खरीप हंगामात जास्त आर्द्रतेदरम्यान महाराष्ट्रात बुरशीजन्य रोग आढळतात.'),
        5: ('Unseasonal Rain', 'अवेळी पाऊस', 'Unseasonal rainfall events in October-November pre-harvest period are historically documented across Maharashtra.', 'ऑक्टोबर-नोव्हेंबर काढणीपूर्व काळात अवेळी पाऊस महाराष्ट्रात नोंदवला जातो.'),
        6: ('Frost', 'दंव', 'Winter frost events in December-January affect grape and vegetable cultivation in Nashik, Pune, Satara districts.', 'डिसेंबर-जानेवारीत नाशिक, पुणे, सातारा जिल्ह्यांत दंव द्राक्ष व भाजीपाला पिकांवर परिणाम करते.'),
        7: ('Fire', 'आग', 'Field fires during dry summer months (April-May) are historically recorded in drought-prone districts.', 'एप्रिल-मे दरम्यान दुष्काळग्रस्त जिल्ह्यांत उन्हाळ्यात शेत आग नोंदवली जाते.'),
        8: ('Other', 'इतर', 'Calamity type reported requires on-ground verification by agriculture officer.', 'नोंदवलेल्या नुकसानाच्या प्रकारासाठी कृषी अधिकाऱ्याची प्रत्यक्ष पडताळणी आवश्यक आहे.'),
    }

    def __init__(self, model_path=None):
        self.model = None
        self.scaler = None
        base = model_path or os.path.join('data', 'models')
        self.model_path  = os.path.join(base, 'calamity_model.joblib')
        self.scaler_path = os.path.join(base, 'calamity_model_scaler.joblib')
        self._load()

    def _load(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
        except Exception as e:
            print(f"Warning: Could not load calamity model: {e}")

    def _extract_month(self, date_str):
        if not date_str:
            return datetime.now().month
        for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%Y/%m/%d', '%d/%m/%Y']:
            try:
                return datetime.strptime(str(date_str)[:10], fmt).month
            except ValueError:
                continue
        return datetime.now().month

    def _season(self, month):
        if month in [6, 7, 8, 9, 10]:
            return 1  # kharif
        if month in [11, 12, 1, 2, 3]:
            return 2  # rabi
        return 3  # summer

    def predict(self, data: dict) -> dict:
        """
        Verify whether a calamity is historically plausible at the given
        location and time.

        Args:
            data: dict with keys:
                district  (str)
                latitude  (float)
                longitude (float)
                lossDate  (str, YYYY-MM-DD)
                lossType  (str, e.g. 'drought')

        Returns:
            dict with calamity_verified, confidence, evidence_summary, reasoning_mr, model_type
        """
        district   = (data.get('district') or '').lower().strip()
        latitude   = float(data.get('latitude') or 0)
        longitude  = float(data.get('longitude') or 0)
        loss_type  = (data.get('lossType') or 'other').lower().strip()
        loss_date  = data.get('lossDate') or ''

        district_code  = self.DISTRICT_CODES.get(district, 0)
        loss_type_code = self.LOSS_TYPE_CODES.get(loss_type, 8)
        month          = self._extract_month(loss_date)
        season_code    = self._season(month)
        drought_score  = self.DROUGHT_SCORES.get(district_code, 0.4)
        flood_score    = self.FLOOD_SCORES.get(district_code, 0.3)

        if self.model is None or self.scaler is None:
            return self._rule_based(loss_type_code, district_code, month, drought_score, flood_score)

        feature_array = np.array([[
            district_code,
            latitude,
            longitude,
            month,
            loss_type_code,
            drought_score,
            flood_score,
            season_code,
        ]])
        feature_scaled = self.scaler.transform(feature_array)
        confidence = float(self.model.predict_proba(feature_scaled)[0][1])

        verified       = confidence >= 0.50
        evidence       = self.EVIDENCE_TEXTS.get(loss_type_code, self.EVIDENCE_TEXTS[8])
        confidence_pct = round(confidence * 100, 1)

        return {
            'calamity_verified':  verified,
            'confidence':         confidence_pct,
            'confidence_label':   self._confidence_label(confidence_pct),
            'calamity_type':      evidence[0],
            'calamity_type_mr':   evidence[1],
            'evidence_summary':   evidence[2] if verified else f'Historical data does not strongly support {evidence[0].lower()} at this location during the reported period. Officer site visit recommended.',
            'evidence_summary_mr': evidence[3] if verified else f'ऐतिहासिक डेटा या स्थानी नोंदवलेल्या {evidence[1]} ला पुरेसा आधार देत नाही. कृषी अधिकाऱ्याची भेट आवश्यक.',
            'district_analyzed':  district or 'unknown',
            'month_analyzed':     month,
            'model_type':         'ml_model',
        }

    def _confidence_label(self, pct: float) -> str:
        if pct >= 80:
            return 'High Confidence'
        if pct >= 60:
            return 'Moderate Confidence'
        if pct >= 40:
            return 'Low Confidence'
        return 'Very Low Confidence'

    def _rule_based(self, loss_type_code, district_code, month, drought_score, flood_score):
        """Fallback when model files are missing."""
        score = 0.3
        # Drought
        if loss_type_code == 0:
            score = drought_score * (0.9 if month in [4, 5, 6] else 0.5)
        # Flood
        elif loss_type_code == 1:
            score = flood_score * (0.9 if month in [6, 7, 8, 9] else 0.3)
        # Hailstorm
        elif loss_type_code == 2:
            hail_prone = {1, 4, 5, 14, 22, 25, 26, 29, 30}
            base = 0.65 if district_code in hail_prone else 0.20
            score = base * (0.9 if month in [3, 4, 11] else 0.3)
        # Pest
        elif loss_type_code == 3:
            pest_prone = {2, 3, 5, 7, 12, 14, 20, 25, 34, 35, 36}
            base = 0.75 if district_code in pest_prone else 0.25
            score = base * (0.9 if month in [7, 8, 9, 10] else 0.3)
        # Unseasonal rain
        elif loss_type_code == 5:
            score = 0.65 if month in [10, 11, 2, 3] else 0.25
        # Frost
        elif loss_type_code == 6:
            frost_prone = {22, 26, 29, 30}
            base = 0.70 if district_code in frost_prone else 0.15
            score = base * (0.9 if month in [12, 1] else 0.2)

        verified  = score >= 0.50
        confidence_pct = round(min(score, 0.95) * 100, 1)
        evidence  = self.EVIDENCE_TEXTS.get(loss_type_code, self.EVIDENCE_TEXTS[8])

        return {
            'calamity_verified':  verified,
            'confidence':         confidence_pct,
            'confidence_label':   self._confidence_label(confidence_pct),
            'calamity_type':      evidence[0],
            'calamity_type_mr':   evidence[1],
            'evidence_summary':   evidence[2] if verified else f'Historical data does not strongly support {evidence[0].lower()} at this location during the reported period.',
            'evidence_summary_mr': evidence[3],
            'district_analyzed':  str(district_code),
            'month_analyzed':     month,
            'model_type':         'rule_based',
        }
