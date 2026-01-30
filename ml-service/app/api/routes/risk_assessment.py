from flask import Blueprint, request, jsonify
from app.api.middleware.auth import require_auth
from app.models.risk_model import RiskAssessmentModel
from app.services.feature_engineering import FeatureEngineer

bp = Blueprint('risk_assessment', __name__)
model = RiskAssessmentModel()
feature_engineer = FeatureEngineer()


@bp.route('/', methods=['POST'])
@require_auth
def assess_risk():
    """
    Assess cultivation risk

    Request Body:
    {
        "district": "nashik",
        "taluka": "dindori",
        "cropName": "onion",
        "cropType": "vegetables",
        "season": "rabi",
        "cultivatedArea": 1.5,
        "irrigationType": "drip",
        "historicalLossRate": 0.15
    }
    """
    data = request.get_json()

    # Validate required fields
    required = ['district', 'cropName', 'season', 'cultivatedArea', 'irrigationType']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({
            'success': False,
            'error': f'Missing required fields: {missing}'
        }), 400

    try:
        features = feature_engineer.prepare_risk_features(data)
        assessment = model.predict(features)

        return jsonify({
            'success': True,
            'data': assessment
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Risk assessment failed: {str(e)}'
        }), 500
