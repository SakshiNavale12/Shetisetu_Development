from flask import Blueprint, request, jsonify
from app.api.middleware.auth import require_auth
from app.models.yield_model import YieldPredictionModel
from app.services.feature_engineering import FeatureEngineer

bp = Blueprint('yield_prediction', __name__)
model = YieldPredictionModel()
feature_engineer = FeatureEngineer()


@bp.route('/', methods=['POST'])
@require_auth
def predict_yield():
    """
    Predict crop yield

    Request Body:
    {
        "district": "pune",
        "taluka": "haveli",
        "cropName": "wheat",
        "cropType": "cereals",
        "season": "rabi",
        "cultivatedArea": 2.5,
        "unit": "hectare",
        "irrigationType": "canal",
        "sowingDate": "2024-11-15"
    }
    """
    data = request.get_json()

    # Validate required fields
    required = ['district', 'cropName', 'season', 'cultivatedArea', 'irrigationType', 'sowingDate']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({
            'success': False,
            'error': f'Missing required fields: {missing}'
        }), 400

    try:
        features = feature_engineer.prepare_yield_features(data)
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
            'error': f'Prediction failed: {str(e)}'
        }), 500
