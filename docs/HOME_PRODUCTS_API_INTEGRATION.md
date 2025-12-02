# Home Products Portal - API Integration Guide
**For Salesforce & External Developers**

## Overview
This guide provides instructions for integrating the Home Products AI Enrichment API into Salesforce or other external systems. This API enriches home improvement product data across 8 departments using Master Schema v1.0 with 100+ attributes.

---

## API Endpoint

### Base URL
```
Production: https://ai-catlog-bot.onrender.com
```

### Endpoint
```http
POST /enrich-home-product
```

---

## Authentication

All API requests require authentication using an API key in the request headers.

### Required Header
```http
X-API-KEY: your-api-key-here
```

### API Keys

| Environment | API Key | Usage |
|-------------|---------|-------|
| **Development/Testing** | `test123` | Use for local development and testing |
| **Production** | `catbot123` | Use for production Salesforce integration |

**Note:** Use `test123` for local testing. For production Salesforce deployments, use `catbot123`. Keep these keys secure and never commit them to version control.

---

## Request Format

### HTTP Method
`POST`

### Content Type
```http
Content-Type: application/json
```

### Request Body

```json
{
  "model_number": "string (REQUIRED)",
  "brand": "string (optional)",
  "description": "string (optional)"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model_number` | string | **YES** | The manufacturer's model number (primary identifier) |
| `brand` | string | No | Brand name (helps speed up identification) |
| `description` | string | No | Brief product description (e.g., "Kitchen Faucet", "Ceiling Light") |

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "product_identity": {
      "brand": "string",
      "model_number": "string",
      "mpn": "string",
      "sku": "string",
      "upc_ean_gtin": "string",
      "product_title": "string",
      "product_type": "string",
      "department": "string",
      "category": "string",
      "subcategory": "string",
      "series_collection": "string",
      "msrp_price": "string"
    },
    "dimensions": {
      "overall_height": "string",
      "overall_width": "string",
      "overall_depth": "string",
      "overall_length": "string",
      "overall_diameter": "string",
      "weight": "string",
      "package_dimensions": "string"
    },
    "material_construction": {
      "primary_material": "string",
      "secondary_materials": ["string"],
      "body_material": "string",
      "construction_type": "string",
      "quality_grade": "string"
    },
    "finish_color": {
      "finish_name": "string",
      "finish_type": "string",
      "color": "string",
      "available_finishes": ["string"],
      "finish_warranty": "string"
    },
    "mechanical_plumbing": {
      "flow_rate_gpm": "string",
      "water_pressure_psi": "string",
      "valve_type": "string",
      "spout_reach": "string",
      "spout_height": "string",
      "spray_functions": ["string"],
      "drain_assembly": "string"
    },
    "electrical_specs": {
      "voltage": "string",
      "wattage": "string",
      "amperage": "string",
      "plug_type": "string",
      "cord_length": "string",
      "power_source": "string"
    },
    "lighting_specs": {
      "lumens": "string",
      "color_temperature_kelvin": "string",
      "cri": "string",
      "bulb_type": "string",
      "number_of_bulbs": "string",
      "bulbs_included": "string",
      "dimmable": "string"
    },
    "hvac_performance": {
      "btu_rating": "string",
      "seer2_rating": "string",
      "eer_rating": "string",
      "cfm": "string",
      "cooling_capacity": "string",
      "heating_capacity": "string",
      "noise_level_db": "string"
    },
    "installation": {
      "mounting_type": "string",
      "installation_method": "string",
      "installation_location": "string",
      "required_hole_size": "string",
      "number_of_holes": "string",
      "clearance_requirements": "string",
      "installation_difficulty": "string",
      "installation_time": "string"
    },
    "compatibility": {
      "compatible_systems": ["string"],
      "sink_compatibility": "string",
      "countertop_compatibility": "string",
      "valve_compatibility": "string",
      "supply_line_connection": "string",
      "drain_compatibility": "string"
    },
    "environmental": {
      "watersense_certified": "boolean",
      "energy_star_certified": "boolean",
      "eco_friendly_features": ["string"],
      "water_efficiency": "string",
      "energy_efficiency": "string"
    },
    "certifications": {
      "ada_compliant": "boolean",
      "nsf_certified": "boolean",
      "ul_listed": "boolean",
      "csa_certified": "boolean",
      "iapmo_certified": "boolean",
      "other_certifications": ["string"]
    },
    "ai_enrichment": {
      "completeness_score": "number (0-100)",
      "enriched_at": "ISO 8601 timestamp",
      "ai_provider": "string (openai|xai)",
      "confidence_score": "number (0-100)",
      "marketing_description": "string",
      "key_features": ["string"],
      "use_cases": ["string"],
      "target_audience": "string",
      "competitive_advantages": ["string"]
    },
    "filtering": {
      "tags": ["string"],
      "search_keywords": ["string"],
      "filters": {
        "price_range": "string",
        "style": "string",
        "room": "string",
        "feature_flags": ["string"]
      }
    }
  },
  "metadata": {
    "ai_provider": "string",
    "response_time": "number (seconds)",
    "ai_processing_time": "number (seconds)",
    "completeness": "number (0-100)",
    "model_number": "string",
    "brand": "string",
    "description": "string"
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Model number is required"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "All AI providers failed. Primary: [error], Fallback: [error]"
}
```

---

## Supported Product Departments

The API enriches products across these departments:

1. **Bathroom** - Faucets, showerheads, toilets, vanities
2. **Kitchen** - Faucets, sinks, disposals, accessories
3. **Lighting** - Ceiling lights, chandeliers, LED fixtures
4. **Bath** - Bathtubs, shower systems, accessories
5. **Fans** - Ceiling fans, exhaust fans, ventilation
6. **Hardware** - Door hardware, cabinet pulls, hinges
7. **Outdoor** - Outdoor lighting, fixtures, accessories
8. **HVAC** - Heating, ventilation, air conditioning units

---

## Example Requests

### Example 1: Kitchen Faucet (Minimal)

```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "model_number": "7594SRS"
  }'
```

### Example 2: Bathroom Faucet (With Brand & Description)

```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "model_number": "2559-DST",
    "brand": "Delta",
    "description": "Trinsic bathroom faucet"
  }'
```

### Example 3: Ceiling Light

```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "model_number": "CH2D046BK16-UPS",
    "brand": "Kichler",
    "description": "Modern ceiling light"
  }'
```

---

## Salesforce Integration (Apex)

### Apex Class Example

```apex
public class HomeProductEnrichmentService {
    
    // Store API credentials in Custom Metadata or Named Credentials
    private static final String API_URL = 'https://ai-catlog-bot.onrender.com/enrich-home-product';
    private static final String API_KEY = 'catbot123'; // Production: catbot123, Development: test123
    
    /**
     * Enrich a home product by model number
     * @param modelNumber - The product model number (required)
     * @param brand - The brand name (optional)
     * @param description - Product description (optional)
     * @return Map<String, Object> - Enriched product data
     */
    public static Map<String, Object> enrichHomeProduct(
        String modelNumber, 
        String brand, 
        String description
    ) {
        
        // Validate required field
        if (String.isBlank(modelNumber)) {
            throw new IllegalArgumentException('Model number is required');
        }
        
        // Build request body
        Map<String, Object> requestBody = new Map<String, Object>{
            'model_number' => modelNumber
        };
        
        if (String.isNotBlank(brand)) {
            requestBody.put('brand', brand);
        }
        
        if (String.isNotBlank(description)) {
            requestBody.put('description', description);
        }
        
        // Create HTTP request
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_URL);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-KEY', API_KEY);
        req.setBody(JSON.serialize(requestBody));
        req.setTimeout(120000); // 2 minutes timeout
        
        // Send request
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // Parse response
        Map<String, Object> responseMap = 
            (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        
        // Check for success
        if (res.getStatusCode() == 200 && (Boolean) responseMap.get('success')) {
            return (Map<String, Object>) responseMap.get('data');
        } else {
            throw new CalloutException(
                'Enrichment failed: ' + responseMap.get('error')
            );
        }
    }
    
    /**
     * Enrich and update a Product record
     * @param productId - Salesforce Product2 record ID
     */
    public static void enrichProductRecord(Id productId) {
        
        // Query product record
        Product2 product = [
            SELECT Id, ProductCode, Name, Brand__c, Description 
            FROM Product2 
            WHERE Id = :productId 
            LIMIT 1
        ];
        
        // Call enrichment API
        Map<String, Object> enrichedData = enrichHomeProduct(
            product.ProductCode,
            product.Brand__c,
            product.Description
        );
        
        // Extract product identity
        Map<String, Object> identity = 
            (Map<String, Object>) enrichedData.get('product_identity');
        
        // Extract dimensions
        Map<String, Object> dimensions = 
            (Map<String, Object>) enrichedData.get('dimensions');
        
        // Extract AI enrichment
        Map<String, Object> aiData = 
            (Map<String, Object>) enrichedData.get('ai_enrichment');
        
        // Update product record (customize fields to match your org)
        product.Name = (String) identity.get('product_title');
        product.Brand__c = (String) identity.get('brand');
        product.Department__c = (String) identity.get('department');
        product.Category__c = (String) identity.get('category');
        product.UPC__c = (String) identity.get('upc_ean_gtin');
        product.MSRP__c = Decimal.valueOf((String) identity.get('msrp_price'));
        
        // Store AI-generated content
        product.Marketing_Description__c = (String) aiData.get('marketing_description');
        product.AI_Completeness_Score__c = (Decimal) aiData.get('completeness_score');
        
        // Store dimensions
        product.Height__c = (String) dimensions.get('overall_height');
        product.Width__c = (String) dimensions.get('overall_width');
        product.Depth__c = (String) dimensions.get('overall_depth');
        
        // Store full enriched data as JSON (optional)
        product.Enriched_Data_JSON__c = JSON.serialize(enrichedData);
        
        update product;
    }
    
    /**
     * Batch enrich multiple products
     * @param modelNumbers - List of model numbers to enrich
     */
    @future(callout=true)
    public static void batchEnrichProducts(List<String> modelNumbers) {
        
        for (String modelNumber : modelNumbers) {
            try {
                Map<String, Object> data = enrichHomeProduct(modelNumber, null, null);
                System.debug('Enriched: ' + modelNumber);
                // Process data as needed
            } catch (Exception e) {
                System.debug('Error enriching ' + modelNumber + ': ' + e.getMessage());
            }
        }
    }
}
```

### Trigger Example (Auto-Enrich on Product Creation)

```apex
trigger ProductTrigger on Product2 (after insert, after update) {
    
    Set<Id> productIdsToEnrich = new Set<Id>();
    
    for (Product2 product : Trigger.new) {
        
        // Only enrich if model number exists and record not yet enriched
        if (String.isNotBlank(product.ProductCode) && 
            String.isBlank(product.Enriched_Data_JSON__c)) {
            productIdsToEnrich.add(product.Id);
        }
    }
    
    // Enrich in future method (async)
    if (!productIdsToEnrich.isEmpty()) {
        ProductEnrichmentQueueable.enqueueEnrichment(productIdsToEnrich);
    }
}
```

### Lightning Component Example (Aura)

```javascript
// ProductEnrichmentController.js
({
    enrichProduct : function(component, event, helper) {
        
        var modelNumber = component.get("v.modelNumber");
        var brand = component.get("v.brand");
        var description = component.get("v.description");
        
        // Validate
        if (!modelNumber) {
            helper.showToast("Error", "Model number is required", "error");
            return;
        }
        
        // Show spinner
        component.set("v.isLoading", true);
        
        // Call Apex
        var action = component.get("c.enrichHomeProduct");
        action.setParams({
            modelNumber: modelNumber,
            brand: brand,
            description: description
        });
        
        action.setCallback(this, function(response) {
            component.set("v.isLoading", false);
            var state = response.getState();
            
            if (state === "SUCCESS") {
                var data = response.getReturnValue();
                component.set("v.enrichedData", data);
                helper.showToast("Success", "Product enriched!", "success");
            } else {
                var errors = response.getError();
                helper.showToast("Error", errors[0].message, "error");
            }
        });
        
        $A.enqueueAction(action);
    }
})
```

---

## Rate Limits & Performance

### Response Time
- **Average:** 15-25 seconds per request
- **Maximum timeout:** 120 seconds recommended

### Rate Limits
- No hard rate limits currently enforced
- Recommended: Max 10 concurrent requests
- For bulk processing: Implement queuing system

### Best Practices
1. **Cache Results** - Store enriched data to avoid redundant API calls
2. **Async Processing** - Use background jobs for bulk enrichment
3. **Error Handling** - Implement retry logic with exponential backoff
4. **Validation** - Always validate model_number before calling API

---

## Error Handling

### Common Errors

| Status Code | Error | Solution |
|-------------|-------|----------|
| 401 | Invalid API key | Verify API key is correct |
| 400 | Model number is required | Ensure model_number field is provided |
| 500 | AI providers failed | Retry request or contact support |
| 503 | Service unavailable | Backend may be starting, wait 30 seconds and retry |

### Retry Strategy Example (Apex)

```apex
public static Map<String, Object> enrichWithRetry(String modelNumber, Integer maxRetries) {
    
    Integer attempt = 0;
    Integer delayMs = 1000; // Start with 1 second
    
    while (attempt < maxRetries) {
        try {
            return enrichHomeProduct(modelNumber, null, null);
        } catch (Exception e) {
            attempt++;
            if (attempt >= maxRetries) {
                throw e;
            }
            
            // Exponential backoff
            System.debug('Retry attempt ' + attempt + ', waiting ' + delayMs + 'ms');
            // In production, use Queueable/Schedulable for delays
            delayMs *= 2;
        }
    }
    
    return null;
}
```

---

## Data Usage Guidelines

### Data You Receive

All enriched data can be:
- ✅ Stored in your Salesforce org
- ✅ Displayed to end users
- ✅ Used for product catalogs
- ✅ Integrated into e-commerce systems
- ✅ Used for search and filtering
- ✅ Exported for analytics

### Restrictions

- ❌ **No Admin Access** - API users cannot access admin panel or system controls
- ❌ **No Metrics Access** - Cannot view AI usage statistics or other users' data
- ❌ **No Configuration Changes** - Cannot modify API settings or AI providers
- ✅ **Read-Only Portal Access** - Can view frontend portal at https://ai-catlog-bot.vercel.app/home-products.html

---

## Support & Contact

### API Issues
- Response time > 2 minutes
- Incorrect enrichment data
- Authentication errors

### Getting API Access
Contact your system administrator to:
1. Request API key
2. Configure Named Credentials in Salesforce
3. Get production endpoint URLs

---

## Testing

### Test Endpoint
```
Production: https://ai-catlog-bot.onrender.com/health
```

### Health Check
```bash
curl https://ai-catlog-bot.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "ai_providers": {
    "openai": {
      "enabled": true,
      "model": "gpt-4o-mini"
    },
    "xai": {
      "enabled": true,
      "model": "grok-2-latest"
    }
  },
  "primary_provider": "openai"
}
```

### Test Products

Use these for testing:

| Model Number | Brand | Type | Expected Department |
|--------------|-------|------|-------------------|
| 2559-DST | Delta | Bathroom Faucet | Bath |
| 7594SRS | Moen | Kitchen Faucet | Kitchen |
| CH2D046BK16-UPS | Kichler | Ceiling Light | Lighting |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2025 | Initial release - Home Products Portal API |

---

## Master Schema v1.0 Coverage

This API implements **Master Product Data Schema v1.0** with sections A through L:

- **Section A:** Product Identity (12 attributes)
- **Section B:** Physical Dimensions (7 attributes)
- **Section C:** Material & Finish (10 attributes)
- **Section D:** Technical Specifications (28 attributes across 4 categories)
- **Section E:** Installation Requirements (8 attributes)
- **Section F:** Compatibility (6 attributes)
- **Section G:** Environmental Ratings (5 attributes)
- **Section H:** Certifications & Compliance (6 attributes)
- **Section K:** AI-Generated Enrichment (9 attributes)
- **Section L:** Filtering & Search (4+ attributes)

**Total:** 100+ structured attributes covering 8 product departments

---

**Ready to integrate? Contact your administrator for API credentials!**
