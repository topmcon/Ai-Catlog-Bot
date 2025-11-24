# Data Verification Framework

## Executive Summary

This framework establishes a **2-source verification requirement** across all portals to ensure data quality and accuracy. Any data point that cannot be verified by at least 2 independent sources will be marked as unverified or null.

---

## Current State Analysis

### ✅ Already Implemented (Price Verification)

All three portals **already enforce 2-source verification for pricing**:

#### Catalog Portal (`main.py`)
- **MSRP Pricing**: Requires 2+ matching sources
- Fields: `msrp_confidence`, `msrp_sources`, `msrp_source_count`, `msrp_verified`
- Rules:
  - ✅ 2+ sources match → `msrp_verified: true`, `confidence: "verified"`
  - ❌ 1 source only → `msrp_price: null`, `verified: false`
  - ❌ Sources conflict → `msrp_price: null`, `verified: false`

#### Parts Portal (`parts.py`)
- **Part Pricing**: Requires 2+ matching sources
- Fields: `price_confidence`, `price_sources`, `price_source_count`, `price_verified`
- Rules:
  - ✅ 2+ sources match → `price_verified: true`, `confidence: "verified"`
  - ⚠️ 1 source only → Shows price but `verified: false`, `confidence: "single-source"`
  - ⚠️ 2+ conflicting → Shows lower price, `verified: false`, `confidence: "conflicting"`

#### Home Products Portal (`home_products.py`)
- **MSRP Pricing**: Requires 2+ matching sources
- Fields: `msrp_confidence`, `msrp_sources`, `msrp_source_count`, `msrp_verified`
- Backend validation: Nullifies price if `msrp_source_count < 2`

---

## Proposed Expansion: Field-Level Verification

### Phase 1: Critical Fields (Immediate Priority)

Expand 2-source verification to these high-priority fields:

#### All Portals - Core Identification
- ✅ **Price/MSRP** (already implemented)
- 🔄 **UPC/GTIN** - Product barcode
- 🔄 **Model Number** - Must match user input or have 2+ sources
- 🔄 **Brand** - Verify manufacturer name
- 🔄 **Product Title** - Official product name
- 🔄 **Country of Origin** - Manufacturing country
- 🔄 **Release Year** - Product launch year

#### Catalog Portal - Specifications
- 🔄 **Dimensions** (height, width, depth)
- 🔄 **Weight**
- 🔄 **Energy Rating** (Energy Star, etc.)
- 🔄 **Capacity** (cubic feet, liters, etc.)
- 🔄 **Warranty** - Official warranty terms

#### Parts Portal - Technical Specs
- 🔄 **Voltage/Amperage/Wattage**
- 🔄 **Compatible Models** - Which appliances it fits
- 🔄 **Replaces Part Numbers** - Cross-reference data
- 🔄 **OEM vs Aftermarket** - Part authenticity

#### Home Products Portal - Product Details
- 🔄 **Dimensions**
- 🔄 **Materials** - Fabric, wood type, etc.
- 🔄 **Assembly Required**
- 🔄 **Weight Capacity**

---

## Implementation Strategy

### Option 1: AI Prompt Enhancement (Recommended - Fastest)

**Pros:**
- No code changes required
- Immediate deployment
- AI naturally provides sources when available
- Already working for pricing

**Cons:**
- Relies on AI accuracy
- Cannot guarantee sources for all fields
- No hard enforcement at code level

**Implementation:**
```
For EVERY field you populate, you must cite at least 2 independent sources.
If you cannot find 2 matching sources for a field, set it to null.

For each verified field, track:
- field_name: value
- field_name_confidence: "verified" | "single-source" | "conflicting" | null
- field_name_sources: ["source1", "source2"]
- field_name_source_count: integer
- field_name_verified: boolean
```

### Option 2: Post-Processing Validation (Recommended - Balanced)

**Pros:**
- Enforces verification in code
- Can audit AI responses
- Flexible rules per field type
- Catches AI hallucinations

**Cons:**
- Requires backend development
- Adds processing time
- Need to define validation rules

**Implementation:**
1. AI returns data with embedded source citations
2. Backend validator checks each field:
   - Parse source citations
   - Count unique sources
   - If < 2 sources: nullify field or mark unverified
3. Return verified + unverified data separately

### Option 3: Structured Data Model with Verification (Comprehensive)

**Pros:**
- Strongly typed verification system
- Database-ready structure
- Full audit trail
- Can show confidence to users

**Cons:**
- Most development work
- Response size increases
- Complex data model

**Implementation:**
```python
class VerifiedField(BaseModel):
    value: Any
    confidence: str  # "verified" | "single-source" | "conflicting" | null
    sources: List[str]
    source_count: int
    verified: bool
    verified_at: datetime

class VerifiedProduct(BaseModel):
    brand: VerifiedField
    model_number: VerifiedField
    upc: VerifiedField
    # ... all fields become VerifiedField
```

---

## Recommended Rollout Plan

### ✅ Phase 0: Complete (Pricing Only)
- All portals verify pricing with 2+ sources
- Working in production

### 🔄 Phase 1: Expand to Critical Fields (Week 1-2)
**Action:** Update AI prompts for all portals

**Fields to add:**
1. UPC/GTIN
2. Model Number (verification)
3. Product Title
4. Dimensions
5. Weight

**Method:** Enhance prompts with source requirement
**Validation:** Add post-processing checks in `main.py`, `parts.py`, `home_products.py`

### 🔄 Phase 2: Technical Specifications (Week 3-4)
**Action:** Add verification to technical specs

**Fields:**
- Electrical specs (voltage, amperage)
- Mechanical specs (capacity, flow rate)
- Compatibility data
- Warranty information

### 🔄 Phase 3: Frontend Display (Week 5-6)
**Action:** Show verification status to users

**UI Updates:**
- Add verification badges: ✅ Verified (2+ sources) | ⚠️ Unverified (1 source) | ❓ Unknown
- Show source count: "Verified by 3 sources"
- Expandable source list (optional)
- Filter by verified data only

### 🔄 Phase 4: Analytics & Reporting (Week 7-8)
**Action:** Track verification rates

**Metrics:**
- % of fields verified per portal
- Most/least verifiable fields
- Source reliability scores
- Verification trends over time

---

## Sample Implementation Code

### Backend: Post-Processing Validator

```python
def validate_field_sources(field_value, field_sources):
    """
    Validates that a field has at least 2 sources.
    Returns validation metadata.
    """
    if field_value is None:
        return {
            "verified": False,
            "confidence": None,
            "source_count": 0,
            "sources": []
        }
    
    source_count = len(field_sources) if field_sources else 0
    
    if source_count >= 2:
        return {
            "verified": True,
            "confidence": "verified",
            "source_count": source_count,
            "sources": field_sources
        }
    elif source_count == 1:
        return {
            "verified": False,
            "confidence": "single-source",
            "source_count": 1,
            "sources": field_sources
        }
    else:
        return {
            "verified": False,
            "confidence": None,
            "source_count": 0,
            "sources": []
        }

def enforce_verification_policy(product_data, strict_mode=True):
    """
    Enforces 2-source verification policy.
    If strict_mode=True, nullifies unverified fields.
    If strict_mode=False, marks them but keeps data.
    """
    verified_fields = {}
    unverified_fields = {}
    
    for field_name, field_info in product_data.items():
        if not isinstance(field_info, dict) or 'value' not in field_info:
            continue
            
        validation = validate_field_sources(
            field_info.get('value'),
            field_info.get('sources', [])
        )
        
        if validation['verified']:
            verified_fields[field_name] = {
                **field_info,
                **validation
            }
        else:
            if strict_mode:
                # Nullify unverified data
                unverified_fields[field_name] = {
                    'value': None,
                    **validation
                }
            else:
                # Keep data but mark as unverified
                unverified_fields[field_name] = {
                    **field_info,
                    **validation
                }
    
    return {
        'verified': verified_fields,
        'unverified': unverified_fields
    }
```

### Frontend: Verification Badge Component

```jsx
function VerificationBadge({ verified, sourceCount, sources }) {
  if (verified && sourceCount >= 2) {
    return (
      <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Verified ({sourceCount} sources)
      </span>
    )
  }
  
  if (sourceCount === 1) {
    return (
      <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Unverified (1 source)
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      Unknown
    </span>
  )
}
```

---

## Decision Matrix

| Approach | Speed | Accuracy | Effort | Cost | Recommended |
|----------|-------|----------|--------|------|-------------|
| **AI Prompt Only** | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | 🔨 Low | 💰 Free | ✅ Phase 1 |
| **Post-Processing** | ⚡⚡ Medium | ⭐⭐⭐⭐ Very Good | 🔨🔨 Medium | 💰 Free | ✅ Phase 2 |
| **Structured Model** | ⚡ Slower | ⭐⭐⭐⭐⭐ Excellent | 🔨🔨🔨 High | 💰💰 Some | 🔄 Phase 3+ |

---

## Next Steps

1. **Immediate:** Update AI prompts to require 2 sources for critical fields
2. **This Week:** Add post-processing validation for UPC, dimensions, weight
3. **Next Sprint:** Implement frontend verification badges
4. **Future:** Full structured data model with audit trails

---

## Success Metrics

Track these KPIs to measure verification effectiveness:

- **Verification Rate**: % of fields with 2+ sources
- **User Trust**: Customer feedback on data accuracy
- **Support Tickets**: Reduction in data quality complaints
- **AI Performance**: Which AI provider gives more sources
- **Field Reliability**: Which fields are hardest to verify

Target: **≥80% verification rate** for critical fields by end of Phase 2.
