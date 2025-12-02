# Ferguson Product Lookup Portal - Quick Start Guide

## ✅ What Was Created

### Frontend Portal
- **File**: `frontend/src/FergusonApp.jsx` - Full React UI for Ferguson product lookup
- **Entry**: `frontend/src/ferguson.jsx` - React entry point
- **HTML**: `frontend/ferguson.html` - HTML page
- **Route**: Access at `/ferguson.html` in your app
- **Navigation**: Added to Header component with 🔍 Ferguson link

### Backend API
- **Endpoint**: `POST /lookup-ferguson`
- **Location**: `main.py` (lines added after home products metrics)
- **Function**: Integrates with `unwrangle_ferguson_scraper.py`
- **Auth**: Requires `X-API-KEY` header

### Features
✅ **Model Number Search** - Just enter "K-2362-8" (no URL needed!)
✅ **Auto Product Discovery** - Searches Ferguson/Build.com automatically
✅ **Rich Product Data** - Title, brand, price, images, variants, specs
✅ **Variant Display** - Shows all color/size options with pricing
✅ **Image Gallery** - Multiple product images
✅ **Specifications** - Detailed technical specs
✅ **Features List** - Product features with checkmarks
✅ **Warranty Info** - Warranty details highlighted
✅ **Direct Links** - Links to view product on Ferguson
✅ **Error Handling** - Clear error messages
✅ **Loading States** - Visual feedback during search

---

## 🚀 How to Use

### 1. Start the Backend (if not running)
```bash
cd /workspaces/Ai-Catlog-Bot
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend (if not running)
```bash
cd /workspaces/Ai-Catlog-Bot/frontend
npm run dev
```

### 3. Access the Portal
Open browser to: **http://localhost:3000/ferguson.html**

### 4. Lookup a Product
- Enter model number: `K-2362-8` or `MOEN 7594SRS` or `DELTA RP50587`
- Click "Lookup Product"
- Wait 5-10 seconds for results
- View complete product data!

---

## 📋 API Usage

### Direct API Call
```bash
curl -X POST "http://localhost:8000/lookup-ferguson" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{"model_number": "K-2362-8"}'
```

### Response Format
```json
{
  "success": true,
  "data": {
    "url": "https://www.build.com/...",
    "title": "Kohler K-2362-8 Vitreous China Sink",
    "brand": "Kohler",
    "model_number": "K-2362-8",
    "price": 347.25,
    "currency": "USD",
    "availability": "In Stock",
    "description": "...",
    "images": ["url1", "url2"],
    "variants": [
      {
        "variant_id": "...",
        "sku": "...",
        "name": "White",
        "price": 347.25,
        "availability": "In Stock"
      }
    ],
    "specifications": {...},
    "features": [...],
    "warranty": "...",
    "category": "...",
    "rating": 4.5,
    "review_count": 42
  },
  "metadata": {
    "source": "unwrangle_ferguson",
    "model_number": "K-2362-8",
    "response_time": "8.45s",
    "timestamp": "2025-12-02T04:30:00"
  }
}
```

---

## 🎨 UI Components

### Search Form
- Model number input (required)
- "Lookup Product" button with loading state
- Reset button to clear results

### Product Display
- **Header**: Title, brand, model number, Ferguson link
- **Pricing**: Current price + original price (if on sale)
- **Availability**: Stock status badge
- **Description**: Product description
- **Category & Ratings**: Category and star rating
- **Warranty**: Highlighted warranty information
- **Images**: Responsive image gallery (up to 6 shown)
- **Features**: Bulleted list with checkmarks
- **Specifications**: Key-value table
- **Variants**: Expandable variant cards with SKU, price, availability
- **Technical Details**: Collapsible raw JSON data

---

## 🔧 Configuration

### Environment Variables Needed
Add to your `.env` file:
```bash
UNWRANGLE_API_KEY=your-unwrangle-api-key-here
```

### Dependencies Installed
```bash
httpx==0.27.0      # HTTP client
rich==13.7.0       # Console output
```

---

## 📊 Data Fields Returned

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Product name | "Kohler K-2362-8 Sink" |
| `brand` | Manufacturer | "Kohler" |
| `model_number` | Model/SKU | "K-2362-8" |
| `price` | Current price | 347.25 |
| `original_price` | MSRP | 399.99 |
| `currency` | Price currency | "USD" |
| `availability` | Stock status | "In Stock" |
| `description` | Product description | "Vitreous china..." |
| `category` | Product category | "Bathroom Sinks" |
| `rating` | Average rating | 4.5 |
| `review_count` | Number of reviews | 42 |
| `images` | Image URLs | ["url1", "url2"] |
| `features` | Feature list | ["Feature 1", ...] |
| `specifications` | Tech specs | {"Dimension": "..."} |
| `warranty` | Warranty info | "Limited lifetime" |
| `variants` | Color/size options | [{...}, {...}] |
| `url` | Product URL | "https://..." |

---

## 🧪 Test Examples

### Test Model Numbers
```bash
# Kohler sink
K-2362-8

# Moen faucet
MOEN 7594SRS

# Delta part
DELTA RP50587

# With brand prefix
KOHLER K-2362-8
```

---

## 🔗 Integration Points

### With Salesforce
Can be called from Salesforce via REST API:
```apex
HttpRequest req = new HttpRequest();
req.setEndpoint('https://api.cxc-ai.com/lookup-ferguson');
req.setMethod('POST');
req.setHeader('X-API-KEY', 'catbot123');
req.setHeader('Content-Type', 'application/json');
req.setBody('{"model_number": "K-2362-8"}');
HttpResponse res = new Http().send(req);
```

### With Existing Portals
The Ferguson portal follows the same design patterns as:
- Catalog Portal (`/`)
- Parts Portal (`/parts.html`)
- Home Products Portal (`/home-products.html`)

Easy to maintain and extend!

---

## 🎯 Key Benefits

1. **No URL Required** - Just model number!
2. **Auto-Discovery** - Searches Ferguson automatically
3. **Complete Data** - All product info in one lookup
4. **Variant Support** - Handles 50+ variants
5. **Fast Results** - Typically 5-10 seconds
6. **Clean UI** - Matches existing portal design
7. **API Ready** - Works via UI or direct API calls
8. **Salesforce Compatible** - Ready for integration

---

## 📝 Next Steps

1. **Add UNWRANGLE_API_KEY** to `.env`
2. **Test the portal** at `/ferguson.html`
3. **Try different model numbers** to see data variety
4. **Deploy to production** VPS (same as other portals)
5. **Optional**: Add to Salesforce integration

**You're all set! 🎉**
