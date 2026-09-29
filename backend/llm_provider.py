import os
import json
import logging
import time
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

# Gemini API accessed directly via HTTP requests (no SDK required)

logger = logging.getLogger(__name__)

# Model fallback chain: if the primary model is overloaded (503) or unavailable,
# the provider will try each model in order until one succeeds.
GEMINI_FALLBACK_MODELS = [
    "gemini-flash-lite-latest",  # lightest / most available
    "gemini-flash-latest",       # standard alias
    "gemini-2.5-flash",          # pinned version
]

class AIAnalysisOutput(BaseModel):
    summary: str = Field(..., description="A short summary of the wellbeing state.")
    observed_changes: list[str] = Field(..., description="Changes observed from baseline.")
    supporting_evidence: list[str] = Field(..., description="Evidence derived from check-in values.")
    contextual_interpretation: str = Field(..., description="AI interpretation of the situation.")
    uncertainty: list[str] = Field(..., description="List of uncertainties or missing information.")
    recommended_attention: str = Field(..., description="Level of attention recommended.")
    safety_note: str = Field(..., description="Any safety related notes. MUST remind professional to decide.")

class JourneyAnalysisOutput(BaseModel):
    baselineStatus: str = Field(..., description="'Building' or 'Established'")
    dimensions: list[str] = Field(..., description="List of dimensions tracked")
    sustainedChanges: list[str] = Field(..., description="E.g., 'Within usual range', 'Change detected'")
    whatChanged: list[str] = Field(..., description="What changed recently based on data and conversations")
    whatRemainedStable: list[str] = Field(..., description="What stayed stable")
    supportingObservations: list[str] = Field(..., description="Observations to support the analysis")

class BaseLLMProvider:
    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def chat(self, user_message: str, history: list, context: Dict[str, Any]) -> str:
        raise NotImplementedError

    def analyze_journey(self, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-flash-lite-latest"):
        self.api_key = api_key
        self.model_name = model_name
        self._base_url_template = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    def _call_api(self, prompt: str, schema=None, temperature=0.2):
        import requests

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH",        "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HARASSMENT",         "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",  "threshold": "BLOCK_NONE"},
            ]
        }
        if schema:
            payload["generationConfig"]["response_mime_type"] = "application/json"

        # Try configured model first, then fallbacks in order
        model_candidates = [self.model_name] + [
            m for m in GEMINI_FALLBACK_MODELS if m != self.model_name
        ]

        last_error: Exception = RuntimeError("No Gemini model candidates available")

        for model in model_candidates:
            url = f"{self._base_url_template.format(model=model)}?key={self.api_key}"

            for attempt in range(2):  # up to 2 attempts per model for 503 / timeout
                try:
                    logger.info(f"[Gemini] Calling model={model} attempt={attempt+1}")
                    response = requests.post(url, headers=headers, json=payload, timeout=30)
                    status = response.status_code

                    if status == 503:
                        logger.warning(
                            f"[Gemini] 503 UNAVAILABLE model={model} attempt={attempt+1}. "
                            f"Body: {response.text[:200]}"
                        )
                        if attempt == 0:
                            time.sleep(1.5)
                        continue  # retry once, then fall through to next model

                    if status == 404:
                        logger.warning(
                            f"[Gemini] 404 NOT_FOUND model={model}. Body: {response.text[:200]}"
                        )
                        break  # try next model immediately

                    response.raise_for_status()
                    result = response.json()

                    if "candidates" not in result or not result["candidates"]:
                        logger.error(
                            f"[Gemini] No candidates in response for model={model}. "
                            f"Response: {json.dumps(result)[:400]}"
                        )
                        raise RuntimeError(
                            f"Gemini returned empty candidates. Response: {json.dumps(result)[:400]}"
                        )

                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    logger.info(f"[Gemini] Success with model={model}")

                    if schema:
                        stripped = text.strip()
                        if stripped.startswith("```json"):
                            stripped = stripped[7:]
                        if stripped.startswith("```"):
                            stripped = stripped[3:]
                        if stripped.endswith("```"):
                            stripped = stripped[:-3]
                        return json.loads(stripped.strip())
                    return text

                except requests.exceptions.Timeout:
                    logger.warning(f"[Gemini] Timeout model={model} attempt={attempt+1}")
                    last_error = RuntimeError(f"Timeout on model {model}")
                    if attempt == 0:
                        time.sleep(1)
                    continue

                except requests.exceptions.RequestException as e:
                    logger.error(f"[Gemini] RequestException model={model} attempt={attempt+1}: {e}")
                    last_error = e
                    if attempt == 0:
                        time.sleep(1.5)
                        continue
                    break  # network error — try next model after retries

                except Exception as e:
                    logger.error(f"[Gemini] Error model={model} attempt={attempt+1}: {e}")
                    last_error = e
                    break

        logger.error(f"[Gemini] All model candidates exhausted. Last error: {last_error}")
        raise last_error



    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
You are an AI assistant for the SWARA wellbeing monitoring system. 
You assist a professional by summarizing the survivor's check-in.
Do NOT diagnose. The system determines the 'Support Priority' deterministically; your job is strictly contextual interpretation.
Always output valid JSON strictly matching the specified structure. Do not output markdown code blocks.

Structure:
{{
  "summary": "string",
  "observed_changes": ["string"],
  "supporting_evidence": ["string"],
  "contextual_interpretation": "string",
  "uncertainty": ["string"],
  "recommended_attention": "string",
  "safety_note": "string"
}}

Context:
{json.dumps(context, indent=2)}
"""
        return self._call_api(prompt, schema=True)

    def analyze_journey(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
You are an AI assistant for the SWARA wellbeing monitoring system.
Analyze the user's recent check-ins against their baseline to provide a journey analysis.
The goal is to show the user how their reported patterns have changed over time relative to THEIR OWN PERSONAL BASELINE.
Do NOT compare them with population norms. Do NOT call the graph a "mental health score." Do NOT diagnose.
Return the output STRICTLY matching the requested JSON structure.
Add: "SWARA provides supportive pattern insights, not a clinical diagnosis." to your analysis where appropriate.

Structure:
{{
  "baselineStatus": "string",
  "dimensions": ["string"],
  "sustainedChanges": ["string"],
  "whatChanged": ["string"],
  "whatRemainedStable": ["string"],
  "supportingObservations": ["string"]
}}

Context:
{json.dumps(context, indent=2)}
"""
        return self._call_api(prompt, schema=True)

    def chat(self, user_message: str, history: list, context: Dict[str, Any]) -> str:
        prompt = f"""
You are Swara, a supportive AI assistant for wellbeing.
You must be supportive, bounded, and calm. Do NOT diagnose. Do NOT pretend to be a human therapist.
If a user indicates immediate danger, calmly offer to contact their care team or emergency services.
Keep responses concise and empathetic.

Authorized Context:
{json.dumps(context, indent=2)}

Recent Conversation History:
{json.dumps(history, indent=2)}

User says: {user_message}
Respond directly to the user:
"""
        return self._call_api(prompt, schema=False, temperature=0.4)

class MockProvider(BaseLLMProvider):
    def analyze(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # Return a mock structured response
        return {
            "summary": "Mock analysis: Survivor check-in processed.",
            "observed_changes": ["Mock change detected"],
            "supporting_evidence": ["Mock evidence: distress value"],
            "contextual_interpretation": "This is a mock interpretation because no real AI key was provided.",
            "uncertainty": ["Mock uncertainty: AI is simulated"],
            "recommended_attention": "Routine review",
            "safety_note": "SWARA recommends. The professional decides."
        }

    def chat(self, user_message: str, history: list, context: Dict[str, Any]) -> str:
        return f"I hear you saying: '{user_message}'. Can you tell me a little more about how you're feeling?"

    def analyze_journey(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "baselineStatus": "Established" if context.get("has_baseline") else "Building",
            "dimensions": ["Sleep", "Distress", "Energy"],
            "sustainedChanges": ["Within usual range"],
            "whatChanged": ["Sleep difficulty has been mentioned in recent check-ins."],
            "whatRemainedStable": ["Energy levels remain close to baseline."],
            "supportingObservations": ["SWARA provides supportive pattern insights, not a clinical diagnosis."]
        }

def get_llm_provider() -> BaseLLMProvider:
    provider_name = os.getenv("LLM_PROVIDER", "MOCK").upper()
    if provider_name == "GEMINI":
        api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            logger.warning("LLM_PROVIDER is GEMINI but LLM_API_KEY is not set. Falling back to MOCK.")
            return MockProvider()
        model_name = os.getenv("LLM_MODEL", "gemini-1.5-flash")
        return GeminiProvider(api_key=api_key, model_name=model_name)
    else:
        return MockProvider()

def analyze_checkin_context(context: Dict[str, Any]) -> Dict[str, Any]:
    provider = get_llm_provider()
    return provider.analyze(context)
