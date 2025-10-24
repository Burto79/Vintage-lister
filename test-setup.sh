#!/bin/bash

# Test script to verify installation

echo "🧪 Testing Vintage Lister Setup..."
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Test 1: Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js $(node --version) installed"
else
    echo "   ❌ Node.js not found"
    exit 1
fi

# Test 2: npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    echo "   ✅ npm $(npm --version) installed"
else
    echo "   ❌ npm not found"
    exit 1
fi

# Test 3: Dependencies
echo "3. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules found"
else
    echo "   ❌ Dependencies not installed"
    echo "      Run: npm install"
    exit 1
fi

# Test 4: .env file
echo "4. Checking configuration..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "ANTHROPIC_API_KEY=sk-" .env; then
        echo "   ✅ API key configured"
    else
        echo "   ⚠️  API key not set (add your key to .env)"
    fi
else
    echo "   ❌ .env file missing"
    exit 1
fi

# Test 5: Folders
echo "5. Checking folders..."
if [ -d "incoming-photos" ]; then
    echo "   ✅ incoming-photos/ exists"
else
    echo "   ⚠️  incoming-photos/ missing"
fi

# Test 6: TypeScript compilation
echo "6. Testing build..."
if npm run build &> /dev/null; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════"
echo "✨ Setup verified! Everything looks good."
echo ""
echo "Next steps:"
echo "  1. Add your Anthropic API key to .env"
echo "  2. Run: ./start.sh"
echo "═══════════════════════════════════════"
