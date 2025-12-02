# Unwrangle Ferguson Scraper

Production-ready Python script for scraping detailed product data from **Build with Ferguson** (formerly Build.com) using the official **Unwrangle API**.

## Features

✨ **Complete Product Data**
- Prices, variants, images, specifications
- Warranty information, ratings, reviews
- Inventory and availability status
- Rich structured data models

🔒 **Secure & Robust**
- API key from environment variables (never hard-coded)
- Automatic retry logic with exponential backoff (3 attempts)
- Respectful 1-second delays between requests
- Comprehensive error handling

📊 **Multiple Output Formats**
- Structured Python objects (dataclasses)
- Pretty-printed JSON export
- Flattened CSV for variants
- Rich console logging

🚀 **Production-Ready**
- Type hints throughout
- Clean, maintainable code
- CLI interface
- Handles 50+ variants gracefully

---

## Installation

1. **Install dependencies:**

```bash
pip install httpx rich python-dotenv
```

Or install from the project's `requirements.txt`:

```bash
pip install -r requirements.txt
```

2. **Set your Unwrangle API key:**

Create a `.env` file:

```bash
UNWRANGLE_API_KEY=your-unwrangle-api-key-here
```

Or export as environment variable:

```bash
export UNWRANGLE_API_KEY="your-unwrangle-api-key-here"
```

---

## Usage

### Basic CLI Usage

**Scrape a single product:**

```bash
python unwrangle_ferguson_scraper.py "https://www.build.com/kohler-k-2362-8/s560423"
```

**Scrape multiple products:**

```bash
python unwrangle_ferguson_scraper.py \
  "https://www.build.com/product1" \
  "https://www.build.com/product2"
```

### Export Options

**Save as pretty JSON:**

```bash
python unwrangle_ferguson_scraper.py \
  --output json \
  --output-file products.json \
  "https://www.build.com/kohler-k-2362-8/s560423"
```

**Export variants as CSV:**

```bash
python unwrangle_ferguson_scraper.py \
  --csv-variants variants.csv \
  "https://www.build.com/product1" \
  "https://www.build.com/product2"
```

**Both JSON and CSV:**

```bash
python unwrangle_ferguson_scraper.py \
  --output json \
  --csv-variants variants.csv \
  "https://www.build.com/kohler-k-2362-8/s560423"
```

### Python API Usage

```python
from unwrangle_ferguson_scraper import UnwrangleFergusonScraper

# Initialize scraper (reads UNWRANGLE_API_KEY from environment)
with UnwrangleFergusonScraper() as scraper:
    # Scrape single product
    product = scraper.scrape_url("https://www.build.com/kohler-k-2362-8/s560423")
    
    print(f"Title: {product.title}")
    print(f"Brand: {product.brand}")
    print(f"Price: ${product.price}")
    print(f"Variants: {len(product.variants) if product.variants else 0}")
    
    # Access structured data
    for variant in product.variants or []:
        print(f"  - {variant.name}: ${variant.price}")

# Or scrape multiple URLs
with UnwrangleFergusonScraper() as scraper:
    products = scraper.scrape_urls([
        "https://www.build.com/product1",
        "https://www.build.com/product2"
    ])
    
    for product in products:
        print(f"{product.title} - ${product.price}")
```

---

## Data Structure

### ProductData

```python
@dataclass
class ProductData:
    url: str                                  # Original product URL
    title: Optional[str]                      # Product name
    brand: Optional[str]                      # Brand/manufacturer
    model_number: Optional[str]               # Model/SKU
    price: Optional[float]                    # Current price
    original_price: Optional[float]           # Original/MSRP price
    currency: Optional[str]                   # Currency (USD)
    availability: Optional[str]               # Stock status
    description: Optional[str]                # Product description
    specifications: Optional[Dict[str, Any]]  # Technical specs
    features: Optional[List[str]]             # Product features
    images: Optional[List[str]]               # Image URLs
    variants: Optional[List[ProductVariant]]  # Color/size variants
    warranty: Optional[str]                   # Warranty information
    category: Optional[str]                   # Product category
    rating: Optional[float]                   # Average rating
    review_count: Optional[int]               # Number of reviews
    raw_data: Optional[Dict[str, Any]]        # Full API response
```

### ProductVariant

```python
@dataclass
class ProductVariant:
    variant_id: Optional[str]                 # Variant identifier
    sku: Optional[str]                        # Variant SKU
    name: Optional[str]                       # Variant name (e.g., "Red - Large")
    price: Optional[float]                    # Variant price
    original_price: Optional[float]           # Variant MSRP
    availability: Optional[str]               # Variant stock status
    stock_status: Optional[str]               # Detailed stock info
    attributes: Optional[Dict[str, Any]]      # Color, size, etc.
    image_url: Optional[str]                  # Variant image
```

---

## Error Handling

- **Automatic retries:** 3 attempts with exponential backoff (1s, 2s, 4s)
- **Respectful delays:** 1-second pause between requests
- **Clear logging:** Rich console output shows progress and errors
- **Graceful degradation:** Failed products don't crash the entire batch

---

## Technical Details

### Unwrangle API Integration

- **Endpoint:** `https://data.unwrangle.com/api/getter/`
- **Platform:** `build_detail` (legacy name, routes to Ferguson)
- **Authentication:** API key via `api_key` parameter
- **Response:** Rich JSON with nested product data

### Dependencies

- **httpx** - Modern HTTP client with timeout handling
- **rich** - Beautiful console output and progress bars
- **python-dotenv** - Environment variable management
- **pydantic** - Data validation (via dataclasses)

### Performance

- **Timeout:** 30 seconds per request
- **Retry logic:** 3 attempts with 2^n exponential backoff
- **Rate limiting:** 1-second delay between requests (configurable)
- **Variant limit:** 100 variants per product (safety cap)

---

## Examples

### Example 1: Quick Product Check

```bash
python unwrangle_ferguson_scraper.py "https://www.build.com/kohler-k-2362-8/s560423"
```

**Output:**
```
✓ Initialized Unwrangle scraper for Ferguson/Build.com
Scraping: https://www.build.com/kohler-k-2362-8/s560423
✓ Successfully fetched data
✓ Product: Kohler K-2362-8 Vitreous China Bathroom Sink
  Found 12 variants

═════════════════════ Scraping Results ═════════════════════

Kohler K-2362-8 Vitreous China Bathroom Sink
  Brand: Kohler
  Model: K-2362-8
  Price: $347.25
  Variants: 12
  URL: https://www.build.com/kohler-k-2362-8/s560423

✓ Done!
```

### Example 2: Export to JSON

```bash
python unwrangle_ferguson_scraper.py \
  --output json \
  --output-file ferguson_products.json \
  "https://www.build.com/kohler-k-2362-8/s560423"
```

Creates `ferguson_products.json`:
```json
[
  {
    "url": "https://www.build.com/kohler-k-2362-8/s560423",
    "title": "Kohler K-2362-8 Vitreous China Bathroom Sink",
    "brand": "Kohler",
    "model_number": "K-2362-8",
    "price": 347.25,
    "variants": [
      {
        "variant_id": "v1",
        "sku": "K-2362-8-0",
        "name": "White",
        "price": 347.25
      }
    ]
  }
]
```

### Example 3: Flatten Variants to CSV

```bash
python unwrangle_ferguson_scraper.py \
  --csv-variants variants.csv \
  "https://www.build.com/product1" \
  "https://www.build.com/product2"
```

Creates `variants.csv`:
```csv
url,title,brand,model_number,variant_sku,variant_name,price,original_price,availability,category
https://www.build.com/product1,Product 1,Brand A,MODEL-1,SKU-001,Red,99.99,129.99,In Stock,Category A
https://www.build.com/product1,Product 1,Brand A,MODEL-1,SKU-002,Blue,99.99,129.99,In Stock,Category A
```

---

## Troubleshooting

### API Key Issues

**Error:** `Unwrangle API key is required`

**Solution:**
```bash
# Check if environment variable is set
echo $UNWRANGLE_API_KEY

# Set it temporarily
export UNWRANGLE_API_KEY="your-key-here"

# Or add to .env file
echo "UNWRANGLE_API_KEY=your-key-here" > .env
```

### Rate Limiting

If you encounter rate limits, the scraper will automatically retry with backoff. You can also increase the delay:

```python
# In the script, modify:
REQUEST_DELAY = 2.0  # 2 seconds between requests
```

### Timeout Issues

For slow products, increase the timeout:

```python
# In UnwrangleFergusonScraper.__init__:
self.client = httpx.Client(timeout=60.0)  # 60 second timeout
```

---

## Integration with Existing Project

This scraper is designed to work alongside your existing Ai-Catlog-Bot infrastructure:

- **Same environment management** (python-dotenv, .env files)
- **Compatible dependencies** (no conflicts with FastAPI/OpenAI stack)
- **Reusable patterns** (dataclasses, error handling, logging)
- **CLI + API usage** (like your existing enrichment endpoints)

You can easily integrate it into your FastAPI backend:

```python
from fastapi import FastAPI
from unwrangle_ferguson_scraper import UnwrangleFergusonScraper

app = FastAPI()

@app.get("/scrape-ferguson")
async def scrape_ferguson(url: str):
    with UnwrangleFergusonScraper() as scraper:
        product = scraper.scrape_url(url)
        return product
```

---

## License

This script is part of the Ai-Catlog-Bot project. Use responsibly and in accordance with Unwrangle's Terms of Service and Ferguson's website policies.

---

## Support

For issues or questions:
1. Check the Unwrangle API documentation
2. Verify your API key is valid
3. Review error logs in the console output
4. Ensure product URLs are from Build.com/Ferguson

**Happy scraping! 🚀**
