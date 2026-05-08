#!/bin/bash

echo "============================================"
echo "  ProTrack - Behavioral Productivity System"
echo "============================================"

# Check Node
if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "[OK] Node $(node --version) found"

# Install dependencies
echo "[1/4] Installing backend deps..."
cd "$(dirname "$0")/backend" && npm install

echo "[2/4] Installing frontend deps..."
cd "$(dirname "$0")/frontend" && npm install

# Start backend
echo "[3/4] Starting backend on :5000..."
cd "$(dirname "$0")/backend" && npm run dev &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "[4/4] Starting frontend on :3000..."
cd "$(dirname "$0")/frontend" && npm start &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Frontend : http://localhost:3000"
echo "  Backend  : http://localhost:5000/api/health"
echo "  Press Ctrl+C to stop both servers"
echo "============================================"

wait $BACKEND_PID $FRONTEND_PID
