#!/bin/bash

echo "=========================================="
echo "Backend System Health Check"
echo "Domain: cxc-ai.com"
echo "Date: $(date)"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $name: $response"
        return 0
    else
        echo -e "${RED}✗${NC} $name: $response (expected $expected_code)"
        return 1
    fi
}

# Test function with JSON response
test_json_endpoint() {
    local name=$1
    local url=$2
    
    response=$(curl -s "$url" 2>&1)
    
    if echo "$response" | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name: Valid JSON"
        echo "   Response: $response" | head -c 200
        echo ""
        return 0
    else
        echo -e "${RED}✗${NC} $name: Invalid JSON or error"
        echo "   Response: $response"
        return 1
    fi
}

echo "1. Frontend Tests"
echo "-------------------"
test_endpoint "Homepage" "https://cxc-ai.com"
test_endpoint "Admin Portal" "https://cxc-ai.com/admin.html"
test_endpoint "Parts Portal" "https://cxc-ai.com/parts.html"
test_endpoint "Home Products" "https://cxc-ai.com/home-products.html"
echo ""

echo "2. Backend API Tests"
echo "-------------------"
test_endpoint "API Root" "https://api.cxc-ai.com/"
test_json_endpoint "Health Check" "https://api.cxc-ai.com/health"
echo ""

echo "3. SSL/TLS Tests"
echo "-------------------"
ssl_info=$(echo | openssl s_client -connect cxc-ai.com:443 -servername cxc-ai.com 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} SSL Certificate Valid"
    echo "$ssl_info" | sed 's/^/   /'
else
    echo -e "${RED}✗${NC} SSL Certificate Issue"
fi
echo ""

echo "4. API Enrichment Test (Sample)"
echo "-------------------"
enrich_response=$(curl -s -X POST "https://api.cxc-ai.com/api/enrich" \
  -H "Content-Type: application/json" \
  -H "x-api-key: catbot123" \
  -d '{"model":"Test Model","category":"Test","manufacturer":"Test"}' 2>&1)

if echo "$enrich_response" | grep -q "enriched_data\|error\|detail"; then
    echo -e "${GREEN}✓${NC} Enrich API Responding"
    echo "   Response preview: $(echo "$enrich_response" | head -c 150)..."
else
    echo -e "${RED}✗${NC} Enrich API Issue"
    echo "   Response: $enrich_response"
fi
echo ""

echo "5. Performance Tests"
echo "-------------------"
response_time=$(curl -s -o /dev/null -w "%{time_total}" "https://cxc-ai.com")
echo "Frontend Load Time: ${response_time}s"

api_response_time=$(curl -s -o /dev/null -w "%{time_total}" "https://api.cxc-ai.com/health")
echo "API Response Time: ${api_response_time}s"
echo ""

echo "6. DNS Resolution"
echo "-------------------"
for domain in cxc-ai.com api.cxc-ai.com www.cxc-ai.com; do
    ip=$(dig +short $domain | head -1)
    if [ -n "$ip" ]; then
        echo -e "${GREEN}✓${NC} $domain → $ip"
    else
        echo -e "${RED}✗${NC} $domain: No IP found"
    fi
done
echo ""

echo "=========================================="
echo "Test Complete!"
echo "=========================================="
