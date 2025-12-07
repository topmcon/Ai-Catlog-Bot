"""
Test script for Catalog-BOT API
Tests the /enrich endpoint with a sample product
"""

import requests
import json
import sys

# Configuration
API_URL = "http://localhost:8000"
API_KEY = "test123"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_enrich(brand, model_number):
    """Test the enrich endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing product enrichment...")
    print(f"Brand: {brand}")
    print(f"Model: {model_number}")
    print(f"{'='*60}\n")
    
    try:
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": API_KEY
        }
        
        data = {
            "brand": brand,
            "model_number": model_number
        }
        
        response = requests.post(
            f"{API_URL}/enrich",
            json=data,
            headers=headers,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS!\n")
            print(json.dumps(result, indent=2))
            
            # Extract key information
            if result.get("success"):
                data = result.get("data", {})
                verified = data.get("verified_information", {})
                
                print(f"\n{'='*60}")
                print("QUICK SUMMARY:")
                print(f"{'='*60}")
                print(f"Product: {verified.get('product_title')}")
                print(f"Brand: {verified.get('brand')}")
                print(f"Model: {verified.get('model_number')}")
                print(f"Capacity: {verified.get('capacity')}")
                print(f"Dimensions: {verified.get('width')} x {verified.get('length')} x {verified.get('height')}")
                print(f"Weight: {verified.get('weight')}")
                print(f"\nFeatures:")
                for feature in data.get("features", []):
                    print(f"  • {feature}")
                print(f"{'='*60}\n")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("CATALOG-BOT API TEST SUITE")
    print("="*60 + "\n")
    
    # Test health
    if not test_health():
        print("\n❌ Server is not running. Start it with: python main.py")
        sys.exit(1)
    
    print("\n✅ Server is healthy!\n")
    
    # Test products
    test_products = [
        ("Fisher & Paykel", "OS24NDB1"),
        ("Miele", "H6880BP"),
        ("Bosch", "SHPM88Z75N"),
    ]
    
    results = []
    for brand, model in test_products:
        success = test_enrich(brand, model)
        results.append((brand, model, success))
        print("\n" + "-"*60 + "\n")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for brand, model, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {brand} {model}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
