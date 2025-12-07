# Ferguson API Integration Guide for Salesforce

## Overview

This API provides a **2-step workflow** to retrieve comprehensive Ferguson product data (308+ fields) for Salesforce integration. The system includes intelligent **multi-tier search** (exact → symbol-stripped → fuzzy) to ensure accurate product matching.

---

## Base Configuration

**API Endpoint:** `https://cxc-ai.com`  
**Authentication:** API Key Header  
**API Key:** `catbot123`

**Required Headers:**
```http
Content-Type: application/json
X-API-KEY: catbot123
```

---

## API Workflow

### Step 1: Search for Products
### Step 2: Get Complete Product Details (308+ fields)

---

## 🔍 Step 1: Search Ferguson Products

**Endpoint:** `POST /search-ferguson`

**Purpose:** Find products and get their detail URLs

### Request Body

```json
{
  "search": "CL4250SID/O",
  "page": 1
}
```

**Parameters:**
- `search` (string, required): Product model, SKU, keyword, or brand
- `page` (integer, optional): Page number for pagination (default: 1)

### Response

```json
{
  "success": true,
  "search_query": "CL4250SID/O",
  "page": 1,
  "total_results": 1,
  "result_count": 1,
  "exact_match_count": 0,
  "partial_match_count": 1,
  "search_strategy": {
    "tier_used": "exact_term",
    "original_search": "CL4250SID/O",
    "actual_search": "CL4250SID/O",
    "explanation": "Searched with exact term provided"
  },
  "products": [
    {
      "name": "Classic Series 42 Inch Wide Refrigerator",
      "brand": "Sub-Zero",
      "model_number": null,
      "url": "https://www.fergusonhome.com/sub-zero-cl4250sid/s1876645?uid=4433788",
      "price": 14475,
      "images": ["https://..."],
      "is_exact_match": false,
      "in_stock": true,
      "variant_count": 1
    }
  ],
  "credits_used": 10
}
```

**Key Fields:**
- `products[].url` - **REQUIRED for Step 2**
- `products[].is_exact_match` - Boolean indicating exact model match
- `search_strategy.tier_used` - Which search tier was used:
  - `"exact_term"` - Found with exact search term
  - `"symbol_stripped"` - Found after removing symbols (e.g., `/`, `-`)
  - `"fuzzy"` - Fuzzy match fallback

### Multi-Tier Search Explained

The API automatically tries 3 search strategies:

1. **Tier 1 (Exact):** Search with your exact term (`CL4250SID/O`)
2. **Tier 2 (Symbol-Stripped):** If no exact match, strip symbols and try again (`CL4250SIDO`)
3. **Tier 3 (Fuzzy):** If still no match, return similar products

This ensures you always get the most relevant results.

### cURL Example

```bash
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "search": "CL4250SID/O",
    "page": 1
  }'
```

---

## 📦 Step 2: Get Complete Product Details

**Endpoint:** `POST /product-detail-ferguson`

**Purpose:** Get ALL 308+ product fields for Salesforce

### Request Body

```json
{
  "url": "https://www.fergusonhome.com/sub-zero-cl4250sid/s1876645?uid=4433788"
}
```

**Parameters:**
- `url` (string, required): Product URL from Step 1 (`products[].url`)

### Response Structure

```json
{
  "success": true,
  "detail": {
    // CORE INFORMATION (13 fields)
    "id": "s1876645",
    "name": "Classic Series 42 Inch Wide Refrigerator",
    "brand": "Sub-Zero",
    "model_number": "CL4250SID",
    "sku": null,
    "url": "https://www.fergusonhome.com/sub-zero-cl4250sid/s1876645",
    "product_type": "Refrigeration Appliances",
    "base_type": "Built-In Refrigerators",
    "base_category": "Appliances",
    "application": "Residential",
    "description": "42 inch panel ready side-by-side refrigerator...",
    "long_description": "Full product description...",
    "thumbnail": "https://...",
    
    // PRICING (9 fields)
    "price": 14475,
    "currency": "USD",
    "msrp": null,
    "price_range": {
      "min": 14475,
      "max": 14475
    },
    "has_price_range": false,
    "min_price": 14475,
    "max_price": 14475,
    "shipping_fee": null,
    "total_price_with_shipping": null,
    
    // IMAGES (3 fields)
    "images": [
      "https://...",
      "https://..."
    ],
    "image_count": 2,
    "has_multiple_images": true,
    
    // BRAND (2 fields)
    "brand_logo": {
      "url": "https://...",
      "width": 200,
      "height": 50
    },
    "manufacturer": "Sub-Zero",
    
    // AVAILABILITY (9 fields)
    "variant_count": 1,
    "has_in_stock_variants": true,
    "all_variants_in_stock": true,
    "total_inventory_quantity": 100,
    "in_stock_variant_count": 1,
    "out_of_stock_variant_count": 0,
    "is_configurable": false,
    "has_variant_groups": false,
    
    // VARIANTS (Array of 22 fields each)
    "variants": [
      {
        "id": "v123",
        "name": "Panel Ready",
        "model_number": "CL4250SID/O",
        "url": "https://...",
        "price": 14475,
        "color": "Panel Ready",
        "in_stock": true,
        "inventory_quantity": 100,
        "images": ["https://..."],
        "has_free_shipping": false,
        "is_quick_ship": false
      }
    ],
    
    // SPECIFICATIONS (60+ fields)
    "specifications": {
      "capacity": "24.5 Cu. Ft.",
      "width": "42 inches",
      "height": "84 inches",
      "depth": "24 inches",
      "energy_star": true,
      "water_filter": true,
      "ice_maker": true,
      "door_style": "French Door"
      // ... 50+ more specification fields
    },
    
    // FEATURE GROUPS (6 nested fields)
    "feature_groups": [
      {
        "name": "Temperature Control",
        "features": [
          {
            "name": "Digital Temperature Display",
            "value": true,
            "featured": true
          }
        ]
      }
    ],
    
    // DIMENSIONS (3 fields)
    "dimensions": {
      "height": "84 inches",
      "width": "42 inches",
      "depth": "24 inches"
    },
    
    // WARRANTY & CERTIFICATIONS (7 fields)
    "warranty": "2 Year Full Warranty",
    "manufacturer_warranty": "2 Year Parts & Labor",
    "certifications": ["Energy Star", "UL Listed"],
    "country_of_origin": "USA",
    "upc": "123456789",
    "barcode": null,
    
    // REVIEWS & RATINGS (4 fields)
    "rating": 4.5,
    "review_count": 128,
    "total_reviews": 128,
    "questions_count": 15,
    
    // RESOURCES (Array)
    "resources": [
      {
        "name": "Installation Guide",
        "url": "https://...",
        "type": "PDF"
      }
    ],
    
    // COLLECTION (6 fields)
    "collection": {
      "id": "classic-series",
      "name": "Classic Series",
      "url": "https://...",
      "total_items": 24
    },
    
    // STATUS FLAGS (6 fields)
    "is_discontinued": false,
    "has_free_installation": false,
    "is_by_appointment_only": false,
    "has_accessories": true,
    "has_replacement_parts": true
  },
  
  // FIELD COVERAGE METRICS
  "field_coverage": {
    "total_fields": 308,
    "populated_fields": 100,
    "missing_fields": 208,
    "coverage_percent": 32.47
  },
  
  // VARIANT INFORMATION
  "related_models": ["CL4250SID/O", "CL4250SID/I"],
  "variant_info": {
    "total_variants": 1,
    "variant_models": ["CL4250SID/O"],
    "note": "If searching for a specific model variant, check variant_models list"
  },
  
  "credits_used": 10
}
```

### Complete Field List (308+ Fields)

#### 📋 Top Level Core Information (13 fields)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique product ID from Ferguson |
| `name` | string | Product name/title |
| `url` | string | Full Ferguson product URL |
| `brand` | string | Brand/manufacturer name |
| `brand_url` | string | Brand page URL |
| `brand_logo` | object | Brand logo {url, description} |
| `model_number` | string | Primary model/SKU number |
| `description` | string | Product description |
| `price` | number | Current price (USD) |
| `currency` | string | Currency code (USD) |
| `base_type` | string | Base product category |
| `product_type` | string | Specific product type |
| `application` | string | Application type (Residential/Commercial) |

#### 📁 Categories (4 fields)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | array | Category breadcrumb hierarchy |
| `base_category` | string | Primary category name |
| `business_category` | string | Business unit category |
| `related_categories` | array | Related category links |

#### 💰 Pricing & Inventory (7 fields)

| Field | Type | Description |
|-------|------|-------------|
| `price_range` | object | {min, max, has_range} price range |
| `shipping_fee` | number | Shipping cost if applicable |
| `variant_count` | integer | Total number of variants |
| `has_in_stock_variants` | boolean | Any variant available |
| `all_variants_in_stock` | boolean | All variants available |
| `total_inventory_quantity` | integer | Total inventory across variants |
| `in_stock_variant_count` | integer | Count of in-stock variants |

#### 📸 Media (3 fields)

| Field | Type | Description |
|-------|------|-------------|
| `images` | array | Array of product images (URLs or objects) |
| `videos` | array | Array of product videos |
| `thumbnail` | string | Primary thumbnail image URL |

#### ⚙️ Configuration & Options (8 fields)

| Field | Type | Description |
|-------|------|-------------|
| `is_configurable` | boolean | Product has configuration options |
| `configuration_type` | string | Type of configuration system |
| `has_variant_groups` | boolean | Variants grouped by attribute |
| `has_accessories` | boolean | Compatible accessories available |
| `has_recommended_options` | boolean | Has recommended add-ons |
| `recommended_options` | array | List of recommended products |
| `has_replacement_parts` | boolean | Replacement parts available |
| `replacement_parts_url` | string | URL to parts page |

#### 🎨 Variants (22 fields per variant - array)

Each product can have multiple variants with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique variant ID |
| `name` | string | Variant name |
| `title` | string | Variant title/description |
| `model_number` | string | Variant-specific model number |
| `url` | string | Direct URL to this variant |
| `price` | number | Variant price |
| `currency` | string | Currency code |
| `color` | string | Color name/code |
| `in_stock` | boolean | Availability status |
| `inventory_quantity` | integer | Stock quantity |
| `availability_status` | string | Stock status message |
| `images` | array | Variant-specific images |
| `image_info` | object | Image metadata |
| `swatch_gradient` | string | Color swatch gradient CSS |
| `shipping_info` | object | Shipping details |
| `shipping_lead_time` | string | Expected ship time |
| `shipping_message` | string | Shipping message text |
| `estimated_delivery` | string | Delivery date estimate |
| `has_free_shipping` | boolean | Free shipping available |
| `is_quick_ship` | boolean | Quick ship eligible |
| `is_made_to_order` | boolean | Custom manufacturing required |
| `bundle_items` | array | Bundled products |

#### 📊 Specifications (60+ fields)

Technical specifications vary by product type. All specs have this structure:
```json
{
  "description": "Field description",
  "value": "Actual value",
  "units": "Unit of measurement"
}
```

**Common Specification Fields:**

| Field | Description |
|-------|-------------|
| `ada` | ADA compliance |
| `asme_code` | ASME certification code |
| `assembly_required` | Assembly required |
| `base_included` | Base/pedestal included |
| `base_material` | Base material type |
| `basin_depth` | Basin depth measurement |
| `basin_length` | Basin length measurement |
| `basin_width` | Basin width measurement |
| `certifications` | Product certifications |
| `collection` | Product collection name |
| `country_of_origin` | Manufacturing country |
| `csa_code` | CSA certification code |
| `drain_assembly_included` | Drain included |
| `drain_connection` | Drain connection type |
| `drain_placement` | Drain position |
| `faucet_centers` | Faucet hole spacing |
| `faucet_hole_size` | Faucet hole diameter |
| `faucet_holes` | Number of faucet holes |
| `faucet_included` | Faucet included |
| `faucet_mounting_type` | Faucet mount type |
| `height` | Product height |
| `installation_hardware_included` | Hardware included |
| `installation_type` | Installation method |
| `length` | Product length |
| `made_in_america` | Made in USA |
| `manufacturer_warranty` | Warranty details |
| `material` | Primary material |
| `mounting_type` | Mounting method |
| `nominal_length` | Nominal length |
| `number_of_basins` | Basin count |
| `overflow` | Overflow drain present |
| `pedestal_included` | Pedestal included |
| `product_variation` | Product variation type |
| `shelves_included` | Shelves included |
| `sink_height` | Sink height |
| `sink_length` | Sink length |
| `sink_material` | Sink material |
| `sink_shape` | Sink shape |
| `sink_width` | Sink width |
| `theme` | Design theme |
| `towel_bar_included` | Towel bar included |
| `width` | Product width |
| `depth` | Product depth |
| `diameter` | Product diameter |
| `finish` | Surface finish |
| `color` | Product color |
| `style` | Design style |
| `valve_type` | Valve type |
| `spout_reach` | Spout reach distance |
| `spout_height` | Spout height |
| `flow_rate` | Water flow rate |
| `water_pressure` | Required pressure |
| `temperature_range` | Temperature range |
| `gpm` | Gallons per minute |
| `psi` | Pressure (PSI) |
| `voltage` | Electrical voltage |
| `wattage` | Power consumption |
| `amperage` | Electrical amperage |
| `lumens` | Light output |
| `color_temperature` | Light color temp (K) |
| `bulb_type` | Bulb/lamp type |
| `bulb_included` | Bulb included |
| `dimmable` | Dimmable capability |
| `energy_star` | Energy Star certified |
| `ul_listed` | UL Listed |
| `nsf_certified` | NSF certified |
| `watersense` | WaterSense certified |
| `compliant_standards` | Compliance standards |
| `ipc_code` | IPC code |
| `iapmo_code` | IAPMO code |
| `ansi_code` | ANSI code |

#### 🎯 Feature Groups (nested structure)

Array of feature groups, each containing:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Feature group name |
| `features` | array | Array of features |

Each feature contains:
- `name` - Feature name
- `value` - Feature value/status
- `description` - Feature description
- `units` - Unit of measurement
- `featured` - Highlighted feature flag

#### 📐 Dimensions (5 fields)

| Field | Type | Description |
|-------|------|-------------|
| `dimensions.height` | string | Height with units |
| `dimensions.width` | string | Width with units |
| `dimensions.length` | string | Length with units |
| `dimensions.depth` | string | Depth with units |
| `dimensions.diameter` | string | Diameter with units |

#### 🛡️ Warranty & Certifications (7 fields)

| Field | Type | Description |
|-------|------|-------------|
| `warranty` | string | Warranty information |
| `manufacturer_warranty` | string | Manufacturer warranty details |
| `certifications` | array | Certification list |
| `country_of_origin` | string | Manufacturing country |
| `upc` | string | UPC barcode |
| `barcode` | string | Other barcode |
| `attribute_ids` | array | Internal attribute IDs |

#### ⭐ Reviews & Ratings (4 fields)

| Field | Type | Description |
|-------|------|-------------|
| `rating` | number | Average star rating (0-5) |
| `review_count` | integer | Number of reviews |
| `total_reviews` | integer | Total review count |
| `questions_count` | integer | Customer questions count |

#### 📄 Resources (array of objects)

Documents, manuals, spec sheets, etc. Each resource has:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Resource ID |
| `name` | string | Document name |
| `url` | string | Download URL |

#### 🗂️ Collection (3 fields)

| Field | Type | Description |
|-------|------|-------------|
| `collection.name` | string | Collection name |
| `collection.description` | string | Collection description |
| `collection.url` | string | Collection page URL |

#### 🚩 Status Flags (3 fields)

| Field | Type | Description |
|-------|------|-------------|
| `is_discontinued` | boolean | Product discontinued |
| `has_free_installation` | boolean | Free installation available |
| `is_by_appointment_only` | boolean | Requires appointment |

---

### Field Coverage Metrics

Every response includes field coverage statistics:

```json
"field_coverage": {
  "total_fields": 308,
  "populated_fields": 95,
  "missing_fields": 213,
  "coverage_percent": 30.84
}
```

**Note:** Not all fields apply to every product. Coverage varies by:
- Product category (appliances have different fields than plumbing)
- Data availability from Ferguson
- Product complexity (configurable vs simple products)

### cURL Example

```bash
curl -X POST https://cxc-ai.com/product-detail-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "url": "https://www.fergusonhome.com/sub-zero-cl4250sid/s1876645?uid=4433788"
  }'
```

---

## 💬 Bonus: AI Product Q&A (Optional)

**Endpoint:** `POST /ask-question-ferguson`

**Purpose:** Get AI-generated answers about products

### Request Body

```json
{
  "question": "What is the energy efficiency rating?",
  "product_data": { ... }
}
```

**Parameters:**
- `question` (string, required): User's question
- `product_data` (object, required): Complete product detail from Step 2

### Response

```json
{
  "success": true,
  "question": "What is the energy efficiency rating?",
  "answer": "This refrigerator is Energy Star certified...",
  "ai_provider": "OpenAI GPT-4o-mini",
  "credits_used": 0
}
```

---

## Salesforce Integration Examples

### Apex HTTP Callout Example

```apex
public class FergusonAPIService {
    
    private static final String API_URL = 'https://cxc-ai.com';
    private static final String API_KEY = 'catbot123';
    
    // Step 1: Search for products
    public static List<FergusonProduct> searchProducts(String searchTerm) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_URL + '/search-ferguson');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-KEY', API_KEY);
        
        Map<String, Object> body = new Map<String, Object>{
            'search' => searchTerm,
            'page' => 1
        };
        req.setBody(JSON.serialize(body));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            List<Object> products = (List<Object>) result.get('products');
            
            List<FergusonProduct> fergusonProducts = new List<FergusonProduct>();
            for (Object prod : products) {
                Map<String, Object> p = (Map<String, Object>) prod;
                FergusonProduct fp = new FergusonProduct();
                fp.name = (String) p.get('name');
                fp.brand = (String) p.get('brand');
                fp.productUrl = (String) p.get('url');
                fp.price = (Decimal) p.get('price');
                fp.isExactMatch = (Boolean) p.get('is_exact_match');
                fergusonProducts.add(fp);
            }
            return fergusonProducts;
        }
        
        throw new CalloutException('Search failed: ' + res.getStatus());
    }
    
    // Step 2: Get complete product details
    public static Map<String, Object> getProductDetail(String productUrl) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_URL + '/product-detail-ferguson');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-KEY', API_KEY);
        
        Map<String, Object> body = new Map<String, Object>{
            'url' => productUrl
        };
        req.setBody(JSON.serialize(body));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (Map<String, Object>) result.get('detail');
        }
        
        throw new CalloutException('Detail fetch failed: ' + res.getStatus());
    }
    
    // Full workflow: Search and get details
    public static Map<String, Object> getProductByModel(String modelNumber) {
        // Step 1: Search
        List<FergusonProduct> results = searchProducts(modelNumber);
        
        if (results.isEmpty()) {
            throw new NoDataFoundException('No products found for: ' + modelNumber);
        }
        
        // Step 2: Get details for first (best) match
        return getProductDetail(results[0].productUrl);
    }
    
    public class FergusonProduct {
        public String name;
        public String brand;
        public String productUrl;
        public Decimal price;
        public Boolean isExactMatch;
    }
}
```

### Remote Site Settings (Salesforce Setup Required)

Add to **Setup → Security → Remote Site Settings:**

```
Name: Ferguson_API
Remote Site URL: https://cxc-ai.com
Active: ✓
Description: Ferguson Product API for catalog integration
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Invalid API key"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "error": "Ferguson search returned unsuccessful response"
}
```

**503 Service Unavailable:**
```json
{
  "detail": "Unwrangle API request failed: timeout"
}
```

### Best Practices

1. **Always check `success` field** before processing data
2. **Handle null values** - Many fields may be null/missing
3. **Cache product URLs** from search results for subsequent detail calls
4. **Use field coverage metrics** to determine data completeness
5. **Implement retry logic** with exponential backoff for 503 errors
6. **Check `variant_models`** if searching for specific variants (e.g., `/O`, `/I` suffixes)

---

## Cost & Rate Limits

**Credits Per Request:**
- Search: 10 credits
- Product Detail: 10 credits
- AI Q&A: 0 credits (uses internal AI)

**Rate Limits:**
- No hard limits currently enforced
- Recommended: Max 100 requests/minute

**Timeout Settings:**
- Search: 30 seconds
- Product Detail: 45 seconds
- AI Q&A: 30 seconds

---

## Testing

### Quick Test Searches

```bash
# Test 1: Exact match (should find product)
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"search": "K-2362-8", "page": 1}'

# Test 2: Variant search (symbol-stripped tier)
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"search": "CL4250SID/O", "page": 1}'

# Test 3: Brand search (fuzzy tier)
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"search": "Kohler Kitchen Faucet", "page": 1}'
```

### Verify Product Detail

```bash
curl -X POST https://cxc-ai.com/product-detail-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"url": "https://www.fergusonhome.com/sub-zero-cl4250sid/s1876645"}' \
  | jq '{success, model: .detail.model_number, variants: .related_models, coverage: .field_coverage.coverage_percent}'
```

---

## Support & Documentation

**API Documentation:** This guide  
**Technical Support:** Contact your integration team  
**API Status:** Monitor at https://cxc-ai.com/admin.html  
**Field Reference:** See `docs/FERGUSON_SCHEMA.md` for complete field definitions

---

## Version History

- **v3** (Dec 2025): Multi-tier search (exact → symbol-stripped → fuzzy)
- **v2** (Dec 2025): Comprehensive 308-field schema with variant detection
- **v1** (Nov 2025): Initial release with basic search and detail endpoints

---

## Migration Notes for Existing Integrations

If upgrading from v1/v2:

1. **New Response Fields:**
   - `search_strategy` - Shows which search tier was used
   - `exact_match_count` / `partial_match_count` - Match statistics
   - `is_exact_match` - Per-product exact match flag
   - `variant_info` - Lists all variant model numbers
   - `related_models` - Quick access to variant models

2. **Behavior Changes:**
   - Searches now automatically try symbol-stripped versions
   - Exact matches sorted to top of results
   - More accurate matching for products with special characters

3. **Backward Compatible:**
   - All existing fields remain in same structure
   - No breaking changes to core API contract
