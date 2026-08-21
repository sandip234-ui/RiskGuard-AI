from .schemas import RiskContext
from .evidence import classify_shap_evidence


class RiskEngine:

    def __init__(
        self,
        model,
        threshold=0.95
    ):

        self.model = model
        self.threshold = threshold


    def calculate_risk(
        self,
        X,
        feature_names,
        transaction,
        behavioral_features,
        shap_values
    ):

        # ==========================================
        # 1. Fraud probability
        # ==========================================

        fraud_probability = float(
            self.model.predict_proba(X)[0, 1]
        )


        # ==========================================
        # 2. Risk score
        # ==========================================

        risk_score = fraud_probability * 100


        # ==========================================
        # 3. Fraud classification
        # ==========================================

        fraud_prediction = int(
            fraud_probability >= self.threshold
        )


        # ==========================================
        # 4. Risk level
        # ==========================================

        if risk_score < 30:

            risk_level = "LOW"

            recommended_action = "ALLOW"

        elif risk_score < 70:

            risk_level = "MEDIUM"

            recommended_action = "REVIEW"

        else:

            risk_level = "HIGH"

            recommended_action = "INVESTIGATE"


        # ==========================================
        # 5. SHAP evidence
        # ==========================================

        (
            risk_factors,
            protective_factors
        ) = classify_shap_evidence(
            shap_values,
            feature_names
        )


        # ==========================================
        # 6. Build RiskContext
        # ==========================================

        risk_context = RiskContext(

            fraud_probability=fraud_probability,

            risk_score=risk_score,

            risk_level=risk_level,

            fraud_prediction=fraud_prediction,

            recommended_action=recommended_action,

            transaction=transaction,

            behavioral_features=behavioral_features,

            risk_factors=risk_factors,

            protective_factors=protective_factors
        )


        return risk_context