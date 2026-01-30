from flask import Flask
from flask_cors import CORS
from app.config import Config


def create_app(config_class=Config):
    """Flask application factory"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for Node.js backend and React frontend
    CORS(app, origins=[
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5174"
    ])

    # Register blueprints
    from app.api.routes import health, yield_prediction, risk_assessment, loss_probability

    app.register_blueprint(health.bp, url_prefix='/api/v1/health')
    app.register_blueprint(yield_prediction.bp, url_prefix='/api/v1/predict/yield')
    app.register_blueprint(risk_assessment.bp, url_prefix='/api/v1/predict/risk')
    app.register_blueprint(loss_probability.bp, url_prefix='/api/v1/predict/loss')

    # Register error handlers
    from app.api.middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    return app
