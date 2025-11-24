# Home Products API Documentation

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

### 1. Enrich Home Product
**Endpoint:** `POST /enrich-home-product`

**Description:** Enriches home product data for Plumbing, Kitchen, Lighting, Bath, Fans, Hardware, Cabinet Hardware, Outdoor, and HVAC products using Master Product Data Schema v1.0 (Sections A-L).

#### Headers
```
Content-Type: application/json
X-API-KEY: test123
```

#### Request Body
```json
{
  "model_number": "REQUIRED - Product model number",
  "brand": "OPTIONAL - Brand name (helps AI identification)",
  "description": "OPTIONAL - Brief description (helps AI identification)"
}
```

#### Example Request (cURL)
```bash
curl -X POST https://api.cxc-ai.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "model_number": "K-10433-CP",
    "brand": "Kohler",
    "description": "Kitchen Faucet"
  }'
```

#### Example Request (JavaScript)
```javascript
const response = await fetch('https://api.cxc-ai.com/enrich-home-product', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test123'
  },
  body: JSON.stringify({
    model_number: 'K-10433-CP',
    brand: 'Kohler',
    description: 'Kitchen Faucet'
  })
});

const data = await response.json();
console.log(data);
```

#### Example Request (Python)
```python
import requests

url = "https://api.cxc-ai.com/enrich-home-product"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "test123"
}
payload = {
    "model_number": "K-10433-CP",
    "brand": "Kohler",
    "description": "Kitchen Faucet"
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
    "product_identity": {
      "brand": "Kohler",
      "model_number": "K-10433-CP",
      "mpn": "K-10433-CP",
      "sku": null,
      "upc_ean_gtin": "885612345678",
      "product_title": "Kohler Forte Kitchen Faucet with Pullout Spray",
      "product_type": "Kitchen Faucet",
      "department": "Kitchen",
      "category": "Kitchen Faucets",
      "subcategory": "Single Handle Pull-Out",
      "series_collection": "Forte",
      "msrp_price": "$349.00"
    },
    "physical_dimensions": {
      "overall_height": "10.5 inches",
      "overall_width": "8.75 inches",
      "overall_depth": "2.5 inches",
      "product_weight": "4.5 lbs",
      "shipping_weight": "6.2 lbs",
      "shipping_length": "18 inches",
      "shipping_width": "12 inches",
      "shipping_height": "8 inches"
    },
    "material_construction": {
      "primary_material": "Brass",
      "secondary_materials": ["Stainless Steel", "Plastic"],
      "surface_treatment": "PVD Coating"
    },
    "technical_specifications": {
      "flow_rate": "1.8 GPM",
      "water_pressure_range": "20-80 PSI",
      "temperature_range": "40-180°F",
      "electrical_requirements": null,
      "connection_type": "3/8 inch compression",
      "valve_type": "Ceramic Disc"
    },
    "installation_requirements": {
      "mounting_type": "Deck Mount",
      "number_of_holes": "1 or 3 hole",
      "rough_in_dimensions": "Standard",
      "installation_difficulty": "Moderate",
      "tools_required": ["Basin wrench", "Adjustable wrench", "Screwdriver"],
      "professional_installation_recommended": false
    },
    "finish_appearance": {
      "finish_name": "Polished Chrome",
      "finish_code": "CP",
      "color_family": "Silver/Chrome",
      "style_aesthetic": "Contemporary",
      "available_finishes": ["CP - Polished Chrome", "VS - Vibrant Stainless", "BN - Brushed Nickel"]
    },
    "certifications_compliance": {
      "ul_listed": true,
      "csa_certified": true,
      "energy_star": false,
      "watersense": true,
      "ada_compliant": false,
      "california_title_20": true,
      "california_prop_65": "Contains lead (compliant with federal Safe Drinking Water Act)",
      "nsf_ansi_61": true
    },
    "warranty_support": {
      "warranty_length": "Lifetime Limited",
      "warranty_coverage": "Faucet and finish",
      "manufacturer_support_phone": "1-800-4-KOHLER",
      "manufacturer_website": "www.kohler.com",
      "replacement_parts_available": true
    },
    "features_technology": {
      "key_features": [
        "Pull-out spray head",
        "Pause button on spray head",
        "MasterClean sprayface",
        "High-arch spout",
        "Single lever handle"
      ],
      "innovative_technologies": [
        "ProMotion technology for smooth operation",
        "Sweep spray for powerful cleaning"
      ],
      "user_benefits": [
        "Easy to clean sprayface",
        "Flexible installation options",
        "Water-saving flow rate"
      ]
    },
    "compatibility_integration": {
      "compatible_accessories": ["Soap dispenser", "Side spray", "Air gap"],
      "sink_compatibility": "Standard kitchen sinks",
      "system_integration": null
    },
    "performance_efficiency": {
      "energy_efficiency_rating": null,
      "water_efficiency": "1.8 GPM WaterSense certified",
      "noise_level": "Quiet operation",
      "lifespan_durability": "Lifetime durability with proper maintenance"
    },
    "environmental_sustainability": {
      "recyclable_materials": "Brass and stainless steel components recyclable",
      "eco_certifications": ["WaterSense"],
      "water_savings": "20% reduction vs. standard 2.2 GPM faucets",
      "carbon_footprint": "Low - durable construction reduces replacement needs"
    },
    "confidence_score": 87.5
  },
  "metadata": {
    "ai_provider": "openai",
    "response_time": 3.45,
    "ai_processing_time": 2.89,
    "completeness": 87.5,
    "verification_rate": 0.78,
    "verified_fields": "14/18",
    "model_number": "K-10433-CP",
    "brand": "Kohler",
    "description": "Kitchen Faucet"
  }
}
```

#### Response Fields

**Success Indicator:**
- `success`: Boolean indicating if enrichment was successful

**Data Object** - Master Product Data Schema (Sections A-L):

1. **product_identity** (Section A) - Core product identification
   - brand, model_number, mpn, sku, upc_ean_gtin
   - product_title, product_type, department, category, subcategory
   - series_collection, msrp_price

2. **physical_dimensions** (Section B) - Size and weight specifications
   - Product dimensions: overall_height, overall_width, overall_depth, product_weight
   - Shipping dimensions: shipping_weight, shipping_length, shipping_width, shipping_height

3. **material_construction** (Section B) - Material details
   - primary_material, secondary_materials, surface_treatment

4. **technical_specifications** (Section C) - Technical details
   - flow_rate, water_pressure_range, temperature_range
   - electrical_requirements, connection_type, valve_type

5. **installation_requirements** (Section D) - Installation info
   - mounting_type, number_of_holes, rough_in_dimensions
   - installation_difficulty, tools_required, professional_installation_recommended

6. **finish_appearance** (Section E) - Aesthetic information
   - finish_name, finish_code, color_family, style_aesthetic, available_finishes

7. **certifications_compliance** (Section F) - Standards and certifications
   - ul_listed, csa_certified, energy_star, watersense, ada_compliant
   - california_title_20, california_prop_65, nsf_ansi_61

8. **warranty_support** (Section G) - Warranty and support
   - warranty_length, warranty_coverage, manufacturer_support_phone
   - manufacturer_website, replacement_parts_available

9. **features_technology** (Section H) - Features and innovations
   - key_features, innovative_technologies, user_benefits

10. **compatibility_integration** (Section I) - Compatibility info
    - compatible_accessories, sink_compatibility, system_integration

11. **performance_efficiency** (Section J) - Performance metrics
    - energy_efficiency_rating, water_efficiency, noise_level, lifespan_durability

12. **environmental_sustainability** (Section K) - Sustainability info
    - recyclable_materials, eco_certifications, water_savings, carbon_footprint

13. **confidence_score** - AI confidence percentage (0-100)

**Metadata Object:**
- `ai_provider`: Which AI was used (openai/xai)
- `response_time`: Total API response time (seconds)
- `ai_processing_time`: Time spent on AI enrichment (seconds)
- `completeness`: Data completeness percentage
- `verification_rate`: Percentage of critical fields verified from 2+ sources
- `verified_fields`: Count of verified fields vs total critical fields
- `model_number`, `brand`, `description`: Echo of request parameters

#### Error Response
```json
{
  "detail": "Invalid API key"
}
```

**Status Codes:**
- `200 OK` - Successful enrichment
- `400 Bad Request` - Missing or invalid model_number
- `401 Unauthorized` - Invalid or missing API key
- `500 Internal Server Error` - AI provider failure

---

### 2. Get Home Products AI Metrics
**Endpoint:** `GET /home-products-ai-metrics`

**Description:** Get AI performance metrics for home products enrichment.

#### Headers
```
X-API-KEY: test123
```

#### Example Request
```bash
curl https://api.cxc-ai.com/home-products-ai-metrics \
  -H "X-API-KEY: test123"
```

#### Response
```json
{
  "openai": {
    "total_requests": 150,
    "successful": 145,
    "failed": 5,
    "success_rate": "96.67%",
    "avg_response_time": "2.847s",
    "avg_completeness": "87.34%"
  },
  "xai": {
    "total_requests": 5,
    "successful": 5,
    "failed": 0,
    "success_rate": "100.00%",
    "avg_response_time": "3.124s",
    "avg_completeness": "84.21%"
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
| **Endpoint** | `/enrich-home-product` | `/enrich-home-product` (unchanged) |
| **AI Providers** | OpenAI only | OpenAI (primary) + xAI (fallback) |
| **Response** | Basic data | Includes verification metadata |
| **Deployment** | Render/Vercel | Self-hosted VPS (198.211.105.43) |

---

## Testing

### Quick Test
```bash
# Health Check
curl https://api.cxc-ai.com/health

# Full Enrichment Test
curl -X POST https://api.cxc-ai.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"model_number": "K-10433-CP", "brand": "Kohler"}'
```

### Test with Different Product Types

**Plumbing:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"model_number": "K-596-CP", "brand": "Kohler", "description": "Bathroom Faucet"}'
```

**Kitchen:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"model_number": "KPF-1610SS", "brand": "Kraus", "description": "Kitchen Faucet"}'
```

**Lighting:**
```bash
curl -X POST https://api.cxc-ai.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{"model_number": "CH2D084BK10", "brand": "Progress Lighting", "description": "Chandelier"}'
```

---

## Support

- **Production API:** https://api.cxc-ai.com
- **Frontend Portal:** https://cxc-ai.com/home-products.html
- **Server:** 198.211.105.43
- **SSL Certificate:** Valid until Feb 22, 2026

For issues or questions, contact your development team.
