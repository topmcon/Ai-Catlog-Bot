"""
Tests for the verification module.
Tests data validation and 2-source verification logic.
"""

import os
import sys
import pytest

# Set environment variables before importing modules
os.environ["OPENAI_API_KEY"] = "test_key_not_real"
os.environ["XAI_API_KEY"] = "test_xai_key"
os.environ["API_KEY"] = "test123"

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from verification import (
    CRITICAL_FIELDS,
    extract_source_info,
    validate_field,
    validate_product_data,
    get_verification_summary,
    add_verification_metadata,
    get_nested_value,
    set_nested_value
)


class TestCriticalFieldsConfiguration:
    """Tests for critical fields configuration."""
    
    def test_catalog_critical_fields_defined(self):
        """Test that catalog portal has critical fields defined."""
        assert 'catalog' in CRITICAL_FIELDS
        assert 'upc_gtin' in CRITICAL_FIELDS['catalog']
        assert 'model_number' in CRITICAL_FIELDS['catalog']
        assert 'product_title' in CRITICAL_FIELDS['catalog']
        assert 'brand' in CRITICAL_FIELDS['catalog']
    
    def test_parts_critical_fields_defined(self):
        """Test that parts portal has critical fields defined."""
        assert 'parts' in CRITICAL_FIELDS
        assert 'upc' in CRITICAL_FIELDS['parts']
        assert 'part_number' in CRITICAL_FIELDS['parts']
        assert 'brand' in CRITICAL_FIELDS['parts']
    
    def test_home_products_critical_fields_defined(self):
        """Test that home_products portal has critical fields defined."""
        assert 'home_products' in CRITICAL_FIELDS
        assert 'upc_gtin' in CRITICAL_FIELDS['home_products']
        assert 'model_number' in CRITICAL_FIELDS['home_products']


class TestExtractSourceInfo:
    """Tests for extract_source_info function."""
    
    def test_extract_explicit_source_info(self):
        """Test extracting explicit source metadata."""
        data = {
            "price": "$100.00",
            "price_source_count": 3,
            "price_sources": ["manufacturer", "ajmadison", "ferguson"],
            "price_confidence": "verified",
            "price_verified": True
        }
        
        result = extract_source_info(data, "price")
        assert result["source_count"] == 3
        assert len(result["sources"]) == 3
        assert result["verified"] == True
    
    def test_extract_source_info_from_verified_by(self):
        """Test extracting source info from verified_by field."""
        data = {
            "price": "$100.00",
            "verified_by": "manufacturer, ajmadison"
        }
        
        result = extract_source_info(data, "price")
        assert result["source_count"] == 2
        assert len(result["sources"]) == 2
    
    def test_extract_source_info_no_sources(self):
        """Test extracting source info when no sources present."""
        data = {"price": "$100.00"}
        
        result = extract_source_info(data, "price")
        assert result["source_count"] == 0
        assert result["sources"] == []
        assert result["verified"] == False


class TestValidateField:
    """Tests for validate_field function."""
    
    def test_validate_field_with_verified_data(self):
        """Test validating field with 2+ sources."""
        source_info = {
            "source_count": 2,
            "sources": ["source1", "source2"],
            "confidence": "verified",
            "verified": True
        }
        
        result = validate_field("$100.00", "price", source_info, strict_mode=True)
        assert result["value"] == "$100.00"
        assert result["verified"] == True
        assert result["status"] == "verified"
    
    def test_validate_field_single_source_strict(self):
        """Test validating field with single source in strict mode."""
        source_info = {
            "source_count": 1,
            "sources": ["source1"]
        }
        
        result = validate_field("$100.00", "price", source_info, strict_mode=True)
        assert result["value"] is None  # Nullified in strict mode
        assert result["verified"] == False
        assert result["status"] == "insufficient_sources"
    
    def test_validate_field_single_source_non_strict(self):
        """Test validating field with single source in non-strict mode."""
        source_info = {
            "source_count": 1,
            "sources": ["source1"]
        }
        
        result = validate_field("$100.00", "price", source_info, strict_mode=False)
        assert result["value"] == "$100.00"  # Kept in non-strict mode
        assert result["verified"] == False
    
    def test_validate_field_none_value(self):
        """Test validating None field value."""
        source_info = {"source_count": 0, "sources": []}
        
        result = validate_field(None, "price", source_info, strict_mode=True)
        assert result["value"] is None
        assert result["status"] == "no_data"
    
    def test_validate_field_empty_string(self):
        """Test validating empty string field value."""
        source_info = {"source_count": 0, "sources": []}
        
        result = validate_field("", "price", source_info, strict_mode=True)
        assert result["value"] is None
        assert result["status"] == "no_data"


class TestValidateProductData:
    """Tests for validate_product_data function."""
    
    def test_validate_catalog_product(self):
        """Test validating catalog product data."""
        product_data = {
            "brand": "Kohler",
            "model_number": "K-2362-8",
            "product_title": "Pedestal Sink",
            "upc_gtin": "123456789012",
            "msrp_source_count": 2,
            "msrp_verified": True
        }
        
        result = validate_product_data(product_data, "catalog", strict_mode=True)
        assert "verification" in result
        assert result["verification"]["portal"] == "catalog"
        assert result["verification"]["total_critical_fields"] > 0
    
    def test_validate_parts_product(self):
        """Test validating parts product data."""
        product_data = {
            "brand": "GE",
            "part_number": "WD-12345",
            "part_name": "Water Valve",
            "upc": "123456789012"
        }
        
        result = validate_product_data(product_data, "parts", strict_mode=True)
        assert "verification" in result
        assert result["verification"]["portal"] == "parts"
    
    def test_validate_returns_verification_rate(self):
        """Test that validation returns verification rate."""
        product_data = {
            "brand": "Kohler",
            "model_number": "K-2362-8"
        }
        
        result = validate_product_data(product_data, "catalog")
        assert "verification_rate" in result["verification"]
        assert isinstance(result["verification"]["verification_rate"], float)


class TestNestedValueHelpers:
    """Tests for nested value helper functions."""
    
    def test_get_nested_value_simple(self):
        """Test getting value from nested dict with single key."""
        data = {"brand": "Kohler"}
        assert get_nested_value(data, "brand") == "Kohler"
    
    def test_get_nested_value_deep(self):
        """Test getting deeply nested value."""
        data = {
            "verified_info": {
                "core": {
                    "brand": "Kohler"
                }
            }
        }
        assert get_nested_value(data, "verified_info.core.brand") == "Kohler"
    
    def test_get_nested_value_missing(self):
        """Test getting missing nested value."""
        data = {"brand": "Kohler"}
        assert get_nested_value(data, "missing.key") is None
    
    def test_set_nested_value_simple(self):
        """Test setting value in nested dict."""
        data = {}
        set_nested_value(data, "brand", "Kohler")
        assert data["brand"] == "Kohler"
    
    def test_set_nested_value_deep(self):
        """Test setting deeply nested value."""
        data = {}
        set_nested_value(data, "info.brand", "Kohler")
        assert data["info"]["brand"] == "Kohler"


class TestGetVerificationSummary:
    """Tests for get_verification_summary function."""
    
    def test_summary_high_rate(self):
        """Test summary for high verification rate."""
        report = {
            "verified_fields": 9,
            "total_critical_fields": 10,
            "verification_rate": 90.0
        }
        
        summary = get_verification_summary(report)
        assert "✅" in summary
        assert "9/10" in summary
    
    def test_summary_medium_rate(self):
        """Test summary for medium verification rate."""
        report = {
            "verified_fields": 7,
            "total_critical_fields": 10,
            "verification_rate": 70.0
        }
        
        summary = get_verification_summary(report)
        assert "⚠️" in summary
        assert "7/10" in summary
    
    def test_summary_low_rate(self):
        """Test summary for low verification rate."""
        report = {
            "verified_fields": 3,
            "total_critical_fields": 10,
            "verification_rate": 30.0
        }
        
        summary = get_verification_summary(report)
        assert "❌" in summary
        assert "3/10" in summary


class TestAddVerificationMetadata:
    """Tests for add_verification_metadata function."""
    
    def test_adds_verification_to_response(self):
        """Test that verification metadata is added to response."""
        response_data = {"data": {"brand": "Kohler"}}
        verification_result = {
            "verification": {
                "verified_fields": 5,
                "total_critical_fields": 10,
                "verification_rate": 50.0,
                "strict_mode": True,
                "field_details": {"brand": {"verified": True}}
            }
        }
        
        result = add_verification_metadata(response_data, verification_result)
        assert "verification" in result
        assert "summary" in result["verification"]
        assert "rate" in result["verification"]
        assert result["verification"]["rate"] == 50.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
