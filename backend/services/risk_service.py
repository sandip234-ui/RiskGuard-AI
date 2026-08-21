import json
from pathlib import Path

import joblib
import pandas as pd
import xgboost as xgb

from services.shap_service import explain_prediction


# ============================================================
# Project Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data" / "processed"

print("MODEL_DIR:", MODEL_DIR)
print("DATA_DIR:", DATA_DIR)


# ============================================================
# Load Feature Names
# ============================================================

FEATURE_NAMES_PATH = DATA_DIR / "feature_names.json"

with open(FEATURE_NAMES_PATH, "r") as f:
    FEATURE_NAMES = json.load(f)


# ============================================================
# Load Encoder
# ============================================================

ENCODER_PATH = MODEL_DIR / "feature_encoder.joblib"

encoder = joblib.load(
    ENCODER_PATH
)


# ============================================================
# Load XGBoost Model
# ============================================================

MODEL_PATH = MODEL_DIR / "riskguard_xgboost.json"

model = xgb.XGBClassifier()

model.load_model(
    str(MODEL_PATH)
)


# ============================================================
# Load Risk Configuration
# ============================================================

CONFIG_PATH = MODEL_DIR / "riskguard_config.json"

with open(CONFIG_PATH, "r") as f:
    RISK_CONFIG = json.load(f)


# ============================================================
# Prediction Function
# ============================================================

def predict_transaction(transaction):
    """
    Run RiskGuard XGBoost inference and local SHAP explanation.

    Returns:
        fraud_probability
        risk_score
        risk_level
        fraud_prediction
        recommended_action
        threshold
        features
        risk_factors
        protective_factors
    """

    # ========================================================
    # Convert Pydantic model to dictionary
    # ========================================================

    data = transaction.model_dump()


    # ========================================================
    # IMPORTANT:
    #
    # API uses:
    #     amount
    #
    # Trained model uses:
    #     amt
    # ========================================================

    data["amt"] = data.pop("amount")


    # ========================================================
    # Create Derived Temporal Features
    # ========================================================

    data["is_weekend"] = int(
        data["day_of_week"] >= 5
    )

    data["is_night"] = int(
        data["transaction_hour"] < 6
        or data["transaction_hour"] >= 22
    )


    # ========================================================
    # Create DataFrame
    # ========================================================

    df = pd.DataFrame([data])


    # ========================================================
    # Categorical Features
    # ========================================================

    categorical_columns = [
        "category",
        "gender"
    ]


    # ========================================================
    # Numerical Features
    # ========================================================

    numerical_columns = [
        "amt",
        "city_pop",
        "transaction_hour",
        "day_of_week",
        "is_weekend",
        "is_night",
        "age",
        "distance_km",
        "customer_txn_count",
        "customer_avg_amount",
        "amount_ratio",
        "time_since_last_txn",
        "has_customer_history"
    ]


    # ========================================================
    # Encode Categorical Features
    # ========================================================

    encoded = encoder.transform(
        df[categorical_columns]
    )

    encoded_names = encoder.get_feature_names_out(
        categorical_columns
    )


    # ========================================================
    # Handle Sparse / Dense Encoder Output
    # ========================================================

    if hasattr(encoded, "toarray"):
        encoded_array = encoded.toarray()
    else:
        encoded_array = encoded


    encoded_df = pd.DataFrame(
        encoded_array,
        columns=encoded_names
    )


    # ========================================================
    # Numerical DataFrame
    # ========================================================

    numerical_df = df[
        numerical_columns
    ].reset_index(drop=True)


    # ========================================================
    # Combine Numerical + Encoded Features
    # ========================================================

    X = pd.concat(
        [
            numerical_df,
            encoded_df
        ],
        axis=1
    )


    # ========================================================
    # Force Exact Training Feature Order
    # ========================================================

    X = X.reindex(
        columns=FEATURE_NAMES,
        fill_value=0
    )


    # ========================================================
    # Validate Feature Vector
    # ========================================================

    if list(X.columns) != FEATURE_NAMES:
        raise ValueError(
            "Feature order mismatch between "
            "API input and trained model."
        )


    if X.shape[1] != len(FEATURE_NAMES):
        raise ValueError(
            f"Expected {len(FEATURE_NAMES)} features, "
            f"but received {X.shape[1]}."
        )


    # ========================================================
    # XGBoost Prediction
    # ========================================================

    fraud_probability = float(
        model.predict_proba(X)[0][1]
    )


    # ========================================================
    # Risk Score
    # ========================================================

    risk_score = round(
        fraud_probability * 100,
        2
    )


    # ========================================================
    # Fraud Threshold
    # ========================================================

    threshold = float(
        RISK_CONFIG["threshold"]
    )

    fraud_prediction = int(
        fraud_probability >= threshold
    )


    # ========================================================
    # Risk Level
    # ========================================================

    if risk_score < 30:

        risk_level = "LOW"

    elif risk_score < 70:

        risk_level = "MEDIUM"

    else:

        risk_level = "HIGH"


    # ========================================================
    # Recommended Action
    # ========================================================

    recommended_action = (
        RISK_CONFIG["actions"].get(
            risk_level,
            "REVIEW"
        )
    )


    # ========================================================
    # SHAP Local Explanation
    # ========================================================

    risk_factors, protective_factors = explain_prediction(
        model,
        X,
        top_n=5
    )


    # ========================================================
    # Return Complete Result
    # ========================================================

    return {
        "fraud_probability": fraud_probability,

        "risk_score": risk_score,

        "risk_level": risk_level,

        "fraud_prediction": fraud_prediction,

        "recommended_action": recommended_action,

        "threshold": threshold,

        "features": X,

        "risk_factors": risk_factors,

        "protective_factors": protective_factors
    }