"""
Data Verification Utilities
Enforces 2-source verification across all portals
"""

from typing import Any, Dict, List, Optional
from datetime import datetime

# Critical fields that MUST have 2+ sources
CRITICAL_FIELDS = {
    'catalog': [
        'upc_gtin', 'model_number', 'product_title', 'brand',
        'country_of_origin', 'release_year', 'warranty',
        'finish_color', 'series_collection'
    ],
    'parts': [
        'upc', 'part_number', 'part_name', 'brand',
        'condition', 'is_oem', 'warranty'
    ],
    'home_products': [
        'upc_gtin', 'model_number', 'product_title', 'brand',
        'material', 'assembly_required', 'warranty',
        'care_instructions'
    ]
}

def extract_source_info(data: Dict[str, Any], field_name: str) -> Dict[str, Any]:
    """
    Extract source information for a field from AI response.
    Looks for patterns like field_name_sources, field_name_source_count, etc.
    """
    base_name = field_name.replace('_', '')
    
    # Check for explicit metadata fields
    source_count = data.get(f'{field_name}_source_count', 0)
    sources = data.get(f'{field_name}_sources', [])
    confidence = data.get(f'{field_name}_confidence')
    verified = data.get(f'{field_name}_verified', False)
    
    # If no explicit metadata, try to infer from verified_by
    if source_count == 0 and not sources:
        verified_by = data.get('verified_by', '')
        if verified_by and isinstance(verified_by, str):
            sources = [s.strip() for s in verified_by.split(',') if s.strip()]
            source_count = len(sources)
    
    return {
        'source_count': source_count,
        'sources': sources if isinstance(sources, list) else [],
        'confidence': confidence,
        'verified': verified or (source_count >= 2)
    }

def validate_field(
    field_value: Any,
    field_name: str,
    source_info: Dict[str, Any],
    strict_mode: bool = True
) -> Dict[str, Any]:
    """
    Validates a single field against 2-source requirement.
    
    Args:
        field_value: The field's value
        field_name: Name of the field
        source_info: Dictionary with source_count, sources, confidence, verified
        strict_mode: If True, nullifies unverified data. If False, marks but keeps it.
    
    Returns:
        Dict with validation result
    """
    if field_value is None or field_value == "":
        return {
            'value': None,
            'verified': False,
            'confidence': None,
            'source_count': 0,
            'sources': [],
            'status': 'no_data'
        }
    
    source_count = source_info.get('source_count', 0)
    
    if source_count >= 2:
        # VERIFIED: 2+ sources
        return {
            'value': field_value,
            'verified': True,
            'confidence': source_info.get('confidence', 'verified'),
            'source_count': source_count,
            'sources': source_info.get('sources', []),
            'status': 'verified'
        }
    elif source_count == 1:
        # UNVERIFIED: Single source
        return {
            'value': None if strict_mode else field_value,
            'verified': False,
            'confidence': 'single-source',
            'source_count': 1,
            'sources': source_info.get('sources', []),
            'status': 'insufficient_sources'
        }
    else:
        # UNKNOWN: No source tracking
        return {
            'value': None if strict_mode else field_value,
            'verified': False,
            'confidence': None,
            'source_count': 0,
            'sources': [],
            'status': 'no_source_tracking'
        }

def get_nested_value(data: Dict[str, Any], path: str) -> Any:
    """Get value from nested dict using dot notation path"""
    parts = path.split('.')
    value = data
    for part in parts:
        if isinstance(value, dict) and part in value:
            value = value[part]
        else:
            return None
    return value

def set_nested_value(data: Dict[str, Any], path: str, value: Any) -> None:
    """Set value in nested dict using dot notation path"""
    parts = path.split('.')
    current = data
    for i, part in enumerate(parts[:-1]):
        if part not in current:
            current[part] = {}
        current = current[part]
    current[parts[-1]] = value

def validate_product_data(
    product_data: Dict[str, Any],
    portal: str,
    strict_mode: bool = True,
    check_critical_only: bool = False
) -> Dict[str, Any]:
    """
    Validates product data against 2-source verification requirements.
    
    Args:
        product_data: The AI-enriched product data
        portal: Which portal ('catalog', 'parts', 'home_products')
        strict_mode: If True, removes unverified data
        check_critical_only: If True, only validates fields in CRITICAL_FIELDS
    
    Returns:
        Dict with validated data + verification report
    """
    critical_fields = CRITICAL_FIELDS.get(portal, [])
    
    verification_report = {
        'portal': portal,
        'total_critical_fields': len(critical_fields),
        'verified_fields': 0,
        'unverified_fields': 0,
        'missing_fields': 0,
        'verification_rate': 0.0,
        'strict_mode': strict_mode,
        'field_details': {}
    }
    
    validated_data = product_data.copy() if isinstance(product_data, dict) else {}
    
    # Validate critical fields
    for field_path in critical_fields:
        field_value = get_nested_value(product_data, field_path)
        source_info = extract_source_info(product_data, field_path.split('.')[0])
        
        validation = validate_field(
            field_value,
            field_path,
            source_info,
            strict_mode
        )
        
        # Update statistics
        if validation['status'] == 'verified':
            verification_report['verified_fields'] += 1
        elif validation['status'] == 'no_data':
            verification_report['missing_fields'] += 1
        else:
            verification_report['unverified_fields'] += 1
        
        # Store validation details
        verification_report['field_details'][field_path] = {
            'verified': validation['verified'],
            'source_count': validation['source_count'],
            'confidence': validation['confidence'],
            'status': validation['status']
        }
        
        # Apply strict mode if needed
        if strict_mode and not validation['verified'] and field_value is not None:
            set_nested_value(validated_data, field_path, None)
    
    # Calculate verification rate
    if verification_report['total_critical_fields'] > 0:
        verification_report['verification_rate'] = round(
            (verification_report['verified_fields'] / verification_report['total_critical_fields']) * 100,
            2
        )
    
    return {
        'data': validated_data,
        'verification': verification_report,
        'validated_at': datetime.utcnow().isoformat()
    }

def get_verification_summary(verification_report: Dict[str, Any]) -> str:
    """Generate human-readable verification summary"""
    verified = verification_report['verified_fields']
    total = verification_report['total_critical_fields']
    rate = verification_report['verification_rate']
    
    if rate >= 80:
        emoji = "✅"
    elif rate >= 60:
        emoji = "⚠️"
    else:
        emoji = "❌"
    
    return f"{emoji} {verified}/{total} critical fields verified ({rate}%)"

def add_verification_metadata(response_data: Dict[str, Any], verification_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add verification metadata to API response.
    """
    response_data['verification'] = {
        'summary': get_verification_summary(verification_result['verification']),
        'rate': verification_result['verification']['verification_rate'],
        'verified_count': verification_result['verification']['verified_fields'],
        'total_critical_fields': verification_result['verification']['total_critical_fields'],
        'strict_mode': verification_result['verification']['strict_mode']
    }
    
    # Optionally include detailed field report
    if verification_result['verification'].get('field_details'):
        response_data['verification']['field_details'] = verification_result['verification']['field_details']
    
    return response_data
