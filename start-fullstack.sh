#!/bin/bash

echo "🚀 Starting Vintage Lister Full Stack Application"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your ANTHROPIC_API_KEY"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if frontend node_modules exists
if [ ! -d frontend/node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Starting servers..."
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend UI: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend in background
npm run dev:backend &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
npm run dev:frontend &
FRONTEND_PID=$!

# Wait for both processes
wait
