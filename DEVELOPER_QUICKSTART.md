# 🚀 Developer Quick Start Guide

Simple instructions for developers to integrate with Catalog-BOT and Parts-BOT APIs.

---

## 🎯 What You Can Do

You can send product or part information to our APIs and receive enriched data back. No admin access needed.

---

## 🔑 Authentication

**You Need:**
- API Endpoint URLs (provided below)
- API Key: `catbot123`

**How to Use:**
Add this header to every API request:
```
X-API-KEY: catbot123
```

---

## 📦 Product Enrichment API

### Send This:
```json
POST https://api.cxc-ai.com/enrich

Headers:
Content-Type: application/json
X-API-KEY: catbot123

Body:
{
  "brand": "Samsung",
  "model_number": "RF28R7351SR"
}
```

### Get Back:
Complete product information including:
- Brand, model, UPC, year
- Dimensions, weight, capacity
- Energy ratings, certifications
- Features, warranty, specifications
- 100+ data fields

---

## 🔧 Parts Enrichment API

### Send This:
```json
POST https://api.cxc-ai.com/enrich-part

Headers:
Content-Type: application/json
X-API-KEY: catbot123

Body:
{
  "part_number": "WR17X11653",
  "brand": "GE"
}
```

### Get Back:
Complete parts information including:
- Part name, category, specifications
- Compatible models (full list)
- Symptoms this part fixes
- Installation instructions
- Technical specs, certifications
- 100+ data fields

---

## 💻 Code Examples

### JavaScript/Node.js

**Product:**
```javascript
async function getProduct(brand, modelNumber) {
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
    return data.data; // All product info here
  } else {
    throw new Error(data.error);
  }
}

// Use it
getProduct('Samsung', 'RF28R7351SR')
  .then(product => console.log(product))
  .catch(error => console.error(error));
```

**Parts:**
```javascript
async function getPart(partNumber, brand) {
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
    return data.data; // All parts info here
  } else {
    throw new Error(data.error);
  }
}

// Use it
getPart('WR17X11653', 'GE')
  .then(part => console.log(part))
  .catch(error => console.error(error));
```

### Python

**Product:**
```python
import requests

def get_product(brand, model_number):
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
        raise Exception(data["error"])

# Use it
product = get_product("Samsung", "RF28R7351SR")
print(product)
```

**Parts:**
```python
import requests

def get_part(part_number, brand):
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
        return data["data"]
    else:
        raise Exception(data["error"])

# Use it
part = get_part("WR17X11653", "GE")
print(part)
```

### cURL (Command Line)

**Product:**
```bash
curl -X POST "https://api.cxc-ai.com/enrich" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"brand":"Samsung","model_number":"RF28R7351SR"}'
```

**Parts:**
```bash
curl -X POST "https://api.cxc-ai.com/enrich-part" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"part_number":"WR17X11653","brand":"GE"}'
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // All enriched data here (100+ fields)
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Always check the `success` field first!**

---

## ⏱️ Response Time

- **First request:** 30-45 seconds (cold start)
- **Subsequent requests:** 10-15 seconds
- **Set timeout:** 60 seconds minimum

---

## 🧪 Test Examples

### Products to Test:
```
Brand: Samsung, Model: RF28R7351SR
Brand: LG, Model: LRFVS3006S
Brand: Whirlpool, Model: WRF535SWHZ
```

### Parts to Test:
```
Part: WR17X11653, Brand: GE
Part: W10813429, Brand: Whirlpool
Part: 5304506469, Brand: Frigidaire
```

---

## 🔍 Accessing Data from Response

### Product Data Structure
```javascript
const product = data.data;

// Brand and model
product.verified_information.brand
product.verified_information.model_number
product.verified_information.product_name

// Dimensions
product.dimensions_and_weight.product_width
product.dimensions_and_weight.product_height
product.dimensions_and_weight.product_weight

// Capacity
product.capacity.total_capacity
product.capacity.fresh_food_capacity

// Features
product.features.key_features  // Array of features
product.features.smart_features

// Energy
product.performance_specs.energy_star_certified
product.performance_specs.estimated_yearly_energy_cost

// Warranty
product.warranty_info.standard_warranty
```

### Parts Data Structure
```javascript
const part = data.data;

// Core info
part.core_identification.part_name
part.core_identification.part_number
part.core_identification.brand

// Category
part.key_details.category
part.key_details.appliance_type

// Compatibility
part.compatibility.compatible_models  // Array of models
part.compatibility.compatible_brands

// Symptoms
part.symptoms.symptoms  // Array of symptoms

// Installation
part.installation.installation_difficulty
part.installation.tools_required  // Array
part.installation.installation_steps  // Array

// Technical specs
part.technical_specs.electrical.voltage
part.technical_specs.mechanical.flow_rate
```

---

## ⚠️ Error Handling

**Always include error handling:**

```javascript
try {
  const product = await getProduct('Samsung', 'RF28R7351SR');
  // Use product data
} catch (error) {
  console.error('Failed to enrich:', error.message);
  // Handle error (show message, retry, etc.)
}
```

**Common Errors:**
- `Invalid API key` - Check your X-API-KEY header
- `Missing required field` - Check brand/model are provided
- `Timeout` - Increase timeout to 60+ seconds

---

## 📊 What Data You Get

### Product (12 sections):
1. ✅ Verified Information - Core details
2. 📏 Dimensions & Weight
3. 📦 Packaging Specs
4. 🏷️ Product Classification
5. ⚡ Performance Specs
6. 📊 Capacity
7. 🌟 Features
8. ✓ Safety & Compliance
9. 🛡️ Warranty
10. 📦 Accessories
11. 🔧 Installation Requirements
12. 🎨 Product Attributes

### Parts (11 sections):
1. 📦 Core Identification
2. 📝 Product Title
3. ✅ Availability
4. 📋 Key Details
5. ⚙️ Technical Specs
6. 🔄 Compatibility
7. 🔗 Cross Reference
8. 🔧 Symptoms Fixed
9. 📄 Description
10. 🛠️ Installation
11. 📦 Shipping Info

**Total: 100+ fields per enrichment**

---

## 💡 Best Practices

1. **Set Timeout:** Minimum 60 seconds
2. **Check Success:** Always check `data.success` first
3. **Handle Nulls:** Not all fields will have data
4. **Cache Results:** Don't call API repeatedly for same item
5. **Error Handling:** Always wrap in try-catch

---

## 🚫 Rate Limits

**Current limits:**
- No hard rate limit
- Process requests sequentially (one at a time)
- Don't send parallel requests

**Response times:**
- Average: 10-30 seconds
- First call: 30-45 seconds (cold start)

---

## 📱 Quick Reference

**Product API:**
```
Endpoint: POST https://api.cxc-ai.com/enrich
Header: X-API-KEY: catbot123
Body: {"brand":"Samsung","model_number":"RF28R7351SR"}
```

**Parts API:**
```
Endpoint: POST https://api.cxc-ai.com/enrich-part
Header: X-API-KEY: catbot123
Body: {"part_number":"WR17X11653","brand":"GE"}
```

---

## ❓ Need Help?

**Test your connection:**
```bash
# Quick test (should return "healthy")
curl https://api.cxc-ai.com/health
```

**Common issues:**
1. Missing X-API-KEY header → Add header
2. Timeout errors → Increase timeout to 60s
3. Invalid response → Check request body format
4. Network errors → Check internet connection

---

## ✅ Complete Example

```javascript
// Complete working example with error handling

async function enrichProduct(brand, model) {
  try {
    // Make request
    const response = await fetch('https://api.cxc-ai.com/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'catbot123'
      },
      body: JSON.stringify({
        brand: brand,
        model_number: model
      }),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });
    
    // Parse response
    const data = await response.json();
    
    // Check success
    if (data.success) {
      // Extract what you need
      const productName = data.data.verified_information?.product_name;
      const capacity = data.data.capacity?.total_capacity;
      const features = data.data.features?.key_features || [];
      
      console.log('Name:', productName);
      console.log('Capacity:', capacity);
      console.log('Features:', features.join(', '));
      
      return data.data;
    } else {
      throw new Error(data.error);
    }
    
  } catch (error) {
    console.error('Enrichment failed:', error.message);
    return null;
  }
}

// Use it
enrichProduct('Samsung', 'RF28R7351SR');
```

---

**That's it! You're ready to integrate.** 🎉

Start with the test examples above, then adapt the code for your needs.
