# Catalog Bot API Documentation

## Base URL
```
Production: https://api.cxc-ai.com
```

## Authentication
All requests require API key in header:
```
X-API-KEY: catbot123
```

---

## Endpoints

### 1. Enrich Product (Catalog)
**Endpoint:** `POST /enrich`

**Description:** Enriches appliance product catalog data with comprehensive specifications, dimensions, features, and compliance information. Uses AI to research and validate product information from multiple authoritative sources.

#### Headers
```
Content-Type: application/json
X-API-KEY: catbot123
```

#### Request Body
```json
{
  "brand": "REQUIRED - Brand name (e.g., GE, Viking, Sub-Zero)",
  "model_number": "REQUIRED - Product model number"
}
```

#### Example Request (cURL)
```bash
curl -X POST https://api.cxc-ai.com/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "brand": "Viking",
    "model_number": "VGSC5366BSS"
  }'
```

#### Example Request (JavaScript)
```javascript
const response = await fetch('https://api.cxc-ai.com/enrich', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'catbot123'
  },
  body: JSON.stringify({
    brand: 'Viking',
    model_number: 'VGSC5366BSS'
  })
});

const data = await response.json();
console.log(data);
```

#### Example Request (Python)
```python
import requests

url = "https://api.cxc-ai.com/enrich"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "catbot123"
}
payload = {
    "brand": "Viking",
    "model_number": "VGSC5366BSS"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)
```

#### Response Structure
```json
{
  "success": true,
  "data": {
    "verified_information": {
      "brand": "Viking",
      "model_number": "VGSC5366BSS",
      "product_title": "Viking 36\" Professional 5 Series Gas Range - Stainless Steel",
      "series_collection": "Professional 5 Series",
      "finish_color": "Stainless Steel",
      "upc_gtin": "0123456789012",
      "sku_internal": null,
      "mpn": "VGSC5366BSS",
      "country_of_origin": "United States",
      "release_year": "2022",
      "msrp_price": "$8,999.00",
      "msrp_confidence": "verified",
      "msrp_sources": ["manufacturer", "ajmadison", "ferguson"],
      "msrp_source_count": 3,
      "msrp_verified": true,
      "verified_by": "openai"
    },
    "product_dimensions": {
      "height": "36.5 inches",
      "width": "35.875 inches",
      "depth": "27.875 inches",
      "depth_with_door_open": "50 inches",
      "cutout_height": "36 inches",
      "cutout_width": "35.875 inches",
      "cutout_depth": "24 inches"
    },
    "clearance_requirements": {
      "top_clearance": "30 inches to combustibles",
      "back_clearance": "0 inches",
      "side_clearance": "6 inches to combustibles",
      "door_swing_clearance": "25 inches"
    },
    "weight": {
      "product_weight": "385 lbs",
      "shipping_weight": "425 lbs"
    },
    "packaging_specs": {
      "box_height": "42 inches",
      "box_width": "40 inches",
      "box_depth": "32 inches",
      "box_weight": "425 lbs",
      "palletized_weight": null,
      "pallet_dimensions": null
    },
    "product_classification": {
      "department": "Appliances",
      "category": "Ranges",
      "subcategory": "Gas Ranges",
      "product_type": "Professional Gas Range",
      "style": "Professional/Commercial",
      "installation_type": "Freestanding"
    },
    "capacity_configuration": {
      "total_capacity": "5.1 cu. ft.",
      "oven_capacity_primary": "5.1 cu. ft.",
      "oven_capacity_secondary": null,
      "number_of_burners": "6",
      "burner_configuration": "4 sealed burners + 2 center burners"
    },
    "performance_specs": {
      "btu_total": "73,000 BTU",
      "btu_per_burner": ["23,000 BTU", "18,000 BTU", "15,000 BTU", "12,000 BTU"],
      "oven_temperature_range": "300°F - 550°F",
      "broiler_btu": "18,000 BTU",
      "convection": true,
      "convection_type": "TruConvection"
    },
    "energy_efficiency": {
      "energy_star_certified": false,
      "estimated_annual_energy_use": "225 kWh",
      "fuel_type": "Natural Gas",
      "gas_connection": "1/2 inch NPT",
      "electrical_requirements": "120V, 15A"
    },
    "key_features": [
      "6 sealed burners with continuous grates",
      "TruConvection technology",
      "Self-cleaning oven",
      "Heavy-duty cast iron grates",
      "Electronic ignition",
      "Porcelain oven interior",
      "Interior oven light"
    ],
    "included_accessories": [
      "Oven racks (3)",
      "Broiler pan",
      "Grates",
      "LP conversion kit"
    ],
    "certifications_compliance": {
      "csa_certified": true,
      "ul_listed": true,
      "ada_compliant": false,
      "california_prop_65": "This product contains chemicals known to the State of California to cause cancer",
      "energy_star": false
    },
    "warranty": {
      "warranty_length": "1 Year Full / 5 Years Limited on sealed system",
      "parts_warranty": "1 Year",
      "labor_warranty": "1 Year",
      "sealed_system_warranty": "5 Years"
    },
    "installation_notes": {
      "installation_complexity": "Professional installation required",
      "gas_line_required": true,
      "electrical_required": true,
      "anti_tip_device_included": true,
      "ventilation_required": true,
      "recommended_hood_cfm": "600+ CFM"
    },
    "special_instructions": "Requires natural gas connection. LP conversion kit included. Professional installation strongly recommended."
  },
  "verification": {
    "summary": "High verification rate - 14 of 18 critical fields verified from 2+ sources",
    "rate": 77.8,
    "verified_count": 14,
    "total_critical_fields": 18
  }
}
```

#### Response Fields

**Success Indicator:**
- `success`: Boolean indicating if enrichment was successful

**Data Object:**

1. **verified_information** - Core product identification
   - brand, model_number, product_title, series_collection
   - finish_color, upc_gtin, sku_internal, mpn
   - country_of_origin, release_year
   - **MSRP with verification:** msrp_price, msrp_confidence, msrp_sources, msrp_source_count, msrp_verified
   - verified_by (AI provider)

2. **product_dimensions** - Physical dimensions
   - height, width, depth, depth_with_door_open
   - cutout_height, cutout_width, cutout_depth

3. **clearance_requirements** - Installation clearances
   - top_clearance, back_clearance, side_clearance, door_swing_clearance

4. **weight** - Weight specifications
   - product_weight, shipping_weight

5. **packaging_specs** - Packaging information
   - box_height, box_width, box_depth, box_weight
   - palletized_weight, pallet_dimensions

6. **product_classification** - Product categorization
   - department, category, subcategory, product_type
   - style, installation_type

7. **capacity_configuration** - Capacity details
   - total_capacity, oven_capacity_primary, oven_capacity_secondary
   - number_of_burners, burner_configuration

8. **performance_specs** - Performance specifications
   - btu_total, btu_per_burner, oven_temperature_range
   - broiler_btu, convection, convection_type

9. **energy_efficiency** - Energy information
   - energy_star_certified, estimated_annual_energy_use
   - fuel_type, gas_connection, electrical_requirements

10. **key_features** - Array of key product features

11. **included_accessories** - Array of included accessories

12. **certifications_compliance** - Standards and certifications
    - csa_certified, ul_listed, ada_compliant
    - california_prop_65, energy_star

13. **warranty** - Warranty information
    - warranty_length, parts_warranty, labor_warranty, sealed_system_warranty

14. **installation_notes** - Installation requirements
    - installation_complexity, gas_line_required, electrical_required
    - anti_tip_device_included, ventilation_required, recommended_hood_cfm

15. **special_instructions** - Additional installation/usage notes

**Verification Object:**
- `summary`: Human-readable verification summary
- `rate`: Verification percentage (0-100)
- `verified_count`: Number of critical fields verified from 2+ sources
- `total_critical_fields`: Total number of critical fields checked

#### MSRP Verification Rules

The API validates MSRP against **authorized sources only**:

**Authorized Sources (checked in order):**
1. Manufacturer's official website
2. AJ Madison
3. Ferguson
4. Best Buy
5. Costco
6. Home Depot
7. Lowes

**Verification Logic:**
- **Verified (2+ sources match)**: Returns MSRP with `msrp_verified: true`
- **Single source only**: Returns `msrp_price: null` (not reliable)
- **Conflicting sources**: Returns `msrp_price: null` (cannot determine)
- **No sources found**: Returns `msrp_price: null`

**Response includes:**
- `msrp_sources`: Array of actual source names found
- `msrp_source_count`: Number of sources (0, 2, 3+)
- `msrp_verified`: true only if 2+ sources agree

#### Error Response
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**Status Codes:**
- `200 OK` - Successful enrichment
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid or missing API key
- `500 Internal Server Error` - AI provider failure

---

### 2. Get AI Metrics
**Endpoint:** `GET /ai-metrics`

**Description:** Get AI performance metrics comparing OpenAI and xAI providers.

#### Headers
```
X-API-KEY: catbot123
```

#### Example Request
```bash
curl https://api.cxc-ai.com/ai-metrics \
  -H "X-API-KEY: catbot123"
```

#### Response
```json
{
  "openai": {
    "total_requests": 1250,
    "successful_requests": 1198,
    "failed_requests": 52,
    "success_rate": "95.84%",
    "avg_response_time": "3.247s",
    "avg_completeness": "89.3%",
    "total_tokens_used": 2450000,
    "avg_tokens": 2045
  },
  "xai": {
    "total_requests": 52,
    "successful_requests": 48,
    "failed_requests": 4,
    "success_rate": "92.31%",
    "avg_response_time": "3.891s",
    "avg_completeness": "86.7%",
    "total_tokens_used": 98000,
    "avg_tokens": 2041
  },
  "recommendation": {
    "preferred_provider": "openai",
    "reason": "OpenAI shows significantly better overall performance",
    "performance_scores": {
      "openai": 87.34,
      "xai": 79.21
    }
  }
}
```

---

### 3. Reset AI Metrics
**Endpoint:** `POST /ai-metrics/reset`

**Description:** Reset all AI performance metrics (admin only).

#### Headers
```
X-API-KEY: catbot123
```

#### Example Request
```bash
curl -X POST https://api.cxc-ai.com/ai-metrics/reset \
  -H "X-API-KEY: catbot123"
```

#### Response
```json
{
  "success": true,
  "message": "All AI metrics have been reset",
  "timestamp": "2025-11-24T20:45:32.123456"
}
```

---

### 4. Health Check
**Endpoint:** `GET /health`

**Description:** Check API health and AI provider status.

#### Example Request
```bash
curl https://api.cxc-ai.com/health
```

#### Response
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

---

## Key Changes from Previous Setup

| Aspect | Previous | Current |
|--------|----------|---------|
| **Base URL** | Render/Vercel URLs | `https://api.cxc-ai.com` |
| **SSL** | Platform-managed | Self-hosted with Let's Encrypt |
| **API Key** | `catbot123` | `catbot123` (unchanged) |
| **Endpoint** | `/enrich` | `/enrich` (unchanged) |
| **AI Providers** | OpenAI only | OpenAI (primary) + xAI (fallback) |
| **Response** | Basic data | Includes verification metadata |
| **MSRP Validation** | Single source accepted | Requires 2+ sources or returns null |
| **Deployment** | Render/Vercel | Self-hosted VPS (198.211.105.43) |

---

## Testing

### Quick Test
```bash
# Health Check
curl https://api.cxc-ai.com/health

# Full Enrichment Test
curl -X POST https://api.cxc-ai.com/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"brand": "Viking", "model_number": "VGSC5366BSS"}'
```

### Test with Different Appliances

**Range:**
```bash
curl -X POST https://api.cxc-ai.com/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"brand": "GE", "model_number": "JGB735SPSS"}'
```

**Refrigerator:**
```bash
curl -X POST https://api.cxc-ai.com/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"brand": "Sub-Zero", "model_number": "BI-42SID/S/TH"}'
```

**Dishwasher:**
```bash
curl -X POST https://api.cxc-ai.com/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"brand": "Bosch", "model_number": "SHPM88Z75N"}'
```

---

## Support

- **Production API:** https://api.cxc-ai.com
- **Frontend Portal:** https://cxc-ai.com/index-catalog.html
- **Server:** 198.211.105.43
- **SSL Certificate:** Valid until Feb 22, 2026

For issues or questions, contact your development team.
