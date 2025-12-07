#!/bin/bash
# Complete Server Diagnostics and Fix Script
# Run this on the CXC-AI server

set -e

echo "=== CXC-AI Server Diagnostics ==="
echo "Date: $(date)"
echo ""

echo "=== 1. System Info ==="
uname -a
echo ""

echo "=== 2. Backend Service Status ==="
systemctl status catalog-bot --no-pager
echo ""

echo "=== 3. Nginx Status ==="
systemctl status nginx --no-pager
echo ""

echo "=== 4. Port Check ==="
ss -tlnp | grep -E '(:80|:8000)'
echo ""

echo "=== 5. Backend Health Check ==="
curl -s http://localhost:8000/health | jq . || echo "Backend not responding"
echo ""

echo "=== 6. Nginx Frontend Check ==="
curl -I http://localhost/
echo ""

echo "=== 7. External Access Check ==="
curl -I http://cxc-ai.com/ || echo "External access failed"
echo ""

echo "=== 8. DNS Resolution ==="
getent hosts cxc-ai.com
echo ""

echo "=== 9. Firewall Status ==="
ufw status || echo "UFW not installed"
echo ""

echo "=== 10. Recent Backend Logs ==="
tail -10 /var/log/catalog-bot/error.log 2>/dev/null || echo "No error logs"
echo ""

echo "=== 11. Recent Nginx Logs ==="
tail -10 /var/log/nginx/error.log
echo ""

echo "=== 12. Frontend Files ==="
ls -lah /var/www/Ai-Catlog-Bot/frontend/dist/
echo ""

echo "=== 13. Environment File Check ==="
ls -la /var/www/Ai-Catlog-Bot/.env
echo ""

echo "=== Diagnostics Complete ==="
