import logging

from fastapi import APIRouter

from schemas.risk import TransactionRequest, RiskResponse
from services.risk_service import predict_transaction
from services.explanation_service import generate_risk_explanation

from agent.schemas import (
    RiskContext,
    TransactionInfo,
    BehavioralFeatures,
    RiskFactor,
)

logger = logging.getLogger(__name__)


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/v1/risk",
    tags=["Risk Assessment"]
)


# ============================================================
# Risk Prediction Endpoint
# ============================================================

@router.post(
    "/predict",
    response_model=RiskResponse
)
def predict_risk(
    transaction: TransactionRequest
):

    # ========================================================
    # 1. Run XGBoost + SHAP  (unchanged — authoritative)
    # ========================================================

    result = predict_transaction(transaction)


    # ========================================================
    # 2. ML Decision label
    # ========================================================

    ml_decision = "FRAUD" if result["fraud_prediction"] == 1 else "LEGITIMATE"


    # ========================================================
    # 3. Confidence (rule-based, from probability)
    # ========================================================

    fraud_probability = result["fraud_probability"]

    if fraud_probability >= 0.70:
        confidence = "HIGH"
    elif fraud_probability >= 0.30:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"


    # ========================================================
    # 4. SHAP factor lists (feature names only)
    # ========================================================

    key_risk_factors = [
        item["feature"] for item in result["risk_factors"]
    ]

    protective_factors_list = [
        item["feature"] for item in result["protective_factors"]
    ]


    # ========================================================
    # 5. Default reasoning (always available, no LLM needed)
    # ========================================================

    reasoning = (
        f"The XGBoost model assigned a "
        f"{result['risk_level']} risk level with a "
        f"fraud probability of {fraud_probability:.2%}. "
        f"The recommended action is {result['recommended_action']}."
    )


    # ========================================================
    # 6. Build RiskContext for Gemma
    # ========================================================

    risk_context = RiskContext(
        fraud_probability=result["fraud_probability"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        fraud_prediction=result["fraud_prediction"],
        recommended_action=result["recommended_action"],
        transaction=TransactionInfo(
            amount=transaction.amount,
            category=transaction.category,
            transaction_hour=transaction.transaction_hour,
            gender=transaction.gender,
        ),
        behavioral_features=BehavioralFeatures(
            customer_txn_count=transaction.customer_txn_count,
            customer_avg_amount=transaction.customer_avg_amount,
            amount_ratio=transaction.amount_ratio,
            time_since_last_txn=transaction.time_since_last_txn,
            distance_km=transaction.distance_km,
            has_customer_history=transaction.has_customer_history,
        ),
        risk_factors=[
            RiskFactor(
                feature=item["feature"],
                shap_value=float(item["shap_value"])
            )
            for item in result["risk_factors"]
        ],
        protective_factors=[
            RiskFactor(
                feature=item["feature"],
                shap_value=float(item["shap_value"])
            )
            for item in result["protective_factors"]
        ],
    )

    # ========================================================
    # 7. Generate Gemma AI explanation  (graceful fallback)
    # ========================================================

    ai_explanation = generate_risk_explanation(
        risk_context.model_dump()
    )

    # If Gemma returned a summary, use it as the reasoning string too
    if ai_explanation.get("ai_available") and ai_explanation.get("summary"):
        reasoning = ai_explanation["summary"]

    logger.info(
        "predict_risk: level=%s score=%.1f ai_available=%s",
        result["risk_level"],
        result["risk_score"],
        ai_explanation.get("ai_available", False),
    )


    # ========================================================
    # 8. Build and return the API response
    # ========================================================

    return {
        # --- XGBoost authoritative values (never from Gemma) ---
        "risk_level":           result["risk_level"],
        "risk_score":           result["risk_score"],
        "fraud_probability":    result["fraud_probability"],
        "ml_decision":          ml_decision,
        "recommended_action":   result["recommended_action"],
        "action":               result["recommended_action"],
        "confidence":           confidence,

        # --- SHAP factor lists ---
        "key_risk_factors":     key_risk_factors,
        "protective_factors":   protective_factors_list,

        # --- Reasoning string (Gemma summary if available, else rule-based) ---
        "reasoning":            reasoning,

        # --- Full structured Gemma explanation (None if unavailable) ---
        "ai_explanation":       ai_explanation,
    }