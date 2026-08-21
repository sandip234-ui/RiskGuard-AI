import numpy as np
import pandas as pd


def classify_shap_evidence(
    shap_values,
    feature_names,
    top_n=5
):
    """
    Separate SHAP contributions into:

    Positive SHAP:
        Risk-increasing features

    Negative SHAP:
        Risk-reducing features
    """

    shap_values = np.asarray(
        shap_values
    ).flatten()

    feature_names = list(
        feature_names
    )

    if len(shap_values) != len(feature_names):

        raise ValueError(
            f"SHAP values ({len(shap_values)}) "
            f"and feature names ({len(feature_names)}) "
            f"have different lengths."
        )

    evidence = pd.DataFrame({
        "feature": feature_names,
        "shap_value": shap_values
    })

    # ------------------------------------------------
    # Positive SHAP → pushes toward fraud
    # ------------------------------------------------

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

    # ------------------------------------------------
    # Negative SHAP → pushes away from fraud
    # ------------------------------------------------

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

    return (
        risk_factors.to_dict(
            "records"
        ),

        protective_factors.to_dict(
            "records"
        )
    )