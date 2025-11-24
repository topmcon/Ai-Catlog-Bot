# 🔌 API Integration Guide

Complete guide for integrating the Catalog-BOT and Parts-BOT APIs into your systems.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Product Enrichment API](#product-enrichment-api)
3. [Parts Enrichment API](#parts-enrichment-api)
4. [Response Formats](#response-formats)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Rate Limits & Best Practices](#rate-limits--best-practices)

---

## 🔐 Authentication

All API requests require an API key in the header.

**Header Required:**
```
X-API-KEY: your-api-key-here
```

**Your API Key:** `catbot123`

---

## 📦 Product Enrichment API

### Endpoint
```
POST https://api.cxc-ai.com/enrich
```

### Request Format

**Headers:**
```
Content-Type: application/json
X-API-KEY: catbot123
```

**Request Body:**
```json
{
  "brand": "Samsung",
  "model_number": "RF28R7351SR"
}
```

**Field Descriptions:**
- `brand` (string, required): Brand name (e.g., "Samsung", "LG", "GE")
- `model_number` (string, required): Model number (e.g., "RF28R7351SR")

### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified_information": {
      "brand": "Samsung",
      "model_number": "RF28R7351SR",
      "product_name": "Samsung 28 cu. ft. 4-Door French Door Refrigerator",
      "upc": "887276302911",
      "manufacturer_part_number": "RF28R7351SR/AA",
      "model_year": 2019,
      "release_date": "2019-01-15",
      "discontinued": false,
      "country_of_origin": "South Korea"
    },
    "dimensions_and_weight": {
      "product_width": "35.75 inches",
      "product_depth": "36.5 inches",
      "product_height": "70 inches",
      "product_weight": "305 lbs",
      "shipping_weight": "330 lbs"
    },
    "packaging_specs": {
      "box_dimensions": "38 x 39 x 72 inches",
      "box_weight": "330 lbs",
      "units_per_pallet": 2,
      "pallet_dimensions": "40 x 48 x 74 inches"
    },
    "product_classification": {
      "category": "Appliances",
      "subcategory": "Refrigerators",
      "product_type": "French Door Refrigerator",
      "series": "Family Hub"
    },
    "performance_specs": {
      "voltage": "115V",
      "frequency": "60Hz",
      "amperage": "15A",
      "wattage": "850W",
      "energy_star_certified": true,
      "energy_star_version": "5.0",
      "estimated_yearly_energy_cost": "$65",
      "estimated_yearly_electricity_use": "659 kWh"
    },
    "capacity": {
      "total_capacity": "28 cu. ft.",
      "fresh_food_capacity": "18.6 cu. ft.",
      "freezer_capacity": "9.4 cu. ft."
    },
    "features": {
      "key_features": [
        "Family Hub touchscreen",
        "FlexZone drawer",
        "Twin Cooling Plus",
        "Ice and water dispenser",
        "LED lighting"
      ],
      "cooling_technology": "Twin Cooling Plus",
      "smart_features": ["WiFi connected", "Bixby voice control"],
      "water_filtration": "NSF certified filter"
    },
    "safety_and_compliance": {
      "ul_listed": true,
      "energy_star": true,
      "california_prop_65": false,
      "fcc_compliant": true
    },
    "warranty_info": {
      "standard_warranty": "1 year parts and labor",
      "compressor_warranty": "10 years",
      "sealed_system_warranty": "5 years"
    },
    "accessories": {
      "included_accessories": ["Ice tray", "Egg holder", "User manual"],
      "optional_accessories": ["Water filter", "Refrigerator mat"]
    },
    "installation_requirements": {
      "installation_type": "Freestanding",
      "water_line_required": true,
      "electrical_outlet": "Standard 115V outlet",
      "clearance_requirements": "1 inch on sides, 2 inches on top"
    },
    "product_attributes": {
      "color": "Stainless Steel",
      "finish": "Fingerprint resistant",
      "door_style": "French Door",
      "counter_depth": false,
      "built_in": false
    }
  },
  "error": null
}
```

**Error Response (400/401/500):**
```json
{
  "success": false,
  "data": null,
  "error": "Invalid API key"
}
```

---

## 🔧 Parts Enrichment API

### Endpoint
```
POST https://api.cxc-ai.com/enrich-part
```

### Request Format

**Headers:**
```
Content-Type: application/json
X-API-KEY: catbot123
```

**Request Body:**
```json
{
  "part_number": "WR17X11653",
  "brand": "GE"
}
```

**Field Descriptions:**
- `part_number` (string, required): OEM part number/MPN (e.g., "WR17X11653")
- `brand` (string, required): Brand name (e.g., "GE", "Whirlpool", "LG")

### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "core_identification": {
      "brand": "GE",
      "manufacturer": "General Electric",
      "part_name": "Refrigerator Water Inlet Valve",
      "part_number": "WR17X11653",
      "alternate_part_numbers": ["WR17X11653", "WR57X10051"],
      "upc": "084691802631",
      "condition": "New OEM",
      "is_oem": true
    },
    "product_title": {
      "product_title": "GE WR17X11653 Refrigerator Water Inlet Valve - Genuine OEM"
    },
    "availability": {
      "stock_status": "In Stock",
      "restock_eta": "Ships within 24 hours",
      "delivery_eta": "2-3 business days"
    },
    "key_details": {
      "category": "valve",
      "appliance_type": "refrigerator",
      "weight": "0.5 lbs",
      "product_dimensions": "3 x 2 x 2 inches",
      "color": "White",
      "material": "Plastic and metal",
      "warranty": "1 year manufacturer warranty"
    },
    "technical_specs": {
      "electrical": {
        "voltage": "120V AC",
        "amperage": "0.5A",
        "wattage": "10W",
        "resistance": "240 Ohm",
        "connector_type": "2-pin connector",
        "bulb_type": null,
        "lumens": null,
        "color_temperature": null
      },
      "mechanical": {
        "size": "3 inches length",
        "thread_size": "3/4 inch inlet/outlet",
        "flow_rate": "0.5 GPM",
        "psi_rating": "125 PSI max",
        "temperature_range": "32°F - 100°F",
        "capacity": null
      },
      "safety_compliance": {
        "prop65_warning": "No",
        "certifications": ["UL", "NSF", "CSA"]
      }
    },
    "compatibility": {
      "compatible_brands": ["GE", "Hotpoint", "RCA"],
      "compatible_models": [
        "GSH25JFXDWW",
        "GSH25JFXFWW",
        "PSE25KGHBCBB",
        "PSE25KGHBCWW"
      ],
      "compatible_appliance_types": ["refrigerator", "freezer"]
    },
    "cross_reference": {
      "replaces_part_numbers": ["WR57X10051", "PS2375660"],
      "superseded_part_numbers": ["WR17X10051"],
      "equivalent_parts": ["AP4345220", "1399105"]
    },
    "symptoms": {
      "symptoms": [
        "No water or ice dispensing",
        "Low water pressure",
        "Water leaking from valve",
        "Ice maker not working",
        "Clicking sound from valve"
      ]
    },
    "description": {
      "short_description": "Genuine GE water inlet valve that controls water flow to ice maker and dispenser",
      "long_description": "This is a genuine OEM water inlet valve for GE refrigerators. It electronically controls the flow of water to the ice maker and water dispenser. The valve opens when the dispenser paddle is pressed or when the ice maker needs water. If defective, you may experience no water flow, low pressure, leaking, or continuous water flow."
    },
    "installation": {
      "tools_required": ["Screwdriver", "Adjustable wrench", "Towel"],
      "installation_difficulty": "Moderate",
      "safety_notes": "Unplug refrigerator and turn off water supply before installation",
      "installation_steps": [
        "Unplug refrigerator from power outlet",
        "Turn off water supply valve",
        "Remove rear access panel",
        "Disconnect electrical connector and water lines",
        "Remove mounting screws and old valve",
        "Install new valve and reconnect lines",
        "Replace access panel and restore power"
      ],
      "documentation_url": "https://products.geappliances.com/appliance/gea-support-search-content?contentId=16716",
      "video_url": "https://www.youtube.com/watch?v=example"
    },
    "shipping_info": {
      "shipping_weight": "0.75 lbs",
      "shipping_dimensions": "4 x 3 x 3 inches",
      "estimated_ship_date": "Ships same day if ordered by 3pm EST",
      "handling_notes": "Fragile - handle with care"
    }
  },
  "metrics": {
    "provider": "openai",
    "response_time": "12.34s",
    "tokens_used": 2500,
    "completeness": "95.2%"
  },
  "error": null
}
```

**Error Response (400/401/500):**
```json
{
  "success": false,
  "data": null,
  "error": "Invalid API key",
  "metrics": null
}
```

---

## 📊 Response Formats

### Product Data Structure (12 Sections)

1. **verified_information** - Core product details
2. **dimensions_and_weight** - Physical measurements
3. **packaging_specs** - Shipping/box info
4. **product_classification** - Categories and type
5. **performance_specs** - Electrical and energy ratings
6. **capacity** - Volume/capacity measurements
7. **features** - Key features and technologies
8. **safety_and_compliance** - Certifications
9. **warranty_info** - Warranty details
10. **accessories** - Included and optional items
11. **installation_requirements** - Installation needs
12. **product_attributes** - Style and attributes

### Parts Data Structure (11 Sections)

1. **core_identification** - Part identification
2. **product_title** - SEO-friendly title
3. **availability** - Stock and delivery info
4. **key_details** - Category, type, dimensions
5. **technical_specs** - Electrical, mechanical, safety
6. **compatibility** - Compatible models/brands
7. **cross_reference** - Replaces/superseded numbers
8. **symptoms** - Problems this part fixes
9. **description** - Product descriptions
10. **installation** - Installation guide
11. **shipping_info** - Shipping details

---

## ⚠️ Error Handling

### Common Error Codes

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required field: brand"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "AI provider error: timeout"
}
```

### Best Practices

1. Always check `success` field first
2. Handle `null` values in response data
3. Implement retry logic for 500 errors
4. Log errors for debugging
5. Validate input before sending

---

## 💻 Code Examples

### JavaScript/Node.js

**Product Enrichment:**
```javascript
async function enrichProduct(brand, modelNumber) {
  const response = await fetch('https://api.cxc-ai.com/enrich', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'catbot123'
    },
    body: JSON.stringify({
      brand: brand,
      model_number: modelNumber
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Product data:', data.data);
    return data.data;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
}

// Usage
enrichProduct('Samsung', 'RF28R7351SR')
  .then(product => {
    console.log('Brand:', product.verified_information.brand);
    console.log('Model:', product.verified_information.model_number);
    console.log('Capacity:', product.capacity.total_capacity);
  })
  .catch(error => console.error('Failed:', error));
```

**Parts Enrichment:**
```javascript
async function enrichPart(partNumber, brand) {
  const response = await fetch('https://api.cxc-ai.com/enrich-part', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'catbot123'
    },
    body: JSON.stringify({
      part_number: partNumber,
      brand: brand
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Part data:', data.data);
    console.log('Metrics:', data.metrics);
    return data.data;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
}

// Usage
enrichPart('WR17X11653', 'GE')
  .then(part => {
    console.log('Part Name:', part.core_identification.part_name);
    console.log('Compatible Models:', part.compatibility.compatible_models);
    console.log('Symptoms Fixed:', part.symptoms.symptoms);
  })
  .catch(error => console.error('Failed:', error));
```

### Python

**Product Enrichment:**
```python
import requests
import json

def enrich_product(brand, model_number):
    url = "https://api.cxc-ai.com/enrich"
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": "catbot123"
    }
    payload = {
        "brand": brand,
        "model_number": model_number
    }
    
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    
    if data["success"]:
        return data["data"]
    else:
        raise Exception(f"API Error: {data['error']}")

# Usage
try:
    product = enrich_product("Samsung", "RF28R7351SR")
    print(f"Brand: {product['verified_information']['brand']}")
    print(f"Model: {product['verified_information']['model_number']}")
    print(f"Capacity: {product['capacity']['total_capacity']}")
except Exception as e:
    print(f"Error: {e}")
```

**Parts Enrichment:**
```python
import requests

def enrich_part(part_number, brand):
    url = "https://api.cxc-ai.com/enrich-part"
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": "catbot123"
    }
    payload = {
        "part_number": part_number,
        "brand": brand
    }
    
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    
    if data["success"]:
        return {
            "data": data["data"],
            "metrics": data["metrics"]
        }
    else:
        raise Exception(f"API Error: {data['error']}")

# Usage
try:
    result = enrich_part("WR17X11653", "GE")
    part = result["data"]
    metrics = result["metrics"]
    
    print(f"Part Name: {part['core_identification']['part_name']}")
    print(f"Category: {part['key_details']['category']}")
    print(f"Response Time: {metrics['response_time']}")
    print(f"Completeness: {metrics['completeness']}")
except Exception as e:
    print(f"Error: {e}")
```

### cURL

**Product Enrichment:**
```bash
curl -X POST "https://api.cxc-ai.com/enrich" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "brand": "Samsung",
    "model_number": "RF28R7351SR"
  }'
```

**Parts Enrichment:**
```bash
curl -X POST "https://api.cxc-ai.com/enrich-part" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "part_number": "WR17X11653",
    "brand": "GE"
  }'
```

### PHP

**Product Enrichment:**
```php
<?php
function enrichProduct($brand, $modelNumber) {
    $url = "https://api.cxc-ai.com/enrich";
    $headers = [
        "Content-Type: application/json",
        "X-API-KEY: catbot123"
    ];
    $payload = json_encode([
        "brand" => $brand,
        "model_number" => $modelNumber
    ]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($data["success"]) {
        return $data["data"];
    } else {
        throw new Exception("API Error: " . $data["error"]);
    }
}

// Usage
try {
    $product = enrichProduct("Samsung", "RF28R7351SR");
    echo "Brand: " . $product["verified_information"]["brand"] . "\n";
    echo "Model: " . $product["verified_information"]["model_number"] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

---

## 🚦 Rate Limits & Best Practices

### Response Times

- **Average Response:** 10-30 seconds per enrichment
- **Cold Start (first request):** 30-45 seconds (free tier)
- **Subsequent Requests:** 10-15 seconds

### Best Practices

1. **Implement Timeouts:**
   - Set 60-second timeout for requests
   - Handle timeout gracefully

2. **Cache Results:**
   - Cache enriched data to avoid duplicate calls
   - Update cache every 30-90 days

3. **Batch Processing:**
   - Process requests sequentially
   - Don't send parallel requests (can overload free tier)

4. **Error Retry Logic:**
   ```javascript
   async function enrichWithRetry(brand, model, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await enrichProduct(brand, model);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
       }
     }
   }
   ```

5. **Handle Null Values:**
   ```javascript
   const capacity = product?.capacity?.total_capacity ?? "Not available";
   ```

6. **Validate Input:**
   ```javascript
   function validateInput(brand, model) {
     if (!brand || brand.trim() === '') {
       throw new Error('Brand is required');
     }
     if (!model || model.trim() === '') {
       throw new Error('Model number is required');
     }
   }
   ```

---

## 📊 Additional Endpoints

### Health Check
```bash
GET https://api.cxc-ai.com/health
```

Returns:
```json
{
  "status": "healthy",
  "primary_provider": "openai"
}
```

### API Documentation
```
GET https://api.cxc-ai.com/docs
```
Interactive Swagger UI documentation.

---

## 💰 Cost Estimation

- **Product Enrichment:** ~$0.001 per call
- **Parts Enrichment:** ~$0.001 per call
- **Monthly Cost Examples:**
  - 100 requests: $0.10
  - 1,000 requests: $1.00
  - 10,000 requests: $10.00
  - 100,000 requests: $100.00

---

## 🔒 Security Notes

1. **Never expose API key in client-side code**
2. **Use environment variables for API key**
3. **Implement server-side proxy if needed**
4. **Rotate API key regularly**
5. **Monitor usage for suspicious activity**

---

## 📞 Support

**Issues or Questions:**
- Check API documentation: https://api.cxc-ai.com/docs
- Review error messages in response
- Test with example products/parts first
- Check backend logs in Render dashboard

**Example Test Data:**

Products:
- Samsung RF28R7351SR
- LG LRFVS3006S
- Whirlpool WRF535SWHZ

Parts:
- WR17X11653 (GE Water Valve)
- W10813429 (Whirlpool Filter)
- 5304506469 (Frigidaire Motor)

---

**API Version:** 1.0.0
**Last Updated:** November 23, 2025
**Base URL:** https://api.cxc-ai.com
