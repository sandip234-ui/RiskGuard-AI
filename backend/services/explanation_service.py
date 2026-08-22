# ============================================================
# RiskGuard-AI — AI Explanation Service
# Connects to local Ollama / Gemma, explains XGBoost+SHAP result.
# ============================================================

import json
import logging
import os
import re
import requests

from agent.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)


# ============================================================
# Configuration
# ============================================================

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_GENERATE_URL = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_MODEL = os.getenv("RISKGUARD_LLM_MODEL", "gemma3:1b")

# Timeout: Gemma 1b can be slow on first load; 120s is generous.
OLLAMA_TIMEOUT = 120

REQUIRED_FIELDS = [
    "risk_level",
    "summary",
    "key_risk_factors",
    "behavioral_analysis",
    "recommended_action",
    "reason",
    "confidence",
]

# ============================================================
# Fallback Explanation
# ============================================================

FALLBACK_EXPLANATION = {
    "risk_level": None,        # filled at call-site from XGBoost value
    "summary": (
        "AI explanation unavailable. "
        "The risk assessment is based on the XGBoost model and SHAP analysis."
    ),
    "key_risk_factors": [],
    "behavioral_analysis": (
        "AI explanation unavailable. "
        "Refer to the SHAP risk and protective factors for model evidence."
    ),
    "recommended_action": None,  # filled at call-site from XGBoost value
    "reason": (
        "The Ollama/Gemma service could not be reached or returned an "
        "invalid response. XGBoost + SHAP remain the authoritative source."
    ),
    "confidence": "Low",
    "ai_available": False,
}


# ============================================================
# Connectivity Check
# ============================================================

def check_ollama_available(timeout: int = 5) -> bool:
    """
    Lightweight check — hits Ollama's version endpoint.
    Returns True if Ollama responds within `timeout` seconds.
    """
    try:
        resp = requests.get(
            f"{OLLAMA_BASE_URL}/api/version",
            timeout=timeout,
        )
        return resp.status_code == 200
    except Exception:
        return False


# ============================================================
# JSON Extraction Helper
# ============================================================

def _extract_json(raw: str) -> dict:
    """
    Try several strategies to get a JSON dict from Gemma's output.
    Gemma sometimes wraps the JSON in markdown code fences.
    """
    # Strategy 1: direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Strategy 2: strip markdown fences ```json … ``` or ``` … ```
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Strategy 3: find the first { … } block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse JSON from Gemma response: {raw[:300]!r}")


# ============================================================
# Main Entry Point
# ============================================================

def generate_risk_explanation(risk_context: dict) -> dict:
    """
    Send the RiskGuard risk context to Gemma via Ollama and return
    a structured AI explanation.

    This function NEVER raises an exception.
    On any failure it returns a safe fallback explanation dict.

    Parameters
    ----------
    risk_context : dict
        The serialised RiskContext produced by the ML/SHAP pipeline.

    Returns
    -------
    dict
        Explanation with keys: risk_level, summary, key_risk_factors,
        behavioral_analysis, recommended_action, reason, confidence,
        ai_available (bool).
    """

    # Build fallback with XGBoost authoritative values pre-filled
    fallback = {
        **FALLBACK_EXPLANATION,
        "risk_level":          risk_context.get("risk_level"),
        "recommended_action":  risk_context.get("recommended_action"),
    }

    # --------------------------------------------------------
    # Build the user prompt from the existing template
    # --------------------------------------------------------
    try:
        user_prompt = USER_PROMPT_TEMPLATE.format(
            risk_context=json.dumps(risk_context, indent=2, default=str)
        )
    except Exception as exc:
        logger.error("Failed to build Gemma prompt: %s", exc)
        return fallback

    # --------------------------------------------------------
    # Ollama request payload
    # --------------------------------------------------------
    payload = {
        "model": OLLAMA_MODEL,
        "system": SYSTEM_PROMPT,
        "prompt": user_prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 1024,
        },
    }

    # --------------------------------------------------------
    # Call Ollama
    # --------------------------------------------------------
    try:
        response = requests.post(
            OLLAMA_GENERATE_URL,
            json=payload,
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()

    except requests.exceptions.ConnectionError:
        logger.warning(
            "Ollama not reachable at %s — returning fallback explanation.",
            OLLAMA_BASE_URL,
        )
        return fallback

    except requests.exceptions.Timeout:
        logger.warning("Ollama request timed out — returning fallback explanation.")
        return fallback

    except Exception as exc:
        logger.error("Ollama HTTP error: %s — returning fallback explanation.", exc)
        return fallback

    # --------------------------------------------------------
    # Parse Gemma's JSON response
    # --------------------------------------------------------
    try:
        result = response.json()
        raw_text = result.get("response", "").strip()

        if not raw_text:
            raise ValueError("Ollama returned an empty response body.")

        explanation = _extract_json(raw_text)

    except Exception as exc:
        logger.error("Failed to parse Gemma JSON: %s — returning fallback.", exc)
        return fallback

    # --------------------------------------------------------
    # Validate required fields
    # --------------------------------------------------------
    missing = [f for f in REQUIRED_FIELDS if f not in explanation]
    if missing:
        logger.warning(
            "Gemma response missing fields %s — returning fallback.", missing
        )
        return fallback

    # --------------------------------------------------------
    # Enforce: XGBoost authoritative values must NOT be changed.
    # Overwrite any fields Gemma might have altered.
    # --------------------------------------------------------
    explanation["risk_level"]         = risk_context.get("risk_level")
    explanation["recommended_action"] = risk_context.get("recommended_action")
    explanation["ai_available"]       = True

    logger.info(
        "Gemma explanation generated successfully (confidence=%s).",
        explanation.get("confidence"),
    )

    return explanation