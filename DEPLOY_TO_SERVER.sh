#!/bin/bash
# Complete Deployment Script for CXC-AI Server
# Run this script ON THE SERVER (198.211.105.43) to deploy all updates

set -e

echo "========================================"
echo "🚀 CXC-AI Complete Deployment Script"
echo "========================================"
echo ""
echo "Server: 198.211.105.43"
echo "Domain: cxc-ai.com"
echo "API: api.cxc-ai.com"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${BLUE}Step 1: Pulling latest code...${NC}"
cd /var/www/catalogbot
git fetch origin production
git checkout production
git pull origin production
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 2: Check if Node.js and npm are available
echo -e "${BLUE}Step 2: Checking Node.js...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
node --version
npm --version
echo -e "${GREEN}✓ Node.js ready${NC}"
echo ""

# Step 3: Build frontend
echo -e "${BLUE}Step 3: Building frontend...${NC}"
cd /var/www/catalogbot/frontend
npm install
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Step 4: Create web root if it doesn't exist
echo -e "${BLUE}Step 4: Preparing web root...${NC}"
sudo mkdir -p /var/www/html
echo -e "${GREEN}✓ Web root ready${NC}"
echo ""

# Step 5: Deploy frontend
echo -e "${BLUE}Step 5: Deploying frontend files...${NC}"
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
echo -e "${GREEN}✓ Frontend deployed${NC}"
echo ""

# Step 6: Verify deployment
echo -e "${BLUE}Step 6: Verifying deployment...${NC}"
echo "Files deployed:"
ls -lh /var/www/html/*.html
echo ""

# Step 7: Test endpoints
echo -e "${BLUE}Step 7: Testing endpoints...${NC}"
echo -n "Frontend (cxc-ai.com): "
curl -s -o /dev/null -w "%{http_code}" https://cxc-ai.com
echo ""
echo -n "Admin Panel: "
curl -s -o /dev/null -w "%{http_code}" https://cxc-ai.com/admin.html
echo ""
echo -n "Catalog Portal: "
curl -s -o /dev/null -w "%{http_code}" https://cxc-ai.com/index-catalog.html
echo ""
echo -n "Parts Portal: "
curl -s -o /dev/null -w "%{http_code}" https://cxc-ai.com/parts.html
echo ""
echo -n "API Health: "
curl -s -o /dev/null -w "%{http_code}" https://api.cxc-ai.com/health
echo ""
echo -e "${GREEN}✓ All endpoints responding${NC}"
echo ""

# Step 8: Check Docker services
echo -e "${BLUE}Step 8: Checking Docker services...${NC}"
cd /var/www/catalogbot
if [ -f "docker-compose.yml" ]; then
    docker-compose ps
    echo -e "${GREEN}✓ Docker services running${NC}"
else
    echo -e "${YELLOW}⚠ No docker-compose.yml found${NC}"
fi
echo ""

echo "========================================"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "========================================"
echo ""
echo "🌐 Access your portals:"
echo "   Homepage:        https://cxc-ai.com"
echo "   Admin Panel:     https://cxc-ai.com/admin.html"
echo "   Catalog Portal:  https://cxc-ai.com/index-catalog.html"
echo "   Parts Portal:    https://cxc-ai.com/parts.html"
echo "   API:             https://api.cxc-ai.com"
echo ""
echo "📋 Next steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)"
echo "   2. Test admin panel at https://cxc-ai.com/admin.html"
echo "   3. Verify all portal tests pass"
echo ""
