# Parts Bot API Documentation

## Base URL
```
Production: https://api.cxc-ai.com
```

## Authentication
All requests require API key in header:
```
X-API-KEY: test123
```

---

## Endpoints

### 1. Enrich Appliance Part
**Endpoint:** `POST /enrich-part`

**Description:** Enriches appliance parts data with detailed specifications, compatibility information, pricing, and technical details. Uses AI to research OEM parts across multiple databases.

#### Headers
```
Content-Type: application/json
X-API-KEY: test123
```

#### Request Body
```json
{
  "part_number": "REQUIRED - OEM part number (MPN)",
  "brand": "REQUIRED - Brand name (GE, LG, Whirlpool, etc.)"
}
```

#### Example Request (cURL)
```bash
curl -X POST https://api.cxc-ai.com/enrich-part \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "part_number": "WPW10312695",
    "brand": "Whirlpool"
  }'
```

#### Example Request (JavaScript)
```javascript
const response = await fetch('https://api.cxc-ai.com/enrich-part', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test123'
  },
  body: JSON.stringify({
    part_number: 'WPW10312695',
    brand: 'Whirlpool'
  })
});

const data = await response.json();
console.log(data);
```

#### Example Request (Python)
```python
import requests

url = "https://api.cxc-ai.com/enrich-part"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "test123"
}
payload = {
    "part_number": "WPW10312695",
    "brand": "Whirlpool"
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
    "core_identification": {
      "brand": "Whirlpool",
      "manufacturer": "Whirlpool Corporation",
      "part_name": "Dishwasher Drain Pump",
      "part_number": "WPW10312695",
      "part_title": "Whirlpool WPW10312695 Dishwasher Drain Pump - OEM Replacement Part",
      "alternate_part_numbers": ["W10348269", "W10312695", "AP6020066"],
      "upc": "883049450926",
      "condition": "New OEM",
      "is_oem": true,
      "price": "$89.99",
      "price_confidence": "verified",
      "price_sources": ["partselect", "repairclinic", "searspartsdirect"],
      "price_source_count": 3,
      "price_verified": true,
      "verified_by": "openai"
    },
    "product_title": {
      "product_title": "Whirlpool WPW10312695 Dishwasher Drain Pump - OEM Replacement Part"
    },
    "availability": {
      "stock_status": "In Stock",
      "restock_eta": null,
      "delivery_eta": "Ships within 1-2 business days"
    },
    "key_details": {
      "category": "Pump",
      "appliance_type": "Dishwasher",
      "weight": "1.2 lbs",
      "product_dimensions": "5.5\" × 4\" × 3.5\"",
      "color": "Black/Gray",
      "material": "Plastic housing with metal impeller",
      "warranty": "1 Year Manufacturer Warranty"
    },
    "technical_specifications": {
      "electrical": {
        "voltage": "120V AC",
        "amperage": "0.5A",
        "wattage": "60W",
        "resistance": null,
        "connector_type": "2-pin connector",
        "bulb_type": null,
        "lumens": null,
        "color_temperature": null
      },
      "mechanical": {
        "size": "5.5\" diameter",
        "thread_size": null,
        "flow_rate": "8 GPM",
        "psi_rating": "25 PSI max",
        "temperature_range": "40°F - 160°F",
        "capacity": null
      },
      "safety_compliance": {
        "prop65_warning": "This product contains chemicals known to the State of California to cause cancer",
        "certifications": ["UL Listed", "CSA Certified", "OEM Approved"]
      }
    },
    "compatibility": {
      "compatible_brands": ["Whirlpool", "KitchenAid", "Kenmore", "Maytag"],
      "compatible_models": [
        "KDFE104DSS",
        "KDFE104HPS",
        "KDTE334GPS",
        "WDF520PADM",
        "WDT730PAHZ",
        "665.13242K900",
        "MDB8959SKZ"
      ],
      "model_families": [
        "Whirlpool Gold Series",
        "KitchenAid Architect Series II",
        "Kenmore Elite"
      ],
      "serial_number_ranges": null,
      "year_range": "2010-Present",
      "notes": "Replaces older pump models W10348269 and W10312695. Compatible with most Whirlpool-family dishwashers manufactured after 2010."
    },
    "installation": {
      "difficulty": "Moderate",
      "estimated_time": "30-45 minutes",
      "tools_required": ["Phillips screwdriver", "Flathead screwdriver", "Towels", "Pliers"],
      "professional_required": false,
      "video_guides_available": true,
      "instructions_url": "https://www.partselect.com/Models/WPW10312695/",
      "installation_tips": [
        "Disconnect power before starting",
        "Remove lower dish rack and spray arm",
        "Bail out water from sump area",
        "Disconnect drain hose and wire harness",
        "Remove pump mounting screws and replace pump",
        "Reconnect all connections and test for leaks"
      ]
    },
    "common_symptoms": [
      "Dishwasher not draining",
      "Water pooling at bottom of dishwasher",
      "Humming noise during drain cycle",
      "E1 or F1 error code",
      "Dishes not getting clean (due to standing water)"
    ],
    "images": {
      "primary_image_url": "https://www.partselect.com/images/product/p02891408-00-l.jpg",
      "additional_images": [
        "https://www.partselect.com/images/product/p02891408-01-l.jpg",
        "https://www.partselect.com/images/product/p02891408-02-l.jpg"
      ],
      "diagram_url": "https://www.partselect.com/PartDetail/Diagram/WPW10312695/"
    },
    "manufacturer_support": {
      "support_phone": "1-800-253-1301",
      "support_website": "https://www.whirlpool.com/services/parts-and-accessories.html",
      "support_email": "parts@whirlpool.com",
      "manuals_url": "https://www.whirlpool.com/owners.html"
    },
    "shipping_info": {
      "ships_from": "Warehouse",
      "shipping_class": "Standard Ground",
      "free_shipping_eligible": true,
      "expedited_available": true,
      "international_shipping": false
    }
  },
  "metrics": {
    "provider": "openai",
    "response_time": "2.87s",
    "tokens_used": 1850,
    "completeness": "92.3%",
    "verification_rate": "83.3%",
    "verified_fields": "10/12"
  }
}
```

#### Response Fields

**Success Indicator:**
- `success`: Boolean indicating if enrichment was successful

**Data Object:**

1. **core_identification** - Core part identification
   - brand, manufacturer, part_name, part_number, part_title
   - alternate_part_numbers (array of superseded/alternate numbers)
   - upc, condition, is_oem
   - **Price with verification:** price, price_confidence, price_sources, price_source_count, price_verified
   - verified_by (AI provider)

2. **product_title** - SEO-friendly product title
   - product_title

3. **availability** - Stock and delivery information
   - stock_status, restock_eta, delivery_eta

4. **key_details** - Key product details
   - category, appliance_type, weight, product_dimensions
   - color, material, warranty

5. **technical_specifications** - Technical specs
   - **electrical:** voltage, amperage, wattage, resistance, connector_type, bulb_type, lumens, color_temperature
   - **mechanical:** size, thread_size, flow_rate, psi_rating, temperature_range, capacity
   - **safety_compliance:** prop65_warning, certifications

6. **compatibility** - Compatibility information
   - compatible_brands, compatible_models (array)
   - model_families, serial_number_ranges, year_range
   - notes (compatibility details)

7. **installation** - Installation guidance
   - difficulty, estimated_time, tools_required (array)
   - professional_required, video_guides_available
   - instructions_url, installation_tips (array)

8. **common_symptoms** - Array of problems this part fixes

9. **images** - Product images
   - primary_image_url, additional_images (array), diagram_url

10. **manufacturer_support** - Manufacturer contact info
    - support_phone, support_website, support_email, manuals_url

11. **shipping_info** - Shipping details
    - ships_from, shipping_class, free_shipping_eligible
    - expedited_available, international_shipping

**Metrics Object:**
- `provider`: Which AI was used (openai/xai)
- `response_time`: Total AI processing time
- `tokens_used`: Number of tokens consumed
- `completeness`: Data completeness percentage
- `verification_rate`: Percentage of critical fields verified from 2+ sources
- `verified_fields`: Count of verified fields vs total critical fields

#### Price Verification Rules

The API validates part pricing against **authorized sources only**:

**Authorized Sources:**
- OEM/Manufacturer website
- PartSelect
- RepairClinic
- Sears Parts Direct
- AppliancePartsPros
- Genuine Replacement Parts

**Verification Logic:**
- **Verified (2+ sources match)**: Returns price with `price_verified: true`
- **Single source only**: Returns `price: null` (not reliable)
- **Conflicting sources**: Returns `price: null` (cannot determine)
- **No sources found**: Returns `price: null`

**Response includes:**
- `price_sources`: Array of actual source names found
- `price_source_count`: Number of sources (0, 2, 3+)
- `price_verified`: true only if 2+ sources agree

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

### 2. Get Parts AI Metrics
**Endpoint:** `GET /parts-ai-metrics`

**Description:** Get AI performance metrics for parts enrichment.

#### Headers
```
X-API-KEY: test123
```

#### Example Request
```bash
curl https://api.cxc-ai.com/parts-ai-metrics \
  -H "X-API-KEY: test123"
```

#### Response
```json
{
  "openai": {
    "total_requests": 875,
    "successful": 841,
    "failed": 34,
    "success_rate": "96.11%",
    "avg_response_time": "2.654s",
    "avg_completeness": "91.2%"
  },
  "xai": {
    "total_requests": 34,
    "successful": 31,
    "failed": 3,
    "success_rate": "91.18%",
    "avg_response_time": "3.021s",
    "avg_completeness": "88.7%"
  }
}
```

---

### 3. Health Check
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
| **API Key** | `test123` | `test123` (unchanged) |
| **Endpoint** | `/enrich-part` | `/enrich-part` (unchanged) |
| **AI Providers** | OpenAI only | OpenAI (primary) + xAI (fallback) |
| **Response** | Basic data | Includes verification metadata |
| **Price Validation** | Single source accepted | Requires 2+ sources or returns null |
| **Deployment** | Render/Vercel | Self-hosted VPS (198.211.105.43) |

---

## Testing

### Quick Test
```bash
# Health Check
curl https://api.cxc-ai.com/health

# Full Enrichment Test
curl -X POST https://api.cxc-ai.com/enrich-part \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"part_number": "WPW10312695", "brand": "Whirlpool"}'
```

### Test with Different Part Types

**Pump:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-part \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"part_number": "WPW10312695", "brand": "Whirlpool"}'
```

**Filter:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-part \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"part_number": "DA29-00020B", "brand": "Samsung"}'
```

**Heating Element:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-part \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"part_number": "W10518394", "brand": "Whirlpool"}'
```

**Control Board:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-part \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"part_number": "WPW10310240", "brand": "Whirlpool"}'
```

---

## Common Part Categories

The Parts Bot API supports enrichment for all appliance part types:

- **Pumps & Motors** - Drain pumps, circulation pumps, fan motors
- **Heating Elements** - Oven elements, dryer elements, water heater elements
- **Filters** - Water filters, air filters, lint filters
- **Control Boards** - Main control boards, user interface boards
- **Switches & Sensors** - Temperature sensors, door switches, pressure switches
- **Gaskets & Seals** - Door gaskets, pump seals, O-rings
- **Valves** - Water inlet valves, gas valves, drain valves
- **Racks & Shelves** - Dishwasher racks, refrigerator shelves
- **Igniters & Spark Modules** - Oven igniters, surface burner igniters
- **Belts & Rollers** - Dryer belts, drum rollers, idler pulleys

---

## Support

- **Production API:** https://api.cxc-ai.com
- **Frontend Portal:** https://cxc-ai.com/parts.html
- **Server:** 198.211.105.43
- **SSL Certificate:** Valid until Feb 22, 2026

For issues or questions, contact your development team.
