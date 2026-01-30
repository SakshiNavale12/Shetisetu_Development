import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'MajorProject@2026!SecureKey')
    MODEL_PATH = os.environ.get('MODEL_PATH', 'data/models')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    PORT = int(os.environ.get('ML_SERVICE_PORT', 5000))

    # Cache settings
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 3600  # 1 hour
