# Salesforce Ferguson API - Variant-Specific Field Mapping

## Issue
When looking up variants like `2400-4273/24`, Salesforce was receiving only the base product data (`2400-4273`) without variant-specific finish, color, or model suffix.

## Solution (Deployed 2025-12-08)
The API now extracts variant-specific details when a URL contains a `uid` parameter and promotes them to the top-level `detail` object.

## Required Salesforce Apex Updates

### Current Mapping (INCORRECT)
```apex
// parseDetails() method - OLD CODE
catalog.Ferguson_Model_Number__c = modeldata.detail.model;  // Wrong - returns base model
catalog.Ferguson_Price__c = modeldata.detail.price;
// No finish or color fields mapped
```

### Correct Mapping (REQUIRED)
```apex
// parseDetails() method - NEW CODE
// Use model_no instead of model (includes variant suffix like /24)
if(modeldata.detail.model_no != null) {
    catalog.Ferguson_Model_Number__c = modeldata.detail.model_no;  // "2400-4273/24"
}

// Add variant-specific finish mapping
if(modeldata.detail.finish != null) {
    catalog.Ferguson_Finish__c = modeldata.detail.finish;  // "Polished Gold (PVD)"
}

// Add variant-specific color mapping
if(modeldata.detail.color != null) {
    catalog.Ferguson_Color__c = modeldata.detail.color;  // "D4AF37"
}

// Price is already variant-specific
if(modeldata.detail.price != null) {
    catalog.Ferguson_Price__c = modeldata.detail.price;  // Variant-specific price
}

// Optional: Add variant stock and shipping info
if(modeldata.detail.variant_in_stock != null) {
    catalog.Ferguson_In_Stock__c = modeldata.detail.variant_in_stock;
}

if(modeldata.detail.variant_shipping_lead_time != null) {
    catalog.Ferguson_Shipping_Lead_Time__c = modeldata.detail.variant_shipping_lead_time;
}
```

## API Response Structure

### Search Response
```json
{
  "products": [
    {
      "model_no": "2400-4273",           // Base product model
      "match_type": "exact_variant",
      "best_match_model": "2400-4273/24", // Variant model
      "best_match_url": "https://www.fergusonhome.com/newport-brass-2400-4273/s1288730?uid=3425924"
    }
  ]
}
```

**Important:** Use `best_match_url` (includes uid parameter) when calling product-detail endpoint.

### Product Detail Response (With Variant UID)
```json
{
  "detail": {
    // Top-level fields (variant-specific when uid present)
    "model_no": "2400-4273/24",                    // ✅ Variant model with suffix
    "finish": "Polished Gold (PVD)",               // ✅ Variant finish name
    "color": "D4AF37",                             // ✅ Variant color hex
    "price": 2157.4,                               // ✅ Variant price
    "images": ["https://...2400-4273-24...jpg"],   // ✅ Variant image
    
    // Additional variant-specific fields
    "variant_model_number": "2400-4273/24",
    "variant_name": "Polished Gold (PVD)",
    "variant_color": "D4AF37",
    "variant_price": 2157.4,
    "variant_in_stock": false,
    "variant_shipping_lead_time": "Leaves the Warehouse in 4 to 7 weeks",
    "variant_availability_status": "in_stock",
    "variant_url": "https://...",
    "variant_images": ["https://..."]
  },
  "metadata": {
    "variant_specific": true  // ✅ Indicates variant data was extracted
  }
}
```

### Product Detail Response (Without UID - Base Product Only)
```json
{
  "detail": {
    "model_no": null,                    // ❌ May be null for base products
    "name": "Aylesbury Tub Filler...",
    "price": 2157.4,                     // Base price (may differ from variants)
    "images": ["https://..."],
    "variants": [...]                    // Array of all variants
  },
  "metadata": {
    "variant_specific": false  // ❌ No variant-specific extraction
  }
}
```

## Field Mapping Reference

| Salesforce Field | API Response Field | Example Value | Notes |
|-----------------|-------------------|---------------|-------|
| `Ferguson_Model_Number__c` | `detail.model_no` | `"2400-4273/24"` | **Must use model_no not model** |
| `Ferguson_Finish__c` | `detail.finish` | `"Polished Gold (PVD)"` | Variant finish name |
| `Ferguson_Color__c` | `detail.color` | `"D4AF37"` | Hex color code |
| `Ferguson_Price__c` | `detail.price` | `2157.4` | Variant-specific price |
| `Ferguson_Title__c` | `detail.name` | `"Aylesbury Tub Filler..."` | Product name |
| `Ferguson_In_Stock__c` | `detail.variant_in_stock` | `false` | Variant stock status |
| `Ferguson_Shipping_Lead_Time__c` | `detail.variant_shipping_lead_time` | `"4 to 7 weeks"` | Variant shipping |

## Workflow

1. **Search:** Salesforce calls `/search-ferguson` with model `"2400-4273/24"`
2. **Match:** API finds exact variant match and returns `best_match_url` with `uid=3425924`
3. **Detail:** Salesforce calls `/product-detail-ferguson` with the `best_match_url`
4. **Extract:** API detects `uid` parameter, finds matching variant, promotes variant data
5. **Map:** Salesforce `parseDetails()` maps `detail.model_no`, `detail.finish`, `detail.color`, etc.
6. **Update:** Salesforce updates Product_Catalog__c with variant-specific data

## Testing

### Test Case 1: Polished Gold Variant
```bash
# Search
curl -X POST 'http://cxc-ai.com:8000/search-ferguson' \
  -H 'X-API-KEY: catbot123' \
  -d '{"search": "2400-4273/24"}'

# Returns: best_match_url with uid=3425924

# Detail (use the best_match_url)
curl -X POST 'http://cxc-ai.com:8000/product-detail-ferguson' \
  -H 'X-API-KEY: catbot123' \
  -d '{"url": "https://www.fergusonhome.com/newport-brass-2400-4273/s1288730?uid=3425924"}'

# Returns:
# model_no: "2400-4273/24"
# finish: "Polished Gold (PVD)"
# color: "D4AF37"
# price: 2157.4
```

### Test Case 2: Antique Brass Variant
```bash
# Search
curl -X POST 'http://cxc-ai.com:8000/search-ferguson' \
  -H 'X-API-KEY: catbot123' \
  -d '{"search": "2400-4273/06"}'

# Returns: best_match_url with uid=3426433

# Detail
curl -X POST 'http://cxc-ai.com:8000/product-detail-ferguson' \
  -H 'X-API-KEY: catbot123' \
  -d '{"url": "https://www.fergusonhome.com/newport-brass-2400-4273/s1288730?uid=3426433"}'

# Returns:
# model_no: "2400-4273/06"
# finish: "Antique Brass"
# color: "ac823a"
# price: 1775.9  (different price!)
```

## Deployment Status

- **API Changes:** ✅ Deployed (2025-12-08 02:42:14 UTC)
- **Git Commit:** cf13944 "Add variant-specific detail extraction based on UID parameter"
- **Server:** Production (198.211.105.43:8000)
- **Salesforce Updates:** ⏳ **REQUIRED** - Apex class needs field mapping updates

## Next Steps

1. Update Salesforce Apex `parseDetails()` method to use `detail.model_no` instead of `detail.model`
2. Add mapping for `detail.finish` → `Ferguson_Finish__c`
3. Add mapping for `detail.color` → `Ferguson_Color__c`
4. Test with variant models (e.g., `2400-4273/24`, `45885NI`)
5. Verify Salesforce catalog shows variant-specific data
