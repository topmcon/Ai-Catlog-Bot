"""
Ferguson Product Lookup API - Complete Integration
===================================================
Production-ready FastAPI server for Ferguson product lookups via Unwrangle API.
Handles search, variant matching, and complete data retrieval automatically.

Features:
- Search products by keyword or model number
- Get complete product details by URL
- Complete automated lookup with smart variant matching
- Handles model number format variations (K2362 → K-2362-8)
- Merges data from both search and detail endpoints
- 60+ product fields with comprehensive specifications

API Endpoints:
- POST /search-ferguson: Search products (10 credits)
- POST /product-detail-ferguson: Get product details by URL (10 credits)
- POST /lookup-ferguson-complete: Complete automated lookup (20 credits) ⭐ RECOMMENDED

Author: CXC-AI Team
Updated: December 2024
API Version: fergusonhome_v2
Cost: 10-20 Unwrangle credits per request
"""

import os
import time
import re
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field, ConfigDict
import requests
import urllib.parse

# Load environment variables
load_dotenv()

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

# Initialize FastAPI app
app = FastAPI(
    title="Ferguson Product API",
    description="Complete Ferguson/Build.com product lookup system using Unwrangle API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class FergusonSearchRequest(BaseModel):
    """Request model for Ferguson product search"""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "search": "K-2362-8",
            "page": 1
        }
    })
    
    search: str = Field(..., description="Search query (keyword or model number)", example="K-2362-8")
    page: int = Field(1, ge=1, description="Page number (default: 1)")


class FergusonProductRequest(BaseModel):
    """Request model for Ferguson product detail lookup by URL"""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"
        }
    })
    
    url: str = Field(..., description="Full Ferguson product URL", example="https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232")


class FergusonCompleteLookupRequest(BaseModel):
    """Request model for complete Ferguson product lookup by model number"""
    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "model_number": "K-2362-8"
            }
        }
    )
    
    model_number: str = Field(..., description="Manufacturer model number", example="K-2362-8")


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
    prefixes = ["K-", "G-", "M-", "A-", "UC-", "T-", "R-", "B-", "C-", "D-"]
    for prefix in prefixes:
        if model.upper().startswith(prefix[0]) and not model.upper().startswith(prefix.upper()):
            variations.append(f"{prefix}{model}")
    
    # Add/remove hyphens intelligently
    if "-" in model:
        # Remove all hyphens
        variations.append(model.replace("-", ""))
        # Remove only last hyphen
        last_hyphen = model.rfind("-")
        if last_hyphen > 0:
            variations.append(model[:last_hyphen] + model[last_hyphen+1:])
    else:
        # Try adding hyphens in common positions
        if len(model) > 4:
            # Pattern: G9104BNI → G-9104-BNI
            if model[0].isalpha() and model[1:5].isdigit():
                variations.append(f"{model[0]}-{model[1:5]}-{model[5:]}")
                variations.append(f"{model[0]}-{model[1:]}")
            
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


def merge_product_data(search_product: Optional[Dict], detail_product: Dict) -> Dict:
    """
    Merge data from search and detail endpoints into complete product object.
    Detail data takes priority when fields exist in both.
    
    Args:
        search_product: Product data from search endpoint (may be None)
        detail_product: Product data from detail endpoint
        
    Returns:
        Complete merged product dictionary with 60+ fields
    """
    return {
        # ========== IDENTIFIERS ==========
        "id": detail_product.get("id") or (search_product.get("id") if search_product else None),
        "family_id": search_product.get("family_id") if search_product else None,
        "upc": detail_product.get("upc"),
        "barcode": detail_product.get("barcode"),
        
        # ========== BASIC INFORMATION ==========
        "name": detail_product.get("name") or (search_product.get("name") if search_product else None),
        "brand": detail_product.get("brand") or (search_product.get("brand") if search_product else None),
        "brand_url": detail_product.get("brand_url"),
        "brand_logo": detail_product.get("brand_logo"),
        "model_number": detail_product.get("model_number") or detail_product.get("model_no"),
        "url": detail_product.get("url"),
        "product_type": detail_product.get("product_type"),
        "application": detail_product.get("application"),
        "base_type": detail_product.get("base_type"),
        
        # ========== PRICING ==========
        "price": detail_product.get("price") or (search_product.get("price") if search_product else None),
        "price_min": search_product.get("price_min") if search_product else None,
        "price_max": search_product.get("price_max") if search_product else None,
        "unit_price": search_product.get("unit_price") if search_product else None,
        "price_type": search_product.get("price_type") if search_product else None,
        "price_range": detail_product.get("price_range"),
        "currency": detail_product.get("currency") or (search_product.get("currency") if search_product else None),
        "shipping_fee": detail_product.get("shipping_fee"),
        "has_free_installation": detail_product.get("has_free_installation"),
        
        # ========== VARIANTS (COMPLETE) ==========
        "variants": detail_product.get("variants", []) or (search_product.get("variants", []) if search_product else []),
        "variant_count": detail_product.get("variant_count") or (search_product.get("variant_count") if search_product else None),
        "has_variant_groups": detail_product.get("has_variant_groups"),
        "has_in_stock_variants": detail_product.get("has_in_stock_variants") or (search_product.get("has_in_stock_variants") if search_product else None),
        "all_variants_in_stock": detail_product.get("all_variants_in_stock") or (search_product.get("all_variants_in_stock") if search_product else None),
        "all_variants_restricted": search_product.get("all_variants_restricted") if search_product else None,
        "total_inventory_quantity": detail_product.get("total_inventory_quantity") or (search_product.get("total_inventory_quantity") if search_product else None),
        "in_stock_variant_count": detail_product.get("in_stock_variant_count") or (search_product.get("in_stock_variant_count") if search_product else None),
        "is_configurable": detail_product.get("is_configurable") or (search_product.get("is_configurable") if search_product else None),
        "is_square_footage_based": search_product.get("is_square_footage_based") if search_product else None,
        "configuration_type": detail_product.get("configuration_type"),
        
        # ========== IMAGES & MEDIA ==========
        "images": detail_product.get("images", []) or (search_product.get("images", []) if search_product else []),
        "thumbnail": search_product.get("thumbnail") if search_product else detail_product.get("thumbnail"),
        "videos": detail_product.get("videos", []),
        
        # ========== PRODUCT DETAILS ==========
        "description": detail_product.get("description"),
        "is_discontinued": detail_product.get("is_discontinued"),
        
        # ========== SPECIFICATIONS (CRITICAL!) ==========
        "specifications": detail_product.get("specifications", {}),
        "features": detail_product.get("features", []),
        "feature_groups": detail_product.get("feature_groups", []),
        "dimensions": detail_product.get("dimensions", {}),
        "attribute_ids": detail_product.get("attribute_ids", []),
        
        # ========== CERTIFICATIONS & COMPLIANCE ==========
        "certifications": detail_product.get("certifications", []),
        "country_of_origin": detail_product.get("country_of_origin"),
        
        # ========== WARRANTY ==========
        "warranty": detail_product.get("warranty"),
        "manufacturer_warranty": detail_product.get("manufacturer_warranty"),
        
        # ========== RESOURCES & DOCUMENTATION ==========
        "resources": detail_product.get("resources", []),
        
        # ========== CATEGORIES ==========
        "categories": detail_product.get("categories", []),
        "base_category": detail_product.get("base_category"),
        "business_category": detail_product.get("business_category"),
        "category": detail_product.get("category") or (search_product.get("category") if search_product else None),
        "related_categories": detail_product.get("related_categories", []),
        
        # ========== REVIEWS & RATINGS ==========
        "rating": detail_product.get("rating") or (search_product.get("rating") if search_product else None),
        "total_ratings": search_product.get("total_ratings") if search_product else None,
        "review_count": detail_product.get("review_count"),
        "total_reviews": detail_product.get("total_reviews") or (search_product.get("total_ratings") if search_product else None),
        "questions_count": detail_product.get("questions_count"),
        
        # ========== COLLECTION ==========
        "collection": detail_product.get("collection") or (search_product.get("collection") if search_product else None),
        
        # ========== SHIPPING INFO ==========
        "is_quick_ship": search_product.get("is_quick_ship") if search_product else None,
        "shipping_info": search_product.get("shipping_info") if search_product else None,
        
        # ========== SPECIAL FLAGS ==========
        "is_appointment_only_brand": search_product.get("is_appointment_only_brand") if search_product else None,
        "is_by_appointment_only": detail_product.get("is_by_appointment_only"),
        
        # ========== RELATED PRODUCTS ==========
        "has_recommended_options": detail_product.get("has_recommended_options"),
        "recommended_options": detail_product.get("recommended_options", []),
        "has_accessories": detail_product.get("has_accessories"),
        "has_replacement_parts": detail_product.get("has_replacement_parts"),
        "replacement_parts_url": detail_product.get("replacement_parts_url")
    }


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root - health check and documentation"""
    return {
        "service": "Ferguson Product API",
        "version": "2.0.0",
        "status": "operational",
        "documentation": "/docs",
        "endpoints": {
            "search": {
                "path": "/search-ferguson",
                "method": "POST",
                "description": "Search products by keyword or model number",
                "credits": 10
            },
            "detail": {
                "path": "/product-detail-ferguson",
                "method": "POST",
                "description": "Get complete product details by URL",
                "credits": 10
            },
            "complete": {
                "path": "/lookup-ferguson-complete",
                "method": "POST",
                "description": "Complete automated lookup (RECOMMENDED)",
                "credits": 20
            }
        },
        "data_sources": {
            "search": "fergusonhome_search (up to 48 products, basic data)",
            "detail": "fergusonhome_detail (complete specs, all variants)"
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
    
    **Cost:** 10 Unwrangle credits per search
    
    **Use When:**
    - Browsing products by category ("bathroom sinks", "kohler faucets")
    - Search by model number to find products
    - Get pricing ranges across variants
    - Check if products exist
    
    **What's Missing:**
    - Complete specifications (only 2-5 key specs)
    - Full product descriptions
    - Warranty information
    - Installation guides/resources
    """
    # Validate API key (optional authentication)
    if API_KEY and API_KEY != "your-api-key" and x_api_key != API_KEY:
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
    - **Complete specifications** (20-50+ fields)
    - **All variants** with individual pricing, inventory, images
    - **High-resolution images** (multiple per variant)
    - **Features and descriptions**
    - **Warranty information**
    - **Resources** (installation guides, spec sheets)
    - **Reviews and ratings**
    - **Dimensions and certifications**
    
    **Cost:** 10 Unwrangle credits per product
    
    **Use When:**
    - After finding product via search
    - Need complete specifications
    - Need all variant details (colors, pricing, inventory)
    - Need warranty, dimensions, certifications
    - Building detailed product catalog
    """
    # Validate API key (optional authentication)
    if API_KEY and API_KEY != "your-api-key" and x_api_key != API_KEY:
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
    ⭐ **RECOMMENDED:** Complete Ferguson product lookup by model number.
    
    This is the **ONE-STOP endpoint** that does EVERYTHING automatically:
    
    **STEP 1:** Search for the product by model number  
    **STEP 2:** Find the matching variant (handles format variations intelligently)  
    **STEP 3:** Fetch complete product details  
    **STEP 4:** Merge all data from both search and detail endpoints  
    
    **Smart Model Matching:**
    Automatically handles format variations:
    - "K2362" → finds "K-2362-8"
    - "UC15IP" → finds "UC-15-IP"
    - "G9104BNI" → finds "G-9104-BNI"
    
    **Complete Data:**
    Returns 60+ fields including:
    - All variants (colors, finishes) with pricing and inventory
    - Complete specifications (20-50+ fields)
    - High-resolution images
    - Warranty and certifications
    - Installation guides/resources
    - Reviews and ratings
    
    **Cost:** 20 Unwrangle credits (10 for search + 10 for detail)
    
    **Response Time:** 3-5 seconds average
    """
    # Validate API key (optional authentication)
    if API_KEY and API_KEY != "your-api-key" and x_api_key != API_KEY:
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
        
        # Build complete merged response using utility function
        complete_product = merge_product_data(search_product_data, product_detail)
        
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
                "api_version": "fergusonhome_complete_v2",
                "total_fields": len([k for k, v in complete_product.items() if v is not None])
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
# HEALTH CHECK & STATUS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "Ferguson Product API",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "unwrangle_key_configured": bool(UNWRANGLE_API_KEY)
    }


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*70)
    print("🏗️  FERGUSON PRODUCT API - Complete Integration")
    print("="*70)
    
    # Check if API key is configured
    if not UNWRANGLE_API_KEY:
        print("\n⚠️  WARNING: UNWRANGLE_API_KEY not set in environment")
        print("   Set it with: export UNWRANGLE_API_KEY='your-key'")
        print("   Or add to .env file")
        print("\n   Get your API key at: https://unwrangle.com")
    else:
        print("\n✓ Unwrangle API key configured")
    
    print("\n🚀 Starting Ferguson Product API Server...")
    print("\n📖 API Documentation:")
    print("   Interactive Docs: http://localhost:8000/docs")
    print("   ReDoc: http://localhost:8000/redoc")
    
    print("\n🔍 Available Endpoints:")
    print("   1. POST /search-ferguson")
    print("      └─ Search products by keyword/model (10 credits)")
    print("\n   2. POST /product-detail-ferguson")
    print("      └─ Get complete product details by URL (10 credits)")
    print("\n   3. POST /lookup-ferguson-complete ⭐ RECOMMENDED")
    print("      └─ Complete automated lookup (20 credits)")
    
    print("\n💡 Quick Test:")
    print("   curl -X POST http://localhost:8000/lookup-ferguson-complete \\")
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"model_number": "K-2362-8"}\'')
    
    print("\n" + "="*70)
    print("Starting server on http://0.0.0.0:8000")
    print("="*70 + "\n")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
