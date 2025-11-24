#!/bin/bash
# Quick deployment script for server
# Run this on your server at 198.211.105.43

set -e

echo "🔄 Pulling latest code..."
cd /var/www/catalogbot
git pull origin production

echo "📦 Building frontend..."
cd frontend
npm run build

echo "🚀 Deploying to web root..."
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

echo "✅ Deployment complete!"
echo "🌐 Now hard refresh your browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
