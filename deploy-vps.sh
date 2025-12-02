#!/bin/bash
# VPS Deployment Script for Ferguson Portal
# Run this on your VPS server at cxc-ai.com

set -e  # Exit on error

echo "🚀 Deploying Ferguson Portal to VPS..."

# Navigate to project directory (adjust path as needed)
cd /var/www/Ai-Catlog-Bot || cd ~/Ai-Catlog-Bot || exit 1

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "📦 Installing Python dependencies..."
pip3 install httpx rich --quiet

echo "🔑 Checking environment variables..."
if ! grep -q "UNWRANGLE_API_KEY" .env; then
    echo "⚠️  Adding UNWRANGLE_API_KEY to .env..."
    echo "" >> .env
    echo "# Unwrangle API Key (for Ferguson/Build.com product lookup)" >> .env
    echo "UNWRANGLE_API_KEY=6ec52883deb5415e19e7eee6b85e93b072fafd26" >> .env
fi

echo "🔄 Restarting backend service..."
# Adjust this based on your service manager (systemd, pm2, supervisor, etc.)
if command -v systemctl &> /dev/null; then
    sudo systemctl restart catalog-bot || sudo systemctl restart uvicorn || echo "⚠️  Please restart backend manually"
elif command -v pm2 &> /dev/null; then
    pm2 restart catalog-bot || pm2 restart all
elif command -v supervisorctl &> /dev/null; then
    sudo supervisorctl restart catalog-bot
else
    echo "⚠️  Could not auto-restart. Please restart backend manually:"
    echo "   pkill -f 'uvicorn main:app' && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &"
fi

echo "🌐 Building frontend..."
cd frontend
npm install --silent
npm run build

echo "📋 Frontend built to frontend/dist/"
echo "   Make sure nginx/apache serves this directory"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test the endpoints:"
echo "   Frontend: https://cxc-ai.com/ferguson.html"
echo "   Backend:  https://api.cxc-ai.com/lookup-ferguson"
echo ""
echo "🔍 Test with:"
echo "   curl -X POST https://api.cxc-ai.com/lookup-ferguson \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'X-API-KEY: catbot123' \\"
echo "     -d '{\"model_number\": \"K-2362-8\"}'"
