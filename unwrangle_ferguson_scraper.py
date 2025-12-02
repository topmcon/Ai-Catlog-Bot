#!/usr/bin/env python3
"""
Unwrangle Ferguson Scraper
==========================
Production-ready Python script for scraping product data from Build with Ferguson
using Unwrangle's official API.

Usage:
    python unwrangle_ferguson_scraper.py "https://www.build.com/kohler-k-2362-8/s560423"
    python unwrangle_ferguson_scraper.py --output json "https://..."
    python unwrangle_ferguson_scraper.py --csv-variants "https://..."
"""

import os
import sys
import time
import json
import csv
import re
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass, asdict
from pathlib import Path

import httpx
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from dotenv import load_dotenv

# Rich console for pretty logging
console = Console()

# Constants
UNWRANGLE_API_URL = "https://data.unwrangle.com/api/getter/"
PLATFORM_NAME = "build_detail"  # Legacy name that routes to Ferguson
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2  # Exponential backoff: 2^n seconds
REQUEST_DELAY = 1.0  # Respectful 1-second delay between requests

# Ferguson/Build.com URL patterns
FERGUSON_SEARCH_URL = "https://www.build.com/search"
BUILD_COM_BASE = "https://www.build.com"


@dataclass
class ProductVariant:
    """Represents a single product variant."""
    variant_id: Optional[str] = None
    sku: Optional[str] = None
    name: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    availability: Optional[str] = None
    stock_status: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None


@dataclass
class ProductData:
    """Structured product data from Unwrangle API."""
    url: str
    title: Optional[str] = None
    brand: Optional[str] = None
    model_number: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    currency: Optional[str] = None
    availability: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    variants: Optional[List[ProductVariant]] = None
    warranty: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    raw_data: Optional[Dict[str, Any]] = None


class UnwrangleFergusonScraper:
    """
    Scraper for Build with Ferguson product data using Unwrangle API.
    
    Examples:
        >>> scraper = UnwrangleFergusonScraper()
        >>> product = scraper.scrape_model("KOHLER-K-2362-8")
        >>> products = scraper.scrape_models(["model1", "model2"])
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the scraper.
        
        Args:
            api_key: Unwrangle API key. If not provided, reads from UNWRANGLE_API_KEY env var.
        """
        self.api_key = api_key or os.getenv("UNWRANGLE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Unwrangle API key is required. Set UNWRANGLE_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        self.client = httpx.Client(timeout=30.0, follow_redirects=True)
        console.log(f"[green]✓[/green] Initialized Unwrangle scraper for Ferguson/Build.com")
    
    def _normalize_model_number(self, model: str) -> str:
        """
        Normalize model number for URL search.
        
        Args:
            model: Raw model number (e.g., "K-2362-8", "KOHLER K-2362-8")
            
        Returns:
            Normalized model number for search
        """
        # Remove extra whitespace and convert to uppercase
        normalized = model.strip().upper()
        
        # Remove common brand prefixes if they appear to be part of model
        # (we'll let Ferguson's search handle brand matching)
        normalized = re.sub(r'^(KOHLER|MOEN|DELTA|GE|LG|BOSCH|PERRIN|ROWE)\s+', '', normalized, flags=re.IGNORECASE)
        
        return normalized
    
    def _construct_product_url(self, model_number: str) -> str:
        """
        Construct a Build.com product URL from model number.
        Build.com uses URL pattern: /brand-model-number/s######
        
        Args:
            model_number: Product model number
            
        Returns:
            Constructed product URL (may not be exact, but Unwrangle will handle redirects)
        """
        normalized_model = self._normalize_model_number(model_number)
        
        # Convert model number to URL-friendly format
        # Example: "K-2362-8" -> "k-2362-8"
        url_slug = normalized_model.lower().replace(' ', '-')
        
        # Construct generic build.com URL
        # Note: The /s###### number isn't critical - Unwrangle can handle product lookups
        # by model number directly
        product_url = f"{BUILD_COM_BASE}/{url_slug}"
        
        console.log(f"[dim]Using model-based URL: {product_url}[/dim]")
        return product_url
    
    def _search_product_url(self, model_number: str) -> Optional[str]:
        """
        Search for product URL using Unwrangle's build_search API.
        
        Args:
            model_number: Product model number
            
        Returns:
            Product URL or None if not found
        """
        normalized_model = self._normalize_model_number(model_number)
        
        # Use Unwrangle's build_search API to find the product
        params = {
            "platform": "build_search",
            "search": normalized_model,
            "api_key": self.api_key
        }
        
        try:
            console.log(f"[dim]Searching for: {normalized_model}[/dim]")
            response = self.client.get(UNWRANGLE_API_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Get first result from search
            results = data.get("results", [])
            
            if not results:
                console.log(f"[yellow]⚠[/yellow] No search results for: {model_number}")
                return None
            
            # Return URL of first matching product
            first_result = results[0]
            product_url = first_result.get("url")
            
            if product_url:
                console.log(f"[green]✓[/green] Found product: {first_result.get('name', 'Unknown')}")
                console.log(f"[dim]  URL: {product_url}[/dim]")
                return product_url
            
            console.log(f"[yellow]⚠[/yellow] No URL in search result")
            return None
            
        except Exception as e:
            console.log(f"[yellow]⚠[/yellow] Search failed: {e}")
            console.log(f"[dim]Falling back to constructed URL[/dim]")
            # Fall back to constructing URL from model number
            return self._construct_product_url(model_number)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()
    
    def _make_request(self, url: str) -> Dict[str, Any]:
        """
        Make a request to Unwrangle API with retry logic.
        
        Args:
            url: Product URL to scrape
            
        Returns:
            Raw JSON response from Unwrangle API
            
        Raises:
            Exception: If all retries fail
        """
        params = {
            "platform": PLATFORM_NAME,
            "url": url,
            "api_key": self.api_key
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                console.log(f"[dim]Request attempt {attempt + 1}/{MAX_RETRIES}[/dim]")
                
                response = self.client.get(UNWRANGLE_API_URL, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Check for API errors in response
                if data.get("error"):
                    raise Exception(f"API Error: {data['error']}")
                
                console.log(f"[green]✓[/green] Successfully fetched data")
                return data
                
            except httpx.HTTPStatusError as e:
                console.log(f"[yellow]⚠[/yellow] HTTP {e.response.status_code}: {e}")
                
                if attempt < MAX_RETRIES - 1:
                    backoff = RETRY_BACKOFF_BASE ** attempt
                    console.log(f"[dim]Retrying in {backoff}s...[/dim]")
                    time.sleep(backoff)
                else:
                    raise Exception(f"Failed after {MAX_RETRIES} attempts: {e}")
                    
            except Exception as e:
                console.log(f"[red]✗[/red] Error: {e}")
                
                if attempt < MAX_RETRIES - 1:
                    backoff = RETRY_BACKOFF_BASE ** attempt
                    console.log(f"[dim]Retrying in {backoff}s...[/dim]")
                    time.sleep(backoff)
                else:
                    raise
    
    def _parse_product_data(self, raw_data: Dict[str, Any], url: str) -> ProductData:
        """
        Parse raw Unwrangle API response into structured ProductData.
        
        Args:
            raw_data: Raw JSON response from Unwrangle
            url: Original product URL
            
        Returns:
            Structured ProductData object
        """
        # Unwrangle's build_detail platform returns data in 'detail' key
        product_info = raw_data.get("detail", {}) or raw_data.get("product", {}) or raw_data
        
        # Parse variants if present
        variants = []
        raw_variants = product_info.get("variants", [])
        
        if raw_variants:
            for var in raw_variants[:100]:  # Limit to 100 variants for safety
                variant = ProductVariant(
                    variant_id=str(var.get("id") or var.get("variant_id") or ""),
                    sku=var.get("sku"),
                    name=var.get("name") or var.get("title") or var.get("color"),
                    price=self._parse_price(var.get("price")),
                    original_price=self._parse_price(var.get("original_price") or var.get("list_price")),
                    availability=var.get("availability") or ("in_stock" if var.get("in_stock") else None),
                    stock_status=var.get("stock_status"),
                    attributes=var.get("attributes") or var.get("options") or {},
                    image_url=var.get("image") or var.get("image_url")
                )
                variants.append(variant)
        
        # Extract features from feature_groups if available
        features = product_info.get("features") or product_info.get("highlights") or []
        if not features and product_info.get("feature_groups"):
            # Flatten feature groups
            for group in product_info.get("feature_groups", []):
                if isinstance(group, dict) and group.get("features"):
                    features.extend(group["features"])
        
        # Build ProductData
        return ProductData(
            url=product_info.get("url") or url,
            title=product_info.get("name") or product_info.get("title"),
            brand=product_info.get("brand"),
            model_number=product_info.get("model_number") or product_info.get("model") or product_info.get("sku"),
            price=self._parse_price(product_info.get("price")),
            original_price=self._parse_price(product_info.get("original_price") or product_info.get("list_price")),
            currency=product_info.get("currency", "USD"),
            availability=product_info.get("availability") or ("in stock" if product_info.get("in_stock") else "check availability"),
            description=product_info.get("description"),
            specifications=product_info.get("specifications") or product_info.get("specs"),
            features=features if features else None,
            images=product_info.get("images") or [],
            variants=variants if variants else None,
            warranty=product_info.get("warranty") or product_info.get("manufacturer_warranty"),
            category=product_info.get("business_category") or product_info.get("base_category") or product_info.get("category"),
            rating=product_info.get("rating"),
            review_count=product_info.get("review_count") or product_info.get("total_reviews"),
            raw_data=raw_data
        )
    
    def _parse_price(self, price_value: Any) -> Optional[float]:
        """Parse price from various formats."""
        if price_value is None:
            return None
        
        if isinstance(price_value, (int, float)):
            return float(price_value)
        
        if isinstance(price_value, str):
            # Remove currency symbols and commas
            cleaned = price_value.replace("$", "").replace(",", "").strip()
            try:
                return float(cleaned)
            except ValueError:
                return None
        
        return None
    
    def scrape_url(self, url: str) -> ProductData:
        """
        Scrape a single product URL.
        
        Args:
            url: Ferguson/Build.com product URL
            
        Returns:
            ProductData object with structured product information
        """
        console.log(f"[bold blue]Scraping:[/bold blue] {url}")
        
        raw_data = self._make_request(url)
        product = self._parse_product_data(raw_data, url)
        
        console.log(f"[green]✓[/green] Product: {product.title or 'Unknown'}")
        if product.variants:
            console.log(f"[dim]  Found {len(product.variants)} variants[/dim]")
        
        return product
    
    def scrape_urls(self, urls: List[str]) -> List[ProductData]:
        """
        Scrape multiple product URLs with respectful delays.
        
        Args:
            urls: List of Ferguson/Build.com product URLs
            
        Returns:
            List of ProductData objects
        """
        products = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Scraping {len(urls)} products...", total=len(urls))
            
            for i, url in enumerate(urls):
                try:
                    product = self.scrape_url(url)
                    products.append(product)
                    
                except Exception as e:
                    console.log(f"[red]✗[/red] Failed to scrape {url}: {e}")
                    products.append(None)
                
                progress.update(task, advance=1)
                
                # Respectful delay between requests (except for last one)
                if i < len(urls) - 1:
                    time.sleep(REQUEST_DELAY)
        
        successful = sum(1 for p in products if p is not None)
        console.log(f"[green]✓[/green] Successfully scraped {successful}/{len(urls)} products")
        
        return [p for p in products if p is not None]
    
    def scrape_model(self, model_number: str) -> Optional[ProductData]:
        """
        Scrape a product by model number using search API.
        Uses search API directly since it returns comprehensive data.
        
        Args:
            model_number: Product model number (e.g., "K-2362-8", "KOHLER K-2362-8")
            
        Returns:
            ProductData object or None if product not found
        """
        console.log(f"[bold blue]Looking up model:[/bold blue] {model_number}")
        
        # Use search API to find and get product data
        search_results = self.search_products(model_number, max_results=1)
        
        if not search_results.get("success") or not search_results.get("results"):
            console.log(f"[red]✗[/red] Could not find product for: {model_number}")
            return None
        
        # Get first result from search
        result = search_results["results"][0]
        
        # Convert search result to ProductData format
        variants = []
        for var in result.get("variants", []):
            variants.append(ProductVariant(
                variant_id=str(var.get("id")),
                sku=var.get("model_no"),
                name=var.get("name"),
                price=var.get("price"),
                availability=var.get("availability_status"),
                stock_status="in_stock" if var.get("in_stock") else "out_of_stock",
                attributes={
                    "swatch_color": var.get("swatch_color"),
                    "is_quick_ship": var.get("is_quick_ship"),
                    "has_free_shipping": var.get("has_free_shipping"),
                    "inventory_quantity": var.get("inventory_quantity")
                },
                image_url=var.get("image")
            ))
        
        product = ProductData(
            url=result.get("url", ""),
            title=result.get("name"),
            brand=result.get("brand"),
            model_number=result.get("model_no"),
            price=result.get("price"),
            currency=result.get("currency", "USD"),
            availability=result.get("availability_status", "in_stock" if result.get("has_in_stock_variants") else "out_of_stock"),
            images=result.get("images", []),
            variants=variants,
            rating=result.get("rating"),
            review_count=result.get("total_ratings"),
            raw_data=result
        )
        
        console.log(f"[green]✓[/green] Successfully loaded product: {product.title}")
        return product
    
    def scrape_models(self, model_numbers: List[str]) -> List[ProductData]:
        """
        Scrape multiple products by model number with respectful delays.
        
        Args:
            model_numbers: List of product model numbers
            
        Returns:
            List of ProductData objects (excludes not found)
        """
        products = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Scraping {len(model_numbers)} models...", total=len(model_numbers))
            
            for i, model in enumerate(model_numbers):
                try:
                    product = self.scrape_model(model)
                    if product:
                        products.append(product)
                    
                except Exception as e:
                    console.log(f"[red]✗[/red] Failed to scrape model {model}: {e}")
                
                progress.update(task, advance=1)
                
                # Respectful delay between requests (except for last one)
                if i < len(model_numbers) - 1:
                    time.sleep(REQUEST_DELAY)
        
        successful = len(products)
        console.log(f"[green]✓[/green] Successfully scraped {successful}/{len(model_numbers)} models")
        
        return products
    
    def search_products(self, query: str, page: int = 1, max_results: int = 48) -> Dict[str, Any]:
        """
        Search for products using Unwrangle's build_search API.
        Returns search results without detailed scraping.
        
        Args:
            query: Search query (e.g., "pedestal bathroom sinks", "K-2362-8")
            page: Page number (default: 1)
            max_results: Maximum results to return (default: 48, API max per page)
            
        Returns:
            Dict containing:
                - results: List of product summaries with basic info
                - total_results: Total matching products
                - page: Current page
                - no_of_pages: Total pages available
        """
        console.log(f"[bold blue]Searching:[/bold blue] {query} (page {page})")
        
        params = {
            "platform": "build_search",
            "search": query,
            "page": page,
            "api_key": self.api_key
        }
        
        try:
            response = self.client.get(UNWRANGLE_API_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get("success"):
                raise Exception(f"Search failed: {data.get('error', 'Unknown error')}")
            
            results = data.get("results", [])
            total_results = data.get("total_results", 0)
            no_of_pages = data.get("no_of_pages", 1)
            
            console.log(f"[green]✓[/green] Found {len(results)} products (total: {total_results})")
            
            # Limit results if requested
            if len(results) > max_results:
                results = results[:max_results]
            
            return {
                "success": True,
                "query": query,
                "page": page,
                "results": results,
                "result_count": len(results),
                "total_results": total_results,
                "no_of_pages": no_of_pages,
                "meta_data": data.get("meta_data", {})
            }
            
        except Exception as e:
            console.log(f"[red]✗[/red] Search failed: {e}")
            raise


def save_json(products: List[ProductData], output_file: str = "products.json"):
    """Save products as pretty-printed JSON."""
    data = [asdict(p) for p in products]
    
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2, default=str)
    
    console.log(f"[green]✓[/green] Saved JSON to {output_file}")


def save_csv_variants(products: List[ProductData], output_file: str = "variants.csv"):
    """Flatten all variants into a CSV file."""
    rows = []
    
    for product in products:
        if not product.variants:
            # Add main product as single row
            rows.append({
                "url": product.url,
                "title": product.title,
                "brand": product.brand,
                "model_number": product.model_number,
                "variant_sku": None,
                "variant_name": None,
                "price": product.price,
                "original_price": product.original_price,
                "availability": product.availability,
                "category": product.category
            })
        else:
            # Add each variant as a row
            for variant in product.variants:
                rows.append({
                    "url": product.url,
                    "title": product.title,
                    "brand": product.brand,
                    "model_number": product.model_number,
                    "variant_sku": variant.sku,
                    "variant_name": variant.name,
                    "price": variant.price or product.price,
                    "original_price": variant.original_price or product.original_price,
                    "availability": variant.availability or product.availability,
                    "category": product.category
                })
    
    if rows:
        with open(output_file, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        
        console.log(f"[green]✓[/green] Saved {len(rows)} variant rows to {output_file}")
    else:
        console.log("[yellow]⚠[/yellow] No variants to save")


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Scrape product data from Ferguson/Build.com using Unwrangle API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape by model number (recommended)
  %(prog)s "K-2362-8"
  %(prog)s "KOHLER K-2362-8" "MOEN 7594SRS"
  
  # Scrape by URL
  %(prog)s --url "https://www.build.com/kohler-k-2362-8/s560423"
  
  # Export options
  %(prog)s --output json "K-2362-8"
  %(prog)s --csv-variants variants.csv "K-2362-8" "7594SRS"
        """
    )
    
    parser.add_argument(
        "inputs",
        nargs="+",
        help="One or more product model numbers (default) or URLs (with --url flag)"
    )
    
    parser.add_argument(
        "--url",
        action="store_true",
        help="Treat inputs as URLs instead of model numbers"
    )
    
    parser.add_argument(
        "--output",
        choices=["json"],
        help="Output format (json for pretty-printed JSON)"
    )
    
    parser.add_argument(
        "--output-file",
        default="products.json",
        help="Output JSON file path (default: products.json)"
    )
    
    parser.add_argument(
        "--csv-variants",
        metavar="FILE",
        help="Export all variants to CSV file"
    )
    
    parser.add_argument(
        "--api-key",
        help="Unwrangle API key (overrides UNWRANGLE_API_KEY env var)"
    )
    
    args = parser.parse_args()
    
    # Load environment variables for CLI usage
    load_dotenv()
    
    # Validate API key
    api_key = args.api_key or os.getenv("UNWRANGLE_API_KEY")
    if not api_key:
        console.log("[red]✗[/red] Error: UNWRANGLE_API_KEY environment variable not set")
        console.log("[dim]Set it with: export UNWRANGLE_API_KEY='your-key-here'[/dim]")
        console.log("[dim]Or create a .env file with: UNWRANGLE_API_KEY=your-key-here[/dim]")
        sys.exit(1)
    
    try:
        # Scrape products
        with UnwrangleFergusonScraper(api_key=api_key) as scraper:
            if args.url:
                # Treat inputs as URLs
                products = scraper.scrape_urls(args.inputs)
            else:
                # Treat inputs as model numbers (default)
                products = scraper.scrape_models(args.inputs)
        
        if not products:
            console.log("[yellow]⚠[/yellow] No products scraped successfully")
            sys.exit(1)
        
        # Output results
        if args.output == "json":
            save_json(products, args.output_file)
        
        if args.csv_variants:
            save_csv_variants(products, args.csv_variants)
        
        # Default: print summary
        if not args.output and not args.csv_variants:
            console.rule("[bold]Scraping Results[/bold]")
            
            for product in products:
                console.print(f"\n[bold cyan]{product.title}[/bold cyan]")
                console.print(f"  Brand: {product.brand}")
                console.print(f"  Model: {product.model_number}")
                console.print(f"  Price: ${product.price}" if product.price else "  Price: N/A")
                
                if product.variants:
                    console.print(f"  Variants: {len(product.variants)}")
                
                console.print(f"  URL: [dim]{product.url}[/dim]")
        
        console.log(f"\n[green]✓[/green] Done!")
        
    except KeyboardInterrupt:
        console.log("\n[yellow]⚠[/yellow] Interrupted by user")
        sys.exit(130)
    
    except Exception as e:
        console.log(f"\n[red]✗[/red] Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
