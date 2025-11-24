"""
Home Products Enrichment Module
Supports: Plumbing, Kitchen, Lighting, Bath, Fans, Hardware, Cabinet Hardware, Outdoor, HVAC
Master Product Data Schema v1.0 - Sections A through L
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ============================================================================
# SECTION A — PRODUCT IDENTITY
# ============================================================================

class ProductIdentity(BaseModel):
    """Every product must contain these fields"""
    brand: Optional[str] = Field(None, description="Manufacturer brand")
    model_number: Optional[str] = Field(None, description="Manufacturer model number")
    mpn: Optional[str] = Field(None, description="Manufacturer part number")
    sku: Optional[str] = Field(None, description="Internal SKU")
    upc_ean_gtin: Optional[str] = Field(None, description="Barcode identifiers")
    product_title: Optional[str] = Field(None, description="Clean standardized title")
    product_type: Optional[str] = Field(None, description="High-level type (Faucet, Range Hood, etc.)")
    department: Optional[str] = Field(None, description="Bathroom/Kitchen/Lighting/Bath/Fans/Hardware/Cabinet Hardware/Outdoor/HVAC")
    category: Optional[str] = Field(None, description="e.g., Bathroom Faucets, Kitchen Sinks")
    subcategory: Optional[str] = Field(None, description="e.g., Widespread/Single-hole/etc.")
    series_collection: Optional[str] = Field(None, description="e.g., Delta Trinsic, Kohler Artifacts")
    msrp_price: Optional[str] = Field(None, description="Manufacturer's suggested retail price")

# ============================================================================
# SECTION B — PHYSICAL ATTRIBUTES
# ============================================================================

class PhysicalDimensions(BaseModel):
    """Product and shipping dimensions"""
    overall_height: Optional[str] = Field(None, description="Product height (not shipping)")
    overall_width: Optional[str] = Field(None, description="Product width (not shipping)")
    overall_depth: Optional[str] = Field(None, description="Product depth (not shipping)")
    product_weight: Optional[str] = Field(None, description="Product weight (not shipping)")
    shipping_weight: Optional[str] = Field(None, description="Product + manufacturer box weight")
    shipping_length: Optional[str] = Field(None, description="Shipping box length")
    shipping_width: Optional[str] = Field(None, description="Shipping box width")
    shipping_height: Optional[str] = Field(None, description="Shipping box height")

class MaterialConstruction(BaseModel):
    """Material and build quality information"""
    primary_material: Optional[str] = Field(None, description="Primary construction material")
    secondary_materials: Optional[List[str]] = Field(None, description="Additional materials used")
    surface_treatment: Optional[str] = Field(None, description="PVD, Lacquer, Powder Coat, etc.")

class FinishColor(BaseModel):
    """Finish and color specifications"""
    color: Optional[str] = Field(None, description="Product color")
    finish_name: Optional[str] = Field(None, description="Specific finish name")
    finish_family: Optional[str] = Field(None, description="Matte Black, Chrome, Brushed Nickel, Brass, White, etc.")
    sheen_level: Optional[str] = Field(None, description="Matte/Satin/Polished")
    color_variants: Optional[List[str]] = Field(None, description="Available color options")

# ============================================================================
# SECTION C — TECHNICAL / PERFORMANCE ATTRIBUTES
# ============================================================================

class MechanicalPlumbing(BaseModel):
    """Plumbing-specific technical specifications"""
    flow_rate_gpm: Optional[str] = Field(None, description="Gallons per minute")
    pressure_range_psi: Optional[str] = Field(None, description="Operating pressure range")
    valve_type: Optional[str] = Field(None, description="Type of valve mechanism")
    connection_size: Optional[str] = Field(None, description="½\", ⅜\", etc.")
    drain_size: Optional[str] = Field(None, description="Drain diameter")
    water_temperature_range: Optional[str] = Field(None, description="Min/max water temperature")
    water_inlet_outlet_positions: Optional[str] = Field(None, description="Connection positions")
    capacity_gallons: Optional[str] = Field(None, description="Capacity for tubs, sinks, tanks")

class ElectricalSpecs(BaseModel):
    """Electrical specifications"""
    voltage: Optional[str] = Field(None, description="120V/240V/12V/24V")
    amperage: Optional[str] = Field(None, description="Current rating")
    wattage: Optional[str] = Field(None, description="Power consumption")
    frequency: Optional[str] = Field(None, description="50/60Hz")
    energy_consumption: Optional[str] = Field(None, description="Energy usage rating")
    motor_type: Optional[str] = Field(None, description="AC/DC/Brushless")
    led_type: Optional[str] = Field(None, description="LED module type")

class LightingSpecs(BaseModel):
    """Lighting-specific specifications"""
    lumens: Optional[str] = Field(None, description="Light output")
    color_temperature_kelvin: Optional[str] = Field(None, description="Color temperature in Kelvin")
    cri: Optional[str] = Field(None, description="Color Rendering Index")
    wattage_per_bulb: Optional[str] = Field(None, description="Per-bulb wattage")
    bulb_type: Optional[str] = Field(None, description="LED/Incandescent/etc.")
    number_of_bulbs: Optional[str] = Field(None, description="Total bulb count")
    dimmable: Optional[str] = Field(None, description="Yes/No")

class HVACPerformance(BaseModel):
    """HVAC performance specifications"""
    btu: Optional[str] = Field(None, description="British Thermal Units")
    seer2: Optional[str] = Field(None, description="Seasonal Energy Efficiency Ratio 2")
    hspf2: Optional[str] = Field(None, description="Heating Seasonal Performance Factor 2")
    eer: Optional[str] = Field(None, description="Energy Efficiency Ratio")
    cfm: Optional[str] = Field(None, description="Cubic Feet per Minute")
    refrigerant_type: Optional[str] = Field(None, description="Refrigerant specification")

# ============================================================================
# SECTION D — INSTALLATION ATTRIBUTES
# ============================================================================

class InstallationAttributes(BaseModel):
    """Installation requirements and specifications"""
    installation_type: Optional[str] = Field(None, description="Wall/Floor/Deck/Ceiling/Undermount")
    mounting_type: Optional[str] = Field(None, description="Recessed/Surface/Flush")
    hardware_included: Optional[str] = Field(None, description="Yes/No")
    mounting_hardware_type: Optional[str] = Field(None, description="Type of mounting hardware")
    rough_in_requirements: Optional[str] = Field(None, description="Rough-in specifications")
    cutout_dimensions: Optional[str] = Field(None, description="Required cutout size")
    minimum_clearance: Optional[str] = Field(None, description="Minimum clearance requirements")
    wiring_type: Optional[str] = Field(None, description="Hardwire/Plug-in")
    included_accessories: Optional[List[str]] = Field(None, description="Accessories included")
    additional_required_parts: Optional[List[str]] = Field(None, description="Additional parts needed")

# ============================================================================
# SECTION E — COMPATIBILITY & REQUIREMENTS
# ============================================================================

class CompatibilityRequirements(BaseModel):
    """Compatibility and integration requirements"""
    compatible_valves: Optional[List[str]] = Field(None, description="Compatible valve models")
    compatible_trims: Optional[List[str]] = Field(None, description="Compatible trim models")
    required_rough_in_number: Optional[str] = Field(None, description="Required rough-in part number")
    compatible_doors: Optional[str] = Field(None, description="Compatible door specifications")
    door_thickness: Optional[str] = Field(None, description="Compatible door thickness")
    replacement_part_numbers: Optional[List[str]] = Field(None, description="Replacement part numbers")
    fuel_type_compatibility: Optional[List[str]] = Field(None, description="Propane/Natural Gas/Electric")
    smart_home_compatibility: Optional[List[str]] = Field(None, description="Alexa/Google/SmartThings/etc.")

# ============================================================================
# SECTION F — ENVIRONMENTAL RATINGS
# ============================================================================

class EnvironmentalRatings(BaseModel):
    """Environmental and location ratings"""
    indoor_outdoor_rated: Optional[str] = Field(None, description="Indoor/Outdoor/Both")
    location_rating: Optional[str] = Field(None, description="Wet/Damp/Dry location rated")
    heat_resistance: Optional[str] = Field(None, description="Heat resistance rating")
    uv_resistance: Optional[str] = Field(None, description="UV resistance rating")
    ip_rating: Optional[str] = Field(None, description="Ingress Protection rating")

# ============================================================================
# SECTION G — CERTIFICATIONS & COMPLIANCE
# ============================================================================

class CertificationsCompliance(BaseModel):
    """Product certifications and compliance standards"""
    ada_compliant: Optional[str] = Field(None, description="ADA compliance Yes/No")
    watersense: Optional[str] = Field(None, description="WaterSense certified Yes/No")
    ul_etl_listed: Optional[str] = Field(None, description="UL/ETL listing")
    csa_listed: Optional[str] = Field(None, description="CSA certification")
    energy_star: Optional[str] = Field(None, description="Energy Star certified")
    ahri_certified: Optional[str] = Field(None, description="AHRI certification")
    title_24: Optional[str] = Field(None, description="California Title 24 compliant")
    nsf_certified: Optional[str] = Field(None, description="NSF certification")
    asme_certified: Optional[str] = Field(None, description="ASME certification")

# ============================================================================
# SECTION K — AI ENRICHMENT FIELDS
# ============================================================================

class AIEnrichmentFields(BaseModel):
    """AI-generated content using the attributes above"""
    key_features: Optional[List[str]] = Field(None, description="4 to 10 key features (bullet points)")
    one_sentence_highlight: Optional[str] = Field(None, description="1-sentence product highlight")
    detailed_description: Optional[str] = Field(None, description="Detailed product description")
    why_this_product: Optional[str] = Field(None, description="Value proposition")
    fitment_notes: Optional[str] = Field(None, description="Fitment guidance")
    compatibility_notes: Optional[str] = Field(None, description="Compatibility information")
    installation_notes: Optional[str] = Field(None, description="Installation guidance")
    seo_title: Optional[str] = Field(None, description="SEO-optimized title")
    seo_meta_description: Optional[str] = Field(None, description="SEO meta description")
    seo_keywords: Optional[List[str]] = Field(None, description="SEO keywords")
    collection_story: Optional[str] = Field(None, description="Collection story if applicable")

# ============================================================================
# SECTION L — FILTERING FIELDS
# ============================================================================

class FilteringFields(BaseModel):
    """Faceted navigation fields for conversions"""
    brand_filter: Optional[str] = Field(None, description="Brand for filtering")
    finish_filter: Optional[str] = Field(None, description="Finish for filtering")
    material_filter: Optional[str] = Field(None, description="Material for filtering")
    price_range: Optional[str] = Field(None, description="Price range bracket")
    width_filter: Optional[str] = Field(None, description="Width range")
    height_filter: Optional[str] = Field(None, description="Height range")
    depth_filter: Optional[str] = Field(None, description="Depth range")
    flow_rate_filter: Optional[str] = Field(None, description="Flow rate range")
    cfm_filter: Optional[str] = Field(None, description="CFM range")
    btu_filter: Optional[str] = Field(None, description="BTU range")
    voltage_filter: Optional[str] = Field(None, description="Voltage options")
    room_size_filter: Optional[str] = Field(None, description="Recommended room size")
    style_filter: Optional[str] = Field(None, description="Style category")
    mounting_type_filter: Optional[str] = Field(None, description="Mounting type")
    special_features: Optional[List[str]] = Field(None, description="Special features")
    certifications_filter: Optional[List[str]] = Field(None, description="Certifications")
    smart_features: Optional[List[str]] = Field(None, description="Smart home features")
    color_temperature_filter: Optional[str] = Field(None, description="Color temperature range")
    bulb_type_filter: Optional[str] = Field(None, description="Bulb type")
    number_of_handles: Optional[str] = Field(None, description="Handle count")
    hole_configuration: Optional[str] = Field(None, description="Hole configuration")
    indoor_outdoor_filter: Optional[str] = Field(None, description="Indoor/Outdoor filter")

# ============================================================================
# COMPREHENSIVE HOME PRODUCT RECORD
# ============================================================================

class HomeProductRecord(BaseModel):
    """
    Master Product Data Schema v1.0
    Complete home products enrichment record covering all departments:
    Bathroom, Kitchen, Lighting, Bath, Fans, Hardware, Cabinet Hardware, Outdoor, HVAC
    """
    # Section A
    product_identity: ProductIdentity
    
    # Section B
    dimensions: PhysicalDimensions
    material_construction: MaterialConstruction
    finish_color: FinishColor
    
    # Section C
    mechanical_plumbing: MechanicalPlumbing
    electrical_specs: ElectricalSpecs
    lighting_specs: LightingSpecs
    hvac_performance: HVACPerformance
    
    # Section D
    installation: InstallationAttributes
    
    # Section E
    compatibility: CompatibilityRequirements
    
    # Section F
    environmental: EnvironmentalRatings
    
    # Section G
    certifications: CertificationsCompliance
    
    # Section K
    ai_enrichment: AIEnrichmentFields
    
    # Section L
    filtering: FilteringFields
    
    # Metadata
    enriched_at: Optional[str] = None
    ai_provider: Optional[str] = None
    confidence_score: Optional[float] = None

# ============================================================================
# AI ENRICHMENT PROMPT TEMPLATE
# ============================================================================

HOME_PRODUCTS_ENRICHMENT_PROMPT = """You are a product data enrichment specialist for home improvement products covering Plumbing, Kitchen, Lighting, Bath, Fans, Hardware, Cabinet Hardware, Outdoor, and HVAC departments.

INPUT DATA:
- Model Number: {model_number} (REQUIRED)
- Brand: {brand} (if provided - helps identification)
- Description: {description} (if provided - helps identification)

🔵 PRIORITIZATION RULE - FERGUSON DATA FIRST:
- When researching products, CHECK fergusonhome.com FIRST as a primary source
- Ferguson is our partner and carries many of our products
- Their data should be prioritized for specifications, pricing, and product details
- Use Ferguson data as the baseline when available, supplement with other sources

⚠️ STRICT MSRP VALIDATION - AUTHORITATIVE SOURCES REQUIRED:

**CRITICAL: You must provide actual source names in msrp_sources array**

AUTHORIZED SOURCES (check in this order):
1. Ferguson (fergusonhome.com) - PRIORITY SOURCE
2. Manufacturer's official website
3. AJ Madison (ajmadison.com)
4. Best Buy (bestbuy.com)
5. Costco (costco.com)
6. Home Depot (homedepot.com)
7. Lowes (lowes.com)

PRICING RULES (STRICT - Better NULL than WRONG):
- **2+ authorized sources with EXACT MATCH** → Set msrp_price, confidence: "verified", list source names in msrp_sources array
- **Single source only** → msrp_price: null, msrp_sources: []
- **Sources conflict** → msrp_price: null, msrp_sources: []
- **No authorized sources** → msrp_price: null, msrp_sources: []

IMPORTANT: List actual source names like ["ferguson", "homedepot"] in the msrp_sources field

YOUR TASK:
Using the model number as the primary identifier (and brand/description as helpers if provided), research and enrich this product with comprehensive details following the Master Product Data Schema v1.0 (Sections A through L).

IMPORTANT INSTRUCTIONS:
1. **Model Number is PRIMARY** - Use this to identify the exact product
2. **Brand & Description are HELPERS** - Use them to narrow down search if provided
3. **Be thorough** - Fill as many fields as possible with accurate information
4. **Department Detection** - Automatically determine which department (Bathroom/Kitchen/Lighting/etc.)
5. **Smart Field Application** - Only populate fields relevant to the product type:
   - Plumbing products: Focus on flow rate, pressure, valve type, etc.
   - Lighting products: Focus on lumens, color temperature, bulb type, etc.
   - HVAC products: Focus on BTU, SEER2, CFM, etc.
   - Skip irrelevant fields (e.g., don't add CFM to a faucet)
6. **AI Enrichment** - Generate compelling marketing content in Section K
7. **Filtering Fields** - Populate Section L for faceted search/filtering

RESPONSE FORMAT:
Return a complete JSON object matching the HomeProductRecord schema with all 12 sections (A-L):

{{
  "product_identity": {{
    "brand": "...",
    "model_number": "...",
    "mpn": "...",
    "sku": "...",
    "upc_ean_gtin": "...",
    "product_title": "...",
    "product_type": "...",
    "department": "...",
    "category": "...",
    "subcategory": "...",
    "series_collection": "...",
    "msrp_price": "..."
  }},
  "dimensions": {{ ... }},
  "material_construction": {{ ... }},
  "finish_color": {{ ... }},
  "mechanical_plumbing": {{ ... }},
  "electrical_specs": {{ ... }},
  "lighting_specs": {{ ... }},
  "hvac_performance": {{ ... }},
  "installation": {{ ... }},
  "compatibility": {{ ... }},
  "environmental": {{ ... }},
  "certifications": {{ ... }},
  "ai_enrichment": {{
    "key_features": ["...", "...", "..."],
    "one_sentence_highlight": "...",
    "detailed_description": "...",
    "why_this_product": "...",
    "fitment_notes": "...",
    "compatibility_notes": "...",
    "installation_notes": "...",
    "seo_title": "...",
    "seo_meta_description": "...",
    "seo_keywords": ["...", "...", "..."],
    "collection_story": "..."
  }},
  "filtering": {{ ... }}
}}

Begin enrichment now."""

# ============================================================================
# METRICS TRACKING
# ============================================================================

home_products_metrics = {
    "openai": {"requests": 0, "successful": 0, "failed": 0, "total_time": 0.0, "completeness_scores": []},
    "xai": {"requests": 0, "successful": 0, "failed": 0, "total_time": 0.0, "completeness_scores": []}
}

def calculate_home_product_completeness(record: dict) -> float:
    """Calculate data completeness percentage for home products"""
    total_fields = 0
    filled_fields = 0
    
    def count_fields(obj, parent_key=""):
        nonlocal total_fields, filled_fields
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key in ["enriched_at", "ai_provider", "confidence_score"]:
                    continue
                if isinstance(value, (dict, list)):
                    count_fields(value, key)
                else:
                    total_fields += 1
                    if value not in [None, "", [], {}]:
                        filled_fields += 1
        elif isinstance(obj, list):
            for item in obj:
                count_fields(item, parent_key)
    
    count_fields(record)
    return (filled_fields / total_fields * 100) if total_fields > 0 else 0.0

def update_home_products_metrics(provider: str, success: bool, response_time: float, completeness: float):
    """Update metrics for home products enrichment"""
    home_products_metrics[provider]["requests"] += 1
    if success:
        home_products_metrics[provider]["successful"] += 1
        home_products_metrics[provider]["completeness_scores"].append(completeness)
    else:
        home_products_metrics[provider]["failed"] += 1
    home_products_metrics[provider]["total_time"] += response_time

# ============================================================================
# AI ENRICHMENT FUNCTION
# ============================================================================

async def enrich_home_product_with_ai(
    model_number: str,
    brand: Optional[str] = None,
    description: Optional[str] = None,
    provider: str = "openai",
    openai_client = None,
    xai_client = None
) -> tuple[dict, str, float]:
    """
    Enrich home product using AI with model number as primary identifier.
    Brand and description are optional helpers.
    
    Returns: (enriched_data_dict, provider_used, response_time)
    """
    import time
    import json
    
    start_time = time.time()
    
    # Format the prompt
    prompt = HOME_PRODUCTS_ENRICHMENT_PROMPT.format(
        model_number=model_number,
        brand=brand or "Not provided",
        description=description or "Not provided"
    )
    
    try:
        if provider == "openai" and openai_client:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a product data enrichment specialist. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            content = response.choices[0].message.content.strip()
        elif provider == "xai" and xai_client:
            response = xai_client.chat.completions.create(
                model="grok-beta",
                messages=[
                    {"role": "system", "content": "You are a product data enrichment specialist. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            content = response.choices[0].message.content.strip()
        else:
            raise Exception(f"Invalid provider or client not available: {provider}")
        
        # Clean JSON response
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        
        # Parse JSON
        enriched_data = json.loads(content)
        
        # ENFORCE STRICT MSRP VALIDATION RULES
        if 'product_identity' in enriched_data:
            pi = enriched_data['product_identity']
            msrp_sources = pi.get('msrp_sources', [])
            msrp_source_count = len(msrp_sources) if msrp_sources else 0
            
            # Rule: Only accept MSRP if AI provided 2+ named sources
            if msrp_source_count < 2:
                pi['msrp_price'] = None
                pi['msrp_confidence'] = None
                pi['msrp_sources'] = []
                pi['msrp_source_count'] = 0
                pi['msrp_verified'] = False
            else:
                # Validate authorized sources
                authorized = ["ferguson", "manufacturer", "ajmadison", "bestbuy", "costco", "homedepot", "lowes"]
                valid_sources = [s.lower().replace(" ", "").replace(".", "") for s in msrp_sources if any(auth in s.lower().replace(" ", "").replace(".", "") for auth in authorized)]
                
                if len(valid_sources) < 2:
                    pi['msrp_price'] = None
                    pi['msrp_confidence'] = None
                    pi['msrp_sources'] = []
                    pi['msrp_source_count'] = 0
                    pi['msrp_verified'] = False
                else:
                    pi['msrp_confidence'] = "verified"
                    pi['msrp_source_count'] = len(valid_sources)
                    pi['msrp_verified'] = True
            
            # Set verified_by field
            pi['verified_by'] = f"{provider.title()} {('gpt-4o-mini' if provider == 'openai' else 'grok-2-latest')}"
        
        # Add metadata
        enriched_data["enriched_at"] = datetime.utcnow().isoformat()
        enriched_data["ai_provider"] = provider
        
        # Calculate completeness
        completeness = calculate_home_product_completeness(enriched_data)
        enriched_data["confidence_score"] = completeness
        
        response_time = time.time() - start_time
        
        # Update metrics
        update_home_products_metrics(provider, True, response_time, completeness)
        
        return enriched_data, provider, response_time
        
    except Exception as e:
        response_time = time.time() - start_time
        update_home_products_metrics(provider, False, response_time, 0.0)
        raise Exception(f"AI enrichment failed with {provider}: {str(e)}")
