#!/bin/bash
# Ferguson API Deployment Script
# Run this on production server (198.211.105.43)

set -e

echo "==================================================="
echo "Ferguson API Update Deployment"
echo "Adding: /lookup-ferguson-complete endpoint"
echo "==================================================="
echo ""

# Step 1: Pull latest code
echo "Step 1: Pulling latest code from GitHub..."
cd /root/Ai-Catlog-Bot
git pull origin main
echo "✓ Code updated"
echo ""

# Step 2: Check if catalog-bot service exists
echo "Step 2: Checking service status..."
systemctl status catalog-bot --no-pager | head -5
echo ""

# Step 3: Restart backend service
echo "Step 3: Restarting catalog-bot service..."
systemctl restart catalog-bot
sleep 3
echo "✓ Service restarted"
echo ""

# Step 4: Verify service is running
echo "Step 4: Verifying service status..."
systemctl status catalog-bot --no-pager | head -10
echo ""

# Step 5: Wait for service to be ready
echo "Step 5: Waiting for service to be ready..."
sleep 2

# Step 6: Test health endpoint
echo "Step 6: Testing health endpoint..."
curl -s http://localhost:8000/health | python3 -m json.tool || echo "Health check failed"
echo ""

# Step 7: Test new complete lookup endpoint
echo "Step 7: Testing NEW /lookup-ferguson-complete endpoint..."
curl -X POST http://localhost:8000/lookup-ferguson-complete \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"model_number": "2400-4273/24"}' \
  -s | python3 -m json.tool | head -30
echo ""

# Step 8: Test backward compatibility (old search endpoint)
echo "Step 8: Testing backward compatibility (old /search-ferguson endpoint)..."
curl -X POST http://localhost:8000/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"search": "kohler"}' \
  -s | python3 -m json.tool | head -20
echo ""

echo "==================================================="
echo "✓ Deployment Complete!"
echo "==================================================="
echo ""
echo "New Endpoint Available:"
echo "  POST https://cxc-ai.com:8000/lookup-ferguson-complete"
echo ""
echo "Existing Endpoints (Still Working):"
echo "  POST https://cxc-ai.com:8000/search-ferguson"
echo "  POST https://cxc-ai.com:8000/product-detail-ferguson"
echo ""
echo "Monitor logs:"
echo "  journalctl -u catalog-bot -f"
echo ""
echo "==================================================="
