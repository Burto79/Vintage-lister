#!/bin/bash

# Get the directory where this script is located
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

cd "$APP_DIR"

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Kill any existing processes on our ports
if check_port 3001; then
    echo "Stopping existing backend on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

if check_port 3000; then
    echo "Stopping existing frontend on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    osascript -e 'display dialog "No .env file found!\n\nPlease create a .env file with your ANTHROPIC_API_KEY" buttons {"OK"} default button "OK" with icon caution with title "Vintage Lister"'
    exit 1
fi

# Check if backend node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "Failed to install backend dependencies.\n\nPlease check your internet connection and try again." buttons {"OK"} default button "OK" with icon stop with title "Vintage Lister"'
        exit 1
    fi
fi

# Check if frontend node_modules exists
if [ ! -d frontend/node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "Failed to install frontend dependencies.\n\nPlease check your internet connection and try again." buttons {"OK"} default button "OK" with icon stop with title "Vintage Lister"'
        exit 1
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║                                                ║"
echo "║         🎨 VINTAGE LISTER 🎨                   ║"
echo "║                                                ║"
echo "║    AI-Powered Vintage Item Listing Tool       ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Starting servers..."
echo ""
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔧 Backend:  http://localhost:3001"
echo ""
echo "Opening browser in 3 seconds..."
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Stopped successfully"
    echo ""
    echo "Press any key to close this window..."
    read -n 1
    exit
}

trap cleanup EXIT INT TERM

# Start backend in background
npm run dev:backend > /dev/null 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 3

# Start frontend in background
npm run dev:frontend > /dev/null 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
sleep 3

# Open browser
echo ""
echo "🚀 Opening browser..."
open http://localhost:3000

echo ""
echo "════════════════════════════════════════════════"
echo "✨ Vintage Lister is now running!"
echo "════════════════════════════════════════════════"
echo ""

# Keep the script running
wait
