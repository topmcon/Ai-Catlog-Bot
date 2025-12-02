"""
Test script for new Ferguson Home APIs (Unwrangle Integration)
Tests both search and product detail endpoints
"""

import requests
import json
from datetime import datetime

# Configuration
API_URL = "http://localhost:8000"
API_KEY = "catbot123"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY
}

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

def test_ferguson_search():
    """Test Ferguson Home product search"""
    print_section("TEST 1: Ferguson Home Product Search")
    
    # Test 1: Search for pedestal bathroom sinks
    try:
        payload = {
            "search": "Pedestal Bathroom Sinks",
            "page": 1
        }
        
        print(f"Searching for: {payload['search']}")
        response = requests.post(
            f"{API_URL}/search-ferguson",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS")
            print(f"   Total Results: {data.get('total_results', 0)}")
            print(f"   Total Pages: {data.get('total_pages', 0)}")
            print(f"   Products Returned: {data.get('result_count', 0)}")
            print(f"   Credits Used: {data.get('credits_used', 0)}")
            print(f"   Response Time: {data.get('metadata', {}).get('response_time', 'N/A')}")
            
            # Show first product
            products = data.get('products', [])
            if products:
                first_product = products[0]
                print(f"\n   First Product:")
                print(f"      Name: {first_product.get('name', 'N/A')}")
                print(f"      Brand: {first_product.get('brand', 'N/A')}")
                print(f"      Model: {first_product.get('model_no', 'N/A')}")
                print(f"      Price: ${first_product.get('price', 0)}")
                print(f"      URL: {first_product.get('url', 'N/A')}")
                print(f"      Variants: {first_product.get('variant_count', 0)}")
                print(f"      In Stock: {first_product.get('has_in_stock_variants', False)}")
                
                return first_product.get('url')  # Return URL for detail test
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

def test_ferguson_product_detail(product_url=None):
    """Test Ferguson Home product detail lookup"""
    print_section("TEST 2: Ferguson Home Product Detail")
    
    # Use provided URL or default
    if not product_url:
        product_url = "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"
    
    try:
        payload = {
            "url": product_url
        }
        
        print(f"Getting details for: {product_url}")
        response = requests.post(
            f"{API_URL}/product-detail-ferguson",
            json=payload,
            headers=HEADERS,
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            detail = data.get('detail', {})
            
            print(f"✅ SUCCESS")
            print(f"   Product ID: {detail.get('id', 'N/A')}")
            print(f"   Name: {detail.get('name', 'N/A')}")
            print(f"   Brand: {detail.get('brand', 'N/A')}")
            print(f"   Model: {detail.get('model_number', 'N/A')}")
            print(f"   Price: ${detail.get('price', 0)}")
            print(f"   Currency: {detail.get('currency', 'N/A')}")
            print(f"   Rating: {detail.get('rating', 'N/A')} ({detail.get('review_count', 0)} reviews)")
            print(f"   Variants: {detail.get('variant_count', 0)}")
            print(f"   In Stock Variants: {detail.get('in_stock_variant_count', 0)}")
            print(f"   Total Inventory: {detail.get('total_inventory_quantity', 0)}")
            print(f"   Images: {len(detail.get('images', []))}")
            print(f"   Category: {detail.get('base_category', 'N/A')} > {detail.get('business_category', 'N/A')}")
            print(f"   Credits Used: {data.get('credits_used', 0)}")
            print(f"   Response Time: {data.get('metadata', {}).get('response_time', 'N/A')}")
            
            # Show some specifications
            specs = detail.get('specifications', {})
            if specs:
                print(f"\n   Key Specifications:")
                for key in ['length', 'width', 'height', 'material', 'installation_type']:
                    if key in specs:
                        spec = specs[key]
                        value = spec.get('value', 'N/A')
                        units = spec.get('units', '')
                        print(f"      {key.replace('_', ' ').title()}: {value} {units}".strip())
            
            # Show variant info
            variants = detail.get('variants', [])
            if variants:
                print(f"\n   Variants Available:")
                in_stock = [v for v in variants if v.get('in_stock')]
                print(f"      Total: {len(variants)}")
                print(f"      In Stock: {len(in_stock)}")
                if in_stock:
                    print(f"      First In-Stock Variant: {in_stock[0].get('name')} - ${in_stock[0].get('price')}")
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_ferguson_search_with_model():
    """Test Ferguson search with model number"""
    print_section("TEST 3: Ferguson Search by Model Number")
    
    try:
        payload = {
            "search": "K-2362-8",
            "page": 1
        }
        
        print(f"Searching for model: {payload['search']}")
        response = requests.post(
            f"{API_URL}/search-ferguson",
            json=payload,
            headers=HEADERS,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS")
            print(f"   Total Results: {data.get('total_results', 0)}")
            print(f"   Products Returned: {data.get('result_count', 0)}")
            
            products = data.get('products', [])
            if products:
                print(f"\n   Matching Products:")
                for i, product in enumerate(products[:3], 1):
                    print(f"      {i}. {product.get('name', 'N/A')}")
                    print(f"         Brand: {product.get('brand', 'N/A')} | Model: {product.get('model_no', 'N/A')}")
                    print(f"         Price: ${product.get('price', 0)} | Rating: {product.get('rating', 'N/A')}")
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
    
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def main():
    """Run all Ferguson API tests"""
    print_header("FERGUSON HOME API TESTS (Unwrangle Integration)")
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API URL: {API_URL}")
    print(f"Testing new Ferguson Home Search and Product Detail APIs")
    
    # Test 1: Search
    product_url = test_ferguson_search()
    
    # Test 2: Product Detail (using URL from search if available)
    test_ferguson_product_detail(product_url)
    
    # Test 3: Search by model number
    test_ferguson_search_with_model()
    
    print_header("TESTS COMPLETED")
    print(f"Test Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nNote: These endpoints use Unwrangle API which consumes credits.")
    print("      10 credits per search request")
    print("      10 credits per product detail request")

if __name__ == "__main__":
    main()
