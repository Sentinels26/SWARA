# SWARA Wellbeing Application

SWARA is a comprehensive full-stack web application designed for wellbeing tracking, professional support, and AI-assisted journaling and analysis.

## 🔒 Security & Safe Setup Instructions

**CRITICAL: KEEP YOUR SECRETS PRIVATE**

Before deploying or running SWARA in a production environment, please observe the following critical security principles:

- **Never commit `.env` files**: Your `.env` and `.env.local` files contain sensitive information. They are ignored by Git. Do not bypass this.
- **Never commit database files**: Local SQLite databases (`*.db`, `*.sqlite`) contain real confidential data (users, cases, chat logs). They are intentionally ignored by Git. 
- **Never commit API Keys**: Your `LLM_API_KEY` (Gemini API Key) must remain fully secret and stored on the server side only.
- **Use `.env.example`**: When setting up the project on a new machine, duplicate `.env.example` to `.env` and fill in your private credentials.
- **Local Data remains Local**: By default, SWARA runs on a local SQLite database (`backend/swara.db`). This allows you to develop locally without exposing data to the cloud.
- **Production Database**: For production (Vercel, Render, etc.), you must provision a PostgreSQL database and configure the `DATABASE_URL` environment variable.
- **Platform Secrets**: In production, all secrets (`LLM_API_KEY`, `JWT_SECRET`, `DATABASE_URL`) must be stored securely in your deployment platform's Environment Variables dashboard, *never* in the source code.

## Tech Stack
- Frontend: React (Vite, TypeScript, TailwindCSS)
- Backend: FastAPI (Python)
- Database: SQLite (Local) / PostgreSQL (Production) via SQLAlchemy
- AI: Google Gemini API
