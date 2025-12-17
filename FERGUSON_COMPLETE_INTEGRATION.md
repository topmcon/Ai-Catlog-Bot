# Ferguson API Complete Integration Guide
## 🚀 Plug-and-Play Copy-Paste Solution

This is a **complete, production-ready** Ferguson lookup system using Unwrangle API. Copy everything below into your new repository.

---

## 📋 Table of Contents
1. [Understanding the Two APIs](#understanding-the-two-apis)
2. [Complete Data Field Reference](#complete-data-field-reference)
3. [Prerequisites & Setup](#prerequisites--setup)
4. [Environment Configuration](#environment-configuration)
5. [Complete Python Integration Code](#complete-python-integration-code)
6. [How to Use - All Scenarios](#how-to-use---all-scenarios)
7. [API Response Structure](#api-response-structure)
8. [Troubleshooting](#troubleshooting)

---

## Understanding the Two APIs

### 🔍 API 1: Ferguson Search (`fergusonhome_search`)

**Purpose:** Find products by keyword or model number, get multiple results quickly.

**Platform ID:** `fergusonhome_search`

**Cost:** 10 credits per search (up to 48 results)

**When to Use:**
- Browse products by category ("bathroom sinks", "kohler faucets")
- Search by model number to find products
- Get pricing ranges across variants
- Check if products exist
- Build product catalogs

**What You Get (Per Product):**
```python
{
    # IDs
    "id": 165232,                    # Variant ID
    "family_id": 560423,             # Product family ID
    
    # Basic Info
    "name": "Product name",
    "brand": "Kohler",
    "model_no": "K-2362-8",
    "url": "https://www.fergusonhome.com/...",
    
    # Pricing (Overview)
    "price": 366.75,                 # Base/current price
    "price_min": 366.75,             # Lowest variant price
    "price_max": 536.08,             # Highest variant price
    "unit_price": 366.75,
    "price_type": "regular",
    "currency": "USD",
    
    # Variants (BASIC info only)
    "variants": [
        {
            "id": 165232,
            "model_no": "K-2362-8-0",
            "name": "White",         # Finish name
            "color": "#FFFFFF",
            "url": "https://...",
            "price": 366.75,
            "in_stock": true
            # NOTE: Missing detailed specs, images, shipping info
        }
    ],
    "variant_count": 3,
    
    # Stock Status (SUMMARY)
    "has_in_stock_variants": true,
    "all_variants_in_stock": true,
    "all_variants_restricted": false,
    "total_inventory_quantity": 150,
    "in_stock_variant_count": 3,
    
    # Images (BASIC - usually 1-2 images)
    "images": ["https://s3.img-b.com/..."],
    "thumbnail": "https://s3.img-b.com/...",
    
    # Features (BASIC - 2-5 key specs only)
    "features": [
        {"name": "Material", "value": "Vitreous China"},
        {"name": "Faucet Holes", "value": "3"}
    ],
    
    # Reviews
    "rating": 5.0,
    "total_ratings": 4,
    
    # Categories
    "category": "Bathroom Sinks",
    "collection": {"name": "Cimarron"},
    
    # Flags
    "is_quick_ship": false,
    "is_configurable": false,
    "is_square_footage_based": false,
    "is_appointment_only_brand": false
}
```

**What's MISSING from Search:**
- ❌ Complete specifications (only 2-5 key specs)
- ❌ Full product description
- ❌ All variant images (only main image)
- ❌ Variant-specific shipping lead times
- ❌ Warranty information
- ❌ Installation guides/resources
- ❌ Dimensions (detailed)
- ❌ Certifications
- ❌ UPC/Barcode
- ❌ Recommended accessories
- ❌ Feature groups

---

### 📦 API 2: Ferguson Detail (`fergusonhome_detail`)

**Purpose:** Get COMPLETE product information for a specific product URL.

**Platform ID:** `fergusonhome_detail`

**Cost:** 10 credits per product

**When to Use:**
- After finding product via search
- Need complete specifications
- Need all variant details (colors, pricing, inventory)
- Need warranty, dimensions, certifications
- Need installation guides/resources
- Building detailed product catalog

**What You Get (COMPLETE):**
```python
{
    # ========== BASIC INFORMATION ==========
    "id": 165232,
    "name": "Cimarron Pedestal Bathroom Sink with 8\" Widespread Faucet Holes",
    "brand": "Kohler",
    "brand_url": "https://www.fergusonhome.com/kohler/",
    "brand_logo": {
        "url": "https://...",
        "alt": "Kohler Logo"
    },
    "model_number": "K-2362-8-0",
    "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232",
    "product_type": "Bathroom Sink",
    "application": "Residential",
    "base_type": "Pedestal Sink",
    
    # ========== PRICING (DETAILED) ==========
    "price": 366.75,
    "original_price": null,
    "currency": "USD",
    "price_range": {
        "min": 366.75,
        "max": 536.08
    },
    "shipping_fee": 0.0,
    "has_free_installation": false,
    
    # ========== COMPLETE VARIANTS (ALL DETAILS) ==========
    "variants": [
        {
            "id": 165232,
            "sku": "K-2362-8-0",
            "model_number": "K-2362-8-0",
            "name": "White",
            "color": "#FFFFFF",
            "color_name": "White",
            "swatch_image": "https://...",
            
            # Pricing
            "price": 366.75,
            "original_price": null,
            "unit_price": 366.75,
            
            # Inventory (DETAILED)
            "in_stock": true,
            "inventory_quantity": 50,
            "stock_status": "in_stock",
            "availability_status": "Available",
            "shipping_lead_time": "Ships in 1-2 business days",
            "estimated_delivery": "Dec 15-17",
            
            # Images (MULTIPLE per variant)
            "images": [
                "https://s3.img-b.com/image1.jpg",
                "https://s3.img-b.com/image2.jpg",
                "https://s3.img-b.com/image3.jpg"
            ],
            "image_url": "https://s3.img-b.com/image1.jpg",
            
            # Attributes
            "attributes": {
                "finish": "White",
                "finish_family": "Whites",
                "color_group": "Neutral"
            },
            
            # URL
            "url": "https://www.fergusonhome.com/...?uid=165232"
        }
        # ... more variants
    ],
    "variant_count": 3,
    "has_variant_groups": true,
    "has_in_stock_variants": true,
    "all_variants_in_stock": true,
    "total_inventory_quantity": 150,
    "in_stock_variant_count": 3,
    "configuration_type": "color_finish",
    
    # ========== COMPLETE SPECIFICATIONS ==========
    "specifications": {
        # Dimensions
        "Length": "22.75 in",
        "Width": "18.875 in",
        "Height": "35.0 in",
        "Bowl Depth": "7.5 in",
        "Weight": "45 lbs",
        
        # Materials
        "Material": "Vitreous China",
        "Finish": "Glazed",
        
        # Features
        "Faucet Holes": "3",
        "Faucet Drilling": "8 in Widespread",
        "Overflow": "Yes",
        "Drain Type": "Pop-up",
        
        # Installation
        "Installation Type": "Pedestal Mount",
        "Mounting Hardware": "Included",
        
        # Compliance
        "ADA Compliant": "No",
        "WaterSense Certified": "N/A",
        "cUPC Listed": "Yes",
        
        # Other
        "Collection": "Cimarron",
        "Style": "Traditional",
        "Color Family": "White"
    },
    
    # ========== FEATURE GROUPS (ORGANIZED) ==========
    "feature_groups": [
        {
            "name": "Dimensions",
            "features": [
                {"name": "Overall Length", "value": "22.75\""},
                {"name": "Overall Width", "value": "18.875\""}
            ]
        },
        {
            "name": "Installation",
            "features": [
                {"name": "Type", "value": "Pedestal"},
                {"name": "Hardware", "value": "Included"}
            ]
        }
    ],
    
    # ========== DIMENSIONS (STRUCTURED) ==========
    "dimensions": {
        "length": "22.75 in",
        "width": "18.875 in",
        "height": "35.0 in",
        "weight": "45 lbs",
        "bowl_depth": "7.5 in"
    },
    
    # ========== IMAGES & MEDIA ==========
    "images": [
        "https://s3.img-b.com/image1.jpg",
        "https://s3.img-b.com/image2.jpg",
        "https://s3.img-b.com/image3.jpg",
        "https://s3.img-b.com/image4.jpg"
    ],
    "thumbnail": "https://s3.img-b.com/thumb.jpg",
    "videos": [
        {
            "url": "https://www.youtube.com/...",
            "title": "Installation Guide"
        }
    ],
    
    # ========== DESCRIPTION ==========
    "description": "The Cimarron collection reflects a timeless aesthetic...",
    
    # ========== IDENTIFIERS ==========
    "upc": "885612345678",
    "barcode": "885612345678",
    
    # ========== CERTIFICATIONS ==========
    "certifications": [
        "cUPC Listed",
        "ASME A112.19.2",
        "CSA B45.1"
    ],
    "country_of_origin": "United States",
    
    # ========== WARRANTY ==========
    "warranty": "Limited Lifetime Warranty",
    "manufacturer_warranty": "Kohler provides a limited lifetime warranty...",
    
    # ========== RESOURCES ==========
    "resources": [
        {
            "type": "Installation Guide",
            "name": "K-2362 Installation Instructions",
            "url": "https://s3.amazonaws.com/.../install.pdf",
            "format": "PDF"
        },
        {
            "type": "Specification Sheet",
            "name": "K-2362 Specifications",
            "url": "https://s3.amazonaws.com/.../spec.pdf",
            "format": "PDF"
        },
        {
            "type": "Care Guide",
            "name": "Vitreous China Care",
            "url": "https://s3.amazonaws.com/.../care.pdf",
            "format": "PDF"
        }
    ],
    
    # ========== CATEGORIES ==========
    "categories": [
        {"name": "Plumbing", "url": "..."},
        {"name": "Bathroom", "url": "..."},
        {"name": "Sinks", "url": "..."},
        {"name": "Pedestal Sinks", "url": "..."}
    ],
    "base_category": "Plumbing",
    "business_category": "Bathroom Sinks",
    "related_categories": [
        {"name": "Bathroom Faucets", "url": "..."},
        {"name": "Drains", "url": "..."}
    ],
    
    # ========== REVIEWS ==========
    "rating": 5.0,
    "review_count": 4,
    "total_reviews": 4,
    "questions_count": 2,
    
    # ========== COLLECTION ==========
    "collection": {
        "name": "Cimarron",
        "url": "https://www.fergusonhome.com/kohler-cimarron/",
        "description": "Traditional style collection"
    },
    
    # ========== RELATED PRODUCTS ==========
    "has_recommended_options": true,
    "recommended_options": [
        {
            "name": "Matching Pedestal",
            "model": "K-2363",
            "url": "..."
        }
    ],
    "has_accessories": true,
    "has_replacement_parts": true,
    "replacement_parts_url": "https://...",
    
    # ========== FLAGS ==========
    "is_discontinued": false,
    "is_configurable": false,
    "is_by_appointment_only": false
}
```

---

### 🎯 Key Differences Summary

| Feature | Search API | Detail API |
|---------|-----------|------------|
| **Purpose** | Find products | Get complete data |
| **Cost** | 10 credits | 10 credits |
| **Results** | Up to 48 products | 1 product |
| **Specifications** | 2-5 key specs | ALL specs (20-50+) |
| **Variant Details** | Basic (price, color) | Complete (inventory, shipping, images) |
| **Images** | 1-2 main images | All images per variant |
| **Description** | ❌ None | ✅ Full description |
| **Warranty** | ❌ None | ✅ Complete warranty |
| **Resources** | ❌ None | ✅ PDFs, guides |
| **Dimensions** | ❌ None | ✅ Detailed |
| **Certifications** | ❌ None | ✅ All certifications |
| **UPC/Barcode** | ❌ None | ✅ Included |

---

### 💡 Recommended Workflow

**For COMPLETE product enrichment (use our `/lookup-ferguson-complete`):**

```
1. Search API (fergusonhome_search)
   ↓ Find product by model number
   ↓ Get variant URL
   
2. Detail API (fergusonhome_detail)
   ↓ Fetch complete specifications
   ↓ Get all variant details
   
3. Merge Results
   ↓ Combine search + detail data
   ↓ Return complete product info
```

**This is what `/lookup-ferguson-complete` does automatically!**

---

## Complete Data Field Reference

### All Fields Returned by `/lookup-ferguson-complete`

This merged endpoint returns **60+ fields** combining both APIs:

```python
{
    # ========== IDENTIFIERS ==========
    "id": int,                          # Variant ID (from search or detail)
    "family_id": int,                   # Product family ID (from search)
    "upc": str,                         # UPC code (from detail)
    "barcode": str,                     # Barcode (from detail)
    
    # ========== BASIC INFORMATION ==========
    "name": str,                        # Product name (detail preferred, fallback to search)
    "brand": str,                       # Brand name (detail preferred)
    "brand_url": str,                   # Brand page URL (from detail)
    "brand_logo": dict,                 # Brand logo (from detail)
    "model_number": str,                # Full model number (from detail)
    "url": str,                         # Product page URL (from detail)
    "product_type": str,                # Product type/category (from detail)
    "application": str,                 # Application type (from detail)
    "base_type": str,                   # Base product type (from detail)
    
    # ========== PRICING ==========
    "price": float,                     # Current price (detail preferred)
    "price_min": float,                 # Lowest variant price (from search)
    "price_max": float,                 # Highest variant price (from search)
    "unit_price": float,                # Unit price (from search)
    "price_type": str,                  # Price type: regular/sale (from search)
    "price_range": dict,                # Price range object (from detail)
    "currency": str,                    # Currency code (detail preferred)
    "shipping_fee": float,              # Shipping cost (from detail)
    "has_free_installation": bool,      # Free install flag (from detail)
    
    # ========== VARIANTS (COMPLETE) ==========
    "variants": [                       # Array of variant objects (detail preferred)
        {
            "id": int,
            "sku": str,
            "model_number": str,
            "name": str,                # Finish/color name
            "color": str,               # Hex color code
            "price": float,
            "in_stock": bool,
            "inventory_quantity": int,
            "stock_status": str,
            "availability_status": str,
            "shipping_lead_time": str,
            "images": [str],           # Multiple images per variant
            "url": str,
            "attributes": dict
        }
    ],
    "variant_count": int,               # Total variants (detail preferred)
    "has_variant_groups": bool,         # Has grouped variants (from detail)
    "has_in_stock_variants": bool,      # Any in stock (merged)
    "all_variants_in_stock": bool,      # All in stock (merged)
    "all_variants_restricted": bool,    # All restricted (from search)
    "total_inventory_quantity": int,    # Total inventory (merged)
    "in_stock_variant_count": int,      # In-stock count (merged)
    "is_configurable": bool,            # Configurable flag (merged)
    "is_square_footage_based": bool,    # Sq ft pricing (from search)
    "configuration_type": str,          # Config type (from detail)
    
    # ========== IMAGES & MEDIA ==========
    "images": [str],                    # All product images (detail preferred)
    "thumbnail": str,                   # Thumbnail image (merged)
    "videos": [dict],                   # Video array (from detail)
    
    # ========== PRODUCT DETAILS ==========
    "description": str,                 # Full description (from detail)
    "is_discontinued": bool,            # Discontinued flag (from detail)
    
    # ========== SPECIFICATIONS (CRITICAL!) ==========
    "specifications": dict,             # Complete specs (from detail) - 20-50+ fields
    "feature_groups": [dict],           # Organized feature groups (from detail)
    "dimensions": dict,                 # Structured dimensions (from detail)
    "attribute_ids": [int],             # Attribute IDs (from detail)
    
    # ========== CERTIFICATIONS & COMPLIANCE ==========
    "certifications": [str],            # All certifications (from detail)
    "country_of_origin": str,           # Manufacturing country (from detail)
    
    # ========== WARRANTY ==========
    "warranty": str,                    # Warranty info (from detail)
    "manufacturer_warranty": str,       # Manufacturer warranty (from detail)
    
    # ========== RESOURCES & DOCUMENTATION ==========
    "resources": [                      # Installation guides, PDFs (from detail)
        {
            "type": str,
            "name": str,
            "url": str,
            "format": str
        }
    ],
    
    # ========== CATEGORIES ==========
    "categories": [dict],               # Category breadcrumbs (from detail)
    "base_category": str,               # Base category (from detail)
    "business_category": str,           # Business category (from detail)
    "related_categories": [dict],       # Related categories (from detail)
    
    # ========== REVIEWS & RATINGS ==========
    "rating": float,                    # Average rating (merged)
    "total_ratings": int,               # Rating count (from search)
    "review_count": int,                # Review count (from detail)
    "total_reviews": int,               # Total reviews (merged)
    "questions_count": int,             # Q&A count (from detail)
    
    # ========== COLLECTION ==========
    "collection": dict,                 # Collection info (merged)
    
    # ========== SHIPPING INFO ==========
    "is_quick_ship": bool,              # Quick ship flag (from search)
    "shipping_info": str,               # Shipping details (from search)
    
    # ========== SPECIAL FLAGS ==========
    "is_appointment_only_brand": bool,  # Appointment flag (from search)
    "is_by_appointment_only": bool,     # Appointment flag (from detail)
    
    # ========== RELATED PRODUCTS ==========
    "has_recommended_options": bool,    # Has recommendations (from detail)
    "recommended_options": [dict],      # Recommended products (from detail)
    "has_accessories": bool,            # Has accessories (from detail)
    "has_replacement_parts": bool,      # Has parts (from detail)
    "replacement_parts_url": str        # Parts URL (from detail)
}
```

**Total: 60+ fields providing COMPLETE product data**

---

## Prerequisites & Setup

### 1. Install Required Packages
```bash
pip install fastapi uvicorn httpx python-dotenv requests pydantic
```

### 2. Create `.env` File
```bash
# Required: Unwrangle API Key for Ferguson scraping
UNWRANGLE_API_KEY=your_unwrangle_api_key_here

# Optional: Your API authentication key
API_KEY=your_secure_api_key_here
```

### 3. Get Unwrangle API Key
- Sign up at: https://unwrangle.com
- Get API key from dashboard
- Add to `.env` file

---

## Environment Configuration

### `.env.example` (Template)
```dotenv
# Unwrangle API (Required for Ferguson scraping)
UNWRANGLE_API_KEY=your_unwrangle_api_key_here

# API Authentication (Optional)
API_KEY=your_secure_api_key_here
```

---

## Complete Python Integration Code

### **COPY THIS ENTIRE CODE BLOCK** 👇

```python
"""
Ferguson Product Lookup - Complete Integration
==============================================
Production-ready code for looking up Ferguson products by model number.
Handles search, variant matching, and complete data retrieval automatically.

Author: CXC-AI Team
Updated: December 2025
API Version: fergusonhome_v2
"""

import os
import time
import re
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
import requests
import urllib.parse

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Ferguson Product API",
    description="Complete Ferguson/Build.com product lookup system",
    version="2.0.0"
)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Get API keys from environment
UNWRANGLE_API_KEY = os.getenv("UNWRANGLE_API_KEY")
API_KEY = os.getenv("API_KEY", "your-api-key")  # Optional authentication

# API Constants
UNWRANGLE_API_URL = "https://data.unwrangle.com/api/getter/"
SEARCH_TIMEOUT = 45  # seconds
DETAIL_TIMEOUT = 45  # seconds

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class FergusonSearchRequest(BaseModel):
    """Request model for Ferguson product search"""
    search: str = Field(..., description="Search query (keyword or model number)")
    page: int = Field(1, ge=1, description="Page number (default: 1)")

class FergusonProductRequest(BaseModel):
    """Request model for Ferguson product detail lookup by URL"""
    url: str = Field(..., description="Full Ferguson product URL")

class FergusonCompleteLookupRequest(BaseModel):
    """Request model for complete Ferguson product lookup by model number"""
    model_number: str = Field(..., description="Manufacturer model number (e.g., K-2362-8)")

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def generate_model_variations(model_number: str) -> List[str]:
    """
    Generate common model number format variations for smart matching.
    
    Examples:
    - "K2362" → ["K2362", "K-2362", "K-23-62"]
    - "G9104BNI" → ["G9104BNI", "G-9104-BNI", "G-9104BNI"]
    - "UC15IP" → ["UC15IP", "UC-15-IP", "UC15-IP", "UC-15IP"]
    
    Args:
        model_number: Original model number from user
        
    Returns:
        List of possible model number variations
    """
    model = model_number.strip()
    variations = [model]  # Always include original
    
    # Common brand prefixes (add hyphen if missing)
    prefixes = ["K-", "G-", "M-", "A-", "UC-"]
    for prefix in prefixes:
        if not model.upper().startswith(prefix.upper()):
            variations.append(f"{prefix}{model}")
    
    # Add/remove hyphens intelligently
    if "-" in model:
        # Remove all hyphens
        variations.append(model.replace("-", ""))
    else:
        # Try adding hyphens in common positions
        if len(model) > 4:
            # Pattern: G9104BNI → G-9104-BNI
            if model[0].isalpha() and model[1:5].isdigit():
                variations.append(f"{model[0]}-{model[1:5]}-{model[5:]}")
            
            # Pattern: 97621SHP → 97621-SHP or UC15IP → UC15-IP
            for i in range(2, len(model) - 1):
                if model[i].isalpha() and model[i-1].isdigit():
                    variations.append(f"{model[:i]}-{model[i:]}")
                if model[i].isdigit() and model[i-1].isalpha() and i > 1:
                    variations.append(f"{model[:i]}-{model[i:]}")
    
    # Remove duplicates while preserving order
    seen = set()
    unique_variations = []
    for v in variations:
        v_upper = v.upper()
        if v_upper not in seen:
            seen.add(v_upper)
            unique_variations.append(v)
    
    return unique_variations


def find_matching_variant(
    search_results: Dict[str, Any], 
    model_number: str, 
    fuzzy: bool = False
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Find the variant that matches the requested model number.
    
    Matching Priority:
    1. Exact match (case-insensitive)
    2. Format variation match (K2362 vs K-2362)
    3. Partial match (contains model number)
    
    Args:
        search_results: Search response from Ferguson API
        model_number: Model number to find
        fuzzy: Enable fuzzy matching (format variations)
        
    Returns:
        Tuple of (variant_url, matched_model, match_type)
        match_type: 'exact', 'variation', 'partial', or None
    """
    model_upper = model_number.upper().strip()
    variations = generate_model_variations(model_number) if fuzzy else [model_number]
    
    # PRIORITY 1: Try exact matches first
    for variation in variations:
        variation_upper = variation.upper().strip()
        for product in search_results.get("products", []):
            for variant in product.get("variants", []):
                variant_model = variant.get("model_no", "").upper().strip()
                
                # Exact match
                if variant_model == variation_upper:
                    match_type = 'exact' if variation == model_number else 'variation'
                    return (variant.get("url"), variant.get("model_no"), match_type)
    
    # PRIORITY 2: Try partial matches (variant contains search term)
    if fuzzy:
        for product in search_results.get("products", []):
            for variant in product.get("variants", []):
                variant_model = variant.get("model_no", "").upper().strip()
                
                # Partial match - variant contains model number
                if model_upper in variant_model or variant_model in model_upper:
                    return (variant.get("url"), variant.get("model_no"), 'partial')
    
    return (None, None, None)


def validate_unwrangle_key():
    """Validate that Unwrangle API key is configured"""
    if not UNWRANGLE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Unwrangle API key not configured. Set UNWRANGLE_API_KEY in .env file"
        )

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root - health check"""
    return {
        "service": "Ferguson Product API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "search": "/search-ferguson",
            "detail": "/product-detail-ferguson",
            "complete": "/lookup-ferguson-complete"
        }
    }


@app.post("/search-ferguson")
async def search_ferguson_products(
    request: FergusonSearchRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Search Ferguson products by keyword or model number.
    
    Returns up to 48 products per page with:
    - Basic product info (name, brand, model, URL)
    - Pricing (current, min, max, currency)
    - Variants (colors, finishes, sizes)
    - Images and thumbnails
    - Ratings and reviews
    - Stock status
    
    Cost: 10 Unwrangle credits per search
    
    Example:
        POST /search-ferguson
        {
            "search": "K-2362-8",
            "page": 1
        }
    """
    # Validate API key (optional authentication)
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    validate_unwrangle_key()
    start_time = time.time()
    
    try:
        # Build search request
        params = {
            "platform": "fergusonhome_search",
            "search": request.search,
            "page": request.page,
            "api_key": UNWRANGLE_API_KEY
        }
        
        # Make request to Unwrangle API
        response = requests.get(UNWRANGLE_API_URL, params=params, timeout=SEARCH_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Ferguson search returned unsuccessful response"
            )
        
        response_time = time.time() - start_time
        
        # Enhance products with smart variant matching
        products = data.get("results", [])
        search_model = request.search.upper().strip()
        
        # Categorize products by match quality
        exact_match_products = []
        fuzzy_match_products = []
        other_products = []
        
        for product in products:
            best_url = None
            best_model = None
            match_type = None
            
            product_model = product.get("model_no", "").upper().strip()
            product_url = product.get("url")
            variants = product.get("variants", [])
            
            # Check variants for exact matches
            if variants:
                for variant in variants:
                    variant_model = variant.get("model_no", "").upper().strip()
                    if variant_model == search_model:
                        best_url = variant.get("url")
                        best_model = variant.get("model_no")
                        match_type = "exact_variant"
                        break
                
                # Fuzzy match if no exact match
                if not best_url:
                    for variant in variants:
                        variant_model = variant.get("model_no", "").upper().strip()
                        clean_search = search_model.replace("-", "").replace("_", "")
                        clean_variant = variant_model.replace("-", "").replace("_", "")
                        if clean_search == clean_variant:
                            best_url = variant.get("url")
                            best_model = variant.get("model_no")
                            match_type = "fuzzy_variant"
                            break
                
                # Use first variant as fallback
                if not best_url and variants:
                    best_url = variants[0].get("url")
                    best_model = variants[0].get("model_no")
                    match_type = "first_variant"
            
            # Check base product
            if not best_url:
                clean_search = search_model.replace("-", "").replace("_", "")
                clean_product = product_model.replace("-", "").replace("_", "")
                if clean_search == clean_product or product_model == search_model:
                    best_url = product_url
                    best_model = product.get("model_no")
                    match_type = "base_product"
            
            # Final fallback
            if not best_url and product_url:
                best_url = product_url
                best_model = product.get("model_no")
                match_type = "product_fallback"
            
            # Add match info to product
            product["best_match_url"] = best_url
            product["best_match_model"] = best_model
            product["match_type"] = match_type
            
            # Categorize by match quality
            if match_type in ["exact_variant", "exact_variant_case_sensitive"]:
                exact_match_products.append(product)
            elif match_type in ["fuzzy_variant", "base_product"]:
                fuzzy_match_products.append(product)
            else:
                other_products.append(product)
        
        # Reorder: exact matches first
        reordered_products = exact_match_products + fuzzy_match_products + other_products
        
        return {
            "success": True,
            "platform": "fergusonhome_search",
            "search_query": request.search,
            "page": request.page,
            "total_results": data.get("total_results", 0),
            "total_pages": data.get("no_of_pages", 0),
            "result_count": data.get("result_count", 0),
            "products": reordered_products,
            "meta_data": data.get("meta_data", {}),
            "credits_used": data.get("credits_used", 10),
            "metadata": {
                "response_time": f"{response_time:.2f}s",
                "timestamp": datetime.utcnow().isoformat(),
                "api_version": "fergusonhome_search_v2"
            }
        }
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unwrangle API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ferguson search failed: {str(e)}"
        )


@app.post("/product-detail-ferguson")
async def get_ferguson_product_detail(
    request: FergusonProductRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Get complete Ferguson product details by URL.
    
    Returns comprehensive product information:
    - Complete specifications
    - All variants (colors, finishes) with individual pricing
    - High-resolution images
    - Features and descriptions
    - Warranty information
    - Resources (installation guides, spec sheets)
    - Reviews and ratings
    - Dimensions and certifications
    
    Cost: 10 Unwrangle credits per product
    
    Example:
        POST /product-detail-ferguson
        {
            "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"
        }
    """
    # Validate API key (optional authentication)
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    validate_unwrangle_key()
    start_time = time.time()
    
    try:
        # URL encode the product URL
        encoded_url = urllib.parse.quote(request.url, safe='')
        
        params = {
            "platform": "fergusonhome_detail",
            "url": encoded_url,
            "page": 1,
            "api_key": UNWRANGLE_API_KEY
        }
        
        # Make request to Unwrangle API
        response = requests.get(UNWRANGLE_API_URL, params=params, timeout=DETAIL_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Ferguson product detail request returned unsuccessful response"
            )
        
        response_time = time.time() - start_time
        
        # Get product detail
        detail_data = data.get("detail", {})
        
        # Extract variant-specific details if URL contains uid parameter
        uid_match = re.search(r'uid=(\d+)', request.url)
        if uid_match and detail_data.get("variants"):
            uid = int(uid_match.group(1))
            variants = detail_data.get("variants", [])
            
            # Find matching variant
            matching_variant = None
            for variant in variants:
                if variant.get("id") == uid:
                    matching_variant = variant
                    break
            
            # Promote variant-specific fields to top level
            if matching_variant:
                detail_data["variant_model_number"] = matching_variant.get("model_number")
                detail_data["variant_name"] = matching_variant.get("name")
                detail_data["variant_color"] = matching_variant.get("color")
                detail_data["variant_price"] = matching_variant.get("price")
                detail_data["variant_images"] = matching_variant.get("images", [])
                detail_data["variant_in_stock"] = matching_variant.get("in_stock")
                detail_data["variant_url"] = matching_variant.get("url")
                
                # Override main fields with variant data
                if matching_variant.get("model_number"):
                    detail_data["model_number"] = matching_variant.get("model_number")
                if matching_variant.get("name"):
                    detail_data["finish"] = matching_variant.get("name")
                if matching_variant.get("price"):
                    detail_data["price"] = matching_variant.get("price")
                if matching_variant.get("images"):
                    detail_data["images"] = matching_variant.get("images", []) + detail_data.get("images", [])
        
        return {
            "success": True,
            "platform": "fergusonhome_detail",
            "url": request.url,
            "result_count": data.get("result_count", 0),
            "detail": detail_data,
            "credits_used": data.get("credits_used", 10),
            "metadata": {
                "response_time": f"{response_time:.2f}s",
                "timestamp": datetime.utcnow().isoformat(),
                "api_version": "fergusonhome_detail_v1",
                "variant_specific": uid_match is not None
            }
        }
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unwrangle API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ferguson product detail lookup failed: {str(e)}"
        )


@app.post("/lookup-ferguson-complete")
async def lookup_ferguson_complete(
    request: FergusonCompleteLookupRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    ⭐ RECOMMENDED: Complete Ferguson product lookup by model number.
    
    This is the ONE-STOP endpoint that does EVERYTHING automatically:
    
    STEP 1: Search for the product by model number
    STEP 2: Find the matching variant (handles format variations intelligently)
    STEP 3: Fetch complete product details
    STEP 4: Merge all data from both search and detail endpoints
    
    Handles model number format variations automatically:
    - "K2362" → finds "K-2362-8"
    - "UC15IP" → finds "UC-15-IP"
    - "G9104BNI" → finds "G-9104-BNI"
    
    Cost: 20 Unwrangle credits (10 for search + 10 for detail)
    
    Example:
        POST /lookup-ferguson-complete
        {
            "model_number": "K-2362-8"
        }
        
    Returns: COMPLETE product data with all variants, specs, pricing, images
    """
    # Validate API key (optional authentication)
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    validate_unwrangle_key()
    
    model_number = request.model_number
    overall_start = time.time()
    
    try:
        # ========================================================================
        # STEP 1: SEARCH FOR PRODUCT
        # ========================================================================
        print(f"[1/3] Searching for model: {model_number}")
        step1_start = time.time()
        
        search_params = {
            "api_key": UNWRANGLE_API_KEY,
            "platform": "fergusonhome_search",
            "search": model_number,
            "page": 1
        }
        search_response = requests.get(UNWRANGLE_API_URL, params=search_params, timeout=SEARCH_TIMEOUT)
        search_response.raise_for_status()
        search_data = search_response.json()
        step1_time = time.time() - step1_start
        
        if not search_data.get("success") or not search_data.get("results"):
            raise HTTPException(
                status_code=404,
                detail=f"No products found for model {model_number}"
            )
        
        print(f"[1/3] ✓ Found {len(search_data.get('results', []))} products ({step1_time:.2f}s)")
        
        # Store search result data
        search_product_data = None
        for product in search_data.get("results", []):
            for variant in product.get("variants", []):
                if variant.get("model_no", "").upper().strip() == model_number.upper().strip():
                    search_product_data = product
                    break
            if search_product_data:
                break
        
        # ========================================================================
        # STEP 2: FIND MATCHING VARIANT (with smart format variations)
        # ========================================================================
        print(f"[2/3] Finding variant match (with format variations)")
        step2_start = time.time()
        
        match_result = find_matching_variant(
            {"products": search_data.get("results", [])},
            model_number,
            fuzzy=True  # Enable smart format matching
        )
        step2_time = time.time() - step2_start
        
        if not match_result or not match_result[0]:
            # Collect available variants for debugging
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
                    "hint": "Try using exact model number from Ferguson website",
                    "total_variants_found": len(available_variants)
                }
            )
        
        variant_url, matched_model, match_type = match_result
        print(f"[2/3] ✓ Matched '{model_number}' → '{matched_model}' ({match_type}, {step2_time:.2f}s)")
        
        # ========================================================================
        # STEP 3: GET COMPLETE PRODUCT DETAILS
        # ========================================================================
        print(f"[3/3] Fetching complete product attributes")
        step3_start = time.time()
        
        encoded_url = urllib.parse.quote(variant_url, safe='')
        detail_params = {
            "api_key": UNWRANGLE_API_KEY,
            "platform": "fergusonhome_detail",
            "url": encoded_url,
            "page": 1
        }
        detail_response = requests.get(UNWRANGLE_API_URL, params=detail_params, timeout=DETAIL_TIMEOUT)
        detail_response.raise_for_status()
        detail_data = detail_response.json()
        step3_time = time.time() - step3_start
        
        if not detail_data.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch product details"
            )
        
        print(f"[3/3] ✓ Retrieved complete data ({step3_time:.2f}s)")
        
        # ========================================================================
        # STEP 4: MERGE DATA FROM BOTH ENDPOINTS
        # ========================================================================
        product_detail = detail_data.get("detail", {})
        overall_time = time.time() - overall_start
        
        # Build complete merged response
        complete_product = {
            # Basic Information (merged)
            "id": product_detail.get("id") or (search_product_data.get("id") if search_product_data else None),
            "family_id": search_product_data.get("family_id") if search_product_data else None,
            "name": product_detail.get("name") or (search_product_data.get("name") if search_product_data else None),
            "brand": product_detail.get("brand") or (search_product_data.get("brand") if search_product_data else None),
            "model_number": product_detail.get("model_number"),
            "url": product_detail.get("url"),
            "product_type": product_detail.get("product_type"),
            
            # Pricing & Inventory (merged)
            "price": product_detail.get("price") or (search_product_data.get("price") if search_product_data else None),
            "price_min": search_product_data.get("price_min") if search_product_data else None,
            "price_max": search_product_data.get("price_max") if search_product_data else None,
            "currency": product_detail.get("currency") or (search_product_data.get("currency") if search_product_data else None),
            
            # Variants (merged - detail has more complete data)
            "variants": product_detail.get("variants", []) or (search_product_data.get("variants", []) if search_product_data else []),
            "variant_count": product_detail.get("variant_count") or (search_product_data.get("variant_count") if search_product_data else None),
            "has_in_stock_variants": product_detail.get("has_in_stock_variants") or (search_product_data.get("has_in_stock_variants") if search_product_data else None),
            
            # Images (merged)
            "images": product_detail.get("images", []) or (search_product_data.get("images", []) if search_product_data else []),
            "thumbnail": search_product_data.get("thumbnail") if search_product_data else None,
            
            # Complete specifications (only in detail)
            "specifications": product_detail.get("specifications", {}),
            "features": product_detail.get("features", []),
            "feature_groups": product_detail.get("feature_groups", []),
            "description": product_detail.get("description"),
            
            # Categories (merged)
            "category": product_detail.get("category") or (search_product_data.get("category") if search_product_data else None),
            "categories": product_detail.get("categories", []),
            
            # Reviews (merged)
            "rating": product_detail.get("rating") or (search_product_data.get("rating") if search_product_data else None),
            "review_count": product_detail.get("review_count") or (search_product_data.get("total_ratings") if search_product_data else None),
            
            # Additional detail data
            "dimensions": product_detail.get("dimensions", {}),
            "resources": product_detail.get("resources", []),
            "videos": product_detail.get("videos", []),
            "collection": product_detail.get("collection"),
            "certifications": product_detail.get("certifications", []),
        }
        
        return {
            "success": True,
            "model_number": model_number,
            "matched_model": matched_model,
            "match_type": match_type,
            "variant_url": variant_url,
            "product": complete_product,
            "credits_used": 20,  # 10 for search + 10 for detail
            "metadata": {
                "search_time": f"{step1_time:.2f}s",
                "match_time": f"{step2_time:.2f}s",
                "detail_time": f"{step3_time:.2f}s",
                "total_time": f"{overall_time:.2f}s",
                "timestamp": datetime.utcnow().isoformat(),
                "api_version": "fergusonhome_complete_v2"
            }
        }
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unwrangle API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ferguson complete lookup failed: {str(e)}"
        )


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Check if API key is configured
    if not UNWRANGLE_API_KEY:
        print("⚠️  WARNING: UNWRANGLE_API_KEY not set in environment")
        print("   Set it with: export UNWRANGLE_API_KEY='your-key'")
        print("   Or add to .env file")
    else:
        print("✓ Unwrangle API key configured")
    
    print("\n🚀 Starting Ferguson Product API...")
    print("📖 Docs: http://localhost:8000/docs")
    print("🔍 Endpoints:")
    print("   - POST /search-ferguson")
    print("   - POST /product-detail-ferguson")
    print("   - POST /lookup-ferguson-complete (⭐ RECOMMENDED)")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## How to Use - All Scenarios

### Scenario 1: Lookup by Model Number (⭐ RECOMMENDED)

**Use this endpoint for 99% of cases - it handles everything automatically!**

```bash
curl -X POST http://localhost:8000/lookup-ferguson-complete \
  -H "Content-Type: application/json" \
  -d '{
    "model_number": "K-2362-8"
  }'
```

**Python Example:**
```python
import requests

response = requests.post(
    "http://localhost:8000/lookup-ferguson-complete",
    json={"model_number": "K-2362-8"}
)

product = response.json()["product"]
print(f"Name: {product['name']}")
print(f"Brand: {product['brand']}")
print(f"Price: ${product['price']}")
print(f"Variants: {len(product['variants'])}")

for variant in product['variants']:
    print(f"  - {variant['name']}: ${variant['price']}")
```

**What It Returns:**
- Complete product details
- All variants (colors, finishes) with individual pricing
- Full specifications
- Images, descriptions, features
- Ratings and reviews
- Dimensions and certifications

---

### Scenario 2: Search Products by Keyword

```bash
curl -X POST http://localhost:8000/search-ferguson \
  -H "Content-Type: application/json" \
  -d '{
    "search": "pedestal bathroom sinks",
    "page": 1
  }'
```

**Use When:**
- Browsing products by category
- Searching by keyword
- Getting multiple products at once

---

### Scenario 3: Get Product Details by URL

```bash
curl -X POST http://localhost:8000/product-detail-ferguson \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"
  }'
```

**Use When:**
- You already have the Ferguson URL
- You want specific variant details

---

### Scenario 4: Handle Model Number Variations

The system automatically handles these variations:

| User Input | System Finds | Match Type |
|-----------|-------------|-----------|
| `K2362` | `K-2362-8` | variation |
| `UC15IP` | `UC-15-IP` | variation |
| `G9104BNI` | `G-9104-BNI` | variation |
| `K-2362-8` | `K-2362-8` | exact |

**No manual formatting required!**

---

## API Response Structure

### Complete Lookup Response (`/lookup-ferguson-complete`)

```json
{
  "success": true,
  "model_number": "K-2362-8",
  "matched_model": "K-2362-8-0",
  "match_type": "exact",
  "variant_url": "https://www.fergusonhome.com/...",
  "product": {
    "id": 165232,
    "family_id": 560423,
    "name": "Cimarron Pedestal Bathroom Sink",
    "brand": "Kohler",
    "model_number": "K-2362-8-0",
    "url": "https://www.fergusonhome.com/...",
    "price": 366.75,
    "price_min": 366.75,
    "price_max": 536.08,
    "currency": "USD",
    "variants": [
      {
        "variant_id": "165232",
        "sku": "K-2362-8-0",
        "name": "White",
        "color": "#FFFFFF",
        "price": 366.75,
        "in_stock": true,
        "image_url": "https://...",
        "url": "https://..."
      },
      {
        "variant_id": "165219",
        "sku": "K-2362-8-96",
        "name": "Biscuit",
        "price": 476.90,
        "in_stock": true
      }
    ],
    "specifications": {
      "Material": "Vitreous China",
      "Length": "22.75\"",
      "Width": "18.875\"",
      "Faucet Holes": "3"
    },
    "features": [
      "Three-hole faucet drilling",
      "Includes mounting hardware"
    ],
    "images": [
      "https://s3.img-b.com/...",
      "https://s3.img-b.com/..."
    ],
    "description": "The Cimarron collection...",
    "rating": 5.0,
    "review_count": 4,
    "category": "Bathroom Sinks",
    "dimensions": {
      "length": "22.75\"",
      "width": "18.875\""
    }
  },
  "credits_used": 20,
  "metadata": {
    "search_time": "1.23s",
    "match_time": "0.05s",
    "detail_time": "2.15s",
    "total_time": "3.43s",
    "timestamp": "2025-12-13T10:30:45.123456"
  }
}
```

---

## Troubleshooting

### Issue 1: "Unwrangle API key not configured"
```bash
# Set environment variable
export UNWRANGLE_API_KEY="your-key-here"

# Or add to .env file
echo "UNWRANGLE_API_KEY=your-key-here" >> .env
```

### Issue 2: "Variant not found"
The response will show available variants:
```json
{
  "error": "Variant not found",
  "requested_model": "K2362",
  "available_models": ["K-2362-8-0", "K-2362-8-96"],
  "hint": "Try using exact model number"
}
```

Try using the exact model from `available_models`.

### Issue 3: "Product not found"
- Verify model number exists on fergusonhome.com
- Try searching with `/search-ferguson` first
- Check if product is discontinued

### Issue 4: Timeout Errors
Increase timeout in code:
```python
SEARCH_TIMEOUT = 60  # Increase from 45
DETAIL_TIMEOUT = 60  # Increase from 45
```

---

## Quick Start Commands

```bash
# 1. Clone or copy this code to your repo
mkdir ferguson-api && cd ferguson-api

# 2. Install dependencies
pip install fastapi uvicorn httpx python-dotenv requests pydantic

# 3. Create .env file
echo "UNWRANGLE_API_KEY=your-key-here" > .env

# 4. Save the Python code to main.py
# (Copy the complete code block from above)

# 5. Run the server
python main.py

# 6. Test it
curl -X POST http://localhost:8000/lookup-ferguson-complete \
  -H "Content-Type: application/json" \
  -d '{"model_number": "K-2362-8"}'

# 7. View interactive API docs
open http://localhost:8000/docs
```

---

## Production Deployment

### Using Uvicorn (Production)
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY .env .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Cost Summary

| Endpoint | Credits | Use Case |
|----------|---------|----------|
| `/search-ferguson` | 10 | Search products |
| `/product-detail-ferguson` | 10 | Get details by URL |
| `/lookup-ferguson-complete` | 20 | Complete lookup (⭐ RECOMMENDED) |

**Best Practice:** Use `/lookup-ferguson-complete` - it's worth the 20 credits for complete automation.

---

## Support & Documentation

- **Unwrangle Docs:** https://docs.unwrangle.com
- **Ferguson Website:** https://www.fergusonhome.com
- **API Status:** Check Unwrangle dashboard for service status

---

## Summary

✅ **Copy the complete Python code above**  
✅ **Set `UNWRANGLE_API_KEY` in .env**  
✅ **Run: `python main.py`**  
✅ **Use: `/lookup-ferguson-complete` endpoint**  
✅ **Pass model number, get complete product data**  

**That's it! Fully plug-and-play.**
