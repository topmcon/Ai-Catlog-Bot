# Ferguson Product Lookup API - Quick Start Guide

## ⚠️ IMPORTANT: Use the Correct Endpoint

**DO NOT use the manual search and detail endpoints separately.**

Use the single, all-in-one endpoint that handles everything automatically:

---

## API Endpoint (USE THIS ONE)

```
POST http://cxc-ai.com:8000/lookup-ferguson
```

### Authentication

Add this header to all requests:

```
X-API-Key: catbot123
```

---

## Complete Example

### Request

```bash
curl -X POST http://cxc-ai.com:8000/lookup-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-Key: catbot123" \
  -d '{
    "model_number": "K-2362-8"
  }'
```

### Request Body (JSON)

```json
{
  "model_number": "K-2362-8"
}
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Kohler Archer Undermount Sink",
    "model_number": "K-2362-8",
    "brand": "Kohler",
    "price": 366.75,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "description": "...",
    "specifications": {
      "material": "Vitreous china",
      "dimensions": "..."
    },
    "variants": [...],
    "url": "https://www.build.com/...",
    "stock_status": "In Stock",
    "categories": ["Bathroom", "Sinks"],
    "rating": 4.5,
    "reviews_count": 127
  },
  "credits_used": 20,
  "metadata": {
    "timestamp": "2025-12-17T18:30:00",
    "response_time": "3.2s"
  }
}
```

### Response (Not Found)

```json
{
  "success": false,
  "error": "Product not found in Ferguson"
}
```

---

## What This Endpoint Does Automatically

This single endpoint handles **all 3 steps** for you:

1. ✅ **Searches** Ferguson for the model number
2. ✅ **Finds matching variant** (with smart format handling)
3. ✅ **Fetches complete details** and merges data
4. ✅ **Returns comprehensive product data** ready to use

**No need to call multiple endpoints!**

---

## Salesforce Apex Example

```apex
public class FergusonProductService {
    
    private static final String API_ENDPOINT = 'http://cxc-ai.com:8000/lookup-ferguson';
    private static final String API_KEY = 'catbot123';
    
    public static Map<String, Object> lookupProduct(String modelNumber) {
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_ENDPOINT);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-API-Key', API_KEY);
        
        Map<String, String> body = new Map<String, String>{
            'model_number' => modelNumber
        };
        req.setBody(JSON.serialize(body));
        req.setTimeout(60000); // 60 second timeout
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> result = 
                (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return result;
        } else {
            System.debug('Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            return null;
        }
    }
}
```

---

## Common Mistakes to Avoid

### ❌ DON'T DO THIS:
```
// Wrong - Manual 2-step process
1. Call /search-ferguson
2. Parse results
3. Call /product-detail-ferguson
4. Merge data yourself
```

### ✅ DO THIS:
```
// Correct - Single call
1. Call /lookup-ferguson
2. Done! Get complete product data
```

---

## Performance & Credits

- **Response Time:** 2-5 seconds (depending on Ferguson API)
- **Credits Used:** 20 credits per lookup (10 for search + 10 for details)
- **Timeout:** Set at least 60 seconds for API calls

---

## Error Handling

**Status Codes:**
- `200` - Success
- `401` - Invalid API key
- `404` - Product not found
- `500` - Server error

**Always check the `success` field in the response:**

```javascript
if (response.success === true) {
  // Use response.data
} else {
  // Handle error: response.error
}
```

---

## Support

- **API Base URL:** `http://cxc-ai.com:8000`
- **Recommended Endpoint:** `/lookup-ferguson` ✅
- **Authentication:** Header `X-API-Key: catbot123`
- **Timeout:** Minimum 60 seconds

For technical questions or issues, contact your system administrator.

---

## Full Documentation

For complete API documentation including all fields, advanced features, and Salesforce integration patterns, see:

`docs/api/SALESFORCE_INTEGRATION_GUIDE.md`
