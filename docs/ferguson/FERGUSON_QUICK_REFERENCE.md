# Ferguson API Quick Reference Card

## 🚨 MUST READ FIRST

**YOU MUST ALWAYS CALL DETAIL ENDPOINT TO GET COMPLETE ATTRIBUTES!**

Search gives you 10%, Detail gives you 90%. Both are required.

---

## Option 1: Complete Lookup (RECOMMENDED)

**One call gets everything - use this!**

```bash
curl -X POST "https://cxc-ai.com:8000/lookup-ferguson-complete?model_number=YOUR_MODEL" \
  -H "X-API-KEY: catbot123"
```

**Cost:** 20 credits (executes search + detail automatically)

**Returns:** Complete product with all attributes

---

## Option 2: Manual 3-Step Process

### Step 1: Search (10 credits)
```bash
curl -X POST https://cxc-ai.com:8000/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"model_number": "YOUR_MODEL"}'
```

**Returns:** Basic info + variant list (INCOMPLETE - must continue!)

### Step 2: Match Variant
```python
# Find exact match in search results
for product in search_results['products']:
    for variant in product['variants']:
        if variant['model_no'].upper() == "YOUR_MODEL".upper():
            variant_url = variant['url']
            break
```

### Step 3: Get Details (10 credits) - REQUIRED!
```bash
curl -X POST https://cxc-ai.com:8000/product-detail-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"url": "VARIANT_URL_FROM_STEP_2"}'
```

**Returns:** Complete specifications, features, dimensions, certifications, warranty, etc.

---

## What Each Endpoint Returns

### Search Returns (BASIC - 10% of data)
- ✅ Product name, brand
- ✅ Base price
- ✅ Variant list (model numbers)
- ✅ Small thumbnail image
- ❌ NO specifications
- ❌ NO features
- ❌ NO dimensions
- ❌ NO certifications
- ❌ NO warranty
- ❌ NO installation guides

### Detail Returns (COMPLETE - 90% of data)
- ✅ Everything from search, PLUS:
- ✅ **Specifications** (Material, Finish, Flow Rate, Voltage, etc.)
- ✅ **Features** (Technology, Capabilities, Benefits)
- ✅ **Dimensions** (Height, Width, Depth, Weight)
- ✅ **Certifications** (WaterSense, ADA, NSF, UL, Energy Star)
- ✅ **Warranty** (Terms and coverage)
- ✅ **Installation Guides** (PDFs, documentation)
- ✅ **Spec Sheets** (Technical specifications)
- ✅ **Country of Origin**
- ✅ **Reviews & Ratings** (Average, count, distribution)
- ✅ **Inventory** (Per-variant stock levels)
- ✅ **Shipping** (Lead times, availability)
- ✅ **Related Products**
- ✅ **Videos**

---

## Copy-Paste Python Implementation

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv()

UNWRANGLE_API_KEY = "6ec52883deb5415e19e7eee6b85e93b072fafd26"
UNWRANGLE_URL = "https://data.unwrangle.com/api/getter/"

def lookup_ferguson_product(model_number: str) -> dict:
    """
    Complete Ferguson lookup - executes all 3 steps.
    Returns complete product data with all attributes.
    Cost: 20 credits (10 search + 10 detail)
    """
    
    # STEP 1: Search for product
    print(f"Searching for {model_number}...")
    search_params = {
        "api_key": UNWRANGLE_API_KEY,
        "platform": "fergusonhome_search",
        "search": model_number,
        "page": 1
    }
    search_response = requests.get(UNWRANGLE_URL, params=search_params, timeout=30)
    search_data = search_response.json()
    
    if not search_data.get("results"):
        raise Exception(f"No products found for {model_number}")
    
    # STEP 2: Find matching variant
    print(f"Finding exact variant match...")
    variant_url = None
    for product in search_data.get("results", []):
        for variant in product.get("variants", []):
            if variant.get("model_no", "").upper() == model_number.upper():
                variant_url = variant.get("url")
                break
        if variant_url:
            break
    
    if not variant_url:
        available = [v.get("model_no") for p in search_data["results"] 
                     for v in p.get("variants", [])]
        raise Exception(f"Variant not found. Available: {available}")
    
    print(f"Found variant: {variant_url}")
    
    # STEP 3: Get complete product details (REQUIRED!)
    print(f"Fetching complete product attributes...")
    import urllib.parse
    detail_params = {
        "api_key": UNWRANGLE_API_KEY,
        "platform": "fergusonhome_detail",
        "url": urllib.parse.quote(variant_url, safe=''),
        "page": 1
    }
    detail_response = requests.get(UNWRANGLE_URL, params=detail_params, timeout=45)
    detail_data = detail_response.json()
    
    if not detail_data.get("success"):
        raise Exception("Failed to fetch product details")
    
    print(f"✓ Retrieved complete product data")
    
    # Return complete product information
    return detail_data.get("detail", {})


# Usage Example
if __name__ == "__main__":
    # Test with working model
    product = lookup_ferguson_product("2400-4273/24")
    
    print("\n=== COMPLETE PRODUCT DATA ===")
    print(f"Name: {product.get('name')}")
    print(f"Brand: {product.get('brand')}")
    print(f"Model: {product.get('model')}")
    
    print("\n=== SPECIFICATIONS (from detail call) ===")
    for key, value in product.get("specifications", {}).items():
        print(f"  {key}: {value}")
    
    print("\n=== FEATURES (from detail call) ===")
    for feature in product.get("features", []):
        print(f"  • {feature}")
    
    print("\n=== DIMENSIONS (from detail call) ===")
    dims = product.get("dimensions", {})
    print(f"  Height: {dims.get('height')}")
    print(f"  Width: {dims.get('width')}")
    print(f"  Weight: {dims.get('weight')}")
    
    print("\n=== WARRANTY (from detail call) ===")
    print(f"  {product.get('warranty')}")
```

---

## Environment Variables

```env
# Required in .env file
UNWRANGLE_API_KEY=6ec52883deb5415e19e7eee6b85e93b072fafd26
API_KEY=catbot123
PORT=8000
```

---

## Testing Commands

### Test Complete Lookup (Recommended)
```bash
curl -X POST "https://cxc-ai.com:8000/lookup-ferguson-complete?model_number=2400-4273/24" \
  -H "X-API-KEY: catbot123" | jq
```

### Test Direct Unwrangle API
```bash
# Verify API key works
curl -X GET "https://data.unwrangle.com/api/getter/?api_key=6ec52883deb5415e19e7eee6b85e93b072fafd26&platform=fergusonhome_search&search=kohler&page=1"
```

---

## Common Mistakes

❌ **WRONG:** Only calling search endpoint
```python
# This only gets 10% of the data!
search_results = search_ferguson(model_number)
return search_results  # Missing 90% of attributes!
```

✅ **CORRECT:** Always call both search AND detail
```python
# Get complete data
search_results = search_ferguson(model_number)
variant_url = find_variant(search_results, model_number)
complete_data = get_product_detail(variant_url)  # 90% of data here!
return complete_data
```

✅ **BEST:** Use complete lookup endpoint
```python
# Executes all 3 steps automatically
complete_data = lookup_ferguson_complete(model_number)
return complete_data
```

---

## Troubleshooting Checklist

- [ ] Is `UNWRANGLE_API_KEY` set in environment?
- [ ] Are you calling BOTH search AND detail endpoints?
- [ ] Does model number exactly match a Ferguson variant?
- [ ] Did you URL-encode the product URL for detail call?
- [ ] Are you parsing specifications, features, dimensions from detail response?
- [ ] Did you check if product exists in Ferguson's catalog?

---

## Key Numbers

- **Search cost:** 10 credits
- **Detail cost:** 10 credits
- **Total required:** 20 credits per product
- **Search timeout:** 30 seconds
- **Detail timeout:** 45 seconds
- **Data completeness:** Search = 10%, Detail = 90%

---

## Quick Decision Tree

```
Do you need complete product data? 
│
├─ YES (always) → Use /lookup-ferguson-complete (20 credits)
│                 OR
│                 Call search (10) + detail (10) manually
│
└─ NO → You're wrong, you always need complete data!
```

---

**Remember: Search returns thumbnails, Detail returns specifications. Both required!**

---

For full documentation, see: `FERGUSON_API_LOGIC.md`
