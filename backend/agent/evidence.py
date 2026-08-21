import numpy as np
import pandas as pd


def classify_shap_evidence(
    shap_values,
    feature_names,
    top_n=5
):
    """
    Classify SHAP contributions into risk-increasing
    and protective evidence.

    Positive SHAP:
        Pushes the XGBoost prediction toward fraud.

    Negative SHAP:
        Pushes the XGBoost prediction away from fraud.

    The direction is determined deterministically here,
    before the evidence is passed to the LLM.
    """

    # ------------------------------------------------
    # Convert inputs
    # ------------------------------------------------

    shap_values = np.asarray(shap_values).flatten()
    feature_names = list(feature_names)

    # ------------------------------------------------
    # Validate dimensions
    # ------------------------------------------------

    if len(shap_values) != len(feature_names):
        raise ValueError(
            f"SHAP values ({len(shap_values)}) "
            f"and feature names ({len(feature_names)}) "
            f"have different lengths."
        )

    # ------------------------------------------------
    # Create evidence table
    # ------------------------------------------------

    evidence = pd.DataFrame({
        "feature": feature_names,
        "shap_value": shap_values
    })

    # ------------------------------------------------
    # Determine direction BEFORE sending to the LLM
    # ------------------------------------------------

    evidence["direction"] = np.where(
        evidence["shap_value"] > 0,
        "risk_increasing",
        np.where(
            evidence["shap_value"] < 0,
            "protective",
            "neutral"
        )
    )

    # ------------------------------------------------
    # Positive SHAP → Risk-increasing
    # ------------------------------------------------

    risk_factors = (
        evidence[
            evidence["direction"] == "risk_increasing"
        ]
        .sort_values(
            "shap_value",
            ascending=False
        )
        .head(top_n)
        .copy()
    )

    # ------------------------------------------------
    # Negative SHAP → Protective
    # ------------------------------------------------

    protective_factors = (
        evidence[
            evidence["direction"] == "protective"
        ]
        .sort_values(
            "shap_value",
            ascending=True
        )
        .head(top_n)
        .copy()
    )

    # ------------------------------------------------
    # Return clean dictionaries
    # ------------------------------------------------

    return (
        risk_factors.to_dict("records"),
        protective_factors.to_dict("records")
    )