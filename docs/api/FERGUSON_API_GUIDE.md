# Ferguson Product API Guide

Complete guide for using the Ferguson/Build.com product scraper powered by Unwrangle API.

## Overview

The Ferguson scraper provides three main capabilities:
1. **Product Search** - Search by keyword or model number, get multiple results
2. **Detailed Lookup** - Get complete product data including variants, specs, images
3. **Batch Processing** - Scrape multiple products efficiently

## API Endpoints

### 1. Search Products (`/search-ferguson`)

Search for products by keyword or model number. Returns up to 48 products per page with basic information.

**Endpoint:** `POST /search-ferguson`

**Headers:**
```http
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "pedestal bathroom sinks",
  "page": 1,
  "max_results": 10
}
```

**Response:**
```json
{
  "success": true,
  "query": "pedestal bathroom sinks",
  "page": 1,
  "result_count": 10,
  "total_results": 432,
  "no_of_pages": 44,
  "results": [
    {
      "name": "Cimarron Pedestal Bathroom Sink with 8\" Widespread Faucet Holes",
      "brand": "Kohler",
      "id": 165232,
      "family_id": 560423,
      "model_no": "K-2362-8",
      "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232",
      "price": 366.75,
      "price_min": 366.75,
      "price_max": 536.08,
      "currency": "USD",
      "rating": 5.0,
      "total_ratings": 4,
      "variant_count": 3,
      "has_in_stock_variants": true,
      "all_variants_in_stock": true,
      "images": ["https://s3.img-b.com/..."],
      "thumbnail": "https://s3.img-b.com/...",
      "features": [
        {"name": "Faucet Holes", "value": "3"},
        {"name": "Material", "value": "Vitreous China"}
      ]
    }
  ],
  "meta_data": {
    "search_engine": "FUSION",
    "base_category": "Plumbing",
    "business_category": "Bathroom Sinks"
  },
  "metadata": {
    "source": "unwrangle_ferguson_search",
    "response_time": "1.23s",
    "timestamp": "2024-12-02T10:30:45.123456"
  }
}
```

**Use Cases:**
- Browse products by category
- Search by brand or product type
- Find products by model number
- Get pricing overviews
- Build product catalogs

**Example Searches:**
```bash
# Search by keyword
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "X-API-Key: catbot123" \
  -H "Content-Type: application/json" \
  -d '{"query": "pedestal bathroom sinks", "max_results": 5}'

# Search by model number
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "X-API-Key: catbot123" \
  -H "Content-Type: application/json" \
  -d '{"query": "K-2362-8"}'

# Search with pagination
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "X-API-Key: catbot123" \
  -H "Content-Type: application/json" \
  -d '{"query": "kohler faucets", "page": 2, "max_results": 20}'
```

### 2. Lookup Product Details (`/lookup-ferguson`)

Get complete product information including all variants, specifications, features, and images.

**Endpoint:** `POST /lookup-ferguson`

**Headers:**
```http
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body (by URL - recommended):**
```json
{
  "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"
}
```

**Request Body (by model number):**
```json
{
  "model_number": "K-2362-8"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423",
    "title": "Cimarron Pedestal Bathroom Sink with 8\" Widespread Faucet Holes",
    "brand": "Kohler",
    "model_number": "K-2362-8",
    "price": 366.75,
    "original_price": null,
    "currency": "USD",
    "availability": "in stock",
    "description": "The Cimarron collection...",
    "specifications": {
      "Material": "Vitreous China",
      "Length": "22.75\"",
      "Width": "18.875\"",
      "Faucet Holes": "3",
      "Installation Type": "Pedestal"
    },
    "features": [
      "Three-hole faucet drilling for 8\" widespread faucets",
      "Includes mounting hardware",
      "Overflow drain included"
    ],
    "images": [
      "https://s3.img-b.com/image/private/t_base,c_lpad,f_auto,dpr_auto/product/kohler/kohler-2362-8-0.jpg",
      "https://s3.img-b.com/image/private/t_base,c_lpad,f_auto,dpr_auto/product/kohler/kohler-2362-8-96.jpg"
    ],
    "variants": [
      {
        "variant_id": "165232",
        "sku": "K-2362-8-0",
        "name": "White",
        "price": 366.75,
        "availability": "in_stock",
        "stock_status": "in_stock",
        "image_url": "https://s3.img-b.com/...",
        "attributes": {
          "color": "White",
          "swatch_color": "ffffff"
        }
      },
      {
        "variant_id": "165219",
        "sku": "K-2362-8-96",
        "name": "Biscuit",
        "price": 476.90,
        "availability": "in_stock"
      }
    ],
    "category": "Bathroom Sinks",
    "rating": 5.0,
    "review_count": 4
  },
  "metadata": {
    "source": "unwrangle_ferguson",
    "lookup_key": "https://www.fergusonhome.com/...",
    "lookup_type": "url",
    "response_time": "2.45s",
    "timestamp": "2024-12-02T10:30:45.123456"
  }
}
```

**Use Cases:**
- Get complete product specifications
- Retrieve all color/finish variants with individual pricing
- Extract product images for catalogs
- Get detailed features and descriptions
- Check real-time availability and pricing

**Examples:**
```bash
# Lookup by URL (recommended - most reliable)
curl -X POST https://cxc-ai.com/lookup-ferguson \
  -H "X-API-Key: catbot123" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"}'

# Lookup by model number (will search first, then scrape)
curl -X POST https://cxc-ai.com/lookup-ferguson \
  -H "X-API-Key: catbot123" \
  -H "Content-Type: application/json" \
  -d '{"model_number": "K-2362-8"}'
```

## Workflow Examples

### Example 1: Search → Lookup Workflow

**Step 1:** Search for products
```bash
curl -X POST https://cxc-ai.com/search-ferguson \
  -H "X-API-Key: catbot123" \
  -d '{"query": "kohler pedestal sinks", "max_results": 5}'
```

**Step 2:** Extract URLs from search results
```json
{
  "results": [
    {"url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"},
    {"url": "https://www.fergusonhome.com/kohler-k-2363-8/s560606?uid=222130"}
  ]
}
```

**Step 3:** Lookup detailed product data
```bash
curl -X POST https://cxc-ai.com/lookup-ferguson \
  -H "X-API-Key: catbot123" \
  -d '{"url": "https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232"}'
```

### Example 2: Model Number Direct Lookup

```bash
# Single API call - scraper will search and scrape automatically
curl -X POST https://cxc-ai.com/lookup-ferguson \
  -H "X-API-Key: catbot123" \
  -d '{"model_number": "K-2362-8"}'
```

### Example 3: Build Product Catalog

```python
import requests

API_URL = "https://cxc-ai.com"
API_KEY = "catbot123"
headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

# Search for products
search_response = requests.post(
    f"{API_URL}/search-ferguson",
    headers=headers,
    json={"query": "bathroom faucets", "max_results": 48}
)

products = search_response.json()["results"]

# Get detailed info for each
catalog = []
for product in products[:10]:  # First 10 products
    detail_response = requests.post(
        f"{API_URL}/lookup-ferguson",
        headers=headers,
        json={"url": product["url"]}
    )
    
    if detail_response.status_code == 200:
        catalog.append(detail_response.json()["data"])

print(f"Catalog built with {len(catalog)} products")
```

## Python CLI Usage

### Installation

```bash
pip install httpx rich python-dotenv
```

### Configure API Key

```bash
export UNWRANGLE_API_KEY="your-unwrangle-api-key"
```

Or create `.env` file:
```
UNWRANGLE_API_KEY=your-unwrangle-api-key
```

### Search Products

```bash
# Search by keyword
python unwrangle_ferguson_scraper.py --search "pedestal bathroom sinks"

# Search by model number
python unwrangle_ferguson_scraper.py --search "K-2362-8"

# Search with pagination
python unwrangle_ferguson_scraper.py --search "kohler faucets" --page 2
```

### Lookup Product Details

```bash
# By model number (searches first)
python unwrangle_ferguson_scraper.py "K-2362-8"

# By URL (direct scraping - faster)
python unwrangle_ferguson_scraper.py --url "https://www.fergusonhome.com/kohler-k-2362-8/s560423"

# Multiple products
python unwrangle_ferguson_scraper.py "K-2362-8" "K-2363-8" "K-2364-8"
```

### Export Options

```bash
# Export to JSON
python unwrangle_ferguson_scraper.py --output json --output-file products.json "K-2362-8"

# Export variants to CSV
python unwrangle_ferguson_scraper.py --csv-variants variants.csv "K-2362-8" "K-2363-8"
```

## Python Library Usage

```python
from unwrangle_ferguson_scraper import UnwrangleFergusonScraper

# Initialize scraper
scraper = UnwrangleFergusonScraper(api_key="your-api-key")

# Search for products
results = scraper.search_products("pedestal bathroom sinks", max_results=10)
print(f"Found {results['total_results']} products")

for product in results['results']:
    print(f"{product['name']} - ${product['price']}")

# Lookup by URL (recommended)
product = scraper.scrape_url("https://www.fergusonhome.com/kohler-k-2362-8/s560423")

# Lookup by model number
product = scraper.scrape_model("K-2362-8")

# Access product data
print(f"Title: {product.title}")
print(f"Brand: {product.brand}")
print(f"Price: ${product.price}")
print(f"Variants: {len(product.variants)}")

for variant in product.variants:
    print(f"  - {variant.name}: ${variant.price}")
```

## Data Fields

### Search Results (per product)
- `name` - Product name/title
- `brand` - Manufacturer brand
- `model_no` - Model/part number
- `url` - Product page URL
- `price` - Current price
- `price_min` / `price_max` - Variant price range
- `currency` - Price currency (USD)
- `rating` - Average rating (1-5)
- `total_ratings` - Number of reviews
- `variant_count` - Number of variants
- `in_stock` - Availability status
- `images` - Product image URLs
- `features` - Key specifications

### Detailed Product Data
All search fields plus:
- `description` - Full product description
- `specifications` - Complete specs dictionary
- `features` - Feature list
- `variants[]` - All variants with:
  - `variant_id` - Unique variant ID
  - `sku` - Variant SKU
  - `name` - Variant name (color/finish)
  - `price` - Variant-specific price
  - `availability` - Variant availability
  - `attributes` - Variant attributes
  - `image_url` - Variant image
- `warranty` - Warranty information
- `category` - Product category

## Rate Limits & Best Practices

### API Costs
- **Search:** 10 credits per request (up to 48 results)
- **Detailed Lookup:** 10 credits per product

### Best Practices
1. **Use search before scraping** - Find exact product first
2. **Batch related requests** - Group searches by category
3. **Cache results** - Store product data to avoid re-scraping
4. **Use URLs when available** - More reliable than model numbers
5. **Respect rate limits** - 1-second delay between requests (built-in)
6. **Handle errors gracefully** - Some products may not be available

### Error Handling

```python
from unwrangle_ferguson_scraper import UnwrangleFergusonScraper

with UnwrangleFergusonScraper() as scraper:
    try:
        product = scraper.scrape_model("K-2362-8")
        if not product:
            print("Product not found")
    except Exception as e:
        print(f"Error: {e}")
```

## Troubleshooting

### Common Issues

**1. "Product not found"**
- Try searching first to get exact URL
- Verify model number spelling
- Check if product is discontinued

**2. "API key not configured"**
```bash
export UNWRANGLE_API_KEY="your-key"
# Or add to .env file
```

**3. "Search returns no results"**
- Try broader search terms
- Remove brand names from model search
- Check spelling and formatting

**4. "Timeout errors"**
- Increase timeout in httpx.Client
- Check network connectivity
- Verify Unwrangle API status

### Getting Help

- **Documentation:** https://docs.unwrangle.com
- **API Status:** https://status.unwrangle.com
- **Support:** support@unwrangle.com

## Migration from URL-Only Approach

If you were using the URL-only approach:

**Before:**
```python
product = scraper.scrape_url("https://www.fergusonhome.com/kohler-k-2362-8/s560423")
```

**After (recommended workflow):**
```python
# Search first
results = scraper.search_products("K-2362-8")
url = results['results'][0]['url']

# Then scrape
product = scraper.scrape_url(url)
```

**Or (simplified):**
```python
# Automatic search + scrape
product = scraper.scrape_model("K-2362-8")
```

## Examples

See `examples/` directory for complete examples:
- `search_example.py` - Product search examples
- `lookup_example.py` - Detailed lookup examples
- `catalog_builder.py` - Build product catalogs
- `price_tracker.py` - Track price changes
- `batch_scraper.py` - Batch processing

## License

MIT License - See LICENSE file for details
