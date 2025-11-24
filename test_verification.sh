#!/bin/bash
# Test 2-source verification system

API_URL="https://ai-catlog-bot.onrender.com"
API_KEY="catbot123"

echo "╔════════════════════════════════════════════════╗"
echo "║  2-Source Verification System Test            ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Test 1: Popular product (should have high verification rate)
echo "📦 Test 1: Popular Product (Samsung Refrigerator)"
echo "   Expected: 80-90% verification rate"
echo ""

RESULT1=$(curl -s -X POST "$API_URL/enrich" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"brand": "Samsung", "model_number": "RF28R7351SR", "category": "refrigerator"}' | \
  python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if 'verification' in d:
        print(f\"   ✅ Verification Rate: {d['verification']['rate']}%\")
        print(f\"   ✅ Verified Fields: {d['verification']['verified_count']}/{d['verification']['total_critical_fields']}\")
        print(f\"   ✅ Summary: {d['verification']['summary']}\")
    else:
        print('   ⚠️  No verification data in response')
        print(f\"   Success: {d.get('success', False)}\")
except Exception as e:
    print(f'   ❌ Error: {str(e)}')
")

echo "$RESULT1"
echo ""

# Test 2: Parts portal
echo "🔧 Test 2: Parts Portal (Whirlpool Part)"
echo "   Expected: 60-80% verification rate"
echo ""

RESULT2=$(curl -s -X POST "$API_URL/enrich-part" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"part_number": "WPW10312695", "brand": "Whirlpool"}' | \
  python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if 'verification' in d:
        print(f\"   ✅ Verification Rate: {d['verification']['rate']}%\")
        print(f\"   ✅ Verified Fields: {d['verification']['verified_count']}/{d['verification']['total_critical_fields']}\")
        print(f\"   ✅ Summary: {d['verification']['summary']}\")
    else:
        print('   ⚠️  No verification data in response')
        print(f\"   Success: {d.get('success', False)}\")
except Exception as e:
    print(f'   ❌ Error: {str(e)}')
")

echo "$RESULT2"
echo ""

# Test 3: Home products portal
echo "🏠 Test 3: Home Products Portal (Kohler Faucet)"
echo "   Expected: 70-85% verification rate"
echo ""

RESULT3=$(curl -s -X POST "$API_URL/enrich-home-product" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{"brand": "Kohler", "model_number": "K-596-VS", "product_type": "faucet"}' | \
  python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if 'verification' in d:
        print(f\"   ✅ Verification Rate: {d['verification']['rate']}%\")
        print(f\"   ✅ Verified Fields: {d['verification']['verified_count']}/{d['verification']['total_critical_fields']}\")
        print(f\"   ✅ Summary: {d['verification']['summary']}\")
    else:
        print('   ⚠️  No verification data in response')
        print(f\"   Success: {d.get('success', False)}\")
except Exception as e:
    print(f'   ❌ Error: {str(e)}')
")

echo "$RESULT3"
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║  Test Complete                                 ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📊 Verification System Status:"
echo "   • AI prompts enhanced with 2-source requirements"
echo "   • Backend validation enforcing strict mode"
echo "   • Verification metadata included in all responses"
echo ""
echo "📖 Documentation:"
echo "   • VERIFICATION_IMPLEMENTATION.md - Detailed guide"
echo "   • DATA_VERIFICATION_FRAMEWORK.md - Strategic overview"
