# Ferguson API Integration Logic

## 🚨 CRITICAL: You MUST Pull ALL Attributes EVERY Time

**⚠️ READ THIS FIRST:**
- The search endpoint returns only **10% of product data** (name, brand, price, variants)
- The detail endpoint returns the **other 90%** (specifications, features, dimensions, certifications, warranty, etc.)
- **YOU MUST ALWAYS CALL BOTH ENDPOINTS** to get complete product information
- **Cost: 20 credits** (10 search + 10 detail) - both are required, not optional
- **Use `/lookup-ferguson-complete` endpoint** - it executes all 3 steps automatically

**Missing the detail call means missing:**
- ❌ Material, finish, and construction details
- ❌ Product dimensions and weight
- ❌ Flow rate, voltage, wattage, capacity
- ❌ Certifications (WaterSense, ADA, NSF, UL)
- ❌ Features and technology descriptions
- ❌ Warranty information
- ❌ Installation guides and spec sheets
- ❌ Country of origin
- ❌ Reviews and ratings
- ❌ Per-variant inventory and stock status

## Overview
This document explains the complete flow of how we search Ferguson products and retrieve **ALL** variant details and attributes using the Unwrangle API.

## API Configuration

### Unwrangle API Details
- **Base URL**: `https://data.unwrangle.com/api/getter/`
- **API Key**: `6ec52883deb5415e19e7eee6b85e93b072fafd26`
- **Authentication**: Passed as `api_key` parameter in request body
- **Cost**: 10 credits per search request, 10 credits per detail request

### Platform Identifiers
- **Search Platform**: `fergusonhome_search`
- **Detail Platform**: `fergusonhome_detail`

## Two-Step API Flow

### Step 1: Search for Product by Model Number

**Endpoint**: `/search-ferguson`

**Purpose**: Find the product and its variants using the manufacturer model number

**Request Structure**:
```json
{
  "api_key": "6ec52883deb5415e19e7eee6b85e93b072fafd26",
  "platform": "fergusonhome_search",
  "search": "MODEL_NUMBER_HERE"
}
```

**Response Structure**:
```json
{
  "results": [
    {
      "url": "https://www.ferguson.com/product/...",
      "title": "Product Name",
      "brand": "Manufacturer Name",
      "price": "$123.45",
      "image": "https://...",
      "variants": [
        {
          "name": "Variant Description",
          "model_no": "EXACT-MODEL-123",
          "url": "https://www.ferguson.com/product/.../_/R-123456"
        }
      ]
    }
  ]
}
```

**Key Points**:
- Search uses broad matching (searches across product descriptions, titles, etc.)
- Returns ALL variants for matching products
- Each variant has its own `model_no` and `url`
- The search query doesn't have to exactly match the variant model numbers

### Step 2: Match Specific Variant

**Logic Flow**:
```python
# 1. Search returns products with variants
search_results = unwrangle_api.search(model_number)

# 2. Find the specific variant that matches the requested model
for result in search_results['results']:
    for variant in result.get('variants', []):
        if variant['model_no'].upper() == requested_model.upper():
            # Found exact match!
            matched_variant = variant
            break

# 3. Extract Ferguson SKU from variant URL
# URL format: https://www.ferguson.com/product/.../_/R-FERGUSON_SKU
ferguson_sku = extract_sku_from_url(variant['url'])
```

**Matching Strategy**:
- **Exact match only**: Uses case-insensitive string comparison
- **No fuzzy matching**: Model number must match exactly
- **Common issue**: Manufacturer model (IE101WC) ≠ Ferguson SKU (75941)

### Step 3: Get Detailed Product Information (**REQUIRED - ALWAYS CALL THIS**)

**Endpoint**: `/product-detail-ferguson`

**Purpose**: Retrieve complete product specifications and attributes

**⚠️ CRITICAL: YOU MUST ALWAYS CALL THIS ENDPOINT**

The search endpoint only returns basic product information (name, brand, price, variants). To get the **complete product data** including all specifications, features, dimensions, certifications, and attributes that are needed for product enrichment, you **MUST** call the product detail endpoint.

**What Search Returns (Limited Data)**:
- Product name and brand
- Base price
- Variant list (model numbers, names, URLs)
- Basic thumbnail images

**What Detail Returns (Complete Attributes - REQUIRED)**:
- ✅ Full specifications (Material, Color, Dimensions, Weight)
- ✅ Features list (technology, certifications, capabilities)
- ✅ Complete description and warranty information
- ✅ High-resolution images and videos
- ✅ Per-variant pricing and inventory
- ✅ Shipping details and lead times
- ✅ Installation guides and spec sheets
- ✅ Certifications and country of origin
- ✅ Related products and recommendations
- ✅ Reviews and ratings
- ✅ Collection information
- ✅ Measurements and dimensions

**Request Structure**:
```json
{
  "api_key": "6ec52883deb5415e19e7eee6b85e93b072fafd26",
  "platform": "fergusonhome_detail",
  "url": "https://www.ferguson.com/product/.../_/R-FERGUSON_SKU"
}
```

**Complete Response Structure**:
```json
{
  "success": true,
  "detail": {
    "product_id": "R-5053429",
    "name": "Newport Brass Jacobean Widespread Lavatory Faucet",
    "brand": "Newport Brass",
    "model": "2400-4273/24",
    "url": "https://www.ferguson.com/product/...",
    "categories": ["Bathroom", "Faucets", "Lavatory Faucets"],
    "breadcrumbs": ["Home", "Bathroom", "Faucets"],
    
    "pricing": {
      "current_price": "$1,234.56",
      "min_price": "$1,200.00",
      "max_price": "$1,500.00",
      "currency": "USD"
    },
    
    "images": [
      "https://assets.ferguson.com/product/..._lg.jpg",
      "https://assets.ferguson.com/product/..._alt1.jpg"
    ],
    
    "specifications": {
      "Material": "Solid Brass",
      "Finish": "Satin Nickel",
      "Spout Height": "5.5 inches",
      "Spout Reach": "6.25 inches",
      "Flow Rate": "1.2 GPM",
      "Valve Type": "Ceramic Disc",
      "Handle Type": "Lever",
      "Installation Type": "3-Hole",
      "Drain Included": "No",
      "ADA Compliant": "Yes",
      "WaterSense Certified": "Yes",
      "Country of Origin": "USA"
    },
    
    "features": [
      "Ceramic disc valving for drip-free performance",
      "Solid brass construction",
      "1/4 turn stops",
      "Stainless steel pop-up drain sold separately",
      "WaterSense certified - saves 30% water",
      "Lifetime limited warranty",
      "ADA compliant when installed per ANSI standards"
    ],
    
    "description": "The Newport Brass Jacobean Collection combines timeless elegance with modern performance...",
    
    "warranty": "Lifetime limited warranty on finish and function",
    
    "variants": [
      {
        "name": "Satin Nickel",
        "model_no": "2400-4273/24",
        "price": "$1,234.56",
        "image": "https://...",
        "stock_status": "In Stock",
        "quantity_available": 15,
        "shipping_time": "Ships in 1-2 days"
      }
    ],
    
    "dimensions": {
      "height": "5.5 in",
      "width": "8.0 in",
      "depth": "6.25 in",
      "weight": "4.2 lbs"
    },
    
    "resources": [
      {
        "type": "Installation Guide",
        "url": "https://..."
      },
      {
        "type": "Spec Sheet",
        "url": "https://..."
      }
    ],
    
    "reviews": {
      "average_rating": 4.7,
      "total_reviews": 142,
      "rating_distribution": {
        "5_star": 98,
        "4_star": 32,
        "3_star": 8,
        "2_star": 3,
        "1_star": 1
      }
    }
  },
  "credits_used": 10
}
```

## Complete Example Flow (ALL 3 STEPS REQUIRED)

### Example: Searching for Model "2400-4273/24"

**⚠️ IMPORTANT: You MUST execute all 3 steps to get complete product data!**

#### Step 1: Search for Product
```bash
curl -X POST https://cxc-ai.com:8000/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "model_number": "2400-4273/24"
  }'
```

#### Response 1: Search Results
```json
{
  "results": [
    {
      "url": "https://www.ferguson.com/product/newport-brass-jacobean-widespread-lavatory-faucet-with-lever-handle-2400-4273/_/R-5053429",
      "title": "Newport Brass Jacobean Widespread Lavatory Faucet with Lever Handle",
      "brand": "Newport Brass",
      "price": "$1,234.56",
      "variants": [
        {
          "name": "Polished Chrome",
          "model_no": "2400-4273/26",
          "url": "https://www.ferguson.com/product/.../_/R-5053430"
        },
        {
          "name": "Satin Nickel",
          "model_no": "2400-4273/24",
          "url": "https://www.ferguson.com/product/.../_/R-5053429"
        }
        // ... 20 more variants
      ]
    }
  ]
}
```

#### Step 2: Match Variant (Backend Logic)
```python
# Find matching variant from search results
requested_model = "2400-4273/24"
matched_variant_url = None

for result in search_response['products']:
    for variant in result.get('variants', []):
        if variant['model_no'].upper() == requested_model.upper():
            # Match found!
            matched_variant_url = variant['url']
            # Extract Ferguson SKU from URL: .../_/R-5053429
            ferguson_sku = matched_variant_url.split('/_/R-')[-1]
            print(f"✓ Found match: Model {variant['model_no']}, Ferguson SKU: {ferguson_sku}")
            break
    if matched_variant_url:
        break

if not matched_variant_url:
    raise Exception("Variant not found - model number doesn't match any Ferguson variants")
```

#### Step 3: Get Complete Attributes (**REQUIRED - DO NOT SKIP THIS**)
```bash
curl -X POST https://cxc-ai.com:8000/product-detail-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "url": "https://www.ferguson.com/product/newport-brass-jacobean-widespread-lavatory-faucet-with-lever-handle-2400-4273/_/R-5053429"
  }'
```

## Why You MUST Call Product Detail Endpoint

### Data Comparison: Search vs Detail

| Attribute Category | Search Endpoint (/search-ferguson) | Detail Endpoint (/product-detail-ferguson) |
|-------------------|-----------------------------------|-------------------------------------------|
| **Product Name** | ✅ Yes (basic) | ✅ Yes (complete with subtitle) |
| **Brand** | ✅ Yes | ✅ Yes |
| **Model Number** | ✅ Yes | ✅ Yes |
| **Base Price** | ✅ Yes | ✅ Yes (with min/max range) |
| **Variant List** | ✅ Yes (model numbers only) | ✅ Yes (with inventory & pricing) |
| **Thumbnail Image** | ✅ Yes (1 small image) | ✅ Yes (multiple high-res images) |
| **Specifications** | ❌ **NO** | ✅ **YES** - Material, Dimensions, Certifications |
| **Features List** | ❌ **NO** | ✅ **YES** - Technology, Capabilities, Benefits |
| **Dimensions** | ❌ **NO** | ✅ **YES** - Height, Width, Depth, Weight |
| **Description** | ❌ **NO** | ✅ **YES** - Full product description |
| **Warranty** | ❌ **NO** | ✅ **YES** - Warranty terms and coverage |
| **Certifications** | ❌ **NO** | ✅ **YES** - WaterSense, ADA, NSF, etc. |
| **Installation Guides** | ❌ **NO** | ✅ **YES** - PDFs and documentation |
| **Spec Sheets** | ❌ **NO** | ✅ **YES** - Technical specifications |
| **Country of Origin** | ❌ **NO** | ✅ **YES** |
| **Reviews & Ratings** | ❌ **NO** | ✅ **YES** - Average rating, count, distribution |
| **Inventory Status** | ❌ **NO** | ✅ **YES** - Per-variant stock levels |
| **Shipping Details** | ❌ **NO** | ✅ **YES** - Lead times, availability |
| **Related Products** | ❌ **NO** | ✅ **YES** - Recommendations |
| **Videos** | ❌ **NO** | ✅ **YES** - Product videos |

### Example: What You're Missing Without Detail Call

#### Search Returns (INCOMPLETE):
```json
{
  "name": "Newport Brass Jacobean Faucet",
  "brand": "Newport Brass",
  "price": "$1,234.56",
  "image": "https://...thumbnail.jpg"
}
```

#### Detail Returns (COMPLETE):
```json
{
  "name": "Newport Brass Jacobean Faucet",
  "brand": "Newport Brass",
  "price": "$1,234.56",
  
  "specifications": {
    "Material": "Solid Brass",
    "Finish": "Satin Nickel",
    "Spout Height": "5.5 inches",
    "Flow Rate": "1.2 GPM",
    "Valve Type": "Ceramic Disc",
    "ADA Compliant": "Yes",
    "WaterSense Certified": "Yes",
    "Country of Origin": "USA"
  },
  
  "features": [
    "Ceramic disc valving for drip-free performance",
    "WaterSense certified - saves 30% water",
    "Lifetime limited warranty"
  ],
  
  "dimensions": {
    "height": "5.5 in",
    "width": "8.0 in",
    "weight": "4.2 lbs"
  },
  
  "warranty": "Lifetime limited warranty on finish and function",
  
  "resources": [
    {"type": "Installation Guide", "url": "https://..."},
    {"type": "Spec Sheet", "url": "https://..."}
  ]
}
```

**Without calling detail endpoint, you're missing 90% of the product data!**

## Why "Variant Not Found" Occurs

### Scenario 1: Model Number Mismatch
**Problem**: Manufacturer model ≠ Ferguson internal model
- Search query: `IE101WC` (manufacturer model)
- Ferguson returns: variant with `model_no: "75941"` (Ferguson SKU)
- Result: Exact match fails, "variant not found"

**Solution**: Use Ferguson's model number if known, or search by product name/brand

### Scenario 2: Product Not in Database
**Problem**: Ferguson doesn't carry the product
- Search query: `KSSXUA/9D`
- Ferguson returns: 0 results
- Result: No products found

### Scenario 3: Search Too Specific
**Problem**: Model number only exists as part of a variant, not searchable
- Some model numbers only appear in variant lists
- General search may find the product family
- Then variant matching can locate the specific model

## Testing the API - Complete Examples

### Method 1: Use Complete Lookup Endpoint (RECOMMENDED)

This executes all 3 steps automatically and returns complete product data:

```bash
# Single call - gets everything you need
curl -X POST "https://cxc-ai.com:8000/lookup-ferguson-complete?model_number=2400-4273/24" \
  -H "X-API-KEY: catbot123"

# Expected: Complete product data with specifications, features, dimensions, etc.
# Cost: 20 credits (10 search + 10 detail)
```

### Method 2: Manual 3-Step Process

If you need to control each step separately:

#### Step 1: Search
```bash
curl -X POST https://cxc-ai.com:8000/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"model_number": "2400-4273/24"}'

# Expected: 1 result with 22 variants
# NOTE: This only returns BASIC info (name, brand, price, variants)
# You MUST continue to Step 3 for complete attributes!
```

#### Step 2: Find Variant URL (from search response)
```python
# Extract from search response
variant_url = "https://www.ferguson.com/product/newport-brass-jacobean-widespread-lavatory-faucet-with-lever-handle-2400-4273/_/R-5053429"
```

#### Step 3: Get Complete Attributes (REQUIRED!)
```bash
curl -X POST https://cxc-ai.com:8000/product-detail-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "url": "https://www.ferguson.com/product/newport-brass-jacobean-widespread-lavatory-faucet-with-lever-handle-2400-4273/_/R-5053429"
  }'

# Expected: COMPLETE product data including:
# - specifications (Material, Dimensions, Certifications)
# - features array
# - dimensions object
# - resources (spec sheets, installation guides)
# - warranty information
# - variant-specific inventory and pricing
# - reviews and ratings
```

### Test Direct Unwrangle API
```bash
# Verify API key works
curl -X POST https://data.unwrangle.com/api/getter/ \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "6ec52883deb5415e19e7eee6b85e93b072fafd26",
    "platform": "fergusonhome_search",
    "search": "kohler"
  }'

# Expected: Multiple results with Kohler products
```

## Complete Backend Implementation (Copy-Paste Ready)

### Full Python Code - Ferguson Product Lookup

```python
"""
Complete Ferguson Product Lookup Implementation
CRITICAL: Always fetches full product attributes via detail endpoint
"""

import os
import requests
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Configuration
UNWRANGLE_API_KEY = os.getenv("UNWRANGLE_API_KEY", "6ec52883deb5415e19e7eee6b85e93b072fafd26")
UNWRANGLE_URL = "https://data.unwrangle.com/api/getter/"
API_KEY = os.getenv("API_KEY", "catbot123")


# Request/Response Models
class FergusonSearchRequest(BaseModel):
    model_number: str
    page: int = 1


class FergusonProductRequest(BaseModel):
    url: str


# ============================================================================
# STEP 1: SEARCH FOR PRODUCT BY MODEL NUMBER
# ============================================================================
@app.post("/search-ferguson")
async def search_ferguson_products(
    request: FergusonSearchRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Search Ferguson products by model number.
    Returns: List of products with basic info and variants.
    
    ⚠️ WARNING: This only returns BASIC data. You MUST call 
    /product-detail-ferguson to get complete specifications!
    """
    # Validate API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        # Build request parameters
        params = {
            "api_key": UNWRANGLE_API_KEY,
            "platform": "fergusonhome_search",
            "search": request.model_number,
            "page": request.page
        }
        
        # Call Unwrangle API
        response = requests.get(UNWRANGLE_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(status_code=500, detail="Search failed")
        
        return {
            "success": True,
            "search_query": request.model_number,
            "total_results": data.get("total_results", 0),
            "products": data.get("results", []),
            "credits_used": 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# STEP 2: FIND MATCHING VARIANT AND EXTRACT URL
# ============================================================================
def find_matching_variant(search_results: Dict, model_number: str) -> Optional[str]:
    """
    Find the variant that matches the requested model number.
    Returns the variant's URL for use in detail lookup.
    
    This implements EXACT matching (case-insensitive).
    """
    model_upper = model_number.upper()
    
    for product in search_results.get("products", []):
        for variant in product.get("variants", []):
            variant_model = variant.get("model_no", "")
            
            # Exact match (case-insensitive)
            if variant_model.upper() == model_upper:
                return variant.get("url")
    
    return None


# ============================================================================
# STEP 3: GET COMPLETE PRODUCT DETAILS (REQUIRED!)
# ============================================================================
@app.post("/product-detail-ferguson")
async def get_ferguson_product_detail(
    request: FergusonProductRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Get COMPLETE Ferguson product details with all attributes.
    
    ⚠️ CRITICAL: This endpoint returns the FULL product data including:
    - Complete specifications (material, dimensions, certifications)
    - Features list
    - High-resolution images
    - Variant-specific pricing and inventory
    - Warranty information
    - Installation resources
    - Reviews and ratings
    
    YOU MUST ALWAYS CALL THIS to get complete product attributes!
    """
    # Validate API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        import urllib.parse
        
        # URL encode the product URL
        encoded_url = urllib.parse.quote(request.url, safe='')
        
        # Build request parameters
        params = {
            "api_key": UNWRANGLE_API_KEY,
            "platform": "fergusonhome_detail",
            "url": encoded_url,
            "page": 1
        }
        
        # Call Unwrangle API
        response = requests.get(UNWRANGLE_URL, params=params, timeout=45)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(status_code=500, detail="Detail lookup failed")
        
        return {
            "success": True,
            "url": request.url,
            "detail": data.get("detail", {}),
            "credits_used": 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# COMPLETE WORKFLOW: ALL 3 STEPS COMBINED
# ============================================================================
@app.post("/lookup-ferguson-complete")
async def lookup_ferguson_complete(
    model_number: str,
    x_api_key: Optional[str] = Header(None)
):
    """
    Complete Ferguson product lookup - executes all 3 steps automatically.
    
    This is the RECOMMENDED endpoint to use for product enrichment.
    It handles:
    1. Searching for the product
    2. Finding matching variant
    3. Fetching complete product attributes
    
    Returns: Complete product data ready for enrichment
    Cost: 20 credits (10 for search + 10 for detail)
    """
    # Validate API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        # STEP 1: Search for product
        print(f"Step 1: Searching for model {model_number}...")
        search_params = {
            "api_key": UNWRANGLE_API_KEY,
            "platform": "fergusonhome_search",
            "search": model_number,
            "page": 1
        }
        search_response = requests.get(UNWRANGLE_URL, params=search_params, timeout=30)
        search_response.raise_for_status()
        search_data = search_response.json()
        
        if not search_data.get("success"):
            raise HTTPException(status_code=404, detail="Product not found in Ferguson")
        
        if not search_data.get("results"):
            raise HTTPException(
                status_code=404, 
                detail=f"No products found for model {model_number}"
            )
        
        # STEP 2: Find matching variant
        print(f"Step 2: Finding exact variant match for {model_number}...")
        variant_url = find_matching_variant(
            {"products": search_data.get("results", [])},
            model_number
        )
        
        if not variant_url:
            # Return available variants for debugging
            available_variants = []
            for product in search_data.get("results", []):
                for variant in product.get("variants", []):
                    available_variants.append(variant.get("model_no"))
            
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "Variant not found",
                    "requested_model": model_number,
                    "available_models": available_variants,
                    "hint": "Model number must match exactly (case-insensitive)"
                }
            )
        
        print(f"Step 2: ✓ Found variant URL: {variant_url}")
        
        # STEP 3: Get complete product details
        print(f"Step 3: Fetching complete product attributes...")
        import urllib.parse
        encoded_url = urllib.parse.quote(variant_url, safe='')
        
        detail_params = {
            "api_key": UNWRANGLE_API_KEY,
            "platform": "fergusonhome_detail",
            "url": encoded_url,
            "page": 1
        }
        detail_response = requests.get(UNWRANGLE_URL, params=detail_params, timeout=45)
        detail_response.raise_for_status()
        detail_data = detail_response.json()
        
        if not detail_data.get("success"):
            raise HTTPException(
                status_code=500, 
                detail="Failed to fetch product details"
            )
        
        print(f"Step 3: ✓ Retrieved complete product data")
        
        # Return complete product information
        product_detail = detail_data.get("detail", {})
        
        return {
            "success": True,
            "model_number": model_number,
            "variant_url": variant_url,
            "product": {
                # Basic Information
                "name": product_detail.get("name"),
                "brand": product_detail.get("brand"),
                "model": product_detail.get("model"),
                "product_id": product_detail.get("product_id"),
                
                # Pricing
                "pricing": product_detail.get("pricing", {}),
                
                # Complete Specifications (THIS IS WHY WE CALL DETAIL!)
                "specifications": product_detail.get("specifications", {}),
                
                # Features (THIS IS WHY WE CALL DETAIL!)
                "features": product_detail.get("features", []),
                
                # Images
                "images": product_detail.get("images", []),
                
                # Description and Warranty
                "description": product_detail.get("description"),
                "warranty": product_detail.get("warranty"),
                
                # Variants with inventory
                "variants": product_detail.get("variants", []),
                
                # Dimensions (THIS IS WHY WE CALL DETAIL!)
                "dimensions": product_detail.get("dimensions", {}),
                
                # Resources (THIS IS WHY WE CALL DETAIL!)
                "resources": product_detail.get("resources", []),
                
                # Reviews
                "reviews": product_detail.get("reviews", {}),
                
                # Categories
                "categories": product_detail.get("categories", []),
                "breadcrumbs": product_detail.get("breadcrumbs", [])
            },
            "credits_used": 20,
            "steps_completed": {
                "search": "✓",
                "variant_match": "✓",
                "detail_fetch": "✓"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Complete lookup failed: {str(e)}"
        )


# ============================================================================
# HEALTH CHECK
# ============================================================================
@app.get("/health")
async def health_check():
    """Check if API is running and configured correctly."""
    return {
        "status": "healthy",
        "unwrangle_api_configured": bool(UNWRANGLE_API_KEY),
        "endpoints": {
            "search": "/search-ferguson",
            "detail": "/product-detail-ferguson",
            "complete": "/lookup-ferguson-complete (RECOMMENDED)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
```

### Environment Variables Required
```env
UNWRANGLE_API_KEY=6ec52883deb5415e19e7eee6b85e93b072fafd26
API_KEY=catbot123
PORT=8000
```

## Salesforce Integration

The Salesforce Apex code follows the same pattern:

1. **CxcFergusonBatch** executes batch job
2. **CxcFergusionAPI.searchFergusion()** calls search endpoint
3. **CxcFergusionAPI.parseVariant()** matches exact model number
4. Uses `equalsIgnoreCase()` for case-insensitive exact matching

## Key Takeaways

### Critical Requirements
🚨 **ALWAYS CALL DETAIL ENDPOINT** - Search returns only 10% of product data
🚨 **THREE-STEP PROCESS** - Search → Match Variant → Get Details (ALL REQUIRED)
🚨 **20 CREDITS TOTAL** - 10 for search + 10 for detail (not optional!)

### Matching Logic
✅ **Exact matching only**: No fuzzy logic, must match precisely
✅ **Case-insensitive**: Matching ignores case differences
✅ **SKU extraction**: Ferguson SKU comes from variant URL
❌ **No flexible matching**: Won't find "IE101WC" if Ferguson returns "75941"
❌ **No partial matching**: "2400-4273" won't match "2400-4273/24"

### What You Get
✅ **From Search**: Basic info, variant list, thumbnail (INCOMPLETE)
✅ **From Detail**: Specifications, features, dimensions, certifications, warranty, resources, reviews (COMPLETE)
✅ **Complete Endpoint**: Executes all 3 steps automatically (RECOMMENDED)

### Cost Structure
- Search only: 10 credits (INSUFFICIENT DATA)
- Detail only: 10 credits (requires URL from search)
- Complete lookup: 20 credits (search + detail) ✅ **USE THIS**

## Troubleshooting Checklist

- [ ] Is `UNWRANGLE_API_KEY` set correctly in environment?
- [ ] Is the API key active and has credits?
- [ ] Does the model number exactly match a Ferguson variant?
- [ ] Is the product carried by Ferguson?
- [ ] Are you searching for manufacturer model vs Ferguson SKU?
- [ ] Is the API endpoint URL correct?
- [ ] Is authentication header included (`X-API-KEY`)?
- [ ] Is python-dotenv loading .env file (for Python implementations)?

## Quick Reference

| Parameter | Value |
|-----------|-------|
| Unwrangle API | https://data.unwrangle.com/api/getter/ |
| API Key | 6ec52883deb5415e19e7eee6b85e93b072fafd26 |
| Search Platform | fergusonhome_search |
| Detail Platform | fergusonhome_detail |
| Auth Header | X-API-KEY: catbot123 |
| Backend URL | https://cxc-ai.com:8000 |
| Test Model | 2400-4273/24 (Newport Brass) |

---

**Last Updated**: December 7, 2025
**Document Version**: 1.0
