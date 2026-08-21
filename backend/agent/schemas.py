from pydantic import BaseModel, Field
from typing import List


# ============================================================
# TRANSACTION INFORMATION
# ============================================================

class TransactionInfo(BaseModel):

    amount: float

    category: str

    transaction_hour: int

    gender: str


# ============================================================
# CUSTOMER BEHAVIOR
# ============================================================

class BehavioralFeatures(BaseModel):

    customer_txn_count: float

    customer_avg_amount: float

    amount_ratio: float

    time_since_last_txn: float

    distance_km: float

    has_customer_history: int


# ============================================================
# SHAP FEATURE CONTRIBUTION
# ============================================================

class RiskFactor(BaseModel):

    feature: str

    shap_value: float


# ============================================================
# INPUT TO AI RISK MANAGER
# ============================================================

class RiskContext(BaseModel):

    # --------------------------------------------
    # Model Output
    # --------------------------------------------

    fraud_probability: float = Field(
        ge=0.0,
        le=1.0
    )

    risk_score: float = Field(
        ge=0.0,
        le=100.0
    )

    risk_level: str

    fraud_prediction: int

    recommended_action: str

    # --------------------------------------------
    # Transaction
    # --------------------------------------------

    transaction: TransactionInfo

    # --------------------------------------------
    # Behavioral Information
    # --------------------------------------------

    behavioral_features: BehavioralFeatures

    # --------------------------------------------
    # SHAP Evidence
    # --------------------------------------------

    risk_factors: List[RiskFactor]

    protective_factors: List[RiskFactor]


# ============================================================
# AI RISK MANAGER OUTPUT
# ============================================================

class RiskAssessment(BaseModel):

    risk_level: str
    risk_score: float
    fraud_probability: float

    ml_decision: str
    recommended_action: str

    key_risk_factors: List[str]
    protective_factors: List[str]

    reasoning: str
    action: str

    confidence: str