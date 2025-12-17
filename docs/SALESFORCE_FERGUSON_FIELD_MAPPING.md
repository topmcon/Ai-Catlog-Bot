# Salesforce Ferguson API - Complete Field Mapping Guide

## Overview
This document provides the complete mapping between Ferguson API response fields and Salesforce Product_Catalog__c custom fields. Use this guide to update the Apex class `parseDetails()` method to correctly map variant-specific data.

---

## Critical Issue: Variant Model Numbers

### Current Problem
**Salesforce Field:** `Ferguson_Model_Number__c`  
**Current Value:** `2400-4273` (base model only)  
**Expected Value:** `2400-4273/24` (variant model with finish suffix)

### Root Cause
The Apex code is using the wrong API response field:
```apex
// WRONG - This returns base model without variant suffix
catalog.Ferguson_Model_Number__c = modeldata.detail.model;
```

### Solution
```apex
// CORRECT - This returns full variant model with suffix
if(modeldata.detail.model_no != null) {
    catalog.Ferguson_Model_Number__c = modeldata.detail.model_no;
}
```

---

## Complete Field Mapping Table

| Salesforce Field | Current Mapping | **CORRECT Mapping** | API Response Path | Example Value | Notes |
|-----------------|----------------|---------------------|-------------------|---------------|-------|
| **Ferguson_Model_Number__c** | ❌ `detail.model` | ✅ `detail.model_no` | `detail.model_no` | `"2400-4273/24"` | **CRITICAL: Must use model_no** |
| **Ferguson_Finish__c** | ❌ Not mapped | ✅ `detail.finish` | `detail.finish` | `"Polished Gold (PVD)"` | **NEW FIELD - Variant finish** |
| **Ferguson_Color__c** | ❌ Not mapped | ✅ `detail.color` | `detail.color` | `"D4AF37"` | **NEW FIELD - Hex color code** |
| **Ferguson_Title__c** | ✅ Correct | `detail.name` | `detail.name` | `"Aylesbury Tub Filler..."` | Product name |
| **Ferguson_Brand__c** | ✅ Correct | `detail.brand` | `detail.brand` | `"Newport Brass"` | Brand name |
| **Ferguson_Price__c** | ✅ Now variant-specific | `detail.price` | `detail.price` | `2157.4` | Variant price (varies by finish) |
| **Ferguson_Min_Price__c** | ✅ Correct | `detail.price_range.min` | `detail.price_range.min` | `1393.7` | Minimum variant price |
| **Ferguson_Max_Price__c** | ✅ Correct | `detail.price_range.max` | `detail.price_range.max` | `2795.0` | Maximum variant price |
| **Ferguson_URL__c** | ⚠️ Update recommended | `detail.variant_url` | `detail.variant_url` | `"https://...?uid=3425924"` | Use variant URL (includes uid) |
| **Ferguson_Base_Type__c** | ✅ Correct | `detail.base_type` | `detail.base_type` | `"Faucet"` | Product type |
| **Ferguson_Base_Category__c** | ✅ Correct | `detail.base_category` | `detail.base_category` | `"Plumbing"` | Base category |
| **Ferguson_Product_Type__c** | ✅ Correct | `detail.product_type` | `detail.product_type` | `"Faucet"` | Product type |
| **Ferguson_Business_Category__c** | ✅ Correct | `detail.business_category` | `detail.business_category` | `"Tub Faucets"` | Business category |
| **Ferguson_Description__c** | ✅ Correct | `detail.description` | `detail.description` | `"Olde English sensibility..."` | Product description |
| **Ferguson_Collection__c** | ✅ Correct | `detail.collection` | `detail.collection` | `"Aylesbury"` | Product collection |
| **Ferguson_Manufacturer_Warranty__c** | ✅ Correct | `detail.manufacturer_warranty` | `detail.manufacturer_warranty` | `"Limited Lifetime"` | Warranty info |
| **Ferguson_In_Stock__c** | ❌ Not mapped | ✅ `detail.variant_in_stock` | `detail.variant_in_stock` | `false` | **NEW - Variant stock status** |
| **Ferguson_Shipping_Lead_Time__c** | ❌ Not mapped | ✅ `detail.variant_shipping_lead_time` | `detail.variant_shipping_lead_time` | `"4 to 7 weeks"` | **NEW - Variant shipping** |

---

## New Variant-Specific Fields

These fields are **NOW AVAILABLE** in the API response (deployed 2025-12-08) and should be mapped:

### 1. Variant Model Number (CRITICAL)
```apex
// Maps to: Ferguson_Model_Number__c
// Current: "2400-4273" (WRONG)
// Should be: "2400-4273/24" (CORRECT)
if(modeldata.detail.model_no != null) {
    catalog.Ferguson_Model_Number__c = modeldata.detail.model_no;
}
```

### 2. Variant Finish (NEW)
```apex
// Maps to: Ferguson_Finish__c (create if doesn't exist)
// Value: "Polished Gold (PVD)", "Antique Brass", etc.
if(modeldata.detail.finish != null) {
    catalog.Ferguson_Finish__c = modeldata.detail.finish;
}
```

### 3. Variant Color (NEW)
```apex
// Maps to: Ferguson_Color__c (create if doesn't exist)
// Value: "D4AF37" (hex color code)
if(modeldata.detail.color != null) {
    catalog.Ferguson_Color__c = modeldata.detail.color;
}
```

### 4. Variant Stock Status (NEW)
```apex
// Maps to: Ferguson_In_Stock__c (create if doesn't exist)
// Value: true/false
if(modeldata.detail.variant_in_stock != null) {
    catalog.Ferguson_In_Stock__c = modeldata.detail.variant_in_stock;
}
```

### 5. Variant Shipping Lead Time (NEW)
```apex
// Maps to: Ferguson_Shipping_Lead_Time__c (create if doesn't exist)
// Value: "Leaves the Warehouse in 4 to 7 weeks"
if(modeldata.detail.variant_shipping_lead_time != null) {
    catalog.Ferguson_Shipping_Lead_Time__c = modeldata.detail.variant_shipping_lead_time;
}
```

### 6. Variant URL (RECOMMENDED)
```apex
// Maps to: Ferguson_URL__c
// Use variant-specific URL (includes uid parameter)
if(modeldata.detail.variant_url != null) {
    catalog.Ferguson_URL__c = modeldata.detail.variant_url;
} else {
    catalog.Ferguson_URL__c = modeldata.detail.url;  // Fallback to base URL
}
```

---

## Categories and Attributes (Related Objects)

### Ferguson Categories
**API Path:** `detail.categories[]`  
**Salesforce Object:** Related list (create records as needed)

Example values from API:
- `"Brands"`
- `"Newport Brass"`
- `"Tub Filler Faucets"`

### Ferguson Attributes
**API Path:** `detail.attributes[]` or `detail.specifications[]`  
**Salesforce Object:** Related list - Ferguson Attributes

Map each specification:
```apex
for(Object specObj : modeldata.detail.specifications) {
    Map<String, Object> spec = (Map<String, Object>) specObj;
    // Create Ferguson_Attribute__c record
    // Name = spec.get('name')
    // Value = spec.get('value')
    // Unit = spec.get('unit')
    // Description = spec.get('description')
}
```

### Ferguson Documents
**API Path:** `detail.resources[]` or `detail.documents[]`  
**Salesforce Object:** Related list - Ferguson Documents

Map each document:
```apex
for(Object docObj : modeldata.detail.resources) {
    Map<String, Object> doc = (Map<String, Object>) docObj;
    // Create Ferguson_Document__c record
    // Name = doc.get('name')
    // URL = doc.get('url')
    // Type = doc.get('type')
}
```

---

## Complete Apex Code Example

```apex
/**
 * Parse Ferguson product detail response and update Product_Catalog__c
 * @param response JSON response from /product-detail-ferguson endpoint
 * @param catalog Product_Catalog__c record to update
 */
public static void parseDetails(String response, Product_Catalog__c catalog) {
    Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response);
    
    if(!(Boolean)result.get('success')) {
        return;
    }
    
    Map<String, Object> detail = (Map<String, Object>) result.get('detail');
    Map<String, Object> metadata = (Map<String, Object>) result.get('metadata');
    
    // === CRITICAL FIX: Use model_no instead of model ===
    if(detail.get('model_no') != null) {
        catalog.Ferguson_Model_Number__c = (String) detail.get('model_no');
    }
    
    // === NEW: Variant Finish ===
    if(detail.get('finish') != null) {
        catalog.Ferguson_Finish__c = (String) detail.get('finish');
    }
    
    // === NEW: Variant Color ===
    if(detail.get('color') != null) {
        catalog.Ferguson_Color__c = (String) detail.get('color');
    }
    
    // === Basic Fields ===
    if(detail.get('name') != null) {
        catalog.Ferguson_Title__c = (String) detail.get('name');
    }
    
    if(detail.get('brand') != null) {
        catalog.Ferguson_Brand__c = (String) detail.get('brand');
    }
    
    // === Variant-Specific Price ===
    if(detail.get('price') != null) {
        catalog.Ferguson_Price__c = (Decimal) detail.get('price');
    }
    
    // === Price Range ===
    Map<String, Object> priceRange = (Map<String, Object>) detail.get('price_range');
    if(priceRange != null) {
        if(priceRange.get('min') != null) {
            catalog.Ferguson_Min_Price__c = (Decimal) priceRange.get('min');
        }
        if(priceRange.get('max') != null) {
            catalog.Ferguson_Max_Price__c = (Decimal) priceRange.get('max');
        }
    }
    
    // === NEW: Use variant URL if available ===
    if(detail.get('variant_url') != null) {
        catalog.Ferguson_URL__c = (String) detail.get('variant_url');
    } else if(detail.get('url') != null) {
        catalog.Ferguson_URL__c = (String) detail.get('url');
    }
    
    // === Product Classification ===
    if(detail.get('base_type') != null) {
        catalog.Ferguson_Base_Type__c = (String) detail.get('base_type');
    }
    
    if(detail.get('base_category') != null) {
        catalog.Ferguson_Base_Category__c = (String) detail.get('base_category');
    }
    
    if(detail.get('product_type') != null) {
        catalog.Ferguson_Product_Type__c = (String) detail.get('product_type');
    }
    
    if(detail.get('business_category') != null) {
        catalog.Ferguson_Business_Category__c = (String) detail.get('business_category');
    }
    
    // === Description ===
    if(detail.get('description') != null) {
        catalog.Ferguson_Description__c = (String) detail.get('description');
    }
    
    // === Collection ===
    if(detail.get('collection') != null) {
        catalog.Ferguson_Collection__c = (String) detail.get('collection');
    }
    
    // === Warranty ===
    // NOTE: Warranty field removed from API to prevent STRING_TOO_LONG errors
    // Use manufacturer_warranty for short warranty description
    if(detail.get('manufacturer_warranty') != null) {
        catalog.Ferguson_Manufacturer_Warranty__c = (String) detail.get('manufacturer_warranty');
    }
    
    // === NEW: Variant Stock Status ===
    if(detail.get('variant_in_stock') != null) {
        catalog.Ferguson_In_Stock__c = (Boolean) detail.get('variant_in_stock');
    }
    
    // === NEW: Variant Shipping Lead Time ===
    if(detail.get('variant_shipping_lead_time') != null) {
        catalog.Ferguson_Shipping_Lead_Time__c = (String) detail.get('variant_shipping_lead_time');
    }
    
    // === Dimensions (if needed) ===
    if(detail.get('width') != null) {
        catalog.Ferguson_Width__c = (String) detail.get('width');
    }
    
    if(detail.get('length') != null) {
        catalog.Ferguson_Length__c = (String) detail.get('length');
    }
    
    if(detail.get('height') != null) {
        catalog.Ferguson_Height__c = (String) detail.get('height');
    }
    
    if(detail.get('depth') != null) {
        catalog.Ferguson_Depth__c = (String) detail.get('depth');
    }
    
    if(detail.get('diameter') != null) {
        catalog.Ferguson_Diameter__c = (String) detail.get('diameter');
    }
    
    // === Update the record ===
    update catalog;
    
    // === Process Related Lists (specifications, documents, categories) ===
    processSpecifications(catalog.Id, detail);
    processDocuments(catalog.Id, detail);
    processCategories(catalog.Id, detail);
}
```

---

## Validation and Testing

### Test Case: 2400-4273/24 (Polished Gold)

**Before Fix:**
- Ferguson_Model_Number__c: `"2400-4273"` ❌
- Ferguson_Finish__c: `null` ❌
- Ferguson_Color__c: `null` ❌

**After Fix:**
- Ferguson_Model_Number__c: `"2400-4273/24"` ✅
- Ferguson_Finish__c: `"Polished Gold (PVD)"` ✅
- Ferguson_Color__c: `"D4AF37"` ✅
- Ferguson_Price__c: `2157.40` ✅
- Ferguson_URL__c: `"https://www.fergusonhome.com/newport-brass-2400-4273/s1288730?uid=3425924"` ✅

### Test Case: 2400-4273/06 (Antique Brass)

**After Fix:**
- Ferguson_Model_Number__c: `"2400-4273/06"` ✅
- Ferguson_Finish__c: `"Antique Brass"` ✅
- Ferguson_Color__c: `"ac823a"` ✅
- Ferguson_Price__c: `1775.90` ✅ (Note: Different price!)

---

## API Workflow

### Step 1: Search
```apex
// Salesforce calls searchFergusion()
String response = searchFergusion('2400-4273/24');
```

**API Returns:**
```json
{
  "products": [{
    "match_type": "exact_variant",
    "best_match_model": "2400-4273/24",
    "best_match_url": "https://www.fergusonhome.com/newport-brass-2400-4273/s1288730?uid=3425924"
  }]
}
```

### Step 2: Parse Variant URL
```apex
// Extract best_match_url from search response
String variantUrl = parseVariant(response, '2400-4273/24');
// Returns: "https://www.fergusonhome.com/newport-brass-2400-4273/s1288730?uid=3425924"
```

### Step 3: Get Product Detail
```apex
// Call detailFergusion() with variant URL (includes uid parameter)
String detailResponse = detailFergusion(variantUrl);
```

**API Returns (variant-specific data):**
```json
{
  "detail": {
    "model_no": "2400-4273/24",
    "finish": "Polished Gold (PVD)",
    "color": "D4AF37",
    "price": 2157.4,
    "variant_in_stock": false,
    "variant_shipping_lead_time": "Leaves the Warehouse in 4 to 7 weeks",
    "variant_url": "https://...?uid=3425924"
  },
  "metadata": {
    "variant_specific": true
  }
}
```

### Step 4: Update Salesforce
```apex
// Parse detail response and update catalog record
parseDetails(detailResponse, catalog);
```

---

## Required Salesforce Custom Fields

Create these custom fields on `Product_Catalog__c` object if they don't exist:

| Field API Name | Field Type | Length | Description |
|---------------|------------|--------|-------------|
| `Ferguson_Finish__c` | Text | 255 | Variant finish name (e.g., "Polished Gold (PVD)") |
| `Ferguson_Color__c` | Text | 20 | Variant color hex code (e.g., "D4AF37") |
| `Ferguson_In_Stock__c` | Checkbox | - | Variant stock availability |
| `Ferguson_Shipping_Lead_Time__c` | Text | 255 | Variant shipping lead time |

---

## Important Notes

1. **Always use `best_match_url` from search response** - This URL includes the `uid` parameter that tells the API which variant to return detailed data for.

2. **Field precedence:** The API promotes variant-specific fields to the top level (`model_no`, `finish`, `color`, `price`) when a `uid` is detected. Use these top-level fields, not the `variant_*` prefixed fields.

3. **Warranty field removed:** The `detail.warranty` field has been removed from API responses to prevent Salesforce STRING_TOO_LONG errors. Use `detail.manufacturer_warranty` instead for short warranty descriptions.

4. **Metadata indicator:** Check `metadata.variant_specific` to confirm the API returned variant-specific data:
   ```apex
   Map<String, Object> metadata = (Map<String, Object>) result.get('metadata');
   Boolean isVariantSpecific = (Boolean) metadata.get('variant_specific');
   ```

5. **Price differences:** Variant prices can vary significantly (e.g., `/24` = $2,157.40 vs `/06` = $1,775.90). Always use the variant-specific price.

---

## Deployment Checklist

- [ ] Update `parseDetails()` method to use `detail.model_no` instead of `detail.model`
- [ ] Add mapping for `detail.finish` → `Ferguson_Finish__c`
- [ ] Add mapping for `detail.color` → `Ferguson_Color__c`
- [ ] Add mapping for `detail.variant_in_stock` → `Ferguson_In_Stock__c`
- [ ] Add mapping for `detail.variant_shipping_lead_time` → `Ferguson_Shipping_Lead_Time__c`
- [ ] Update `detail.url` to use `detail.variant_url` when available
- [ ] Create missing custom fields on Product_Catalog__c object
- [ ] Test with variant models: `2400-4273/24`, `2400-4273/06`, `45885NI`
- [ ] Verify Salesforce shows correct variant model numbers with finish suffix
- [ ] Verify finish and color fields are populated
- [ ] Verify prices match variant-specific prices from Ferguson website

---

## Support

**API Documentation:** See `/docs/api/FERGUSON_API_GUIDE.md`  
**API Endpoint:** `https://cxc-ai.com:8000/product-detail-ferguson`  
**Git Commit:** cf13944 (deployed 2025-12-08 02:42:14 UTC)  
**Questions:** Contact backend development team

---

## Quick Reference: Before vs After

### BEFORE (Incorrect)
```apex
catalog.Ferguson_Model_Number__c = modeldata.detail.model;  // "2400-4273" ❌
// No finish mapping ❌
// No color mapping ❌
```

**Result in Salesforce:**
- Ferguson Model Number: `2400-4273` (missing /24 suffix)
- Ferguson Finish: `(empty)`
- Ferguson Color: `(empty)`

### AFTER (Correct)
```apex
catalog.Ferguson_Model_Number__c = modeldata.detail.model_no;  // "2400-4273/24" ✅
catalog.Ferguson_Finish__c = modeldata.detail.finish;          // "Polished Gold (PVD)" ✅
catalog.Ferguson_Color__c = modeldata.detail.color;            // "D4AF37" ✅
```

**Result in Salesforce:**
- Ferguson Model Number: `2400-4273/24` (correct variant)
- Ferguson Finish: `Polished Gold (PVD)` (variant finish)
- Ferguson Color: `D4AF37` (variant color)
