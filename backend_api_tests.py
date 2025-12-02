"""
Comprehensive Backend API Testing Suite
Tests all backend systems, endpoints, and integrations
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List

# Configuration
API_URL = "http://localhost:8000"
API_KEY = "catbot123"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY
}

# Test counters
total_tests = 0
passed_tests = 0
failed_tests = 0

def print_header(text: str):
    """Print formatted header"""
    print(f"\n{'='*100}")
    print(f"  {text}")
    print(f"{'='*100}\n")

def print_section(text: str):
    """Print formatted section"""
    print(f"\n{'-'*100}")
    print(f"  {text}")
    print(f"{'-'*100}\n")

def log_test(name: str, passed: bool, details: str = "", response_time: float = 0):
    """Log individual test result"""
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    
    if passed:
        passed_tests += 1
        status = "✅ PASS"
    else:
        failed_tests += 1
        status = "❌ FAIL"
    
    print(f"{status} - {name}")
    if details:
        print(f"    {details}")
    if response_time > 0:
        print(f"    Response Time: {response_time:.3f}s")
    print()

# ============================================================================
# CORE BACKEND TESTS
# ============================================================================

def test_core_endpoints():
    """Test core backend endpoints"""
    print_section("1. CORE BACKEND ENDPOINTS")
    
    # Test 1: Root endpoint
    try:
        start = time.time()
        response = requests.get(f"{API_URL}/", timeout=5)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Root Endpoint",
                True,
                f"Version: {data.get('version')}, Status: {data.get('status')}",
                elapsed
            )
        else:
            log_test("Root Endpoint", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Root Endpoint", False, f"Error: {str(e)}")
    
    # Test 2: Health check
    try:
        start = time.time()
        response = requests.get(f"{API_URL}/health", timeout=5)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            ai_status = data.get('ai_providers', {})
            log_test(
                "Health Check",
                True,
                f"OpenAI: {ai_status.get('openai', {}).get('enabled')}, xAI: {ai_status.get('xai', {}).get('enabled')}",
                elapsed
            )
        else:
            log_test("Health Check", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Health Check", False, f"Error: {str(e)}")
    
    # Test 3: Authentication - Valid Key
    try:
        start = time.time()
        response = requests.get(f"{API_URL}/ai-providers", headers=HEADERS, timeout=5)
        elapsed = time.time() - start
        
        log_test(
            "Authentication (Valid Key)",
            response.status_code == 200,
            f"Status: {response.status_code}",
            elapsed
        )
    except Exception as e:
        log_test("Authentication (Valid Key)", False, f"Error: {str(e)}")
    
    # Test 4: Authentication - Invalid Key
    try:
        start = time.time()
        bad_headers = {"X-API-KEY": "invalid_key"}
        response = requests.get(f"{API_URL}/ai-providers", headers=bad_headers, timeout=5)
        elapsed = time.time() - start
        
        log_test(
            "Authentication (Invalid Key)",
            response.status_code == 401,
            f"Correctly rejected with status: {response.status_code}",
            elapsed
        )
    except Exception as e:
        log_test("Authentication (Invalid Key)", False, f"Error: {str(e)}")

# ============================================================================
# CATALOG ENRICHMENT TESTS
# ============================================================================

def test_catalog_enrichment():
    """Test catalog enrichment API"""
    print_section("2. CATALOG ENRICHMENT API")
    
    # Test 1: Basic enrichment
    try:
        start = time.time()
        payload = {
            "brand": "Bosch",
            "model_number": "SHPM88Z75N"
        }
        response = requests.post(
            f"{API_URL}/enrich",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Basic Product Enrichment",
                True,
                f"Product: {data.get('enriched_data', {}).get('product_name', 'N/A')[:60]}...",
                elapsed
            )
        else:
            log_test("Basic Product Enrichment", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Basic Product Enrichment", False, f"Error: {str(e)}")
    
    # Test 2: Enrichment with minimal data
    try:
        start = time.time()
        payload = {
            "brand": "Generic",
            "model_number": "TEST123"
        }
        response = requests.post(
            f"{API_URL}/enrich",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        elapsed = time.time() - start
        
        log_test(
            "Enrichment with Minimal Data",
            response.status_code == 200,
            f"Status: {response.status_code}",
            elapsed
        )
    except Exception as e:
        log_test("Enrichment with Minimal Data", False, f"Error: {str(e)}")

# ============================================================================
# FERGUSON API TESTS
# ============================================================================

# Global variable to store product URL between tests
first_product_url = None

def test_ferguson_api():
    """Test Ferguson Home API integration (Unwrangle)"""
    print_section("3. FERGUSON HOME API INTEGRATION (Unwrangle)")
    
    global first_product_url
    
    # Test 1: Ferguson Home Search
    try:
        start = time.time()
        payload = {
            "search": "Pedestal Bathroom Sinks",
            "page": 1
        }
        response = requests.post(
            f"{API_URL}/search-ferguson",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            log_test(
                "Ferguson Home Search",
                True,
                f"Found {len(products)} products, Total: {data.get('total_results', 0)}",
                elapsed
            )
            # Store first product URL for next test
            if products:
                first_product_url = products[0].get('url')
        else:
            log_test("Ferguson Home Search", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Ferguson Home Search", False, f"Error: {str(e)}")
    
    # Test 2: Ferguson Home Product Detail
    try:
        start = time.time()
        # Use URL from search or default
        test_url = first_product_url or "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"
        payload = {
            "url": test_url
        }
        response = requests.post(
            f"{API_URL}/product-detail-ferguson",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            detail = data.get('detail', {})
            log_test(
                "Ferguson Home Product Detail",
                True,
                f"{detail.get('name', 'N/A')[:50]}... - {detail.get('variant_count', 0)} variants",
                elapsed
            )
        else:
            log_test("Ferguson Home Product Detail", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Ferguson Home Product Detail", False, f"Error: {str(e)}")
    
    # Test 3: Ferguson Search by Model Number
    try:
        start = time.time()
        payload = {
            "search": "K-2362-8",
            "page": 1
        }
        response = requests.post(
            f"{API_URL}/search-ferguson",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            log_test(
                "Ferguson Search by Model",
                True,
                f"Found {data.get('total_results', 0)} matching products",
                elapsed
            )
        else:
            log_test("Ferguson Search by Model", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Ferguson Search by Model", False, f"Error: {str(e)}")

# ============================================================================
# HOME PRODUCTS API TESTS
# ============================================================================

def test_home_products_api():
    """Test Home Products API"""
    print_section("4. HOME PRODUCTS API")
    
    # Test 1: Home products enrichment
    try:
        start = time.time()
        payload = {
            "model_number": "GTS18GTHWW",
            "brand": "GE",
            "description": "Refrigerator"
        }
        response = requests.post(
            f"{API_URL}/enrich-home-product",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Home Products Enrichment",
                True,
                f"Product enriched successfully",
                elapsed
            )
        else:
            log_test("Home Products Enrichment", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Home Products Enrichment", False, f"Error: {str(e)}")
    
    # Test 2: Home products enrichment (second test)
    try:
        start = time.time()
        payload = {
            "model_number": "WF45R6100AP",
            "brand": "Samsung",
            "description": "Washing Machine"
        }
        response = requests.post(
            f"{API_URL}/enrich-home-product",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Home Products Enrichment (2)",
                True,
                f"Product enriched successfully",
                elapsed
            )
        else:
            log_test("Home Products Enrichment (2)", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Home Products Enrichment (2)", False, f"Error: {str(e)}")

# ============================================================================
# PARTS API TESTS
# ============================================================================

def test_parts_api():
    """Test Parts API"""
    print_section("5. PARTS API")
    
    # Test 1: Parts enrichment
    try:
        start = time.time()
        payload = {
            "part_number": "W10295370A",
            "brand": "Whirlpool"
        }
        response = requests.post(
            f"{API_URL}/enrich-part",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Parts Enrichment",
                True,
                f"Part enriched successfully",
                elapsed
            )
        else:
            log_test("Parts Enrichment", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Parts Enrichment", False, f"Error: {str(e)}")
    
    # Test 2: Parts enrichment (second test)
    try:
        start = time.time()
        payload = {
            "part_number": "WD12X10304",
            "brand": "GE"
        }
        response = requests.post(
            f"{API_URL}/enrich-part",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Parts Enrichment (2)",
                True,
                f"Part enriched successfully",
                elapsed
            )
        else:
            log_test("Parts Enrichment (2)", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Parts Enrichment (2)", False, f"Error: {str(e)}")

# ============================================================================
# SALESFORCE INTEGRATION TESTS
# ============================================================================

def test_salesforce_integration():
    """Test Salesforce integration"""
    print_section("6. SALESFORCE INTEGRATION")
    
    # Note: Salesforce endpoints may not be implemented in main.py
    # These tests document expected functionality
    
    print("⚠️  NOTE: Salesforce integration is implemented via Apex class (CatalogBotService.cls)")
    print("    Backend API may not have direct Salesforce endpoints.")
    print("    Salesforce integration works via Apex REST callouts to the enrichment endpoints.\n")
    
    # Test: Verify enrichment endpoints work (used by Salesforce)
    try:
        start = time.time()
        payload = {
            "brand": "Test Mfg",
            "model_number": "SF-TEST-123"
        }
        response = requests.post(
            f"{API_URL}/enrich",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        elapsed = time.time() - start
        
        log_test(
            "Salesforce-Compatible Enrichment",
            response.status_code == 200,
            f"Enrichment endpoint available for Salesforce integration",
            elapsed
        )
    except Exception as e:
        log_test("Salesforce-Compatible Enrichment", False, f"Error: {str(e)}")

# ============================================================================
# METRICS AND MONITORING TESTS
# ============================================================================

def test_metrics_monitoring():
    """Test metrics and monitoring endpoints"""
    print_section("7. METRICS AND MONITORING")
    
    # Test 1: AI Providers status
    try:
        start = time.time()
        response = requests.get(
            f"{API_URL}/ai-providers",
            headers=HEADERS,
            timeout=10
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "AI Providers Status",
                True,
                f"Providers: {', '.join(data.keys())}",
                elapsed
            )
        else:
            log_test("AI Providers Status", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("AI Providers Status", False, f"Error: {str(e)}")
    
    # Test 2: AI Metrics
    try:
        start = time.time()
        response = requests.get(
            f"{API_URL}/ai-metrics",
            headers=HEADERS,
            timeout=10
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "AI Metrics Endpoint",
                True,
                f"Total requests: {data.get('total_requests', 0)}",
                elapsed
            )
        else:
            log_test("AI Metrics Endpoint", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("AI Metrics Endpoint", False, f"Error: {str(e)}")
    
    # Test 3: Parts AI Metrics
    try:
        start = time.time()
        response = requests.get(
            f"{API_URL}/parts-ai-metrics",
            headers=HEADERS,
            timeout=10
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Parts AI Metrics",
                True,
                f"Total requests: {data.get('total_requests', 0)}",
                elapsed
            )
        else:
            log_test("Parts AI Metrics", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Parts AI Metrics", False, f"Error: {str(e)}")
    
    # Test 4: Home Products AI Metrics
    try:
        start = time.time()
        response = requests.get(
            f"{API_URL}/home-products-ai-metrics",
            headers=HEADERS,
            timeout=10
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Home Products AI Metrics",
                True,
                f"Total requests: {data.get('total_requests', 0)}",
                elapsed
            )
        else:
            log_test("Home Products AI Metrics", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Home Products AI Metrics", False, f"Error: {str(e)}")
    
    # Test 5: Portal Metrics
    try:
        start = time.time()
        response = requests.get(
            f"{API_URL}/portal-metrics",
            headers=HEADERS,
            timeout=10
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log_test(
                "Portal Metrics",
                True,
                f"Total requests: {data.get('total_requests', 0)}",
                elapsed
            )
        else:
            log_test("Portal Metrics", False, f"Status: {response.status_code}", elapsed)
    except Exception as e:
        log_test("Portal Metrics", False, f"Error: {str(e)}")

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def main():
    """Run all backend tests"""
    print_header("CATALOG-BOT BACKEND API COMPREHENSIVE TEST SUITE")
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API URL: {API_URL}")
    print(f"API Key: {'*' * (len(API_KEY) - 4) + API_KEY[-4:]}")
    
    start_time = time.time()
    
    # Run all test suites
    test_core_endpoints()
    test_catalog_enrichment()
    test_ferguson_api()
    test_home_products_api()
    test_parts_api()
    test_salesforce_integration()
    test_metrics_monitoring()
    
    # Print summary
    total_time = time.time() - start_time
    
    print_header("TEST SUMMARY")
    print(f"Total Tests Run: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100) if total_tests > 0 else 0:.1f}%")
    print(f"Total Duration: {total_time:.2f}s")
    print(f"\nTest Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*100)
    
    return failed_tests == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
