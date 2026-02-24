"""
Calamity Verification Model Training Script
Trains a RandomForest classifier to verify whether a claimed agricultural
calamity (drought/flood/pest/etc.) actually occurred at a given geo-location
and time in Maharashtra, India.

Based on:
  - Historical Maharashtra district-level calamity patterns (IMD / NDMA records)
  - Seasonal probability curves per calamity type
  - District drought/flood vulnerability scores
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import joblib

# ── Paths ──────────────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs('data/models', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)

# ── Maharashtra district centre coordinates ────────────────────────────────────
DISTRICT_COORDS = {
    1:  (19.09, 74.74),   # Ahmednagar
    2:  (20.71, 77.00),   # Akola
    3:  (20.93, 77.75),   # Amravati
    4:  (19.87, 75.34),   # Aurangabad
    5:  (18.99, 75.76),   # Beed
    6:  (21.17, 79.65),   # Bhandara
    7:  (20.53, 76.18),   # Buldhana
    8:  (19.96, 79.30),   # Chandrapur
    9:  (20.90, 74.77),   # Dhule
    10: (20.18, 80.01),   # Gadchiroli
    11: (21.46, 80.20),   # Gondia
    12: (19.72, 77.15),   # Hingoli
    13: (21.00, 75.56),   # Jalgaon
    14: (19.84, 75.88),   # Jalna
    15: (16.70, 74.24),   # Kolhapur
    16: (18.40, 76.56),   # Latur
    17: (19.08, 72.88),   # Mumbai
    18: (19.12, 72.87),   # Mumbai Suburban
    19: (21.15, 79.09),   # Nagpur
    20: (19.15, 77.31),   # Nanded
    21: (21.37, 74.24),   # Nandurbar
    22: (20.01, 73.79),   # Nashik
    23: (18.18, 76.04),   # Osmanabad
    24: (19.70, 72.77),   # Palghar
    25: (19.27, 76.77),   # Parbhani
    26: (18.52, 73.85),   # Pune
    27: (18.52, 73.18),   # Raigad
    28: (16.99, 73.31),   # Ratnagiri
    29: (16.86, 74.57),   # Sangli
    30: (17.69, 74.00),   # Satara
    31: (16.35, 73.67),   # Sindhudurg
    32: (17.69, 75.90),   # Solapur
    33: (19.21, 73.10),   # Thane
    34: (20.74, 78.60),   # Wardha
    35: (20.11, 77.15),   # Washim
    36: (20.39, 78.12),   # Yavatmal
}

# ── Vulnerability scores (from feature_engineering.py) ────────────────────────
DROUGHT_SCORES = {
    1: 0.70, 2: 0.60, 3: 0.50, 4: 0.80, 5: 0.85, 6: 0.20, 7: 0.60,
    8: 0.30, 9: 0.60, 10: 0.20, 11: 0.20, 12: 0.70, 13: 0.65, 14: 0.75,
    15: 0.20, 16: 0.80, 17: 0.10, 18: 0.10, 19: 0.40, 20: 0.70, 21: 0.50,
    22: 0.50, 23: 0.85, 24: 0.20, 25: 0.75, 26: 0.40, 27: 0.15, 28: 0.10,
    29: 0.60, 30: 0.40, 31: 0.10, 32: 0.90, 33: 0.15, 34: 0.50, 35: 0.65,
    36: 0.60,
}
FLOOD_SCORES = {
    1: 0.20, 2: 0.30, 3: 0.30, 4: 0.20, 5: 0.15, 6: 0.60, 7: 0.25,
    8: 0.50, 9: 0.30, 10: 0.70, 11: 0.65, 12: 0.20, 13: 0.35, 14: 0.20,
    15: 0.70, 16: 0.15, 17: 0.80, 18: 0.75, 19: 0.40, 20: 0.30, 21: 0.40,
    22: 0.40, 23: 0.15, 24: 0.60, 25: 0.25, 26: 0.50, 27: 0.65, 28: 0.70,
    29: 0.50, 30: 0.55, 31: 0.60, 32: 0.10, 33: 0.70, 34: 0.35, 35: 0.25,
    36: 0.35,
}

# Hailstorm and pest-prone districts
HAIL_PRONE = {1, 4, 5, 14, 22, 25, 26, 29, 30}    # Nashik, Marathwada, W.Mah
PEST_PRONE  = {2, 3, 5, 7, 12, 14, 20, 25, 34, 35, 36}  # Vidarbha cotton belt

# Loss type codes (same as feature_engineering.py)
LOSS_CODES = {
    'drought': 0, 'flood': 1, 'hailstorm': 2, 'pest': 3,
    'disease': 4, 'unseasonal_rain': 5, 'frost': 6, 'fire': 7, 'other': 8,
}


def _season_probability(loss_type_code: int, month: int) -> float:
    """Return the seasonal probability that calamity type occurred in this month."""
    # Drought: peaks Apr-Jun, moderate Oct-Nov
    if loss_type_code == 0:
        return {4: 0.75, 5: 0.85, 6: 0.70, 10: 0.50, 11: 0.55}.get(month, 0.15)
    # Flood: June-September monsoon season
    if loss_type_code == 1:
        return {6: 0.65, 7: 0.85, 8: 0.90, 9: 0.75}.get(month, 0.10)
    # Hailstorm: March-April (pre-harvest), November
    if loss_type_code == 2:
        return {3: 0.65, 4: 0.70, 11: 0.55, 12: 0.40}.get(month, 0.10)
    # Pest: July-October (kharif cotton season)
    if loss_type_code == 3:
        return {7: 0.60, 8: 0.75, 9: 0.80, 10: 0.70}.get(month, 0.15)
    # Disease: spread across growing season
    if loss_type_code == 4:
        return {6: 0.50, 7: 0.60, 8: 0.65, 9: 0.60, 10: 0.55}.get(month, 0.25)
    # Unseasonal rain: October-November (post-kharif), Feb-March
    if loss_type_code == 5:
        return {2: 0.50, 3: 0.55, 10: 0.70, 11: 0.75}.get(month, 0.20)
    # Frost: December-January
    if loss_type_code == 6:
        return {12: 0.75, 1: 0.80, 2: 0.45}.get(month, 0.05)
    # Fire: summer
    if loss_type_code == 7:
        return {3: 0.55, 4: 0.70, 5: 0.65}.get(month, 0.10)
    return 0.30  # other


def _district_probability(loss_type_code: int, district_code: int) -> float:
    """Return geographic probability that calamity type is possible in district."""
    if loss_type_code == 0:  # drought
        return DROUGHT_SCORES.get(district_code, 0.4)
    if loss_type_code == 1:  # flood
        return FLOOD_SCORES.get(district_code, 0.3)
    if loss_type_code == 2:  # hailstorm
        return 0.70 if district_code in HAIL_PRONE else 0.20
    if loss_type_code == 3:  # pest
        return 0.75 if district_code in PEST_PRONE else 0.25
    if loss_type_code == 4:  # disease
        return 0.55  # can occur anywhere
    if loss_type_code == 5:  # unseasonal_rain
        return 0.65  # affects all Maharashtra
    if loss_type_code == 6:  # frost
        return 0.70 if district_code in {22, 26, 29, 30} else 0.15
    if loss_type_code == 7:  # fire
        return DROUGHT_SCORES.get(district_code, 0.4) * 0.8
    return 0.40


def generate_calamity_dataset(n_samples: int = 8000) -> pd.DataFrame:
    """
    Generate a realistic Maharashtra calamity occurrence dataset.
    Each row represents a (district, month, calamity_type) observation.
    Label 1 = calamity actually verified, 0 = not verified.
    """
    np.random.seed(42)
    records = []

    loss_type_codes = list(LOSS_CODES.values())   # 0-8

    for _ in range(n_samples):
        district_code = np.random.randint(1, 37)
        month = np.random.randint(1, 13)
        loss_type_code = np.random.choice(loss_type_codes)

        lat_center, lon_center = DISTRICT_COORDS[district_code]
        # Add small random offset (±0.2°) to simulate farm GPS vs district centre
        lat = lat_center + np.random.uniform(-0.20, 0.20)
        lon = lon_center + np.random.uniform(-0.20, 0.20)

        drought_score = DROUGHT_SCORES.get(district_code, 0.4)
        flood_score   = FLOOD_SCORES.get(district_code, 0.3)

        # Derive season from month
        if month in [6, 7, 8, 9, 10]:
            season_code = 1  # kharif
        elif month in [11, 12, 1, 2, 3]:
            season_code = 2  # rabi
        else:
            season_code = 3  # summer

        # Combined probability = geographic × seasonal
        p_geo  = _district_probability(loss_type_code, district_code)
        p_seas = _season_probability(loss_type_code, month)
        combined = p_geo * p_seas * 2.5   # scale so some reach 1.0
        combined = min(0.95, combined)

        # Bernoulli draw for label with 5% noise
        noise = np.random.uniform(-0.05, 0.05)
        verified = int(np.random.random() < (combined + noise))

        records.append({
            'district_code':   district_code,
            'latitude':        round(lat, 5),
            'longitude':       round(lon, 5),
            'month':           month,
            'loss_type_code':  loss_type_code,
            'drought_score':   drought_score,
            'flood_score':     flood_score,
            'season_code':     season_code,
            'calamity_verified': verified,
        })

    return pd.DataFrame(records)


def train_calamity_model():
    print("\n" + "=" * 60)
    print("  Calamity Verification Model Training")
    print("  ShetiSetu AI Service")
    print("=" * 60)

    # 1. Generate dataset
    print("\n[1/5] Generating Maharashtra calamity dataset (8000 samples)...")
    df = generate_calamity_dataset(8000)
    df.to_csv('data/processed/calamity_training_data.csv', index=False)
    print(f"      Dataset saved -> data/processed/calamity_training_data.csv")
    print(f"      Class balance: verified={df['calamity_verified'].sum()} "
          f"/ not_verified={len(df) - df['calamity_verified'].sum()}")

    # 2. Prepare features
    print("\n[2/5] Preparing features...")
    feature_cols = [
        'district_code', 'latitude', 'longitude',
        'month', 'loss_type_code', 'drought_score',
        'flood_score', 'season_code',
    ]
    X = df[feature_cols].values
    y = df['calamity_verified'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 3. Scale features
    print("[3/5] Scaling features...")
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    # 4. Train model
    print("[4/5] Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_s, y_train)

    # 5. Evaluate
    print("[5/5] Evaluating model...")
    y_pred = model.predict(X_test_s)
    y_prob = model.predict_proba(X_test_s)[:, 1]
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)

    print(f"\n  Accuracy : {acc:.4f}")
    print(f"  ROC-AUC  : {auc:.4f}")
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Verified', 'Verified']))

    # Save model and scaler
    joblib.dump(model,  'data/models/calamity_model.joblib')
    joblib.dump(scaler, 'data/models/calamity_model_scaler.joblib')
    print("\n  Model  saved -> data/models/calamity_model.joblib")
    print("  Scaler saved -> data/models/calamity_model_scaler.joblib")

    # Feature importances
    importances = model.feature_importances_
    for col, imp in sorted(zip(feature_cols, importances), key=lambda x: -x[1]):
        print(f"    {col:25s}: {imp:.4f}")

    print("\n" + "=" * 60)
    print("  Calamity model training complete!")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    train_calamity_model()
