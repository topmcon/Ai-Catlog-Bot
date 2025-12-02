"""
Tests for the Unwrangle Ferguson Scraper module
Tests the scraper's data parsing and handling logic
"""

import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from dataclasses import asdict

# Set environment variables before importing modules
os.environ["OPENAI_API_KEY"] = "test_key_not_real"
os.environ["XAI_API_KEY"] = "test_xai_key"
os.environ["API_KEY"] = "test123"
os.environ["UNWRANGLE_API_KEY"] = "test_unwrangle_key"

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unwrangle_ferguson_scraper import (
    ProductData,
    ProductVariant,
    UnwrangleFergusonScraper
)


class TestProductVariant:
    """Tests for ProductVariant dataclass."""
    
    def test_variant_creation(self):
        """Test that a ProductVariant can be created."""
        variant = ProductVariant(
            variant_id="12345",
            sku="K-2362-8-0",
            name="White",
            price=366.75,
            availability="in_stock"
        )
        assert variant.variant_id == "12345"
        assert variant.sku == "K-2362-8-0"
        assert variant.name == "White"
        assert variant.price == 366.75
    
    def test_variant_to_dict(self):
        """Test that a ProductVariant can be converted to dict."""
        variant = ProductVariant(
            variant_id="12345",
            sku="K-2362-8-0",
            name="White",
            price=366.75
        )
        variant_dict = asdict(variant)
        assert variant_dict["variant_id"] == "12345"
        assert variant_dict["price"] == 366.75


class TestProductData:
    """Tests for ProductData dataclass."""
    
    def test_product_creation(self):
        """Test that a ProductData can be created."""
        product = ProductData(
            url="https://www.fergusonhome.com/test",
            title="Test Product",
            brand="TestBrand",
            model_number="TB-123",
            price=99.99
        )
        assert product.url == "https://www.fergusonhome.com/test"
        assert product.title == "Test Product"
        assert product.brand == "TestBrand"
        assert product.model_number == "TB-123"
        assert product.price == 99.99
    
    def test_product_with_variants(self):
        """Test that a ProductData can include variants."""
        variant = ProductVariant(
            variant_id="1",
            sku="TB-123-WHT",
            name="White",
            price=99.99
        )
        product = ProductData(
            url="https://www.fergusonhome.com/test",
            title="Test Product",
            variants=[variant]
        )
        assert len(product.variants) == 1
        assert product.variants[0].name == "White"
    
    def test_product_to_dict(self):
        """Test that a ProductData can be converted to dict."""
        product = ProductData(
            url="https://www.fergusonhome.com/test",
            title="Test Product",
            brand="TestBrand",
            price=99.99,
            features=["Feature 1", "Feature 2"]
        )
        product_dict = asdict(product)
        assert product_dict["url"] == "https://www.fergusonhome.com/test"
        assert product_dict["features"] == ["Feature 1", "Feature 2"]


class TestUnwrangleFergusonScraper:
    """Tests for the UnwrangleFergusonScraper class."""
    
    def test_scraper_requires_api_key(self):
        """Test that scraper requires an API key."""
        # Clear env var to test requirement
        old_key = os.environ.pop("UNWRANGLE_API_KEY", None)
        try:
            with pytest.raises(ValueError) as exc_info:
                UnwrangleFergusonScraper()
            assert "API key is required" in str(exc_info.value)
        finally:
            # Restore env var
            if old_key:
                os.environ["UNWRANGLE_API_KEY"] = old_key
    
    def test_scraper_accepts_api_key_param(self):
        """Test that scraper accepts API key as parameter."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        assert scraper.api_key == "test_key"
        scraper.client.close()
    
    def test_scraper_context_manager(self):
        """Test that scraper works as a context manager."""
        with UnwrangleFergusonScraper(api_key="test_key") as scraper:
            assert scraper is not None
            assert scraper.api_key == "test_key"
    
    def test_normalize_model_number(self):
        """Test model number normalization."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        
        # Test basic normalization
        assert scraper._normalize_model_number("k-2362-8") == "K-2362-8"
        assert scraper._normalize_model_number("  K-2362-8  ") == "K-2362-8"
        
        # Test brand prefix removal
        assert scraper._normalize_model_number("KOHLER K-2362-8") == "K-2362-8"
        assert scraper._normalize_model_number("kohler k-2362-8") == "K-2362-8"
        
        scraper.client.close()
    
    def test_parse_price_int(self):
        """Test price parsing with integer input."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        assert scraper._parse_price(100) == 100.0
        scraper.client.close()
    
    def test_parse_price_float(self):
        """Test price parsing with float input."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        assert scraper._parse_price(99.99) == 99.99
        scraper.client.close()
    
    def test_parse_price_string(self):
        """Test price parsing with string input."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        assert scraper._parse_price("$99.99") == 99.99
        assert scraper._parse_price("$1,299.99") == 1299.99
        assert scraper._parse_price("99.99") == 99.99
        scraper.client.close()
    
    def test_parse_price_none(self):
        """Test price parsing with None input."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        assert scraper._parse_price(None) is None
        scraper.client.close()
    
    def test_parse_price_invalid_string(self):
        """Test price parsing with invalid string."""
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        assert scraper._parse_price("not a price") is None
        scraper.client.close()
    
    @patch.object(UnwrangleFergusonScraper, "_make_request")
    def test_scrape_url_parses_response(self, mock_request):
        """Test that scrape_url correctly parses API response."""
        # Mock API response
        mock_request.return_value = {
            "detail": {
                "url": "https://www.fergusonhome.com/test",
                "name": "Test Sink",
                "brand": "Kohler",
                "model_number": "K-2362-8",
                "price": 366.75,
                "currency": "USD",
                "availability": True,
                "in_stock": True,
                "description": "A beautiful sink",
                "specifications": {"Material": "China"},
                "features": ["8-inch spacing"],
                "images": ["https://example.com/img.jpg"],
                "variants": [
                    {
                        "id": "1",
                        "sku": "K-2362-8-0",
                        "name": "White",
                        "price": 366.75,
                        "in_stock": True
                    }
                ],
                "business_category": "Bathroom Sinks",
                "rating": 4.5,
                "review_count": 10
            }
        }
        
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        product = scraper.scrape_url("https://www.fergusonhome.com/test")
        
        assert product.title == "Test Sink"
        assert product.brand == "Kohler"
        assert product.model_number == "K-2362-8"
        assert product.price == 366.75
        assert len(product.variants) == 1
        assert product.variants[0].name == "White"
        
        scraper.client.close()
    
    @patch.object(UnwrangleFergusonScraper, "search_products")
    def test_scrape_model_uses_search(self, mock_search):
        """Test that scrape_model calls search_products."""
        mock_search.return_value = {
            "success": True,
            "results": [
                {
                    "url": "https://www.fergusonhome.com/test",
                    "name": "Test Product",
                    "brand": "Kohler",
                    "model_number": "K-2362-8",
                    "price": 366.75
                }
            ]
        }
        
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        product = scraper.scrape_model("K-2362-8")
        
        assert product is not None
        assert product.brand == "Kohler"
        mock_search.assert_called_once_with("K-2362-8", max_results=1)
        
        scraper.client.close()
    
    @patch.object(UnwrangleFergusonScraper, "search_products")
    def test_scrape_model_returns_none_when_not_found(self, mock_search):
        """Test that scrape_model returns None when product not found."""
        mock_search.return_value = {
            "success": True,
            "results": []
        }
        
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        product = scraper.scrape_model("NONEXISTENT-123")
        
        assert product is None
        scraper.client.close()


class TestScraperIntegration:
    """Integration tests that verify scraper behavior with mock HTTP responses."""
    
    @patch("httpx.Client.get")
    def test_search_products_parses_response(self, mock_get):
        """Test that search_products correctly parses API response."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "results": [
                {
                    "name": "Sink 1",
                    "brand": "Kohler",
                    "model_no": "K-2362-8",
                    "url": "https://test.com/sink1",
                    "price": 366.75
                },
                {
                    "name": "Sink 2",
                    "brand": "Moen",
                    "model_no": "M-1234",
                    "url": "https://test.com/sink2",
                    "price": 299.99
                }
            ],
            "total_results": 2,
            "no_of_pages": 1
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response
        
        scraper = UnwrangleFergusonScraper(api_key="test_key")
        results = scraper.search_products("bathroom sinks", max_results=5)
        
        assert results["success"] == True
        assert len(results["results"]) == 2
        assert results["results"][0]["name"] == "Sink 1"
        assert results["total_results"] == 2
        
        scraper.client.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
