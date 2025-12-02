# Production Server Cleanup & Setup Guide
**Server:** CXC-AI (198.211.105.43)  
**Domain:** cxc-ai.com  
**Date:** December 2, 2025

---

## 🎯 Goal
Clean up the production server and ensure everything runs properly on cxc-ai.com with:
- ✅ Backend API accessible at http://cxc-ai.com/api/*
- ✅ Frontend served at http://cxc-ai.com
- ✅ Single nginx configuration handling all routing
- ✅ No Docker (simplified standalone deployment)
- ✅ Systemd service for backend auto-restart

---

## 📋 Current Issues

1. **Backend running but not accessible** - Process on port 8000, but nginx not routing
2. **No systemd service** - Backend won't auto-restart on reboot
3. **Nginx config has placeholder domains** - References "yourdomain.com" instead of "cxc-ai.com"
4. **Multiple deployment methods** - Docker compose exists but not used
5. **No SSL configured** - HTTPS not working

---

## 🧹 Step 1: Cleanup Existing Setup

Run these commands on the server console:

```bash
# Stop any running backend processes
pkill -f "uvicorn main:app"

# Check if Docker containers exist (should be empty)
docker ps -a
docker-compose down 2>/dev/null || true

# Find the project directory
cd ~ && find . -name "Ai-Catlog-Bot" -type d 2>/dev/null
```

---

## 📁 Step 2: Set Up Project Directory

```bash
# Create proper directory structure
mkdir -p /var/www
cd /var/www

# Clone or update repository
if [ ! -d "Ai-Catlog-Bot" ]; then
    git clone https://github.com/topmcon/Ai-Catlog-Bot.git
else
    cd Ai-Catlog-Bot
    git pull origin main
fi

cd /var/www/Ai-Catlog-Bot

# Install Python dependencies
pip3 install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_key_here

# XAI Configuration (optional backup)
XAI_API_KEY=your_xai_key_here

# API Authentication
API_KEY=catbot123

# Unwrangle API Key (for Ferguson lookups)
UNWRANGLE_API_KEY=6ec52883deb5415e19e7eee6b85e93b072fafd26

# Data Directory
DATA_DIR=/var/www/Ai-Catlog-Bot/data
EOF

# Create data directory
mkdir -p data

# Set permissions
chmod 600 .env
chmod 755 data
```

---

## ⚙️ Step 3: Create Systemd Service

```bash
# Create systemd service file
cat > /etc/systemd/system/catalog-bot.service << 'EOF'
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

# Logging
StandardOutput=append:/var/log/catalog-bot/access.log
StandardError=append:/var/log/catalog-bot/error.log

[Install]
WantedBy=multi-user.target
EOF

# Create log directory
mkdir -p /var/log/catalog-bot
chmod 755 /var/log/catalog-bot

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable catalog-bot
systemctl start catalog-bot

# Check status
systemctl status catalog-bot
```

---

## 🌐 Step 4: Configure Nginx (Simplified)

```bash
# Backup existing config
cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Create new nginx configuration
cat > /etc/nginx/sites-enabled/default << 'EOF'
# Catalog-BOT Production Configuration
# Domain: cxc-ai.com

server {
    listen 80;
    server_name cxc-ai.com www.cxc-ai.com;

    # Logging
    access_log /var/log/nginx/cxc-ai.access.log;
    error_log /var/log/nginx/cxc-ai.error.log;

    # Frontend root directory
    root /var/www/Ai-Catlog-Bot/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API endpoints - Proxy to backend on port 8000
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running AI requests
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-API-KEY" always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Health check (no /api prefix for backward compatibility)
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }

    # Static files - Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.env$ {
        deny all;
    }
}
EOF

# Test nginx configuration
nginx -t

# If test passes, reload nginx
systemctl reload nginx
```

---

## 🎨 Step 5: Build and Deploy Frontend

```bash
cd /var/www/Ai-Catlog-Bot/frontend

# Install dependencies
npm install

# Create production .env file
cat > .env.production << 'EOF'
VITE_API_URL=http://cxc-ai.com/api
VITE_API_KEY=catbot123
EOF

# Build for production
npm run build

# Verify dist directory exists
ls -la dist/

# Set proper permissions
chmod -R 755 dist/
```

---

## ✅ Step 6: Verify Everything Works

```bash
# 1. Check backend is running
systemctl status catalog-bot
curl -s http://localhost:8000/health | jq .

# 2. Check nginx is running
systemctl status nginx

# 3. Test API through nginx
curl -s http://cxc-ai.com/api/health | jq .

# 4. Test Ferguson lookup
curl -X POST http://cxc-ai.com/api/lookup-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"model_number": "K-2362-8"}' | jq .

# 5. Test frontend
curl -s http://cxc-ai.com/ | head -20

# 6. Check logs
tail -f /var/log/catalog-bot/access.log
tail -f /var/log/nginx/cxc-ai.access.log
```

---

## 🔧 Step 7: Update Frontend API Configuration

The frontend should automatically use the correct API URL from the .env.production file, but verify the build includes:

```javascript
// Should be: http://cxc-ai.com/api
// NOT: http://localhost:8000
```

---

## 🚀 Step 8: Final Cleanup

```bash
# Remove old Docker images if any
docker system prune -a -f

# Clean up old processes
ps aux | grep uvicorn

# Set up log rotation
cat > /etc/logrotate.d/catalog-bot << 'EOF'
/var/log/catalog-bot/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 root root
}
EOF

# Test log rotation
logrotate -d /etc/logrotate.d/catalog-bot
```

---

## 📊 Monitoring Commands

```bash
# Check service status
systemctl status catalog-bot

# View backend logs
tail -f /var/log/catalog-bot/access.log
tail -f /var/log/catalog-bot/error.log

# View nginx logs
tail -f /var/log/nginx/cxc-ai.access.log
tail -f /var/log/nginx/cxc-ai.error.log

# Restart services
systemctl restart catalog-bot
systemctl restart nginx

# Check disk usage
df -h
du -sh /var/www/Ai-Catlog-Bot
```

---

## 🔄 Auto-Deployment Script

Create this script for future updates:

```bash
cat > /root/update-catalog-bot.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Updating Catalog-BOT..."

cd /var/www/Ai-Catlog-Bot

# Pull latest code
git pull origin main

# Update Python dependencies
pip3 install -r requirements.txt --upgrade

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Restart backend
systemctl restart catalog-bot

# Reload nginx
systemctl reload nginx

echo "✅ Update complete!"
echo ""
echo "🧪 Test endpoints:"
echo "   Frontend: http://cxc-ai.com"
echo "   API: http://cxc-ai.com/api/health"
EOF

chmod +x /root/update-catalog-bot.sh
```

---

## 🎯 Success Criteria

After completing these steps, you should have:

- ✅ Backend API accessible at `http://cxc-ai.com/api/*`
- ✅ Frontend accessible at `http://cxc-ai.com`
- ✅ Ferguson lookup working at `http://cxc-ai.com/api/lookup-ferguson`
- ✅ All portals working (catalog, parts, home-products, admin)
- ✅ Backend auto-starts on server reboot
- ✅ Logs being written to `/var/log/catalog-bot/`
- ✅ Single command to update: `/root/update-catalog-bot.sh`

---

## 🆘 Troubleshooting

### Backend not responding
```bash
systemctl status catalog-bot
journalctl -u catalog-bot -n 50
```

### Nginx errors
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

### API returns 404
```bash
# Check nginx is proxying correctly
curl -v http://cxc-ai.com/api/health
# Should show proxy_pass working
```

### Frontend shows old content
```bash
cd /var/www/Ai-Catlog-Bot/frontend
rm -rf dist/
npm run build
systemctl reload nginx
```

---

## 📝 Next Steps (Optional)

1. **Set up SSL/HTTPS** with Let's Encrypt:
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d cxc-ai.com -d www.cxc-ai.com
   ```

2. **Set up firewall**:
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

3. **Set up monitoring** with status checks

4. **Configure backups** for data directory
