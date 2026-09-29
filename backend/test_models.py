import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("LLM_API_KEY")
if not api_key:
    raise RuntimeError(
        "LLM_API_KEY is not set. Add it to backend/.env (never commit the real key)."
    )

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

response = requests.get(url)
print(response.json())
