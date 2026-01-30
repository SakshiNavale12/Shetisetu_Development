from functools import wraps
from flask import request, jsonify, current_app
import jwt


def require_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid token format'
                }), 401

        if not token:
            return jsonify({
                'success': False,
                'error': 'Token is missing'
            }), 401

        try:
            # Decode the token using the same secret as Node.js backend
            jwt_secret = current_app.config.get('JWT_SECRET')
            payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': 'Invalid token'
            }), 401

        return f(*args, **kwargs)

    return decorated
