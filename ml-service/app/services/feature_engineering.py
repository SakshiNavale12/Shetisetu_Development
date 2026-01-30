from datetime import datetime


class FeatureEngineer:
    """Transform raw inputs into model features for Maharashtra agriculture data"""

    # Maharashtra districts with codes
    DISTRICT_CODES = {
        'ahmednagar': 1, 'akola': 2, 'amravati': 3, 'aurangabad': 4,
        'beed': 5, 'bhandara': 6, 'buldhana': 7, 'chandrapur': 8,
        'dhule': 9, 'gadchiroli': 10, 'gondia': 11, 'hingoli': 12,
        'jalgaon': 13, 'jalna': 14, 'kolhapur': 15, 'latur': 16,
        'mumbai': 17, 'mumbai suburban': 18, 'nagpur': 19, 'nanded': 20,
        'nandurbar': 21, 'nashik': 22, 'osmanabad': 23, 'palghar': 24,
        'parbhani': 25, 'pune': 26, 'raigad': 27, 'ratnagiri': 28,
        'sangli': 29, 'satara': 30, 'sindhudurg': 31, 'solapur': 32,
        'thane': 33, 'wardha': 34, 'washim': 35, 'yavatmal': 36
    }

    # Crop codes for Maharashtra crops
    CROP_CODES = {
        'rice': 1, 'paddy': 1, 'wheat': 2, 'jowar': 3, 'sorghum': 3,
        'bajra': 4, 'pearl millet': 4, 'maize': 5, 'corn': 5,
        'sugarcane': 6, 'cotton': 7, 'soybean': 8, 'soya': 8,
        'groundnut': 9, 'onion': 10, 'grapes': 11, 'pomegranate': 12,
        'orange': 13, 'banana': 14, 'mango': 15, 'turmeric': 16,
        'ginger': 17, 'chilli': 18, 'tomato': 19, 'potato': 20,
        'chickpea': 21, 'gram': 21, 'pigeon pea': 22, 'tur': 22, 'arhar': 22,
        'green gram': 23, 'moong': 23, 'black gram': 24, 'urad': 24,
        'sunflower': 25, 'safflower': 26, 'mustard': 27, 'linseed': 28
    }

    SEASON_CODES = {
        'kharif': 1,
        'rabi': 2,
        'summer': 3,
        'zaid': 3,
        'perennial': 4,
        'whole year': 4
    }

    IRRIGATION_CODES = {
        'rainfed': 0,
        'canal': 1,
        'well': 2,
        'borewell': 3,
        'tubewell': 3,
        'drip': 4,
        'sprinkler': 5,
        'mixed': 6,
        'other': 6
    }

    LOSS_TYPE_CODES = {
        'drought': 0,
        'flood': 1,
        'hailstorm': 2,
        'pest': 3,
        'disease': 4,
        'unseasonal_rain': 5,
        'frost': 6,
        'fire': 7,
        'other': 8
    }

    GROWTH_STAGE_CODES = {
        'germination': 0,
        'seedling': 0,
        'vegetative': 1,
        'flowering': 2,
        'maturity': 3,
        'harvest': 3
    }

    # District-wise drought and flood prone scores (0-1)
    DROUGHT_PRONE_SCORES = {
        'ahmednagar': 0.7, 'akola': 0.6, 'amravati': 0.5, 'aurangabad': 0.8,
        'beed': 0.85, 'bhandara': 0.2, 'buldhana': 0.6, 'chandrapur': 0.3,
        'dhule': 0.6, 'gadchiroli': 0.2, 'gondia': 0.2, 'hingoli': 0.7,
        'jalgaon': 0.65, 'jalna': 0.75, 'kolhapur': 0.2, 'latur': 0.8,
        'mumbai': 0.1, 'mumbai suburban': 0.1, 'nagpur': 0.4, 'nanded': 0.7,
        'nandurbar': 0.5, 'nashik': 0.5, 'osmanabad': 0.85, 'palghar': 0.2,
        'parbhani': 0.75, 'pune': 0.4, 'raigad': 0.15, 'ratnagiri': 0.1,
        'sangli': 0.6, 'satara': 0.4, 'sindhudurg': 0.1, 'solapur': 0.9,
        'thane': 0.15, 'wardha': 0.5, 'washim': 0.65, 'yavatmal': 0.6
    }

    FLOOD_PRONE_SCORES = {
        'ahmednagar': 0.2, 'akola': 0.3, 'amravati': 0.3, 'aurangabad': 0.2,
        'beed': 0.15, 'bhandara': 0.6, 'buldhana': 0.25, 'chandrapur': 0.5,
        'dhule': 0.3, 'gadchiroli': 0.7, 'gondia': 0.65, 'hingoli': 0.2,
        'jalgaon': 0.35, 'jalna': 0.2, 'kolhapur': 0.7, 'latur': 0.15,
        'mumbai': 0.8, 'mumbai suburban': 0.75, 'nagpur': 0.4, 'nanded': 0.3,
        'nandurbar': 0.4, 'nashik': 0.4, 'osmanabad': 0.15, 'palghar': 0.6,
        'parbhani': 0.25, 'pune': 0.5, 'raigad': 0.65, 'ratnagiri': 0.7,
        'sangli': 0.5, 'satara': 0.55, 'sindhudurg': 0.6, 'solapur': 0.1,
        'thane': 0.7, 'wardha': 0.35, 'washim': 0.25, 'yavatmal': 0.35
    }

    def prepare_yield_features(self, data):
        """Prepare features for yield prediction model"""
        district = data.get('district', '').lower().strip()
        crop = data.get('cropName', '').lower().strip()
        season = data.get('season', 'kharif').lower().strip()
        irrigation = data.get('irrigationType', 'rainfed').lower().strip()

        # Convert area to hectares
        area = data.get('cultivatedArea', 1)
        unit = data.get('unit', 'hectare').lower()
        area_hectares = self._convert_to_hectares(area, unit)

        # Extract sowing month
        sowing_date = data.get('sowingDate', '')
        sowing_month = self._extract_month(sowing_date)

        return {
            'district_code': self.DISTRICT_CODES.get(district, 0),
            'crop_code': self.CROP_CODES.get(crop, 0),
            'season_code': self.SEASON_CODES.get(season, 1),
            'area_hectares': area_hectares,
            'irrigation_type': self.IRRIGATION_CODES.get(irrigation, 0),
            'sowing_month': sowing_month,
            'historical_yield_avg': data.get('historicalYieldAvg', 25),
            'rainfall_deviation': data.get('rainfallDeviation', 0),
        }

    def prepare_risk_features(self, data):
        """Prepare features for risk assessment model"""
        district = data.get('district', '').lower().strip()
        crop = data.get('cropName', '').lower().strip()
        season = data.get('season', 'kharif').lower().strip()
        irrigation = data.get('irrigationType', 'rainfed').lower().strip()

        area = data.get('cultivatedArea', 1)
        unit = data.get('unit', 'hectare').lower()
        area_hectares = self._convert_to_hectares(area, unit)

        return {
            'district_code': self.DISTRICT_CODES.get(district, 0),
            'crop_code': self.CROP_CODES.get(crop, 0),
            'season_code': self.SEASON_CODES.get(season, 1),
            'irrigation_type': self.IRRIGATION_CODES.get(irrigation, 0),
            'area_hectares': area_hectares,
            'historical_loss_rate': data.get('historicalLossRate', 0.1),
            'drought_prone_score': self.DROUGHT_PRONE_SCORES.get(district, 0.5),
            'flood_prone_score': self.FLOOD_PRONE_SCORES.get(district, 0.3),
            'pest_history_score': data.get('pestHistoryScore', 0.2),
        }

    def prepare_loss_features(self, data):
        """Prepare features for loss probability model"""
        district = data.get('district', '').lower().strip()
        crop = data.get('cropName', '').lower().strip()
        loss_type = data.get('lossType', 'other').lower().strip()
        growth_stage = data.get('growthStage', 'vegetative').lower().strip()

        area = data.get('affectedArea', 1)
        unit = data.get('unit', 'hectare').lower()
        area_hectares = self._convert_to_hectares(area, unit)

        return {
            'district_code': self.DISTRICT_CODES.get(district, 0),
            'crop_code': self.CROP_CODES.get(crop, 0),
            'loss_type_code': self.LOSS_TYPE_CODES.get(loss_type, 8),
            'growth_stage': self.GROWTH_STAGE_CODES.get(growth_stage, 1),
            'area_hectares': area_hectares,
            'rainfall_current_month': data.get('currentMonthRainfall', 50),
            'temperature_deviation': data.get('temperatureDeviation', 0),
            'days_since_sowing': data.get('daysSinceSowing', 60),
        }

    def _convert_to_hectares(self, area, unit):
        """Convert area to hectares"""
        conversions = {
            'hectare': 1,
            'hectares': 1,
            'ha': 1,
            'are': 0.01,
            'ares': 0.01,
            'guntha': 0.01012,  # 1 guntha = 0.01012 hectare
            'gunthas': 0.01012,
            'acre': 0.4047,
            'acres': 0.4047,
            'bigha': 0.25,  # Approximate, varies by region
        }
        multiplier = conversions.get(unit.lower(), 1)
        return float(area) * multiplier

    def _extract_month(self, date_str):
        """Extract month from date string"""
        if not date_str:
            return 6  # Default to June (kharif season)

        try:
            # Try different date formats
            for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%Y/%m/%d', '%d/%m/%Y']:
                try:
                    dt = datetime.strptime(str(date_str)[:10], fmt)
                    return dt.month
                except ValueError:
                    continue

            # If string contains date object info
            if hasattr(date_str, 'month'):
                return date_str.month

            return 6
        except Exception:
            return 6
