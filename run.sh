#!/bin/bash

# Kill any existing processes on these ports to avoid conflicts
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:8001 | xargs kill -9 2>/dev/null

echo "Starting Backend (FastAPI)..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8001 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend (Vite)..."
cd frontend
npm run dev -- --port 5173 --host &
FRONTEND_PID=$!
cd ..

echo "================================================="
echo "SWARA is running!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8001"
echo "Press Ctrl+C to stop both servers."
echo "================================================="

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID
