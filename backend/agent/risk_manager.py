import json
import os
import requests

from .schemas import RiskContext, RiskAssessment
from .prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE


class RiskManager:

    def __init__(self):

        self.ollama_url = os.getenv(
            "OLLAMA_URL",
            "http://localhost:11434"
        )

        self.model = os.getenv(
            "RISKGUARD_LLM_MODEL",
            "gemma3:4b"
        )

    def analyze(
        self,
        risk_context: RiskContext
    ) -> RiskAssessment:

        # Convert Pydantic model → dictionary
        context_dict = risk_context.model_dump()

        # Convert dictionary → readable JSON
        context_json = json.dumps(
            context_dict,
            indent=2
        )

        # Build user prompt
        user_prompt = USER_PROMPT_TEMPLATE.format(
            risk_context=context_json
        )

        # Ollama request
        payload = {
            "model": self.model,

            "messages": [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],

            "stream": False,

            "options": {
                "temperature": 0
            }
        }

        response = requests.post(
            f"{self.ollama_url}/api/chat",
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        # Extract model response
        content = result["message"]["content"]

        if not content:
            raise ValueError(
                "Ollama Risk Manager returned an empty response."
            )

        # Remove possible markdown code fences
        content = content.strip()

        if content.startswith("```json"):
            content = content[7:]

        if content.startswith("```"):
            content = content[3:]

        if content.endswith("```"):
            content = content[:-3]

        content = content.strip()

        # Parse JSON
        try:
            result_json = json.loads(content)

        except json.JSONDecodeError as e:

            raise ValueError(
                f"Gemma returned invalid JSON:\n{content}"
            ) from e

        # Validate against Pydantic schema
        assessment = RiskAssessment.model_validate(
            result_json
        )

        return assessment