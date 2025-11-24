#!/bin/bash
# Test script for all three portals - confirms they're working and saving data

API_URL="https://ai-catlog-bot.onrender.com"
API_KEY="catbot123"

echo "╔═══════════════════════════════════════════╗"
echo "║   Testing All 3 Portals with Real Data   ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Test Catalog Portal
echo "📦 Testing CATALOG Portal..."
CATALOG_RESULT=$(curl -s -X POST "$API_URL/enrich" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"brand": "Samsung", "model_number": "RF28R7351SR", "category": "refrigerator"}' | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed')")
echo "   $CATALOG_RESULT"

# Test Parts Portal
echo "🔧 Testing PARTS Portal..."
PARTS_RESULT=$(curl -s -X POST "$API_URL/enrich-part" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"part_number": "WPW10312695", "brand": "Whirlpool"}' | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed')")
echo "   $PARTS_RESULT"

# Test Home Products Portal
echo "🏠 Testing HOME PRODUCTS Portal..."
HOME_RESULT=$(curl -s -X POST "$API_URL/enrich-home-product" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"brand": "IKEA", "model_number": "KIVIK-003", "product_type": "sofa"}' | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed')")
echo "   $HOME_RESULT"

echo ""
echo "⏳ Waiting for metrics to update..."
sleep 3

# Check Portal Metrics
echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║         Current Portal Metrics            ║"
echo "╚═══════════════════════════════════════════╝"
curl -s -H "X-API-KEY: $API_KEY" "$API_URL/portal-metrics" | python3 -c "
import json, sys
data = json.load(sys.stdin)

for portal, metrics in data['portals'].items():
    print(f'\n{portal.upper().replace(\"_\", \" \")}:')
    print(f'  Total: {metrics[\"total_requests\"]} | Success: {metrics[\"successful_requests\"]} | UI: {metrics[\"ui_calls\"]} | API: {metrics[\"api_calls\"]}')

print(f'\n📊 Total System Requests: {data[\"totals\"][\"total_requests\"]}')
print(f'✓ Success Rate: {data[\"totals\"][\"success_rate\"]}%')
print(f'📋 Activity Logs Stored: {len(data[\"recent_logs\"])}')
"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║              Test Complete!               ║"
echo "╚═══════════════════════════════════════════╝"
