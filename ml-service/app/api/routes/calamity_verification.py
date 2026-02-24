from flask import Blueprint, request, jsonify
from app.api.middleware.auth import require_auth
from app.models.calamity_model import CalamityVerificationModel

bp = Blueprint('calamity_verification', __name__)

# Instantiate model once at import time
_model = CalamityVerificationModel()


@bp.route('', methods=['POST'])
@require_auth
def verify_calamity():
    """
    POST /api/v1/predict/calamity
    Verify whether a claimed agricultural calamity actually occurred
    at the given geo-location and time.

    Request body:
        district   (str)   - Maharashtra district name
        latitude   (float) - GPS latitude of affected field
        longitude  (float) - GPS longitude of affected field
        lossDate   (str)   - Reported loss date (YYYY-MM-DD)
        lossType   (str)   - drought | flood | hailstorm | pest |
                             disease | unseasonal_rain | frost | fire | other

    Response:
        calamity_verified  (bool)  - AI verdict
        confidence         (float) - Confidence % (0-100)
        confidence_label   (str)   - High / Moderate / Low / Very Low
        calamity_type      (str)   - English name
        calamity_type_mr   (str)   - Marathi name
        evidence_summary   (str)   - English evidence description
        evidence_summary_mr (str)  - Marathi evidence description
        district_analyzed  (str)
        month_analyzed     (int)
        model_type         (str)   - ml_model | rule_based
    """
    data = request.get_json(force=True)

    if not data:
        return jsonify({'success': False, 'error': 'Request body is required'}), 400

    # Validate required fields
    required = ['district', 'lossType']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({
            'success': False,
            'error': f"Missing required fields: {', '.join(missing)}"
        }), 400

    valid_loss_types = [
        'drought', 'flood', 'hailstorm', 'pest',
        'disease', 'unseasonal_rain', 'frost', 'fire', 'other'
    ]
    if data.get('lossType', '').lower() not in valid_loss_types:
        return jsonify({
            'success': False,
            'error': f"Invalid lossType. Must be one of: {', '.join(valid_loss_types)}"
        }), 400

    result = _model.predict(data)
    return jsonify({'success': True, **result}), 200
