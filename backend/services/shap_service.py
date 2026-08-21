import shap
import pandas as pd


# ============================================================
# SHAP Explainer
# ============================================================

def explain_prediction(
    model,
    features: pd.DataFrame,
    top_n: int = 5
):
    """
    Generate local SHAP explanation for one transaction.

    Positive SHAP values:
        Push prediction toward fraud.

    Negative SHAP values:
        Push prediction away from fraud.
    """

    # --------------------------------------------------------
    # Create TreeExplainer
    # --------------------------------------------------------

    explainer = shap.TreeExplainer(model)

    # --------------------------------------------------------
    # Calculate SHAP values
    # --------------------------------------------------------

    shap_values = explainer.shap_values(features)

    # --------------------------------------------------------
    # Handle different SHAP output formats
    # --------------------------------------------------------

    if isinstance(shap_values, list):
        shap_values = shap_values[-1]

    shap_values = shap_values[0]

    # --------------------------------------------------------
    # Create evidence dataframe
    # --------------------------------------------------------

    evidence = pd.DataFrame({
        "feature": features.columns,
        "shap_value": shap_values
    })

    # --------------------------------------------------------
    # Positive SHAP = risk increasing
    # --------------------------------------------------------

    risk_factors = (
        evidence[
            evidence["shap_value"] > 0
        ]
        .sort_values(
            "shap_value",
            ascending=False
        )
        .head(top_n)
    )

    # --------------------------------------------------------
    # Negative SHAP = protective
    # --------------------------------------------------------

    protective_factors = (
        evidence[
            evidence["shap_value"] < 0
        ]
        .sort_values(
            "shap_value",
            ascending=True
        )
        .head(top_n)
    )

    # --------------------------------------------------------
    # Convert to dictionaries
    # --------------------------------------------------------

    risk_factors = risk_factors.to_dict(
        orient="records"
    )

    protective_factors = protective_factors.to_dict(
        orient="records"
    )

    return (
        risk_factors,
        protective_factors
    )