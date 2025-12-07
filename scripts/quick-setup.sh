#!/bin/bash
# Quick Setup Script for CXC-AI Production Server
# Run this on: root@CXC-AI (198.211.105.43)

set -e
echo "🚀 Starting Catalog-BOT Production Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Stop existing backend
echo -e "${YELLOW}Step 1: Stopping existing backend...${NC}"
pkill -f "uvicorn main:app" || true
sleep 2

# Step 2: Set up project directory
echo -e "${YELLOW}Step 2: Setting up project directory...${NC}"
mkdir -p /var/www
cd /var/www

if [ ! -d "Ai-Catlog-Bot" ]; then
    echo "Cloning repository..."
    git clone https://github.com/topmcon/Ai-Catlog-Bot.git
else
    echo "Updating existing repository..."
    cd Ai-Catlog-Bot
    git pull origin main
fi

cd /var/www/Ai-Catlog-Bot

# Step 3: Install Python dependencies
echo -e "${YELLOW}Step 3: Installing Python dependencies...${NC}"
pip3 install -r requirements.txt -q

# Step 4: Create data directory
echo -e "${YELLOW}Step 4: Creating data directory...${NC}"
mkdir -p data
chmod 755 data

# Step 5: Create systemd service
echo -e "${YELLOW}Step 5: Creating systemd service...${NC}"
cat > /etc/systemd/system/catalog-bot.service << 'SERVICEEOF'
[Unit]
Description=Catalog-BOT API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/Ai-Catlog-Bot
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

StandardOutput=append:/var/log/catalog-bot/access.log
StandardError=append:/var/log/catalog-bot/error.log

[Install]
WantedBy=multi-user.target
SERVICEEOF

mkdir -p /var/log/catalog-bot
chmod 755 /var/log/catalog-bot

systemctl daemon-reload
systemctl enable catalog-bot
systemctl start catalog-bot

# Step 6: Configure Nginx
echo -e "${YELLOW}Step 6: Configuring Nginx...${NC}"
cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

cat > /etc/nginx/sites-enabled/default << 'NGINXEOF'
server {
    listen 80;
    server_name cxc-ai.com www.cxc-ai.com;

    access_log /var/log/nginx/cxc-ai.access.log;
    error_log /var/log/nginx/cxc-ai.error.log;

    root /var/www/Ai-Catlog-Bot/frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
        
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-API-KEY" always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    location ~ /\. {
        deny all;
    }
    
    location ~ \.env$ {
        deny all;
    }
}
NGINXEOF

nginx -t
systemctl reload nginx

# Step 7: Build Frontend
echo -e "${YELLOW}Step 7: Building frontend...${NC}"
cd /var/www/Ai-Catlog-Bot/frontend

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Create production env file
cat > .env.production << 'ENVEOF'
VITE_API_URL=http://cxc-ai.com/api
VITE_API_KEY=catbot123
ENVEOF

npm install
npm run build

chmod -R 755 dist/

# Step 8: Verify
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "🧪 Testing endpoints..."
sleep 3

echo -n "Backend Health: "
curl -s http://localhost:8000/health | jq -r .status

echo -n "API via Nginx: "
curl -s http://cxc-ai.com/api/health | jq -r .status 2>/dev/null || echo "Not accessible yet (check DNS)"

echo ""
echo "📊 Service Status:"
systemctl status catalog-bot --no-pager -l | head -10

echo ""
echo "📝 Useful Commands:"
echo "  - Check backend: systemctl status catalog-bot"
echo "  - Check nginx: systemctl status nginx"
echo "  - View logs: tail -f /var/log/catalog-bot/access.log"
echo "  - Restart backend: systemctl restart catalog-bot"
echo "  - Update code: cd /var/www/Ai-Catlog-Bot && git pull && systemctl restart catalog-bot"
echo ""
echo "🌐 Access:"
echo "  - Frontend: http://cxc-ai.com"
echo "  - API Health: http://cxc-ai.com/api/health"
echo "  - Ferguson API: http://cxc-ai.com/api/lookup-ferguson"
echo ""
