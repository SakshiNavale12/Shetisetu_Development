from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('ML_SERVICE_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

    print("")
    print("=" * 60)
    print("    Smart Agriculture ML Service")
    print("    ShetiSetu AI Service")
    print("=" * 60)
    print(f"  Server running on: http://localhost:{port}")
    print(f"  Health check:      http://localhost:{port}/api/v1/health")
    print("")
    print("  Endpoints:")
    print("  - POST /api/v1/predict/yield      (Yield Prediction)")
    print("  - POST /api/v1/predict/risk        (Risk Assessment)")
    print("  - POST /api/v1/predict/loss        (Loss Probability)")
    print("  - POST /api/v1/predict/calamity    (Calamity Verification)")
    print("=" * 60)
    print("")

    app.run(host='0.0.0.0', port=port, debug=debug)
