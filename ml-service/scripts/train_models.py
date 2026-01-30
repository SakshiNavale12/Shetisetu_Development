"""
Model Training Script for Smart Agriculture ML Service
This script trains all three ML models using synthetic/sample data.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier, RandomForestClassifier
from xgboost import XGBRegressor
import joblib

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create data directories
os.makedirs('data/models', exist_ok=True)
os.makedirs('data/raw', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)


def generate_yield_data(n_samples=5000):
    """Generate synthetic yield data based on Maharashtra agriculture patterns"""
    np.random.seed(42)

    # Districts (1-36)
    districts = np.random.randint(1, 37, n_samples)

    # Crops (1-28)
    crops = np.random.randint(1, 29, n_samples)

    # Season (1=kharif, 2=rabi, 3=summer, 4=perennial)
    seasons = np.random.choice([1, 2, 3, 4], n_samples, p=[0.4, 0.35, 0.15, 0.1])

    # Area (0.5 to 20 hectares)
    areas = np.random.uniform(0.5, 20, n_samples)

    # Irrigation (0=rainfed, 1-6=others)
    irrigation = np.random.choice([0, 1, 2, 3, 4, 5, 6], n_samples, p=[0.35, 0.15, 0.15, 0.15, 0.1, 0.05, 0.05])

    # Sowing month (1-12)
    sowing_months = np.random.randint(1, 13, n_samples)

    # Historical yield average
    historical_avg = np.random.uniform(15, 40, n_samples)

    # Rainfall deviation (-50 to +50%)
    rainfall_dev = np.random.uniform(-50, 50, n_samples)

    # Generate target yield based on features
    base_yields = {
        1: 22, 2: 28, 3: 12, 4: 10, 5: 25, 6: 800, 7: 4, 8: 15,
        9: 12, 10: 180, 11: 120, 12: 100, 13: 80, 14: 300, 15: 100,
        16: 50, 17: 40, 18: 25, 19: 200, 20: 180, 21: 12, 22: 15,
        23: 8, 24: 7, 25: 10, 26: 8, 27: 10, 28: 6
    }

    yields = []
    for i in range(n_samples):
        base = base_yields.get(crops[i], 20)

        # Irrigation factor
        irr_mult = [0.7, 1.1, 1.0, 1.05, 1.2, 1.15, 1.1][irrigation[i]]

        # Season factor
        season_mult = [1.0, 1.0, 1.05, 0.9, 1.0][seasons[i]]

        # Rainfall factor
        rain_factor = 1 + (rainfall_dev[i] / 200)

        # Add some noise
        noise = np.random.normal(1, 0.15)

        yield_val = base * irr_mult * season_mult * rain_factor * noise
        yields.append(max(0, yield_val))

    return pd.DataFrame({
        'district_code': districts,
        'crop_code': crops,
        'season_code': seasons,
        'area_hectares': areas,
        'irrigation_type': irrigation,
        'sowing_month': sowing_months,
        'historical_yield_avg': historical_avg,
        'rainfall_deviation': rainfall_dev,
        'yield': yields
    })


def generate_risk_data(n_samples=5000):
    """Generate synthetic risk assessment data"""
    np.random.seed(43)

    districts = np.random.randint(1, 37, n_samples)
    crops = np.random.randint(1, 29, n_samples)
    seasons = np.random.choice([1, 2, 3, 4], n_samples, p=[0.4, 0.35, 0.15, 0.1])
    irrigation = np.random.choice([0, 1, 2, 3, 4, 5, 6], n_samples, p=[0.35, 0.15, 0.15, 0.15, 0.1, 0.05, 0.05])
    areas = np.random.uniform(0.5, 20, n_samples)
    historical_loss = np.random.uniform(0, 0.5, n_samples)
    drought_score = np.random.uniform(0, 1, n_samples)
    flood_score = np.random.uniform(0, 1, n_samples)
    pest_score = np.random.uniform(0, 1, n_samples)

    # Generate risk level based on features
    risk_scores = (
        (irrigation == 0).astype(float) * 25 +
        drought_score * 20 +
        flood_score * 15 +
        historical_loss * 30 +
        pest_score * 10 +
        np.random.uniform(0, 20, n_samples)
    )

    risk_levels = np.digitize(risk_scores, [30, 50, 70])

    return pd.DataFrame({
        'district_code': districts,
        'crop_code': crops,
        'season_code': seasons,
        'irrigation_type': irrigation,
        'area_hectares': areas,
        'historical_loss_rate': historical_loss,
        'drought_prone_score': drought_score,
        'flood_prone_score': flood_score,
        'pest_history_score': pest_score,
        'risk_level': risk_levels
    })


def generate_loss_data(n_samples=5000):
    """Generate synthetic loss probability data"""
    np.random.seed(44)

    districts = np.random.randint(1, 37, n_samples)
    crops = np.random.randint(1, 29, n_samples)
    loss_types = np.random.randint(0, 9, n_samples)
    growth_stages = np.random.randint(0, 4, n_samples)
    areas = np.random.uniform(0.5, 20, n_samples)
    rainfall = np.random.uniform(0, 300, n_samples)
    temp_dev = np.random.uniform(-10, 10, n_samples)
    days_sowing = np.random.randint(0, 200, n_samples)

    # Generate loss occurrence based on features
    loss_prob = (
        (loss_types < 3).astype(float) * 0.2 +
        (growth_stages == 2).astype(float) * 0.15 +
        (rainfall < 20).astype(float) * 0.2 +
        (rainfall > 200).astype(float) * 0.15 +
        (np.abs(temp_dev) > 5).astype(float) * 0.1 +
        np.random.uniform(0, 0.3, n_samples)
    )

    loss_occurred = (loss_prob > 0.5).astype(int)

    return pd.DataFrame({
        'district_code': districts,
        'crop_code': crops,
        'loss_type_code': loss_types,
        'growth_stage': growth_stages,
        'area_hectares': areas,
        'rainfall_current_month': rainfall,
        'temperature_deviation': temp_dev,
        'days_since_sowing': days_sowing,
        'loss_occurred': loss_occurred
    })


def train_yield_model():
    """Train and save yield prediction model"""
    print("Training Yield Prediction Model...")

    df = generate_yield_data()
    df.to_csv('data/processed/yield_training_data.csv', index=False)

    X = df.drop('yield', axis=1)
    y = df['yield']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    score = model.score(X_test_scaled, y_test)
    print(f"  R² Score: {score:.4f}")

    joblib.dump(model, 'data/models/yield_model.joblib')
    joblib.dump(scaler, 'data/models/yield_model_scaler.joblib')
    print("  Model saved to data/models/yield_model.joblib")


def train_risk_model():
    """Train and save risk assessment model"""
    print("Training Risk Assessment Model...")

    df = generate_risk_data()
    df.to_csv('data/processed/risk_training_data.csv', index=False)

    X = df.drop('risk_level', axis=1)
    y = df['risk_level']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    score = model.score(X_test_scaled, y_test)
    print(f"  Accuracy: {score:.4f}")

    joblib.dump(model, 'data/models/risk_model.joblib')
    joblib.dump(scaler, 'data/models/risk_model_scaler.joblib')
    print("  Model saved to data/models/risk_model.joblib")


def train_loss_model():
    """Train and save loss probability model"""
    print("Training Loss Probability Model...")

    df = generate_loss_data()
    df.to_csv('data/processed/loss_training_data.csv', index=False)

    X = df.drop('loss_occurred', axis=1)
    y = df['loss_occurred']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    score = model.score(X_test_scaled, y_test)
    print(f"  Accuracy: {score:.4f}")

    joblib.dump(model, 'data/models/loss_model.joblib')
    joblib.dump(scaler, 'data/models/loss_model_scaler.joblib')
    print("  Model saved to data/models/loss_model.joblib")


def main():
    print("")
    print("=" * 60)
    print("    Smart Agriculture ML Model Training")
    print("=" * 60)
    print("")

    train_yield_model()
    print()
    train_risk_model()
    print()
    train_loss_model()

    print("")
    print("=" * 60)
    print("    All models trained successfully!")
    print("    Models saved to: data/models/")
    print("=" * 60)
    print("")


if __name__ == '__main__':
    main()
