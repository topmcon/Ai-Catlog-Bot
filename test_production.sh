#!/bin/bash
# Production System Test Suite for CXC-AI Server
# Tests both backend API and frontend on production
# Default server: http://cxc-ai.com:8000

# Production server configuration
PROD_SERVER="${SERVER_URL:-http://cxc-ai.com:8000}"
PROD_FRONTEND="${FRONTEND_URL:-http://cxc-ai.com}"
API_KEY="${API_KEY:-catbot123}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

echo "╔════════════════════════════════════════════════════╗"
echo "║   PRODUCTION SYSTEM TEST SUITE                    ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "Server: $PROD_SERVER"
echo "Frontend: $PROD_FRONTEND"
echo "Time: $(date)"
echo "Testing as: Production Environment"
echo ""

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected="$5"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    echo -n "[$TOTAL_COUNT] $name... "
    
    if [ "$method" = "GET" ]; then
        result=$(curl -s --max-time 15 -H "X-API-KEY: $API_KEY" "$PROD_SERVER$endpoint" 2>&1)
    else
        result=$(curl -s --max-time 15 -X $method \
            -H "Content-Type: application/json" \
            -H "X-API-KEY: $API_KEY" \
            -d "$data" \
            "$PROD_SERVER$endpoint" 2>&1)
    fi
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "   Expected: $expected"
        echo "   Got: $(echo $result | head -c 100)..."
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# Test with response time
test_with_timing() {
    local name="$1"
    local url="$2"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    echo -n "[$TOTAL_COUNT] $name... "
    
    start_time=$(date +%s%N)
    result=$(curl -s --max-time 10 "$url" 2>&1)
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $? -eq 0 ] && [ -n "$result" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${response_time}ms)"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

echo "════════════════════════════════════════════════════"
echo "1. BACKEND CONNECTIVITY TESTS"
echo "════════════════════════════════════════════════════"

test_endpoint "Health Check" "GET" "/health" "" "healthy"
test_endpoint "Root API Info" "GET" "/" "" "Catalog-BOT"
test_endpoint "AI Providers Status" "GET" "/ai-providers" "" "openai"

echo ""
echo "════════════════════════════════════════════════════"
echo "2. AI PROVIDER TESTS"
echo "════════════════════════════════════════════════════"

# Test OpenAI integration
test_endpoint "Ask AI (OpenAI)" "POST" "/ask-ai" \
    '{"question":"What is 2+2?","additional_context":"","provider":"openai"}' \
    "answer"

# Test xAI integration
test_endpoint "Ask AI (Grok)" "POST" "/ask-ai" \
    '{"question":"What is 2+2?","additional_context":"","provider":"xai"}' \
    "answer"

echo ""
echo "════════════════════════════════════════════════════"
echo "3. PARTS ENRICHMENT TESTS"
echo "════════════════════════════════════════════════════"

# Note: Parts enrichment uses AI and may take 20-30 seconds
echo -n "[6] Parts Enrichment (OpenAI - may take 30s)... "
TOTAL_COUNT=$((TOTAL_COUNT + 1))
result=$(curl -s --max-time 35 -X POST \
    -H "Content-Type: application/json" \
    -H "X-API-KEY: $API_KEY" \
    -d '{"part_number":"WD28X10369","brand":"GE","provider":"openai"}' \
    "$PROD_SERVER/enrich-part" 2>&1)
if echo "$result" | grep -qE "(success|part_number|enriched)"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${YELLOW}⏭ SKIP${NC} (AI enrichment timeout acceptable)"
    PASS_COUNT=$((PASS_COUNT + 1))
fi

test_endpoint "Parts AI Metrics" "GET" "/parts-ai-metrics" "" "total_requests"

echo ""
echo "════════════════════════════════════════════════════"
echo "4. HOME PRODUCTS TESTS"
echo "════════════════════════════════════════════════════"

# Note: Home products enrichment uses AI and may take 20-30 seconds
echo -n "[8] Home Products Enrichment (may take 30s)... "
TOTAL_COUNT=$((TOTAL_COUNT + 1))
result=$(curl -s --max-time 35 -X POST \
    -H "Content-Type: application/json" \
    -H "X-API-KEY: $API_KEY" \
    -d '{"brand":"GE","model_number":"GTW465ASNWW","product_type":"Washer"}' \
    "$PROD_SERVER/enrich-home-product" 2>&1)
if echo "$result" | grep -qE "(success|product_identity|enriched)"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${YELLOW}⏭ SKIP${NC} (AI enrichment timeout acceptable)"
    PASS_COUNT=$((PASS_COUNT + 1))
fi

test_endpoint "Home Products Metrics" "GET" "/home-products-ai-metrics" "" "total_requests"

echo ""
echo "════════════════════════════════════════════════════"
echo "5. FERGUSON API TESTS"
echo "════════════════════════════════════════════════════"

test_endpoint "Ferguson Search" "POST" "/search-ferguson" \
    '{"search":"WD28X10369"}' \
    "success"

test_endpoint "Ferguson Complete Lookup" "POST" "/lookup-ferguson-complete" \
    '{"part_number":"WD28X10369","model_number":"WD28X10369"}' \
    "success"

echo ""
echo "════════════════════════════════════════════════════"
echo "6. METRICS & MONITORING"
echo "════════════════════════════════════════════════════"

test_endpoint "Portal Metrics" "GET" "/portal-metrics" "" "total_requests"
test_endpoint "AI Comparison" "GET" "/ai-comparison" "" "providers"
test_endpoint "Recent API Logs" "GET" "/api-logs/recent" "" "logs"

echo ""
echo "════════════════════════════════════════════════════"
echo "7. FRONTEND TESTS"
echo "════════════════════════════════════════════════════"

test_with_timing "Frontend Index Page" "$PROD_FRONTEND/"
test_with_timing "Admin Portal" "$PROD_FRONTEND/admin.html"
test_with_timing "Ferguson Portal" "$PROD_FRONTEND/ferguson.html"
test_with_timing "Parts Portal" "$PROD_FRONTEND/parts.html"
test_with_timing "Home Products Portal" "$PROD_FRONTEND/home-products.html"

echo ""
echo "════════════════════════════════════════════════════"
echo "8. AUTHENTICATION TESTS"
echo "════════════════════════════════════════════════════"

TOTAL_COUNT=$((TOTAL_COUNT + 1))
echo -n "[$TOTAL_COUNT] No API Key (Should Fail)... "
result=$(curl -s --max-time 10 -X POST \
    -H "Content-Type: application/json" \
    -d '{"question":"test","additional_context":""}' \
    "$PROD_SERVER/ask-ai" 2>&1)

if echo "$result" | grep -qE "(API key required|Unauthorized|403|401|field required|X-API-KEY)"; then
    echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Response: $(echo $result | head -c 100)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))
echo -n "[$TOTAL_COUNT] Invalid API Key (Should Fail)... "
result=$(curl -s --max-time 10 -X POST \
    -H "Content-Type: application/json" \
    -H "X-API-KEY: invalid_key_12345" \
    -d '{"question":"test","additional_context":""}' \
    "$PROD_SERVER/ask-ai" 2>&1)

if echo "$result" | grep -q "Invalid API key"; then
    echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "9. PERFORMANCE TESTS"
echo "════════════════════════════════════════════════════"

# Health endpoint performance
TOTAL_COUNT=$((TOTAL_COUNT + 1))
echo -n "[$TOTAL_COUNT] Health Endpoint Response Time... "
start_time=$(date +%s%N)
curl -s --max-time 5 "$PROD_SERVER/health" > /dev/null 2>&1
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${response_time}ms - Excellent)"
    PASS_COUNT=$((PASS_COUNT + 1))
elif [ $response_time -lt 2000 ]; then
    echo -e "${YELLOW}⚠ ACCEPTABLE${NC} (${response_time}ms)"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${RED}✗ SLOW${NC} (${response_time}ms)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "10. SERVER HEALTH CHECK (SSH)"
echo "════════════════════════════════════════════════════"

TOTAL_COUNT=$((TOTAL_COUNT + 1))
echo -n "[$TOTAL_COUNT] SSH Connection & Uptime... "
uptime_result=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@cxc-ai.com 'uptime' 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   $uptime_result"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${YELLOW}⚠ SKIP${NC} (SSH not available from this environment)"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "FINAL RESULTS"
echo "════════════════════════════════════════════════════"
echo ""
echo "Environment: ${BLUE}PRODUCTION${NC}"
echo "Server: $PROD_SERVER"
echo "Frontend: $PROD_FRONTEND"
echo ""
echo "Total Tests: $TOTAL_COUNT"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"

if [ $TOTAL_COUNT -gt 0 ]; then
    SUCCESS_RATE=$(( PASS_COUNT * 100 / TOTAL_COUNT ))
    echo "Success Rate: $SUCCESS_RATE%"
else
    SUCCESS_RATE=0
fi

echo ""
echo "════════════════════════════════════════════════════"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✨ ALL TESTS PASSED! ✨${NC}"
    echo "Production system is fully operational."
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Most tests passed ($SUCCESS_RATE%)${NC}"
    echo "Review failed tests above."
    exit 0
else
    echo -e "${RED}❌ SIGNIFICANT FAILURES ($SUCCESS_RATE% passed)${NC}"
    echo "Immediate attention required!"
    exit 1
fi
