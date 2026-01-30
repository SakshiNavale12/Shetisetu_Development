from flask import Blueprint, request, jsonify
from app.api.middleware.auth import require_auth
from app.models.loss_model import LossProbabilityModel
from app.services.feature_engineering import FeatureEngineer

bp = Blueprint('loss_probability', __name__)
model = LossProbabilityModel()
feature_engineer = FeatureEngineer()


@bp.route('/', methods=['POST'])
@require_auth
def predict_loss():
    """
    Predict loss probability

    Request Body:
    {
        "district": "solapur",
        "cropName": "sugarcane",
        "lossType": "drought",
        "growthStage": "maturity",
        "affectedArea": 3.0,
        "unit": "hectare",
        "currentMonthRainfall": 15.5,
        "temperatureDeviation": 3.2,
        "daysSinceSowing": 180
    }
    """
    data = request.get_json()

    # Validate required fields
    required = ['district', 'cropName', 'affectedArea']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({
            'success': False,
            'error': f'Missing required fields: {missing}'
        }), 400

    try:
        features = feature_engineer.prepare_loss_features(data)
        prediction = model.predict(features)

        return jsonify({
            'success': True,
            'data': prediction
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Loss prediction failed: {str(e)}'
        }), 500
