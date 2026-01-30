from flask import Blueprint, jsonify
import os

bp = Blueprint('health', __name__)


@bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    models_path = os.environ.get('MODEL_PATH', 'data/models')

    # Check if models exist
    yield_model_exists = os.path.exists(os.path.join(models_path, 'yield_model.joblib'))
    risk_model_exists = os.path.exists(os.path.join(models_path, 'risk_model.joblib'))
    loss_model_exists = os.path.exists(os.path.join(models_path, 'loss_model.joblib'))

    return jsonify({
        'status': 'healthy',
        'service': 'Smart Agriculture ML Service',
        'version': '1.0.0',
        'models': {
            'yield_prediction': 'loaded' if yield_model_exists else 'not_found',
            'risk_assessment': 'loaded' if risk_model_exists else 'not_found',
            'loss_probability': 'loaded' if loss_model_exists else 'not_found'
        }
    })
