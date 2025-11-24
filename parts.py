"""
Parts-BOT: AI Appliance Parts Enrichment Engine
Dedicated endpoint for appliance parts data enrichment.
"""

import os
import json
import time
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ===== PYDANTIC MODELS FOR APPLIANCE PARTS =====

class CoreIdentification(BaseModel):
    """Core Product Identification"""
    brand: Optional[str] = Field(None, description="Brand of the appliance/part (GE, LG, Bosch, etc.)")
    manufacturer: Optional[str] = Field(None, description="OEM manufacturer (if different)")
    part_name: Optional[str] = Field(None, description="Clear human-friendly name")
    part_number: Optional[str] = Field(None, description="OEM part number (MPN)")
    part_title: Optional[str] = Field(None, description="SEO-friendly title")
    alternate_part_numbers: Optional[List[str]] = Field(None, description="List of OEM superseded or alternate numbers")
    upc: Optional[str] = Field(None, description="UPC/GTIN")
    condition: Optional[str] = Field(None, description="New OEM / New / Refurbished / Open-Box")
    is_oem: Optional[bool] = Field(None, description="Whether this is genuine OEM")
    price: Optional[str] = Field(None, description="Part price")
    price_confidence: Optional[str] = Field(None, description="Price confidence: verified/null")
    price_sources: Optional[List[str]] = Field(None, description="Actual source names (oem, partselect, repairclinic, etc.)")
    price_source_count: Optional[int] = Field(None, description="Number of price sources found (0, 2, 3+)")
    price_verified: Optional[bool] = Field(None, description="True if 2+ matching sources, false otherwise")
    verified_by: Optional[str] = Field(None, description="AI provider that enriched this data")


class ProductTitle(BaseModel):
    """Product Title"""
    product_title: Optional[str] = Field(None, description="SEO-friendly title customers see")


class Availability(BaseModel):
    """Availability (Consumer-Facing)"""
    stock_status: Optional[str] = Field(None, description="In Stock / Out of Stock")
    restock_eta: Optional[str] = Field(None, description="Ships by... if applicable")
    delivery_eta: Optional[str] = Field(None, description="Estimated arrival")


class KeyDetails(BaseModel):
    """Key Product Details"""
    category: Optional[str] = Field(None, description="Part category (pump, fan, lamp, switch, filter, etc.)")
    appliance_type: Optional[str] = Field(None, description="Type of appliance this part fits")
    weight: Optional[str] = Field(None, description="Product weight")
    product_dimensions: Optional[str] = Field(None, description="Size of the part (L × W × H)")
    color: Optional[str] = Field(None, description="Color/finish")
    material: Optional[str] = Field(None, description="Material composition")
    warranty: Optional[str] = Field(None, description="Manufacturer or store warranty")


class ElectricalSpecs(BaseModel):
    """Electrical Specifications"""
    voltage: Optional[str] = Field(None, description="Voltage rating")
    amperage: Optional[str] = Field(None, description="Current rating")
    wattage: Optional[str] = Field(None, description="Watts")
    resistance: Optional[str] = Field(None, description="Ohm rating")
    connector_type: Optional[str] = Field(None, description="Type/number of pins or connectors")
    bulb_type: Optional[str] = Field(None, description="Incandescent/LED/base type")
    lumens: Optional[str] = Field(None, description="Light output")
    color_temperature: Optional[str] = Field(None, description="Kelvin rating for bulbs")


class MechanicalSpecs(BaseModel):
    """Mechanical Specifications"""
    size: Optional[str] = Field(None, description="Key size/diameter/length")
    thread_size: Optional[str] = Field(None, description="For fittings, valves, hoses")
    flow_rate: Optional[str] = Field(None, description="Water/air flow rate")
    psi_rating: Optional[str] = Field(None, description="Pressure rating")
    temperature_range: Optional[str] = Field(None, description="Safe operating temps")
    capacity: Optional[str] = Field(None, description="Capacity rating")


class SafetyCompliance(BaseModel):
    """Safety & Compliance"""
    prop65_warning: Optional[str] = Field(None, description="CA Prop 65 info")
    certifications: Optional[List[str]] = Field(None, description="UL / ETL / CSA / NSF / RoHS / OEM certifications")


class TechnicalSpecs(BaseModel):
    """Technical Specifications"""
    electrical: Optional[ElectricalSpecs] = Field(None, description="Electrical specs (if relevant)")
    mechanical: Optional[MechanicalSpecs] = Field(None, description="Mechanical specs")
    safety_compliance: Optional[SafetyCompliance] = Field(None, description="Safety & compliance info")


class Compatibility(BaseModel):
    """Compatibility Information"""
    compatible_brands: Optional[List[str]] = Field(None, description="All brands the part works with")
    compatible_models: Optional[List[str]] = Field(None, description="Full list of models the part fits")
    compatible_appliance_types: Optional[List[str]] = Field(None, description="If part fits more than one appliance type")


class CrossReference(BaseModel):
    """Cross Reference Information"""
    replaces_part_numbers: Optional[List[str]] = Field(None, description="OEM numbers replaced by this part")
    superseded_part_numbers: Optional[List[str]] = Field(None, description="Older part numbers")
    equivalent_parts: Optional[List[str]] = Field(None, description="True OEM alternates")


class Symptoms(BaseModel):
    """Symptoms This Part Fixes"""
    symptoms: Optional[List[str]] = Field(None, description="Common failure symptoms customers look for")


class Description(BaseModel):
    """Product Description"""
    short_description: Optional[str] = Field(None, description="Quick overview")
    long_description: Optional[str] = Field(None, description="Detailed product description, function, and usage notes")


class Installation(BaseModel):
    """Installation & Documentation"""
    tools_required: Optional[List[str]] = Field(None, description="Basic tools needed")
    installation_difficulty: Optional[str] = Field(None, description="Easy / Moderate / Advanced")
    safety_notes: Optional[str] = Field(None, description="Power/gas/water warnings")
    installation_steps: Optional[List[str]] = Field(None, description="Short summary")
    documentation_url: Optional[str] = Field(None, description="PDF manual / installation guide")
    video_url: Optional[str] = Field(None, description="Repair or installation video")


class ShippingInfo(BaseModel):
    """Shipping Information"""
    shipping_weight: Optional[str] = Field(None, description="Shipping weight")
    shipping_dimensions: Optional[str] = Field(None, description="Package/carton size")
    estimated_ship_date: Optional[str] = Field(None, description="When it ships")
    handling_notes: Optional[str] = Field(None, description="Fragile, hazardous, etc.")


class PartRecord(BaseModel):
    """Complete Appliance Part Record"""
    core_identification: Optional[CoreIdentification] = None
    product_title: Optional[ProductTitle] = None
    availability: Optional[Availability] = None
    key_details: Optional[KeyDetails] = None
    technical_specs: Optional[TechnicalSpecs] = None
    compatibility: Optional[Compatibility] = None
    cross_reference: Optional[CrossReference] = None
    symptoms: Optional[Symptoms] = None
    description: Optional[Description] = None
    installation: Optional[Installation] = None
    shipping_info: Optional[ShippingInfo] = None


# ===== AI PROMPT TEMPLATE =====

PARTS_ENRICHMENT_PROMPT = """You are an appliance parts data enrichment specialist. Given a part number and brand, provide comprehensive technical and commercial information.

⚠️ ENHANCED PRICE VALIDATION WITH CONFIDENCE TRACKING:

PRICING RULES:
1. **2+ sources with SAME price** → Set price + confidence: "verified" + source_count: 2+ + verified: true
2. **1 source only** → Set price + confidence: "single-source" + source_count: 1 + verified: false
3. **2+ sources CONFLICTING** → Set price to lower value + confidence: "conflicting" + source_count: 2+ + verified: false
4. **No sources found** → Set price: null + confidence: null + source_count: 0 + verified: false

SOURCES: OEM websites, authorized parts distributors, repair manuals, parts retailers, etc.

ADD THESE FIELDS TO core_identification:
- "price": "$XX.XX" or null
- "price_confidence": "verified" | "single-source" | "conflicting" | null
- "price_source_count": number of sources found
- "price_verified": true only if 2+ matching sources

⚠️ UNIVERSAL FIELD VERIFICATION - CRITICAL FIELDS REQUIRE 2+ SOURCES:

Apply 2-source verification to these essential fields:
- part_number, brand, part_name (core identification)
- upc (barcode - critical for inventory matching)
- condition, is_oem (authenticity verification)
- warranty (commercial terms)

TECHNICAL SPECIFICATION VERIFICATION:
For technical specs (voltage, amperage, wattage, dimensions, weight):
- **2+ sources MATCH** → Populate field
- **1 source only** → Set to null
- **Sources CONFLICT** → Set to null
- Acceptable tolerance: ±5% for electrical specs, ±10% for dimensions/weight

COMPATIBILITY VERIFICATION:
For compatible_models and replaces_part_numbers:
- Require 2+ sources OR official OEM documentation
- If only 1 aftermarket source → set to null
- Cross-reference data must be verifiable

VERIFICATION STANDARD:
✅ 2+ matching sources → Populate
❌ 1 source only → Set null
❌ Conflicting sources → Set null
❌ No sources → Set null

Part Number: {part_number}
Brand: {brand}

Return ONLY a valid JSON object with these sections (use null for unknown fields):

{{
  "core_identification": {{
    "brand": "Brand name",
    "manufacturer": "OEM manufacturer if different",
    "part_name": "Human-friendly name (e.g., 'Refrigerator Water Valve')",
    "part_number": "OEM part number",
    "alternate_part_numbers": ["alternate1", "alternate2"],
    "upc": "UPC/GTIN code",
    "condition": "New OEM / New / Refurbished / Open-Box",
    "is_oem": true,
    "price": "$XX.XX or null",
    "price_confidence": "verified or single-source or conflicting or null",
    "price_source_count": 0,
    "price_verified": true
  }},
  "product_title": {{
    "product_title": "SEO-friendly title"
  }},
  "availability": {{
    "stock_status": "In Stock / Out of Stock",
    "restock_eta": "Ships by date",
    "delivery_eta": "Estimated arrival"
  }},
  "key_details": {{
    "category": "pump / fan / lamp / switch / filter / valve / motor / etc.",
    "appliance_type": "refrigerator / washer / dryer / dishwasher / etc.",
    "weight": "Weight with units",
    "product_dimensions": "L × W × H",
    "color": "Color/finish",
    "material": "Material composition",
    "warranty": "Warranty info"
  }},
  "technical_specs": {{
    "electrical": {{
      "voltage": "Voltage rating",
      "amperage": "Current rating",
      "wattage": "Watts",
      "resistance": "Ohm rating",
      "connector_type": "Connector details",
      "bulb_type": "If lamp: LED/incandescent/base type",
      "lumens": "Light output",
      "color_temperature": "Kelvin rating"
    }},
    "mechanical": {{
      "size": "Key dimensions",
      "thread_size": "For fittings/valves/hoses",
      "flow_rate": "Water/air flow rate",
      "psi_rating": "Pressure rating",
      "temperature_range": "Operating temps",
      "capacity": "Capacity rating"
    }},
    "safety_compliance": {{
      "prop65_warning": "CA Prop 65 info",
      "certifications": ["UL", "ETL", "CSA", "NSF", "RoHS"]
    }}
  }},
  "compatibility": {{
    "compatible_brands": ["Brand1", "Brand2"],
    "compatible_models": ["Model1", "Model2", "Model3"],
    "compatible_appliance_types": ["refrigerator", "freezer"]
  }},
  "cross_reference": {{
    "replaces_part_numbers": ["OldPart1", "OldPart2"],
    "superseded_part_numbers": ["SupersededPart1"],
    "equivalent_parts": ["EquivPart1", "EquivPart2"]
  }},
  "symptoms": {{
    "symptoms": ["Symptom1", "Symptom2", "Symptom3"]
  }},
  "description": {{
    "short_description": "Quick overview",
    "long_description": "Detailed description with function and usage notes"
  }},
  "installation": {{
    "tools_required": ["Tool1", "Tool2"],
    "installation_difficulty": "Easy / Moderate / Advanced",
    "safety_notes": "Safety warnings",
    "installation_steps": ["Step1", "Step2", "Step3"],
    "documentation_url": "URL to manual",
    "video_url": "URL to video"
  }},
  "shipping_info": {{
    "shipping_weight": "Weight with units",
    "shipping_dimensions": "Package size",
    "estimated_ship_date": "Ship date",
    "handling_notes": "Special handling notes"
  }}
}}

CRITICAL: Return ONLY the JSON object. No markdown, no explanations, no code blocks. Raw JSON only.
"""


# ===== AI ENRICHMENT FUNCTIONS =====

def calculate_part_completeness(part_record: PartRecord) -> float:
    """Calculate what percentage of fields are populated."""
    total_fields = 0
    populated_fields = 0
    
    record_dict = part_record.dict()
    
    for section_key, section_value in record_dict.items():
        if section_value is None:
            total_fields += 1
            continue
        
        if isinstance(section_value, dict):
            for field_key, field_value in section_value.items():
                total_fields += 1
                if field_value is not None and field_value != "" and field_value != []:
                    populated_fields += 1
        else:
            total_fields += 1
            if section_value is not None and section_value != "":
                populated_fields += 1
    
    return (populated_fields / total_fields * 100) if total_fields > 0 else 0.0


def enrich_part_with_ai(part_number: str, brand: str, provider: str = "openai") -> tuple:
    """
    Call AI to enrich part data.
    Returns: (PartRecord, metrics_dict)
    """
    start_time = time.time()
    
    try:
        # Get AI client
        if provider not in AI_PROVIDERS or not AI_PROVIDERS[provider]["enabled"]:
            raise ValueError(f"Provider {provider} not available")
        
        client = AI_PROVIDERS[provider]["client"]
        model = AI_PROVIDERS[provider]["model"]
        
        # Build prompt
        prompt = PARTS_ENRICHMENT_PROMPT.format(
            part_number=part_number,
            brand=brand
        )
        
        # Call AI
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an appliance parts data specialist. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        # Extract JSON
        content = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1]) if len(lines) > 2 else content
            if content.startswith("json"):
                content = content[4:].strip()
        
        # Parse JSON
        part_data = json.loads(content)
        
        # ENFORCE STRICT PRICING VALIDATION RULES
        if 'core_identification' in part_data:
            ci = part_data['core_identification']
            price_sources = ci.get('price_sources', [])
            price_source_count = len(price_sources) if price_sources else 0
            
            # Rule: Only accept price if AI provided 2+ named sources
            if price_source_count < 2:
                ci['price'] = None
                ci['price_confidence'] = None
                ci['price_sources'] = []
                ci['price_source_count'] = 0
                ci['price_verified'] = False
            else:
                # Validate authorized sources
                authorized = ["oem", "manufacturer", "appliancepartspros", "partselect", "repairclinic", "reliableparts", "ferguson", "ajmadison"]
                valid_sources = [s.lower().replace(" ", "") for s in price_sources if any(auth in s.lower().replace(" ", "") for auth in authorized)]
                
                if len(valid_sources) < 2:
                    ci['price'] = None
                    ci['price_confidence'] = None
                    ci['price_sources'] = []
                    ci['price_source_count'] = 0
                    ci['price_verified'] = False
                else:
                    ci['price_confidence'] = "verified"
                    ci['price_source_count'] = len(valid_sources)
                    ci['price_verified'] = True
        
        # Create PartRecord
        part_record = PartRecord(**part_data)
        
        # Calculate metrics
        elapsed_time = time.time() - start_time
        tokens_used = response.usage.total_tokens
        completeness = calculate_part_completeness(part_record)
        
        metrics = {
            "provider": provider,
            "model": model,
            "response_time": elapsed_time,
            "tokens_used": tokens_used,
            "completeness": completeness,
            "timestamp": datetime.now().isoformat()
        }
        
        return part_record, metrics
        
    except Exception as e:
        elapsed_time = time.time() - start_time
        raise Exception(f"{provider} error after {elapsed_time:.2f}s: {str(e)}")


# Store for parts enrichment metrics
parts_ai_metrics = {
    "openai": {
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "total_response_time": 0.0,
        "avg_response_time": 0.0,
        "total_tokens_used": 0,
        "avg_tokens": 0,
        "field_completeness_scores": [],
        "avg_completeness": 0.0,
        "last_used": None,
        "errors": []
    },
    "xai": {
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "total_response_time": 0.0,
        "avg_response_time": 0.0,
        "total_tokens_used": 0,
        "avg_tokens": 0,
        "field_completeness_scores": [],
        "avg_completeness": 0.0,
        "last_used": None,
        "errors": []
    }
}


def update_parts_metrics(provider: str, metrics: dict, success: bool = True):
    """Update performance metrics for parts enrichment."""
    provider_metrics = parts_ai_metrics[provider]
    
    provider_metrics["total_requests"] += 1
    
    if success:
        provider_metrics["successful_requests"] += 1
        provider_metrics["total_response_time"] += metrics["response_time"]
        provider_metrics["total_tokens_used"] += metrics["tokens_used"]
        provider_metrics["field_completeness_scores"].append(metrics["completeness"])
        provider_metrics["last_used"] = metrics["timestamp"]
        
        # Calculate averages
        provider_metrics["avg_response_time"] = (
            provider_metrics["total_response_time"] / provider_metrics["successful_requests"]
        )
        provider_metrics["avg_tokens"] = (
            provider_metrics["total_tokens_used"] // provider_metrics["successful_requests"]
        )
        provider_metrics["avg_completeness"] = (
            sum(provider_metrics["field_completeness_scores"]) / 
            len(provider_metrics["field_completeness_scores"])
        )
    else:
        provider_metrics["failed_requests"] += 1
        if "error" in metrics:
            provider_metrics["errors"].append({
                "timestamp": datetime.now().isoformat(),
                "error": metrics["error"]
            })


# Initialize AI clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
xai_client = OpenAI(
    api_key=os.getenv("XAI_API_KEY"),
    base_url="https://api.x.ai/v1"
)

AI_PROVIDERS = {
    "openai": {
        "client": openai_client,
        "model": "gpt-4o-mini",
        "name": "OpenAI gpt-4o-mini",
        "enabled": bool(os.getenv("OPENAI_API_KEY"))
    },
    "xai": {
        "client": xai_client,
        "model": "grok-beta",
        "name": "xAI Grok",
        "enabled": bool(os.getenv("XAI_API_KEY"))
    }
}
