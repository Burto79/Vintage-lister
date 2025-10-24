#!/bin/bash

echo "🎨 Starting 1979 Supply Co..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Kill any existing processes on port 3001
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "🧹 Cleaning up old server..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "🚀 Starting backend server..."
echo ""
npm run dev:backend &
BACKEND_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "✅ 1979 Supply Co is running!"
echo ""
echo "📍 Your Website:"
echo "   → http://localhost:3001/"
echo ""
echo "📸 Upload Items:"
echo "   → http://localhost:3000/"
echo ""
echo "🔧 API:"
echo "   → http://localhost:3001/api/shop/listings"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Keep script running
wait $BACKEND_PID
