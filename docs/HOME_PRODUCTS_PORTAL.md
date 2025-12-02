# Home Products Portal Documentation
## Master Product Data Schema v1.0

## Overview
The Home Products Portal is an AI-powered enrichment system designed for **Plumbing, Kitchen, Lighting, Bath, Fans, Hardware, Cabinet Hardware, Outdoor, and HVAC** products. It uses a comprehensive master schema covering 12 sections (A-L) with 100+ product attributes.

## Portal Access
- **Live URL**: https://ai-catlog-bot.vercel.app/home-products.html
- **Backend API**: https://ai-catlog-bot.onrender.com
- **API Endpoint**: `/enrich-home-product`

## Supported Departments
1. 🚰 **Bathroom** - Faucets, sinks, toilets, showers, tubs
2. 🍳 **Kitchen** - Faucets, sinks, fixtures, accessories
3. 💡 **Lighting** - Ceiling lights, pendants, chandeliers, LED fixtures
4. 🛁 **Bath** - Shower systems, bathtubs, accessories
5. 🌀 **Fans** - Ceiling fans, exhaust fans, ventilation
6. 🪛 **Hardware** - Handles, knobs, pulls, hinges
7. 🚪 **Cabinet Hardware** - Cabinet pulls, knobs, drawer slides
8. 🏡 **Outdoor** - Outdoor lighting, fixtures, hardware
9. ❄️ **HVAC** - Heating, ventilation, air conditioning systems

## Input Requirements

### Required Field
- **Model Number** (REQUIRED) - The manufacturer's model number
  - Primary identifier for product lookup
  - Examples: `2559-DST`, `K-596-CP`, `7594ESRS`, `LX1500`

### Optional Helper Fields
- **Brand** (Optional) - Helps narrow down search faster
  - Examples: `Delta`, `Kohler`, `Moen`, `GE`
- **Description** (Optional) - Brief product description to aid identification
  - Examples: `Kitchen Faucet`, `Ceiling Light`, `Shower Head`

## Master Schema - Sections A through L

### Section A - Product Identity
Every product contains these core identifiers:
- Brand
- Model Number
- MPN (Manufacturer Part Number)
- SKU
- UPC/EAN/GTIN
- Product Title
- Product Type
- Department
- Category
- Subcategory
- Series/Collection
- MSRP Price

### Section B - Physical Attributes

#### Dimensions
- Overall Height (product-specific)
- Overall Width (product-specific)
- Overall Depth (product-specific)
- Product Weight
- Shipping Weight
- Shipping Dimensions (L x W x H)

#### Material & Construction
- Primary Material
- Secondary Materials
- Surface Treatment/Coating (PVD, Lacquer, Powder Coat, etc.)

#### Finish & Color
- Color
- Finish Name
- Finish Family (Matte Black, Chrome, Brushed Nickel, Brass, White, etc.)
- Sheen Level (Matte/Satin/Polished)
- Color Variants

### Section C - Technical/Performance Attributes
AI automatically determines which specs apply to each product type:

#### Mechanical/Plumbing (for plumbing products)
- Flow Rate (GPM)
- Pressure Range (PSI)
- Valve Type
- Connection Size
- Drain Size
- Water Temperature Range
- Water Inlet/Outlet Positions
- Capacity (gallons)

#### Electrical (for powered products)
- Voltage (120V/240V/12V/24V)
- Amperage
- Wattage
- Frequency (50/60Hz)
- Energy Consumption
- Motor Type

#### Lighting (for lighting products)
- Lumens
- Color Temperature (Kelvin)
- CRI (Color Rendering Index)
- Wattage per Bulb
- Bulb Type (LED/Incandescent/etc.)
- Number of Bulbs
- Dimmable (Yes/No)

#### HVAC Performance (for HVAC products)
- BTU
- SEER2
- HSPF2
- EER
- CFM
- Refrigerant Type

### Section D - Installation Attributes
- Installation Type (Wall/Floor/Deck/Ceiling/Undermount)
- Mounting Type (Recessed/Surface/Flush)
- Hardware Included
- Mounting Hardware Type
- Rough-In Requirements
- Cutout Dimensions
- Minimum Clearance Requirements
- Wiring Type (Hardwire/Plug-in)
- Included Accessories
- Additional Required Parts

### Section E - Compatibility & Requirements
- Compatible Valves
- Compatible Trims
- Required Rough-in Number
- Compatible Doors/Door Thickness
- Replacement Part Numbers
- Fuel Type Compatibility (Propane/Natural Gas/Electric)
- Smart Home Compatibility (Alexa, Google, SmartThings, etc.)

### Section F - Environmental Ratings
- Indoor/Outdoor Rated
- Wet/Damp/Dry Location Rated
- Heat Resistance
- UV Resistance
- Ingress Protection (IP) Rating

### Section G - Certifications & Compliance
- ADA Compliant
- WaterSense
- UL/ETL Listed
- CSA Listed
- Energy Star
- AHRI Certified
- Title 24
- NSF
- ASME

### Section K - AI Enrichment Fields
AI-generated marketing and SEO content:
- 4-10 Key Features (bullet points)
- 1-Sentence Highlight
- Detailed Product Description
- Why This Product? (value proposition)
- Fitment Notes
- Compatibility Notes
- Installation Notes
- SEO Title
- SEO Meta Description
- SEO Keywords
- Collection Story (if applicable)

### Section L - Filtering Fields
For faceted navigation and search:
- Brand, Finish, Material
- Price Range
- Width, Height, Depth
- Flow Rate, CFM, BTU
- Voltage, Room Size
- Style, Mounting Type
- Special Features
- Certifications
- Smart Features
- Color Temperature
- Bulb Type
- Number of Handles
- Hole Configuration
- Indoor/Outdoor

## API Usage

### Endpoint
```
POST https://ai-catlog-bot.onrender.com/enrich-home-product
```

### Headers
```
Content-Type: application/json
X-API-KEY: catbot123
```

### Request Body
```json
{
  "model_number": "2559-DST",
  "brand": "Delta",
  "description": "Kitchen Faucet"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "product_identity": {
      "brand": "Delta",
      "model_number": "2559-DST",
      "product_title": "Delta 2559-DST Leland Pull-Down Kitchen Faucet",
      "department": "Kitchen",
      "category": "Faucets",
      ...
    },
    "dimensions": {...},
    "material_construction": {...},
    "finish_color": {...},
    "mechanical_plumbing": {...},
    "electrical_specs": {...},
    "lighting_specs": {...},
    "hvac_performance": {...},
    "installation": {...},
    "compatibility": {...},
    "environmental": {...},
    "certifications": {...},
    "ai_enrichment": {
      "key_features": [...],
      "one_sentence_highlight": "...",
      "detailed_description": "...",
      ...
    },
    "filtering": {...},
    "enriched_at": "2025-11-24T00:45:12.345678",
    "ai_provider": "openai",
    "confidence_score": 100.0
  },
  "metadata": {
    "ai_provider": "openai",
    "response_time": 17.96,
    "ai_processing_time": 15.23,
    "completeness": 100.0,
    "model_number": "2559-DST",
    "brand": "Delta",
    "description": "Kitchen Faucet"
  }
}
```

## Code Examples

### JavaScript/Node.js
```javascript
const enrichHomeProduct = async (modelNumber, brand = null, description = null) => {
  const response = await fetch('https://ai-catlog-bot.onrender.com/enrich-home-product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'catbot123'
    },
    body: JSON.stringify({
      model_number: modelNumber,
      brand: brand,
      description: description
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Product Title:', data.data.product_identity.product_title);
    console.log('Department:', data.data.product_identity.department);
    console.log('Completeness:', data.metadata.completeness + '%');
    return data.data;
  } else {
    throw new Error(data.error);
  }
};

// Usage
enrichHomeProduct('2559-DST', 'Delta', 'Kitchen Faucet')
  .then(product => console.log(product))
  .catch(err => console.error(err));
```

### Python
```python
import requests

def enrich_home_product(model_number, brand=None, description=None):
    url = 'https://ai-catlog-bot.onrender.com/enrich-home-product'
    headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': 'catbot123'
    }
    payload = {
        'model_number': model_number,
        'brand': brand,
        'description': description
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    if data['success']:
        print(f"Product: {data['data']['product_identity']['product_title']}")
        print(f"Department: {data['data']['product_identity']['department']}")
        print(f"Completeness: {data['metadata']['completeness']}%")
        return data['data']
    else:
        raise Exception(data['error'])

# Usage
product = enrich_home_product('2559-DST', 'Delta', 'Kitchen Faucet')
```

### cURL
```bash
curl -X POST https://ai-catlog-bot.onrender.com/enrich-home-product \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "model_number": "2559-DST",
    "brand": "Delta",
    "description": "Kitchen Faucet"
  }'
```

## Example Products

### Kitchen Faucet - Delta
```json
{
  "model_number": "2559-DST",
  "brand": "Delta",
  "description": "Kitchen Faucet"
}
```

### Bathroom Faucet - Kohler
```json
{
  "model_number": "K-596-CP",
  "brand": "Kohler",
  "description": "Simplice Faucet"
}
```

### Kitchen Faucet - Moen
```json
{
  "model_number": "7594ESRS",
  "brand": "Moen",
  "description": "Arbor Faucet"
}
```

### Ceiling Light
```json
{
  "model_number": "LX1500",
  "description": "Ceiling Light"
}
```

## Performance Metrics

### Current Statistics
- **Total Requests**: 3
- **Success Rate**: 100%
- **Avg Response Time**: 15.7 seconds
- **Avg Completeness**: 100%

### AI Provider
- **Primary**: OpenAI (gpt-4o-mini)
- **Fallback**: xAI (grok-beta)
- **Cost per enrichment**: ~$0.001

## Metrics Endpoint
Get performance statistics:

```
GET https://ai-catlog-bot.onrender.com/home-products-ai-metrics
Headers: X-API-KEY: catbot123
```

Response:
```json
{
  "metrics": {
    "openai": {
      "total_requests": 3,
      "successful": 3,
      "failed": 0,
      "success_rate": "100.00%",
      "avg_response_time": "15.695s",
      "avg_completeness": "100.00%"
    },
    "xai": {
      "total_requests": 0,
      "successful": 0,
      "failed": 0,
      "success_rate": "0.00%",
      "avg_response_time": "0.000s",
      "avg_completeness": "0.00%"
    }
  },
  "timestamp": "2025-11-24T00:45:30.123456"
}
```

## Smart Field Application

The AI automatically determines which fields to populate based on the product type:

- **Plumbing Products** → Focus on flow rate, pressure, valve type, connections
- **Lighting Products** → Focus on lumens, color temperature, bulb type, dimmable
- **HVAC Products** → Focus on BTU, SEER2, CFM, refrigerant
- **Fans** → Focus on CFM, blade span, motor type, controls
- **Hardware** → Focus on material, finish, mounting, dimensions

Irrelevant fields are automatically skipped (e.g., CFM won't be added to a faucet).

## Integration with Salesforce

The Home Products Portal can be integrated with Salesforce using the same pattern as the Product and Parts portals. See `SALESFORCE_INTEGRATION.md` for complete Apex integration examples.

Quick example:
```apex
public class HomeProductsService {
    public static Map<String, Object> enrichHomeProduct(String modelNumber, String brand, String description) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://ai-catlog-bot.onrender.com/enrich-home-product');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('X-API-KEY', 'catbot123');
        
        Map<String, String> payload = new Map<String, String>{
            'model_number' => modelNumber,
            'brand' => brand,
            'description' => description
        };
        request.setBody(JSON.serialize(payload));
        
        HttpResponse response = http.send(request);
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        return result;
    }
}
```

## Best Practices

1. **Always provide Model Number** - This is the primary identifier
2. **Include Brand when possible** - Speeds up identification
3. **Add Description for ambiguous models** - Helps AI understand context
4. **Cache results** - Same model number returns consistent data
5. **Monitor metrics** - Track success rates and response times
6. **Handle errors gracefully** - Implement retry logic for failed requests

## Support

- **Frontend Portal**: https://ai-catlog-bot.vercel.app/home-products.html
- **API Documentation**: https://ai-catlog-bot.onrender.com/docs
- **GitHub Repository**: https://github.com/topmcon/Ai-Catlog-Bot
- **Admin Dashboard**: https://ai-catlog-bot.vercel.app/admin.html

## Changelog

### v1.0.0 (2025-11-24)
- Initial release with Master Product Data Schema v1.0
- 12 comprehensive sections (A-L) covering 100+ attributes
- Support for 8 departments (Bathroom, Kitchen, Lighting, Bath, Fans, Hardware, Outdoor, HVAC)
- Dual-AI enrichment (OpenAI + xAI with automatic failover)
- Model number required, brand and description optional
- 9 tabbed UI sections in frontend portal
- Full metrics tracking and performance monitoring
- Deployed to production (Render + Vercel)
