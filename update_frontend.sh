#!/bin/bash
# Frontend Update Script
# Run this on server (198.211.105.43) to deploy latest frontend changes

set -e

echo "🚀 Updating Frontend to use api.cxc-ai.com"
echo "=========================================="

cd /var/www/catalogbot

echo "📥 Pulling latest code from production branch..."
git fetch origin production
git checkout production
git pull origin production

echo "🔨 Building frontend with updated API URL..."
cd frontend
npm install
npm run build

echo "📦 Deploying to web root..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

echo ""
echo "✅ Frontend updated successfully!"
echo ""
echo "🔍 Verifying deployment..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://cxc-ai.com/admin.html

echo ""
echo "✨ Admin panel should now show all systems operational at:"
echo "   https://cxc-ai.com/admin.html"
