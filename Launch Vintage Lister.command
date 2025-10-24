#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Kill any existing processes on our ports
if check_port 3001; then
    echo "🧹 Cleaning up existing backend on port 3001..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

if check_port 3000; then
    echo "🧹 Cleaning up existing frontend on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

clear

echo "╔════════════════════════════════════════════════╗"
echo "║                                                ║"
echo "║         🎨 VINTAGE LISTER 🎨                   ║"
echo "║                                                ║"
echo "║    AI-Powered Vintage Item Listing Tool       ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: No .env file found!"
    echo ""
    echo "Please create a .env file with your ANTHROPIC_API_KEY"
    echo ""
    echo "Example:"
    echo "  ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx"
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Check if backend node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    echo "   This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Failed to install backend dependencies"
        echo ""
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
    echo ""
fi

# Check if frontend node_modules exists
if [ ! -d frontend/node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    echo "   This may take a few minutes..."
    echo ""
    cd frontend && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Failed to install frontend dependencies"
        echo ""
        echo "Press any key to exit..."
        read -n 1
        exit 1
    fi
    echo ""
fi

echo "🚀 Starting servers..."
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
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
echo "   Starting backend API..."
npm run dev:backend > /tmp/vintage-lister-backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Check if backend is still running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo ""
    echo "❌ Backend failed to start. Check logs:"
    tail -20 /tmp/vintage-lister-backend.log
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

echo "   ✅ Backend running on http://localhost:3001"

# Start frontend in background
echo "   Starting frontend UI..."
npm run dev:frontend > /tmp/vintage-lister-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
sleep 4

# Check if frontend is still running
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo ""
    echo "❌ Frontend failed to start. Check logs:"
    tail -20 /tmp/vintage-lister-frontend.log
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

echo "   ✅ Frontend running on http://localhost:3000"

# Open browser
echo ""
echo "🌐 Opening browser..."
sleep 1
open http://localhost:3000

echo ""
echo "════════════════════════════════════════════════"
echo "✨ Vintage Lister is now running!"
echo "════════════════════════════════════════════════"
echo ""
echo "  🌐 Web Interface: http://localhost:3000"
echo "  🔧 API Backend:   http://localhost:3001"
echo ""
echo "  Press Ctrl+C to stop the servers"
echo ""
echo "════════════════════════════════════════════════"
echo ""

# Keep the script running and show a waiting message
echo "Waiting for requests... (logs hidden for clean output)"
echo ""

# Wait for processes
wait
