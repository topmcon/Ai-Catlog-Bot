# Data Verification Implementation Plan

## Quick Start: Enable 2-Source Verification Today

### Current Status ✅
**Already Working:**
- All 3 portals verify MSRP/pricing with 2+ sources
- Infrastructure exists in code
- Frontend displays price verification status

**What We Need:**
Extend the same verification logic to ALL fields, not just pricing.

---

## Immediate Implementation (Today)

### Step 1: Enhance AI Prompts (15 minutes per portal)

Update the AI prompts to require source citations for ALL fields:

#### Catalog Portal (`main.py` - ENRICHMENT_PROMPT)
Find line ~900-1000 and add after the pricing rules:

```python
⚠️ FIELD-LEVEL VERIFICATION REQUIREMENT:

For EVERY field you populate (not just price), you MUST verify with 2+ independent sources:

VERIFIED FIELDS (2+ matching sources):
- brand, model_number, product_title
- upc_gtin, sku_internal, mpn
- country_of_origin, release_year
- dimensions (height, width, depth, weight)
- capacity, energy_rating
- warranty, finish_color

RULES:
1. **2+ sources MATCH** → Populate field + add metadata
2. **1 source only** → Set field to null
3. **Sources CONFLICT** → Set field to null
4. **No sources** → Set field to null

METADATA FORMAT:
For each critical field, track sources:
- verified_by: "Source1, Source2, Source3"
- source_count: 2+
- confidence: "verified"

Example:
{
  "upc_gtin": "012345678901",
  "upc_verified_by": "Manufacturer website, Best Buy, Home Depot",
  "upc_source_count": 3,
  "upc_confidence": "verified"
}
```

#### Parts Portal (`parts.py` - PARTS_ENRICHMENT_PROMPT)
Find line ~160-200 and expand the pricing rules to all fields:

```python
⚠️ UNIVERSAL SOURCE VERIFICATION:

Apply the SAME 2-source rule to ALL technical fields:

CRITICAL FIELDS REQUIRING 2+ SOURCES:
- part_number, brand, part_name
- upc (barcode)
- compatible_models (appliance model numbers)
- replaces_part_numbers, superseded_part_numbers
- voltage, amperage, wattage
- dimensions, weight
- warranty

DO NOT populate a field unless you have 2+ matching sources.

For single-source data:
- Set field to null
- Add note: "insufficient_sources"

For conflicting sources:
- Set field to null
- Add note: "conflicting_sources"
```

#### Home Products Portal (`home_products.py` - HOME_PRODUCTS_ENRICHMENT_PROMPT)
Find line ~280-320 and add global verification rules:

```python
⚠️ COMPREHENSIVE SOURCE VALIDATION:

ALL fields must be verified by 2+ independent sources:

REQUIRED VERIFICATION:
- Basic Info: brand, model_number, product_title, upc_gtin
- Physical: dimensions (H×W×D), weight, material, color
- Details: assembly_required, weight_capacity, seating_capacity
- Commercial: msrp_price (already implemented), warranty, care_instructions

VERIFICATION STANDARD:
✅ 2+ sources agree → Populate field
❌ 1 source only → Set null
❌ 2+ sources conflict → Set null
❌ No sources → Set null

SOURCES TO CITE:
- Manufacturer website (highest priority)
- Authorized retailers (Wayfair, Ashley, etc.)
- Product specifications sheets
- Multiple retail listings
```

---

### Step 2: Add Backend Validation (30 minutes)

Create a shared validation module:

**File: `/workspaces/Ai-Catlog-Bot/verification.py`**

```python
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
        'dimensions.height', 'dimensions.width', 'dimensions.depth',
        'weight.product_weight', 'capacity', 'energy_rating',
        'country_of_origin', 'release_year', 'warranty'
    ],
    'parts': [
        'upc', 'part_number', 'part_name', 'brand',
        'compatible_models', 'replaces_part_numbers',
        'voltage', 'amperage', 'wattage',
        'dimensions', 'weight', 'warranty'
    ],
    'home_products': [
        'upc_gtin', 'model_number', 'product_title', 'brand',
        'dimensions.height', 'dimensions.width', 'dimensions.depth',
        'weight', 'material', 'assembly_required',
        'weight_capacity', 'seating_capacity', 'warranty'
    ]
}

def extract_source_count(field_data: Any, field_name: str) -> int:
    """
    Extract source count from AI response.
    Looks for patterns like:
    - field_name_source_count: 2
    - field_name_sources: ["source1", "source2"]
    - verified_by: "source1, source2"
    """
    if isinstance(field_data, dict):
        # Check for explicit source_count
        if f'{field_name}_source_count' in field_data:
            return field_data[f'{field_name}_source_count']
        
        # Check for sources array
        if f'{field_name}_sources' in field_data:
            sources = field_data[f'{field_name}_sources']
            return len(sources) if isinstance(sources, list) else 0
        
        # Check for verified_by string
        if 'verified_by' in field_data:
            verified_by = field_data['verified_by']
            if isinstance(verified_by, str):
                return len([s.strip() for s in verified_by.split(',') if s.strip()])
    
    return 0

def validate_field_verification(
    field_value: Any,
    field_name: str,
    source_count: int,
    strict_mode: bool = True
) -> Dict[str, Any]:
    """
    Validates a field against 2-source requirement.
    
    Args:
        field_value: The field's value
        field_name: Name of the field
        source_count: Number of sources that verified this field
        strict_mode: If True, nullifies unverified data. If False, marks but keeps it.
    
    Returns:
        Dict with verification metadata
    """
    if field_value is None or field_value == "":
        return {
            'value': None,
            'verified': False,
            'confidence': None,
            'source_count': 0,
            'note': 'no_data'
        }
    
    if source_count >= 2:
        # VERIFIED: 2+ sources
        return {
            'value': field_value,
            'verified': True,
            'confidence': 'verified',
            'source_count': source_count,
            'note': None
        }
    elif source_count == 1:
        # UNVERIFIED: Single source
        return {
            'value': None if strict_mode else field_value,
            'verified': False,
            'confidence': 'single-source',
            'source_count': 1,
            'note': 'insufficient_sources'
        }
    else:
        # UNKNOWN: No source tracking
        return {
            'value': None if strict_mode else field_value,
            'verified': False,
            'confidence': None,
            'source_count': 0,
            'note': 'no_source_tracking'
        }

def validate_product_data(
    product_data: Dict[str, Any],
    portal: str,
    strict_mode: bool = True
) -> Dict[str, Any]:
    """
    Validates entire product response against verification requirements.
    
    Args:
        product_data: The AI-enriched product data
        portal: Which portal ('catalog', 'parts', 'home_products')
        strict_mode: If True, removes unverified data
    
    Returns:
        Dict with validated data + verification report
    """
    critical_fields = CRITICAL_FIELDS.get(portal, [])
    validated_data = product_data.copy()
    verification_report = {
        'total_fields': len(critical_fields),
        'verified_fields': 0,
        'unverified_fields': 0,
        'missing_fields': 0,
        'verification_rate': 0.0,
        'field_details': {}
    }
    
    for field_path in critical_fields:
        # Handle nested fields (e.g., "dimensions.height")
        parts = field_path.split('.')
        field_value = product_data
        
        # Navigate to nested field
        for part in parts:
            if isinstance(field_value, dict) and part in field_value:
                field_value = field_value[part]
            else:
                field_value = None
                break
        
        # Extract source count from metadata
        source_count = extract_source_count(product_data, parts[0])
        
        # Validate the field
        validation = validate_field_verification(
            field_value,
            field_path,
            source_count,
            strict_mode
        )
        
        # Update report
        if validation['verified']:
            verification_report['verified_fields'] += 1
        elif field_value is None:
            verification_report['missing_fields'] += 1
        else:
            verification_report['unverified_fields'] += 1
        
        verification_report['field_details'][field_path] = validation
    
    # Calculate verification rate
    if verification_report['total_fields'] > 0:
        verification_report['verification_rate'] = round(
            (verification_report['verified_fields'] / verification_report['total_fields']) * 100,
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
    total = verification_report['total_fields']
    rate = verification_report['verification_rate']
    
    return f"{verified}/{total} fields verified ({rate}%)"
```

---

### Step 3: Integrate Validation into Endpoints (15 minutes per portal)

#### Update Catalog Portal

In `main.py`, find the `/enrich` endpoint (around line 700-800) and add:

```python
from verification import validate_product_data, get_verification_summary

@app.post("/enrich", response_model=EnrichmentResponse)
async def enrich_product_data(...):
    # ... existing code ...
    
    if success:
        # ADD VALIDATION HERE
        validated_result = validate_product_data(
            product_record,
            portal='catalog',
            strict_mode=True  # Set False to keep unverified data
        )
        
        return {
            "success": True,
            "data": validated_result['data'],
            "verification": validated_result['verification'],
            "verification_summary": get_verification_summary(
                validated_result['verification']
            ),
            "metadata": {...}
        }
```

#### Similar updates for Parts and Home Products portals

---

### Step 4: Frontend Display (Optional - Phase 2)

Add verification badges to product displays:

```jsx
// In ProductDisplay components
{field.verified && (
  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
    ✓ {field.source_count} sources
  </span>
)}

{!field.verified && field.value && (
  <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
    ⚠ Unverified
  </span>
)}
```

---

## Testing Plan

### Test 1: Known Product with Good Data
```bash
# Should return VERIFIED data
curl -X POST "https://api.cxc-ai.com/enrich" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "brand": "Samsung",
    "model_number": "RF28R7351SR"
  }' | python3 -c "import json, sys; d=json.load(sys.stdin); print('Verification Rate:', d['verification']['verification_rate'], '%')"
```

### Test 2: Obscure Product
```bash
# Should return lower verification rate
curl -X POST "https://api.cxc-ai.com/enrich" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: catbot123" \
  -d '{
    "brand": "UnknownBrand",
    "model_number": "ABC123XYZ"
  }' | python3 -c "import json, sys; d=json.load(sys.stdin); print('Verification Rate:', d['verification']['verification_rate'], '%')"
```

---

## Rollout Recommendation

### 🚀 Today (2 hours)
1. ✅ Create `verification.py` module
2. ✅ Update AI prompts (all 3 portals)
3. ✅ Add validation to 1 portal (start with Catalog)
4. ✅ Test with known products
5. ✅ Deploy to production

### 📊 This Week
1. Add validation to remaining portals
2. Monitor verification rates
3. Tune AI prompts if rates < 80%
4. Document common unverifiable fields

### 🎨 Next Week
1. Add frontend verification badges
2. Create admin dashboard for verification metrics
3. Allow users to filter "verified only" data

---

## Key Decision: Strict Mode vs Lenient Mode

**Strict Mode (`strict_mode=True`)**: ✅ RECOMMENDED
- Nullifies unverified data
- Only shows 2+ source verified info
- Highest data quality
- May have sparse results for obscure products

**Lenient Mode (`strict_mode=False`)**:
- Shows all data but marks verification status
- More complete results
- Lower data quality guarantee
- Users see warnings on unverified fields

**Recommendation**: Start with Strict Mode for critical fields (UPC, dimensions, pricing) and Lenient Mode for descriptive fields (color, features, descriptions).

---

## Success Criteria

After implementation, track:
- ✅ 80%+ verification rate for popular products (Samsung, LG, Whirlpool)
- ✅ 60%+ verification rate for mid-tier brands
- ✅ Clear "unverified" indicators for low-confidence data
- ✅ No customer complaints about inaccurate specs
- ✅ Reduced support tickets related to wrong dimensions/specs

---

## Support & Maintenance

**If verification rates are low:**
1. Check AI provider performance (OpenAI vs xAI)
2. Enhance prompts with specific source examples
3. Add manual verification for top 100 products
4. Consider switching to lenient mode for some fields

**If performance degrades:**
1. Cache verified results for popular products
2. Run validation async (return preliminary data, validate in background)
3. Pre-verify top requested products

**Questions?** Review `DATA_VERIFICATION_FRAMEWORK.md` for detailed strategy.
