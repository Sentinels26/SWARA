import json
from backend.llm_provider import GeminiProvider, MockProvider
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

provider = GeminiProvider(api_key=os.getenv("LLM_API_KEY"), model_name=os.getenv("LLM_MODEL"))
context = {
    "has_baseline": True,
    "recent_checkins": [
        {"distress": 5, "sleep": 4, "activity": 3},
        {"distress": 6, "sleep": 3, "activity": 2}
    ]
}
try:
    print(json.dumps(provider.analyze_journey(context), indent=2))
except Exception as e:
    print(f"Error: {e}")
