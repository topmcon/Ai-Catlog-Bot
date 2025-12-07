#!/bin/bash
# Master Server Control Script for CXC-AI
# This script handles all server operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CXC-AI Server Control ===${NC}"

# Function to show menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Full System Status"
    echo "2) Restart Backend"
    echo "3) Restart Nginx"
    echo "4) Restart All Services"
    echo "5) View Backend Logs"
    echo "6) View Nginx Logs"
    echo "7) Test All Endpoints"
    echo "8) Update from GitHub"
    echo "9) Run Full Diagnostics"
    echo "0) Exit"
    echo ""
}

# 1. Full System Status
full_status() {
    echo -e "${YELLOW}=== System Status ===${NC}"
    echo "Backend Service:"
    systemctl status catalog-bot --no-pager | head -15
    echo ""
    echo "Nginx Service:"
    systemctl status nginx --no-pager | head -15
    echo ""
    echo "Ports:"
    ss -tlnp | grep -E '(:80|:8000)'
}

# 2. Restart Backend
restart_backend() {
    echo -e "${YELLOW}Restarting Backend...${NC}"
    systemctl restart catalog-bot
    sleep 3
    systemctl status catalog-bot --no-pager | head -10
    curl -s http://localhost:8000/health | jq .
}

# 3. Restart Nginx
restart_nginx() {
    echo -e "${YELLOW}Restarting Nginx...${NC}"
    systemctl restart nginx
    sleep 2
    systemctl status nginx --no-pager | head -10
}

# 4. Restart All
restart_all() {
    restart_backend
    echo ""
    restart_nginx
}

# 5. View Backend Logs
view_backend_logs() {
    echo -e "${YELLOW}=== Backend Logs (last 50 lines) ===${NC}"
    journalctl -u catalog-bot -n 50 --no-pager
}

# 6. View Nginx Logs
view_nginx_logs() {
    echo -e "${YELLOW}=== Nginx Error Logs ===${NC}"
    tail -50 /var/log/nginx/error.log
    echo ""
    echo -e "${YELLOW}=== Nginx Access Logs ===${NC}"
    tail -20 /var/log/nginx/access.log
}

# 7. Test All Endpoints
test_endpoints() {
    echo -e "${YELLOW}=== Testing Endpoints ===${NC}"
    
    echo "1. Backend Health:"
    curl -s http://localhost:8000/health | jq .
    
    echo ""
    echo "2. Nginx API Proxy:"
    curl -s http://cxc-ai.com/api/health | jq .
    
    echo ""
    echo "3. Frontend:"
    curl -I http://cxc-ai.com/ | head -5
    
    echo ""
    echo "4. Ferguson Lookup:"
    curl -X POST http://cxc-ai.com/api/lookup-ferguson \
      -H "Content-Type: application/json" \
      -H "X-API-KEY: catbot123" \
      -d '{"model_number": "K-2362-8"}' | jq '.success, .data.title'
}

# 8. Update from GitHub
update_from_github() {
    echo -e "${YELLOW}=== Updating from GitHub ===${NC}"
    cd /var/www/Ai-Catlog-Bot
    git pull
    echo ""
    echo "Rebuilding frontend..."
    cd frontend
    npm install
    npm run build
    echo ""
    echo "Restarting services..."
    systemctl restart catalog-bot
    systemctl reload nginx
    echo -e "${GREEN}Update complete!${NC}"
}

# 9. Full Diagnostics
full_diagnostics() {
    echo -e "${YELLOW}=== Full Diagnostics ===${NC}"
    
    echo "System Info:"
    uname -a
    echo ""
    
    echo "Backend Service:"
    systemctl status catalog-bot --no-pager
    echo ""
    
    echo "Nginx Service:"
    systemctl status nginx --no-pager
    echo ""
    
    echo "Ports:"
    ss -tlnp | grep -E '(:80|:8000)'
    echo ""
    
    echo "DNS Resolution:"
    getent hosts cxc-ai.com
    echo ""
    
    echo "Backend Health:"
    curl -s http://localhost:8000/health | jq . || echo "Failed"
    echo ""
    
    echo "External Access:"
    curl -I http://cxc-ai.com/ || echo "Failed"
    echo ""
    
    echo "Frontend Files:"
    ls -lah /var/www/Ai-Catlog-Bot/frontend/dist/
    echo ""
    
    echo "Environment File:"
    ls -la /var/www/Ai-Catlog-Bot/.env
    echo ""
    
    echo "Recent Backend Errors:"
    tail -20 /var/log/catalog-bot/error.log 2>/dev/null || echo "No errors"
    echo ""
    
    echo "Recent Nginx Errors:"
    tail -20 /var/log/nginx/error.log
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice: " choice
    
    case $choice in
        1) full_status ;;
        2) restart_backend ;;
        3) restart_nginx ;;
        4) restart_all ;;
        5) view_backend_logs ;;
        6) view_nginx_logs ;;
        7) test_endpoints ;;
        8) update_from_github ;;
        9) full_diagnostics ;;
        0) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
