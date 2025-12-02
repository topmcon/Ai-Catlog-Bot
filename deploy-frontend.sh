#!/bin/bash
# Deploy frontend to VPS

cd /root/Ai-Catlog-Bot

# Pull latest code
git pull origin main

# Build frontend with production env
cd frontend
npm run build

# Deploy to web root
cp -r dist/* /var/www/html/

echo "✅ Frontend deployed to /var/www/html/"
echo "Test at: http://cxc-ai.com/ferguson.html"
