from typing import Optional
from pydantic import BaseModel, Field


# ============================================================
# Transaction Request
# ============================================================

class TransactionRequest(BaseModel):

    # --------------------------------------------------------
    # Transaction information
    # --------------------------------------------------------

    amount: float = Field(gt=0)

    category: str

    transaction_hour: int = Field(
        ge=0,
        le=23
    )

    day_of_week: int = Field(
        ge=0,
        le=6
    )

    gender: str

    # --------------------------------------------------------
    # Customer information
    # --------------------------------------------------------

    age: float = Field(gt=0)

    city_pop: float = Field(
        ge=0
    )

    # --------------------------------------------------------
    # Behavioral features
    # --------------------------------------------------------

    customer_txn_count: float = Field(
        ge=0
    )

    customer_avg_amount: float = Field(
        ge=0
    )

    amount_ratio: float = Field(
        ge=0
    )

    time_since_last_txn: float = Field(
        ge=-1
    )

    distance_km: float = Field(
        ge=0
    )

    has_customer_history: int = Field(
        ge=0,
        le=1
    )

    # --------------------------------------------------------
    # Derived temporal features
    #
    # These are optional from the API perspective because
    # risk_service.py calculates them automatically.
    # --------------------------------------------------------

    is_weekend: int = Field(
        default=0,
        ge=0,
        le=1
    )

    is_night: int = Field(
        default=0,
        ge=0,
        le=1
    )


# ============================================================
# Risk Response
# ============================================================

class RiskResponse(BaseModel):

    risk_level: str

    risk_score: float

    fraud_probability: float

    ml_decision: str

    recommended_action: str

    key_risk_factors: list[str]

    protective_factors: list[str]

    reasoning: str

    action: str

    confidence: str

    # Added: structured Gemma explanation (None if Ollama unavailable)
    ai_explanation: Optional[dict] = None