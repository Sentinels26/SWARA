"""
Vercel serverless entry point for SWARA FastAPI backend.

Vercel Python runtime calls the `handler` (Mangum ASGI adapter) object.
All path rewrites in vercel.json point here.

Environment variables required (set in Vercel dashboard):
  DATABASE_URL      — PostgreSQL connection string (postgresql://user:pass@host/db)
  JWT_SECRET        — HS256 signing key (generate with: python -c "import secrets; print(secrets.token_hex(32))")
  LLM_PROVIDER      — GEMINI
  LLM_API_KEY       — Gemini API key (SERVER-SIDE ONLY — NEVER use VITE_ prefix)
  LLM_MODEL         — gemini-flash-lite-latest
  CORS_ORIGINS      — https://your-app.vercel.app (comma-separated for multiple)
"""

import sys
import os

# Add the backend directory to the path so all backend modules are importable
_backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(_backend_dir))

# Import the FastAPI app — this triggers all route registration
from main import app  # noqa: F401

# Mangum wraps the ASGI app for AWS Lambda-style serverless (which Vercel uses)
from mangum import Mangum

handler = Mangum(app, lifespan="off")
