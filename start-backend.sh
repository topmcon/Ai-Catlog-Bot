#!/bin/bash
# Start backend with environment variables loaded

cd /root/Ai-Catlog-Bot

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Kill old backend process (try multiple times)
echo "=== Stopping old backend ==="
pkill -9 -f "uvicorn main:app" 2>/dev/null || true
sleep 1
pkill -9 -f "python3 -m uvicorn" 2>/dev/null || true
sleep 1

# Verify no process is running
if pgrep -f "uvicorn main:app" > /dev/null; then
    echo "ERROR: Could not stop old backend process"
    exit 1
fi

# Start backend with environment variables
echo "=== Starting new backend ==="
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for startup
sleep 3

# Verify process is running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo "ERROR: Backend process failed to start"
    echo "Last 20 lines of log:"
    tail -20 /tmp/backend.log
    exit 1
fi

# Test health endpoint
echo "=== Backend Health Check ==="
curl -s http://localhost:8000/health | python3 -m json.tool

echo ""
echo "=== Backend started successfully (PID: $BACKEND_PID) ==="
echo "Logs: tail -f /tmp/backend.log"
