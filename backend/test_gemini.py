import os
import sys
from dotenv import load_dotenv

load_dotenv()
from google import genai

try:
    client = genai.Client(api_key=os.getenv("LLM_API_KEY"))
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Hello"
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
