"""
Catalog-BOT: AI Product Enrichment Engine
Single-file FastAPI backend that uses OpenAI to enrich product data.
"""

import os
import json
import time
import atexit
from datetime import datetime
from typing import Optional, List, Dict, Any
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
from api_logger import logger as api_logger

# Load environment variables
load_dotenv()

# Metrics persistence file - use persistent disk if available (Render)
DATA_DIR = os.getenv("DATA_DIR", "/opt/render/project/src/data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)
METRICS_FILE = os.path.join(DATA_DIR, "portal_metrics.json")

# Import home products module
from home_products import (
    HomeProductRecord,
    enrich_home_product_with_ai,
    home_products_metrics,
    calculate_home_product_completeness
)

# Import verification module
from verification import (
    validate_product_data,
    get_verification_summary,
    add_verification_metadata
)

# Initialize FastAPI app
app = FastAPI(
    title="Catalog-BOT API",
    description="AI-powered product enrichment engine using OpenAI",
    version="1.0.0"
)

# API Call Logging Middleware
@app.middleware("http")
async def log_api_calls(request: Request, call_next):
    """Middleware to log all API calls"""
    start_time = time.time()
    
    # Get request data
    request_body = {}
    if request.method == "POST":
        try:
            body_bytes = await request.body()
            if body_bytes:
                request_body = json.loads(body_bytes)
                # Reset body for downstream handlers
                async def receive():
                    return {"type": "http.request", "body": body_bytes}
                request._receive = receive
        except:
            pass
    
    # Process request
    response = await call_next(request)
    
    # Calculate response time
    response_time_ms = int((time.time() - start_time) * 1000)
    
    # Get response data
    response_body = {}
    if hasattr(response, 'body'):
        try:
            response_body = json.loads(response.body.decode())
        except:
            pass
    
    # Log the call (async, don't block response)
    try:
        api_key = request.headers.get('x-api-key') or request.headers.get('X-API-KEY')
        client_ip = request.client.host if request.client else None
        
        api_logger.log_call(
            endpoint=request.url.path,
            method=request.method,
            request_data=request_body,
            response_data=response_body,
            response_time_ms=response_time_ms,
            status_code=response.status_code,
            client_ip=client_ip,
            api_key=api_key
        )
    except Exception as log_error:
        print(f"Failed to log API call: {log_error}")
    
    return response

# Configure CORS - Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite default port
        "https://*.vercel.app",   # Vercel deployments
        "https://*.netlify.app",  # Netlify deployments
        "*"  # Allow all origins (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
xai_client = OpenAI(
    api_key=os.getenv("XAI_API_KEY"),
    base_url="https://api.x.ai/v1"
)
API_KEY = os.getenv("API_KEY", "test123")

# AI Provider configuration
AI_PROVIDERS = {
    "openai": {
        "client": openai_client,
        "model": "gpt-4o-mini",
        "name": "OpenAI gpt-4o-mini",
        "enabled": bool(os.getenv("OPENAI_API_KEY"))
    },
    "xai": {
        "client": xai_client,
        "model": "grok-2-latest",
        "name": "xAI Grok 2",
        "enabled": bool(os.getenv("XAI_API_KEY"))
    }
}

# AI Performance Tracking
ai_metrics = {
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

# Portal-specific metrics tracking
def load_metrics():
    """Load metrics from file if it exists."""
    try:
        if os.path.exists(METRICS_FILE):
            with open(METRICS_FILE, 'r') as f:
                data = json.load(f)
                return data.get('portal_metrics', {}), data.get('request_logs', [])
    except Exception as e:
        print(f"Error loading metrics: {e}")
    
    # Return default metrics if file doesn't exist or error
    return {
        "catalog": {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_response_time": 0.0,
            "avg_response_time": 0.0,
            "last_used": None,
            "ui_calls": 0,
            "api_calls": 0,
        },
        "parts": {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_response_time": 0.0,
            "avg_response_time": 0.0,
            "last_used": None,
            "ui_calls": 0,
            "api_calls": 0,
        },
        "home_products": {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_response_time": 0.0,
            "avg_response_time": 0.0,
            "last_used": None,
            "ui_calls": 0,
            "api_calls": 0,
        }
    }, []

def save_metrics():
    """Save metrics to file."""
    try:
        with open(METRICS_FILE, 'w') as f:
            json.dump({
                'portal_metrics': portal_metrics,
                'request_logs': request_logs
            }, f)
    except Exception as e:
        print(f"Error saving metrics: {e}")

# Load metrics on startup
portal_metrics, request_logs = load_metrics()

# Save metrics on shutdown
atexit.register(save_metrics)

def update_portal_metrics(portal_name: str, success: bool, response_time: float, 
                          source: str = "api", user_agent: str = None, model_number: str = None, brand: str = None):
    """Update metrics for a specific portal endpoint."""
    metrics = portal_metrics[portal_name]
    metrics["total_requests"] += 1
    metrics["last_used"] = datetime.utcnow().isoformat()
    
    # Track source (UI vs API)
    if source == "ui":
        metrics["ui_calls"] += 1
    else:
        metrics["api_calls"] += 1
    
    if success:
        metrics["successful_requests"] += 1
        metrics["total_response_time"] += response_time
        metrics["avg_response_time"] = metrics["total_response_time"] / metrics["successful_requests"]
    else:
        metrics["failed_requests"] += 1
    
    # Log the request
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "portal": portal_name,
        "endpoint": f"/enrich-{portal_name}" if portal_name != "catalog" else "/enrich",
        "source": source,
        "success": success,
        "response_time": round(response_time, 2),
        "model_number": model_number,
        "brand": brand,
        "user_agent": user_agent[:100] if user_agent else None  # Truncate long user agents
    }
    
    request_logs.append(log_entry)
    
    # Keep only last 100 logs
    if len(request_logs) > 100:
        request_logs.pop(0)
    
    # Save metrics after each update
    save_metrics()

def calculate_field_completeness(product_record: 'ProductRecord') -> float:
    """Calculate what percentage of optional fields are populated."""
    total_fields = 0
    populated_fields = 0
    
    def count_fields(obj, parent_key=''):
        nonlocal total_fields, populated_fields
        if isinstance(obj, dict):
            for key, value in obj.items():
                total_fields += 1
                if value is not None and value != [] and value != {}:
                    populated_fields += 1
                if isinstance(value, (dict, list)):
                    count_fields(value, f"{parent_key}.{key}")
        elif isinstance(obj, list) and obj:
            for item in obj:
                if isinstance(item, dict):
                    count_fields(item, parent_key)
    
    # Convert to dict and count
    data_dict = product_record.dict()
    count_fields(data_dict)
    
    return (populated_fields / total_fields * 100) if total_fields > 0 else 0.0

def update_metrics(provider_name: str, success: bool, response_time: float, 
                   tokens_used: int = 0, product_record: 'ProductRecord' = None, 
                   error: str = None):
    """Update performance metrics for a provider."""
    metrics = ai_metrics[provider_name]
    metrics["total_requests"] += 1
    metrics["last_used"] = datetime.utcnow().isoformat()
    
    if success:
        metrics["successful_requests"] += 1
        metrics["total_response_time"] += response_time
        metrics["avg_response_time"] = metrics["total_response_time"] / metrics["successful_requests"]
        
        if tokens_used > 0:
            metrics["total_tokens_used"] += tokens_used
            metrics["avg_tokens"] = metrics["total_tokens_used"] // metrics["successful_requests"]
        
        if product_record:
            completeness = calculate_field_completeness(product_record)
            metrics["field_completeness_scores"].append(completeness)
            # Keep only last 100 scores for moving average
            if len(metrics["field_completeness_scores"]) > 100:
                metrics["field_completeness_scores"] = metrics["field_completeness_scores"][-100:]
            metrics["avg_completeness"] = sum(metrics["field_completeness_scores"]) / len(metrics["field_completeness_scores"])
    else:
        metrics["failed_requests"] += 1
        if error and len(metrics["errors"]) < 10:  # Keep last 10 errors
            metrics["errors"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "error": error[:200]  # Truncate long errors
            })

def get_performance_comparison() -> dict:
    """Compare performance between providers and recommend best."""
    openai_metrics = ai_metrics["openai"]
    xai_metrics = ai_metrics["xai"]
    
    # Calculate success rates
    openai_success_rate = (openai_metrics["successful_requests"] / openai_metrics["total_requests"] * 100) if openai_metrics["total_requests"] > 0 else 0
    xai_success_rate = (xai_metrics["successful_requests"] / xai_metrics["total_requests"] * 100) if xai_metrics["total_requests"] > 0 else 0
    
    # Scoring system (weighted)
    def calculate_score(metrics, success_rate):
        if metrics["total_requests"] == 0:
            return 0
        
        # Weights: success rate (40%), completeness (30%), speed (20%), reliability (10%)
        success_score = success_rate * 0.4
        completeness_score = metrics["avg_completeness"] * 0.3
        speed_score = (1 / (metrics["avg_response_time"] + 1)) * 100 * 0.2  # Inverse of time
        reliability_score = ((metrics["successful_requests"] / metrics["total_requests"]) * 100) * 0.1
        
        return success_score + completeness_score + speed_score + reliability_score
    
    openai_score = calculate_score(openai_metrics, openai_success_rate)
    xai_score = calculate_score(xai_metrics, xai_success_rate)
    
    # Determine recommendation
    if openai_score > xai_score * 1.1:  # 10% threshold
        recommendation = "openai"
        reason = "OpenAI shows significantly better overall performance"
    elif xai_score > openai_score * 1.1:
        recommendation = "xai"
        reason = "xAI shows significantly better overall performance"
    else:
        recommendation = "tie"
        reason = "Both providers perform similarly, keep current failover strategy"
    
    return {
        "recommendation": recommendation,
        "reason": reason,
        "scores": {
            "openai": round(openai_score, 2),
            "xai": round(xai_score, 2)
        },
        "detailed_comparison": {
            "success_rate": {
                "openai": round(openai_success_rate, 2),
                "xai": round(xai_success_rate, 2),
                "winner": "openai" if openai_success_rate > xai_success_rate else "xai"
            },
            "avg_response_time": {
                "openai": round(openai_metrics["avg_response_time"], 3),
                "xai": round(xai_metrics["avg_response_time"], 3),
                "winner": "openai" if openai_metrics["avg_response_time"] < xai_metrics["avg_response_time"] else "xai"
            },
            "data_completeness": {
                "openai": round(openai_metrics["avg_completeness"], 2),
                "xai": round(xai_metrics["avg_completeness"], 2),
                "winner": "openai" if openai_metrics["avg_completeness"] > xai_metrics["avg_completeness"] else "xai"
            }
        }
    }

# Pydantic models for request/response
class EnrichRequest(BaseModel):
    brand: str = Field(..., description="Product brand name")
    model_number: str = Field(..., description="Product model number")

class VerifiedInformation(BaseModel):
    brand: str
    model_number: str
    product_title: str
    series_collection: Optional[str] = None
    finish_color: Optional[str] = None
    upc_gtin: Optional[str] = None
    sku_internal: Optional[str] = None
    mpn: Optional[str] = None
    country_of_origin: Optional[str] = None
    release_year: Optional[str] = None
    msrp_price: Optional[str] = None
    msrp_confidence: Optional[str] = None
    msrp_sources: Optional[List[str]] = None
    msrp_source_count: Optional[int] = None
    msrp_verified: Optional[bool] = None
    verified_by: str = "AI Enrichment"

class ProductDimensions(BaseModel):
    height: Optional[str] = None
    width: Optional[str] = None
    depth: Optional[str] = None
    depth_with_door_open: Optional[str] = None
    cutout_height: Optional[str] = None
    cutout_width: Optional[str] = None
    cutout_depth: Optional[str] = None

class ClearanceRequirements(BaseModel):
    top_clearance: Optional[str] = None
    back_clearance: Optional[str] = None
    side_clearance: Optional[str] = None
    door_swing_clearance: Optional[str] = None

class Weight(BaseModel):
    product_weight: Optional[str] = None
    shipping_weight: Optional[str] = None

class DimensionsAndWeight(BaseModel):
    product_dimensions: ProductDimensions
    clearance_requirements: ClearanceRequirements
    weight: Weight

class PackagingSpecs(BaseModel):
    box_height: Optional[str] = None
    box_width: Optional[str] = None
    box_depth: Optional[str] = None
    box_weight: Optional[str] = None
    palletized_weight: Optional[str] = None
    pallet_dimensions: Optional[str] = None

class ProductClassification(BaseModel):
    department: Optional[str] = None
    category: Optional[str] = None
    product_family: Optional[str] = None
    product_style: Optional[str] = None
    configuration: Optional[str] = None

class Electrical(BaseModel):
    voltage: Optional[str] = None
    amperage: Optional[str] = None
    hertz: Optional[str] = None
    plug_type: Optional[str] = None
    power_cord_included: Optional[bool] = None

class Water(BaseModel):
    water_line_required: Optional[bool] = None
    water_pressure_range: Optional[str] = None
    water_usage_per_cycle: Optional[str] = None

class Gas(BaseModel):
    gas_type: Optional[str] = None
    conversion_kit_included: Optional[bool] = None

class Energy(BaseModel):
    kwh_per_year: Optional[str] = None
    energy_star_rating: Optional[bool] = None

class CoolingHeating(BaseModel):
    cooling_system_type: Optional[str] = None
    compressor_type: Optional[str] = None
    defrost_type: Optional[str] = None
    refrigerant_type: Optional[str] = None
    temperature_range: Optional[str] = None

class NoiseLevel(BaseModel):
    dba_rating: Optional[str] = None

class PerformanceSpecs(BaseModel):
    electrical: Electrical
    water: Water
    gas: Gas
    energy: Energy
    cooling_heating: CoolingHeating
    noise_level: NoiseLevel

class Capacity(BaseModel):
    total_capacity: Optional[str] = None
    refrigerator_capacity: Optional[str] = None
    freezer_capacity: Optional[str] = None
    oven_capacity: Optional[str] = None
    washer_drum_capacity: Optional[str] = None
    dryer_capacity: Optional[str] = None
    dishwasher_place_settings: Optional[str] = None

class SmartFeatures(BaseModel):
    wifi_enabled: Optional[bool] = None
    app_compatibility: Optional[str] = None
    voice_control: Optional[str] = None
    remote_monitoring: Optional[bool] = None
    notifications: Optional[List[str]] = Field(default_factory=list)

class ConvenienceFeatures(BaseModel):
    ice_maker_type: Optional[str] = None
    water_dispenser: Optional[bool] = None
    door_in_door: Optional[bool] = None
    interior_lighting_type: Optional[str] = None
    shelving_type: Optional[str] = None
    rack_basket_material: Optional[str] = None
    control_panel_type: Optional[str] = None

class Features(BaseModel):
    core_features: List[str] = Field(default_factory=list)
    smart_features: SmartFeatures
    convenience_features: ConvenienceFeatures

class SafetyCompliance(BaseModel):
    ada_compliant: Optional[bool] = None
    prop_65_warning: Optional[bool] = None
    ul_csa_certified: Optional[bool] = None
    fire_safety_certifications: Optional[List[str]] = Field(default_factory=list)
    child_lock: Optional[bool] = None

class WarrantyInfo(BaseModel):
    manufacturer_warranty_parts: Optional[str] = None
    manufacturer_warranty_labor: Optional[str] = None
    compressor_warranty: Optional[str] = None
    drum_warranty: Optional[str] = None
    extended_warranty_options: Optional[List[str]] = Field(default_factory=list)

class Accessories(BaseModel):
    included_accessories: List[str] = Field(default_factory=list)
    optional_accessories: List[str] = Field(default_factory=list)

class InstallationRequirements(BaseModel):
    installation_type: Optional[str] = None
    venting_requirements: Optional[str] = None
    drain_requirement: Optional[bool] = None
    hardwire_vs_plug: Optional[str] = None
    leveling_legs_included: Optional[bool] = None

class ProductAttributes(BaseModel):
    built_in_appliance: Optional[bool] = None
    luxury_premium_appliance: Optional[bool] = None
    portable: Optional[bool] = None
    panel_ready: Optional[bool] = None
    counter_depth: Optional[bool] = None
    commercial_rated: Optional[bool] = None
    outdoor_rated: Optional[bool] = None

class ProductRecord(BaseModel):
    verified_information: VerifiedInformation
    dimensions_and_weight: DimensionsAndWeight
    packaging_specs: PackagingSpecs
    product_classification: ProductClassification
    performance_specs: PerformanceSpecs
    capacity: Capacity
    features: Features
    product_description: str
    safety_compliance: SafetyCompliance
    warranty_info: WarrantyInfo
    accessories: Accessories
    installation_requirements: InstallationRequirements
    product_attributes: ProductAttributes

class EnrichResponse(BaseModel):
    success: bool
    data: Optional[ProductRecord] = None
    error: Optional[str] = None

# Auth middleware
async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Catalog-BOT API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "enrich": "/enrich (POST)"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_providers": {
            "openai": {
                "enabled": AI_PROVIDERS["openai"]["enabled"],
                "model": AI_PROVIDERS["openai"]["model"]
            },
            "xai": {
                "enabled": AI_PROVIDERS["xai"]["enabled"],
                "model": AI_PROVIDERS["xai"]["model"]
            }
        },
        "primary_provider": "openai" if AI_PROVIDERS["openai"]["enabled"] else "xai"
    }

# AI Provider status endpoint
@app.get("/ai-providers")
async def get_ai_providers(x_api_key: str = Header(..., alias="X-API-KEY")):
    """
    Get status of all configured AI providers.
    Requires X-API-KEY header for authentication.
    """
    await verify_api_key(x_api_key)
    
    return {
        "providers": {
            "openai": {
                "name": AI_PROVIDERS["openai"]["name"],
                "model": AI_PROVIDERS["openai"]["model"],
                "enabled": AI_PROVIDERS["openai"]["enabled"],
                "status": "active" if AI_PROVIDERS["openai"]["enabled"] else "disabled"
            },
            "xai": {
                "name": AI_PROVIDERS["xai"]["name"],
                "model": AI_PROVIDERS["xai"]["model"],
                "enabled": AI_PROVIDERS["xai"]["enabled"],
                "status": "active" if AI_PROVIDERS["xai"]["enabled"] else "disabled"
            }
        },
        "strategy": "fallback",
        "primary": "openai" if AI_PROVIDERS["openai"]["enabled"] else "xai",
        "fallback": "xai" if AI_PROVIDERS["openai"]["enabled"] and AI_PROVIDERS["xai"]["enabled"] else None
    }

# AI Performance Metrics endpoint
@app.get("/ai-metrics")
async def get_ai_metrics(x_api_key: str = Header(..., alias="X-API-KEY")):
    """
    Get detailed performance metrics for all AI providers.
    Requires X-API-KEY header for authentication.
    """
    await verify_api_key(x_api_key)
    
    return {
        "metrics": ai_metrics,
        "timestamp": datetime.utcnow().isoformat()
    }

# Parts AI Metrics endpoint
@app.get("/parts-ai-metrics")
async def get_parts_ai_metrics(x_api_key: str = Header(..., alias="X-API-KEY")):
    """
    Get detailed performance metrics for parts enrichment AI providers.
    Requires X-API-KEY header for authentication.
    """
    await verify_api_key(x_api_key)
    
    from parts import parts_ai_metrics
    
    return {
        "metrics": parts_ai_metrics,
        "timestamp": datetime.utcnow().isoformat()
    }

# Portal-specific Metrics endpoint
@app.get("/portal-metrics")
async def get_portal_metrics(x_api_key: str = Header(..., alias="X-API-KEY")):
    """
    Get portal-specific usage metrics for all three portals.
    Tracks usage across Catalog, Parts, and Home Products portals.
    Includes source tracking (UI vs API) and recent request logs.
    Requires X-API-KEY header for authentication.
    """
    await verify_api_key(x_api_key)
    
    # Calculate totals
    total_requests = sum(p["total_requests"] for p in portal_metrics.values())
    total_successful = sum(p["successful_requests"] for p in portal_metrics.values())
    total_failed = sum(p["failed_requests"] for p in portal_metrics.values())
    total_ui_calls = sum(p["ui_calls"] for p in portal_metrics.values())
    total_api_calls = sum(p["api_calls"] for p in portal_metrics.values())
    
    return {
        "success": True,
        "portals": portal_metrics,
        "totals": {
            "total_requests": total_requests,
            "successful_requests": total_successful,
            "failed_requests": total_failed,
            "success_rate": (total_successful / total_requests * 100) if total_requests > 0 else 0,
            "ui_calls": total_ui_calls,
            "api_calls": total_api_calls
        },
        "recent_logs": request_logs[-50:],  # Return last 50 requests
        "timestamp": datetime.utcnow().isoformat()
    }

# AI Performance Comparison endpoint
@app.get("/ai-comparison")
async def get_ai_comparison(x_api_key: str = Header(..., alias="X-API-KEY")):
    """
    Get AI provider performance comparison and recommendations.
    Requires X-API-KEY header for authentication.
    """
    await verify_api_key(x_api_key)
    
    comparison = get_performance_comparison()
    
    # Add alert if one provider is significantly better
    alert = None
    if comparison["recommendation"] != "tie":
        winner = comparison["recommendation"]
        score_diff = abs(comparison["scores"]["openai"] - comparison["scores"]["xai"])
        if score_diff > 20:  # Significant difference threshold
            alert = {
                "level": "warning",
                "message": f"{AI_PROVIDERS[winner]['name']} is performing {score_diff:.1f}% better. Consider making it primary.",
                "recommendation": f"Switch primary provider to {winner}"
            }
    
    return {
        "comparison": comparison,
        "alert": alert,
        "metrics_summary": {
            "openai": {
                "total_requests": ai_metrics["openai"]["total_requests"],
                "success_rate": f"{(ai_metrics['openai']['successful_requests'] / ai_metrics['openai']['total_requests'] * 100):.2f}%" if ai_metrics["openai"]["total_requests"] > 0 else "0%",
                "avg_response_time": f"{ai_metrics['openai']['avg_response_time']:.3f}s",
                "avg_completeness": f"{ai_metrics['openai']['avg_completeness']:.2f}%"
            },
            "xai": {
                "total_requests": ai_metrics["xai"]["total_requests"],
                "success_rate": f"{(ai_metrics['xai']['successful_requests'] / ai_metrics['xai']['total_requests'] * 100):.2f}%" if ai_metrics["xai"]["total_requests"] > 0 else "0%",
                "avg_response_time": f"{ai_metrics['xai']['avg_response_time']:.3f}s",
                "avg_completeness": f"{ai_metrics['xai']['avg_completeness']:.2f}%"
            }
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# Reset metrics endpoint (for testing)
@app.post("/ai-metrics/reset")
async def reset_ai_metrics(x_api_key: str = Header(..., alias="X-API-KEY")):
    """
    Reset all AI performance metrics.
    Requires X-API-KEY header for authentication.
    """
    await verify_api_key(x_api_key)
    
    # Reset all metrics
    for provider in ["openai", "xai"]:
        ai_metrics[provider] = {
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
    
    return {
        "success": True,
        "message": "All AI metrics have been reset",
        "timestamp": datetime.utcnow().isoformat()
    }

# Main enrichment endpoint
@app.post("/enrich", response_model=EnrichResponse)
async def enrich_product(
    request: EnrichRequest,
    x_api_key: str = Header(..., alias="X-API-KEY"),
    user_agent: str = Header(None, alias="User-Agent"),
    referer: str = Header(None, alias="Referer")
):
    """
    Enrich product data using OpenAI.
    Requires X-API-KEY header for authentication.
    """
    # Verify API key
    await verify_api_key(x_api_key)
    
    start_time = time.time()
    success = False
    
    # Detect source: UI calls will have our frontend URL in referer
    source = "ui" if referer and ("vercel.app" in referer or "localhost" in referer) else "api"
    
    try:
        # Call OpenAI to generate product data
        product_data = await generate_product_data(request.brand, request.model_number)
        
        success = True
        response_time = time.time() - start_time
        update_portal_metrics("catalog", success, response_time, source, user_agent, 
                             request.model_number, request.brand)
        
        # Try to add verification metadata, but don't fail if it doesn't work
        try:
            # Convert ProductRecord to dict for validation
            product_dict = product_data.model_dump() if hasattr(product_data, 'model_dump') else product_data.dict()
            
            # Flatten nested structure to get verified_information fields
            flattened_data = {}
            if 'verified_information' in product_dict:
                flattened_data.update(product_dict['verified_information'])
            
            # Validate data against 2-source verification requirements
            validation_result = validate_product_data(
                flattened_data,
                portal='catalog',
                strict_mode=True  # Null out unverified critical fields
            )
            
            # Return with verification metadata
            return {
                "success": True,
                "data": product_data,
                "verification": {
                    "summary": get_verification_summary(validation_result['verification']),
                    "rate": validation_result['verification']['verification_rate'],
                    "verified_count": validation_result['verification']['verified_fields'],
                    "total_critical_fields": validation_result['verification']['total_critical_fields']
                }
            }
        except Exception as verify_error:
            # If verification fails, return without it
            print(f"Verification failed: {str(verify_error)}")
            return EnrichResponse(
                success=True,
                data=product_data
            )
    
    except Exception as e:
        response_time = time.time() - start_time
        update_portal_metrics("catalog", success, response_time, source, user_agent,
                             request.model_number, request.brand)
        return EnrichResponse(
            success=False,
            error=str(e)
        )


# Parts enrichment endpoint
class PartEnrichRequest(BaseModel):
    """Request body for parts enrichment"""
    part_number: str = Field(..., description="OEM part number")
    brand: str = Field(..., description="Brand name")


class PartEnrichResponse(BaseModel):
    """Response from parts enrichment"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None


@app.post("/enrich-part", response_model=PartEnrichResponse)
async def enrich_appliance_part(
    request: PartEnrichRequest,
    x_api_key: str = Header(..., alias="X-API-KEY"),
    user_agent: str = Header(None, alias="User-Agent"),
    referer: str = Header(None, alias="Referer")
):
    """
    Enrich appliance part data using AI.
    Requires X-API-KEY header for authentication.
    """
    # Verify API key
    await verify_api_key(x_api_key)
    
    start_time = time.time()
    success = False
    
    # Detect source: UI calls will have our frontend URL in referer
    source = "ui" if referer and ("vercel.app" in referer or "localhost" in referer) else "api"
    
    try:
        # Import parts module functions
        from parts import (
            enrich_part_with_ai, 
            update_parts_metrics,
            AI_PROVIDERS as PARTS_AI_PROVIDERS
        )
        
        # Try primary provider (OpenAI), fallback to xAI
        providers_to_try = ["openai", "xai"] if PARTS_AI_PROVIDERS["openai"]["enabled"] else ["xai"]
        
        last_error = None
        for provider_name in providers_to_try:
            try:
                part_record, metrics = enrich_part_with_ai(
                    request.part_number,
                    request.brand,
                    provider=provider_name
                )
                
                # Update metrics
                update_parts_metrics(provider_name, metrics, success=True)
                success = True
                response_time = time.time() - start_time
                
                # Get headers for source detection
                from fastapi import Request as FastAPIRequest
                # Note: We'll need to add request parameter to function signature
                
                update_portal_metrics("parts", success, response_time, source, user_agent,
                                     request.part_number, request.brand)
                
                # Flatten part_record to get core_identification fields for validation
                part_dict = part_record.dict()
                flattened_data = {}
                if 'core_identification' in part_dict:
                    flattened_data.update(part_dict['core_identification'])
                
                # Validate part data against 2-source verification requirements
                validation_result = validate_product_data(
                    flattened_data,
                    portal='parts',
                    strict_mode=True
                )
                
                # Return original structure with verification metadata
                return PartEnrichResponse(
                    success=True,
                    data=part_dict,
                    metrics={
                        "provider": provider_name,
                        "response_time": f"{metrics['response_time']:.2f}s",
                        "tokens_used": metrics['tokens_used'],
                        "completeness": f"{metrics['completeness']:.1f}%",
                        "verification_rate": f"{validation_result['verification']['verification_rate']:.1f}%",
                        "verified_fields": f"{validation_result['verification']['verified_fields']}/{validation_result['verification']['total_critical_fields']}"
                    }
                )
                
            except Exception as e:
                last_error = str(e)
                update_parts_metrics(provider_name, {"error": str(e)}, success=False)
                continue
        
        # All providers failed
        response_time = time.time() - start_time
        update_portal_metrics("parts", success, response_time, source, user_agent,
                             request.part_number, request.brand)
        return PartEnrichResponse(
            success=False,
            error=f"All AI providers failed. Last error: {last_error}"
        )
    
    except Exception as e:
        return PartEnrichResponse(
            success=False,
            error=str(e)
        )

async def generate_product_data(brand: str, model_number: str) -> ProductRecord:
    """
    Use AI (OpenAI primary, xAI fallback) to research and generate complete product data.
    """
    
    # Try primary provider (OpenAI), fallback to xAI if it fails
    providers_to_try = ["openai", "xai"] if AI_PROVIDERS["openai"]["enabled"] else ["xai"]
    
    last_error = None
    for provider_name in providers_to_try:
        provider = AI_PROVIDERS.get(provider_name)
        if not provider or not provider["enabled"]:
            continue
            
        start_time = time.time()
        try:
            result = await _generate_with_provider(brand, model_number, provider_name, provider)
            response_time = time.time() - start_time
            
            # Track successful request
            update_metrics(provider_name, True, response_time, 
                         tokens_used=0,  # Will be updated in _generate_with_provider
                         product_record=result)
            
            return result
        except Exception as e:
            response_time = time.time() - start_time
            last_error = e
            
            # Track failed request
            update_metrics(provider_name, False, response_time, error=str(e))
            
            print(f"[{provider_name}] Failed: {str(e)}")
            continue
    
    # If all providers failed, raise the last error
    raise Exception(f"All AI providers failed. Last error: {str(last_error)}")

async def _generate_with_provider(brand: str, model_number: str, provider_name: str, provider: dict) -> ProductRecord:
    """
    Generate product data using a specific AI provider.
    """
    
    # System prompt to ensure structured output
    system_prompt = """You are an expert product research assistant specializing in appliances and consumer products. 
Your task is to research and provide comprehensive, accurate product information based on the brand and model number provided.

⚠️ STRICT MSRP VALIDATION - AUTHORITATIVE SOURCES REQUIRED:

**CRITICAL: AI must provide actual source names, not just count sources**

AUTHORIZED SOURCES (AI must check these in order):
1. Manufacturer's official website (vikingrange.com, geappliances.com, etc.)
2. AJ Madison (ajmadison.com)
3. Ferguson (ferguson.com)
4. Best Buy (bestbuy.com)
5. Costco (costco.com)
6. Home Depot (homedepot.com)
7. Lowes (lowes.com)

PRICING RULES (STRICT - Better NULL than WRONG):
1. **Manufacturer website + 1 authorized retailer MATCH** → msrp_price: "$X,XXX", confidence: "verified", sources: ["manufacturer", "retailer_name"], source_count: 2, verified: true
2. **2+ authorized retailers MATCH (no manufacturer)** → msrp_price: "$X,XXX", confidence: "verified", sources: ["retailer1", "retailer2"], source_count: 2+, verified: true
3. **Single authorized source only** → msrp_price: null, confidence: null, sources: [], source_count: 0, verified: false (DO NOT use single source)
4. **Sources conflict** → msrp_price: null, confidence: null, sources: [], source_count: 0, verified: false (DO NOT guess)
5. **No authorized sources found** → msrp_price: null, confidence: null, sources: [], source_count: 0, verified: false

**IMPORTANT**: 
- AI must list actual source names in the "msrp_sources" array
- Only return MSRP if 2+ authorized sources agree on exact price
- If uncertain or only 1 source found → return null
- Do NOT fabricate source counts - list actual sources checked

ADDITIONAL FIELDS TO INCLUDE:
- "msrp_confidence": "verified" | null
- "msrp_sources": ["actual", "source", "names"]
- "msrp_source_count": number (0, 2, 3+)
- "msrp_verified": true only if 2+ matching sources, false otherwise

⚠️ UNIVERSAL FIELD VERIFICATION - ALL CRITICAL FIELDS REQUIRE 2+ SOURCES:

Apply the SAME 2-source verification standard to these critical fields:
- brand, model_number, product_title (basic identification)
- upc_gtin (barcode - critical for inventory)
- country_of_origin, release_year (provenance)
- series_collection, finish_color (product line identification)
- warranty (commercial terms)

FIELD VERIFICATION RULES:
1. **2+ sources AGREE** → Populate field with verified data
2. **1 source only** → Set field to null (insufficient verification)
3. **2+ sources CONFLICT** → Set field to null (cannot verify)
4. **No sources found** → Set field to null

For fields that cannot be verified:
- Set value to null
- Do NOT guess or estimate
- Better to return null than incorrect data

DIMENSION & WEIGHT VERIFICATION:
- Dimensions and weights must have 2+ matching sources
- Acceptable variation: ±0.5 inches for dimensions, ±1 lb for weight
- If sources vary beyond this, set to null

You must return ONLY valid JSON matching this comprehensive structure for appliances:

{
  "brand": "exact brand name",
  "model_number": "exact model number",
  "product_title": "full product name/title",
  "series_collection": "product series/collection name",
  "finish_color": "finish and color description",
  "upc_gtin": "UPC/GTIN barcode",
  "sku_internal": "internal SKU",
  "mpn": "manufacturer part number",
  "country_of_origin": "manufacturing country",
  "release_year": "year released",
  "msrp_price": "$XXX.XX or null",
  "msrp_confidence": "verified or null",
  "msrp_sources": ["source1", "source2"] or [],
  "msrp_source_count": 0 or 2 or 3,
  "msrp_verified": true or false,
  
  "product_height": "product height with units",
  "product_width": "product width with units",
  "product_depth": "product depth with units",
  "depth_with_door_open": "depth when door fully open",
  "cutout_height": "required cutout height",
  "cutout_width": "required cutout width",
  "cutout_depth": "required cutout depth",
  "top_clearance": "required top clearance",
  "back_clearance": "required back clearance",
  "side_clearance": "required side clearance",
  "door_swing_clearance": "door swing space needed",
  "product_weight": "product weight with units",
  "shipping_weight": "shipping weight with units",
  
  "box_height": "shipping box height",
  "box_width": "shipping box width",
  "box_depth": "shipping box depth",
  "box_weight": "shipping box weight",
  "palletized_weight": "weight on pallet",
  "pallet_dimensions": "pallet size",
  
  "department": "department (e.g., 'Appliances')",
  "category": "category (e.g., 'Refrigeration')",
  "product_family": "product family",
  "product_style": "style (e.g., 'Built-In')",
  "configuration": "configuration type",
  
  "voltage": "electrical voltage",
  "amperage": "electrical amperage",
  "hertz": "frequency (Hz)",
  "plug_type": "plug configuration",
  "power_cord_included": true/false,
  "water_line_required": true/false,
  "water_pressure_range": "water pressure PSI range",
  "water_usage_per_cycle": "water usage per cycle",
  "gas_type": "natural gas or propane",
  "conversion_kit_included": true/false,
  "kwh_per_year": "annual energy usage",
  "energy_star_rating": true/false,
  "cooling_system_type": "cooling system description",
  "compressor_type": "compressor type",
  "defrost_type": "defrost mechanism",
  "refrigerant_type": "refrigerant used",
  "temperature_range": "operating temperature range",
  "dba_rating": "noise level in dBA",
  
  "total_capacity": "total capacity with units",
  "refrigerator_capacity": "fridge capacity",
  "freezer_capacity": "freezer capacity",
  "oven_capacity": "oven capacity",
  "washer_drum_capacity": "washer capacity",
  "dryer_capacity": "dryer capacity",
  "dishwasher_place_settings": "place settings capacity",
  
  "core_features": ["feature 1", "feature 2", "feature 3"],
  "wifi_enabled": true/false,
  "app_compatibility": "compatible apps/platforms",
  "voice_control": "voice assistants supported",
  "remote_monitoring": true/false,
  "notifications": ["notification types"],
  "ice_maker_type": "ice maker description",
  "water_dispenser": true/false,
  "door_in_door": true/false,
  "interior_lighting_type": "lighting type",
  "shelving_type": "shelf material/type",
  "rack_basket_material": "rack materials",
  "control_panel_type": "control interface type",
  
  "product_description": "comprehensive 2-3 paragraph description",
  
  "ada_compliant": true/false,
  "prop_65_warning": true/false,
  "ul_csa_certified": true/false,
  "fire_safety_certifications": ["certifications"],
  "child_lock": true/false,
  
  "manufacturer_warranty_parts": "parts warranty period",
  "manufacturer_warranty_labor": "labor warranty period",
  "compressor_warranty": "compressor warranty",
  "drum_warranty": "drum warranty (washers/dryers)",
  "extended_warranty_options": ["available options"],
  
  "included_accessories": ["included items"],
  "optional_accessories": ["optional purchase items"],
  
  "installation_type": "installation method",
  "venting_requirements": "venting specifications",
  "drain_requirement": true/false,
  "hardwire_vs_plug": "hardwired or plug-in",
  "leveling_legs_included": true/false,
  
  "built_in_appliance": true/false,
  "luxury_premium_appliance": true/false,
  "portable": true/false,
  "panel_ready": true/false,
  "counter_depth": true/false,
  "commercial_rated": true/false,
  "outdoor_rated": true/false
}

CRITICAL INSTRUCTIONS:
- Research the specific appliance model thoroughly
- Provide REAL, VERIFIED data from your knowledge base
- Include units for ALL measurements (inches, lbs, cu.ft., etc.)
- Use null for truly unavailable data (don't guess)
- Core features should list 8-15 key features
- Product description must be 2-3 detailed paragraphs
- Analyze specifications carefully for all boolean flags
- For capacities, use appropriate units (cu.ft. for refrigerators, lbs for washers, etc.)
- Return ONLY the JSON object, no markdown, no additional text"""

    user_prompt = f"""Research and provide complete product information for:
Brand: {brand}
Model Number: {model_number}

Return comprehensive, verified product data in the specified JSON format."""

    # Call AI API
    response = provider["client"].chat.completions.create(
        model=provider["model"],
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3,  # Lower temperature for more consistent output
        max_tokens=4000  # Increased for comprehensive appliance data
    )
    
    # Track token usage
    tokens_used = response.usage.total_tokens if hasattr(response, 'usage') else 0
    if tokens_used > 0:
        ai_metrics[provider_name]["total_tokens_used"] += tokens_used
    
    # Parse AI response
    raw_data = json.loads(response.choices[0].message.content)
    
    # ENFORCE STRICT MSRP VALIDATION RULES
    msrp_sources = raw_data.get("msrp_sources", [])
    msrp_source_count = len(msrp_sources) if msrp_sources else 0
    
    # Rule: Only accept MSRP if AI provided 2+ named sources
    if msrp_source_count < 2:
        raw_data["msrp_price"] = None
        raw_data["msrp_confidence"] = None
        raw_data["msrp_sources"] = []
        raw_data["msrp_source_count"] = 0
        raw_data["msrp_verified"] = False
    else:
        # Validate that sources are from authorized list
        authorized = ["manufacturer", "ajmadison", "ferguson", "bestbuy", "costco", "homedepot", "lowes"]
        valid_sources = [s.lower().replace(" ", "") for s in msrp_sources if any(auth in s.lower().replace(" ", "") for auth in authorized)]
        
        if len(valid_sources) < 2:
            # Not enough authorized sources
            raw_data["msrp_price"] = None
            raw_data["msrp_confidence"] = None
            raw_data["msrp_sources"] = []
            raw_data["msrp_source_count"] = 0
            raw_data["msrp_verified"] = False
        else:
            # Valid MSRP with 2+ authorized sources
            raw_data["msrp_confidence"] = "verified"
            raw_data["msrp_source_count"] = len(valid_sources)
            raw_data["msrp_verified"] = True
    
    # Map to our structured ProductRecord model
    product_record = ProductRecord(
        verified_information=VerifiedInformation(
            brand=raw_data.get("brand", brand),
            model_number=raw_data.get("model_number", model_number),
            product_title=raw_data.get("product_title", f"{brand} {model_number}"),
            series_collection=raw_data.get("series_collection"),
            finish_color=raw_data.get("finish_color"),
            upc_gtin=raw_data.get("upc_gtin"),
            sku_internal=raw_data.get("sku_internal"),
            mpn=raw_data.get("mpn"),
            country_of_origin=raw_data.get("country_of_origin"),
            release_year=raw_data.get("release_year"),
            msrp_price=raw_data.get("msrp_price"),
            msrp_confidence=raw_data.get("msrp_confidence"),
            msrp_sources=raw_data.get("msrp_sources"),
            msrp_source_count=raw_data.get("msrp_source_count"),
            msrp_verified=raw_data.get("msrp_verified"),
            verified_by=provider["name"]
        ),
        dimensions_and_weight=DimensionsAndWeight(
            product_dimensions=ProductDimensions(
                height=raw_data.get("product_height"),
                width=raw_data.get("product_width"),
                depth=raw_data.get("product_depth"),
                depth_with_door_open=raw_data.get("depth_with_door_open"),
                cutout_height=raw_data.get("cutout_height"),
                cutout_width=raw_data.get("cutout_width"),
                cutout_depth=raw_data.get("cutout_depth")
            ),
            clearance_requirements=ClearanceRequirements(
                top_clearance=raw_data.get("top_clearance"),
                back_clearance=raw_data.get("back_clearance"),
                side_clearance=raw_data.get("side_clearance"),
                door_swing_clearance=raw_data.get("door_swing_clearance")
            ),
            weight=Weight(
                product_weight=raw_data.get("product_weight"),
                shipping_weight=raw_data.get("shipping_weight")
            )
        ),
        packaging_specs=PackagingSpecs(
            box_height=raw_data.get("box_height"),
            box_width=raw_data.get("box_width"),
            box_depth=raw_data.get("box_depth"),
            box_weight=raw_data.get("box_weight"),
            palletized_weight=raw_data.get("palletized_weight"),
            pallet_dimensions=raw_data.get("pallet_dimensions")
        ),
        product_classification=ProductClassification(
            department=raw_data.get("department"),
            category=raw_data.get("category"),
            product_family=raw_data.get("product_family"),
            product_style=raw_data.get("product_style"),
            configuration=raw_data.get("configuration")
        ),
        performance_specs=PerformanceSpecs(
            electrical=Electrical(
                voltage=raw_data.get("voltage"),
                amperage=raw_data.get("amperage"),
                hertz=raw_data.get("hertz"),
                plug_type=raw_data.get("plug_type"),
                power_cord_included=raw_data.get("power_cord_included")
            ),
            water=Water(
                water_line_required=raw_data.get("water_line_required"),
                water_pressure_range=raw_data.get("water_pressure_range"),
                water_usage_per_cycle=raw_data.get("water_usage_per_cycle")
            ),
            gas=Gas(
                gas_type=raw_data.get("gas_type"),
                conversion_kit_included=raw_data.get("conversion_kit_included")
            ),
            energy=Energy(
                kwh_per_year=raw_data.get("kwh_per_year"),
                energy_star_rating=raw_data.get("energy_star_rating")
            ),
            cooling_heating=CoolingHeating(
                cooling_system_type=raw_data.get("cooling_system_type"),
                compressor_type=raw_data.get("compressor_type"),
                defrost_type=raw_data.get("defrost_type"),
                refrigerant_type=raw_data.get("refrigerant_type"),
                temperature_range=raw_data.get("temperature_range")
            ),
            noise_level=NoiseLevel(
                dba_rating=raw_data.get("dba_rating")
            )
        ),
        capacity=Capacity(
            total_capacity=raw_data.get("total_capacity"),
            refrigerator_capacity=raw_data.get("refrigerator_capacity"),
            freezer_capacity=raw_data.get("freezer_capacity"),
            oven_capacity=raw_data.get("oven_capacity"),
            washer_drum_capacity=raw_data.get("washer_drum_capacity"),
            dryer_capacity=raw_data.get("dryer_capacity"),
            dishwasher_place_settings=raw_data.get("dishwasher_place_settings")
        ),
        features=Features(
            core_features=raw_data.get("core_features", []),
            smart_features=SmartFeatures(
                wifi_enabled=raw_data.get("wifi_enabled"),
                app_compatibility=raw_data.get("app_compatibility"),
                voice_control=raw_data.get("voice_control"),
                remote_monitoring=raw_data.get("remote_monitoring"),
                notifications=raw_data.get("notifications", [])
            ),
            convenience_features=ConvenienceFeatures(
                ice_maker_type=raw_data.get("ice_maker_type"),
                water_dispenser=raw_data.get("water_dispenser"),
                door_in_door=raw_data.get("door_in_door"),
                interior_lighting_type=raw_data.get("interior_lighting_type"),
                shelving_type=raw_data.get("shelving_type"),
                rack_basket_material=raw_data.get("rack_basket_material"),
                control_panel_type=raw_data.get("control_panel_type")
            )
        ),
        product_description=raw_data.get("product_description", "No description available"),
        safety_compliance=SafetyCompliance(
            ada_compliant=raw_data.get("ada_compliant"),
            prop_65_warning=raw_data.get("prop_65_warning"),
            ul_csa_certified=raw_data.get("ul_csa_certified"),
            fire_safety_certifications=raw_data.get("fire_safety_certifications", []),
            child_lock=raw_data.get("child_lock")
        ),
        warranty_info=WarrantyInfo(
            manufacturer_warranty_parts=raw_data.get("manufacturer_warranty_parts"),
            manufacturer_warranty_labor=raw_data.get("manufacturer_warranty_labor"),
            compressor_warranty=raw_data.get("compressor_warranty"),
            drum_warranty=raw_data.get("drum_warranty"),
            extended_warranty_options=raw_data.get("extended_warranty_options", [])
        ),
        accessories=Accessories(
            included_accessories=raw_data.get("included_accessories", []),
            optional_accessories=raw_data.get("optional_accessories", [])
        ),
        installation_requirements=InstallationRequirements(
            installation_type=raw_data.get("installation_type"),
            venting_requirements=raw_data.get("venting_requirements"),
            drain_requirement=raw_data.get("drain_requirement"),
            hardwire_vs_plug=raw_data.get("hardwire_vs_plug"),
            leveling_legs_included=raw_data.get("leveling_legs_included")
        ),
        product_attributes=ProductAttributes(
            built_in_appliance=raw_data.get("built_in_appliance"),
            luxury_premium_appliance=raw_data.get("luxury_premium_appliance"),
            portable=raw_data.get("portable"),
            panel_ready=raw_data.get("panel_ready"),
            counter_depth=raw_data.get("counter_depth"),
            commercial_rated=raw_data.get("commercial_rated"),
            outdoor_rated=raw_data.get("outdoor_rated")
        )
    )
    
    return product_record

# ============================================================================
# HOME PRODUCTS ENDPOINTS (Plumbing, Kitchen, Lighting, Bath)
# ============================================================================

class HomeProductEnrichRequest(BaseModel):
    """Request model for home product enrichment"""
    model_number: str = Field(..., description="Product model number (REQUIRED)")
    brand: Optional[str] = Field(None, description="Brand name (optional, helps identification)")
    description: Optional[str] = Field(None, description="Brief description (optional, helps identification)")

@app.post("/enrich-home-product")
async def enrich_home_product_endpoint(
    request: HomeProductEnrichRequest,
    x_api_key: Optional[str] = Header(None),
    user_agent: str = Header(None, alias="User-Agent"),
    referer: str = Header(None, alias="Referer")
):
    """
    Enrich home product data (Plumbing, Kitchen, Lighting, Bath, Fans, Hardware, Outdoor, HVAC)
    using Master Product Data Schema v1.0 (Sections A-L)
    
    Requires: model_number (primary identifier)
    Optional: brand, description (helpers for identification)
    """
    # Verify API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Validate model number is provided
    if not request.model_number or not request.model_number.strip():
        raise HTTPException(status_code=400, detail="Model number is required")
    
    start_time = time.time()
    
    # Detect source: UI calls will have our frontend URL in referer
    source = "ui" if referer and ("vercel.app" in referer or "localhost" in referer) else "api"
    
    # Determine which AI provider to use (primary: OpenAI, fallback: xAI)
    primary_provider = "openai"
    fallback_provider = "xai"
    
    enriched_data = None
    provider_used = None
    ai_response_time = 0
    
    # Try primary provider first
    try:
        enriched_data, provider_used, ai_response_time = await enrich_home_product_with_ai(
            model_number=request.model_number,
            brand=request.brand,
            description=request.description,
            provider=primary_provider,
            openai_client=openai_client,
            xai_client=xai_client
        )
    except Exception as e:
        print(f"Primary AI provider ({primary_provider}) failed: {str(e)}")
        
        # Try fallback provider
        try:
            enriched_data, provider_used, ai_response_time = await enrich_home_product_with_ai(
                model_number=request.model_number,
                brand=request.brand,
                description=request.description,
                provider=fallback_provider,
                openai_client=openai_client,
                xai_client=xai_client
            )
        except Exception as fallback_error:
            total_time = time.time() - start_time
            update_portal_metrics("home_products", False, total_time, source, user_agent,
                                 request.model_number, request.brand)
            raise HTTPException(
                status_code=500,
                detail=f"All AI providers failed. Primary: {str(e)}, Fallback: {str(fallback_error)}"
            )
    
    total_time = time.time() - start_time
    
    # Update portal metrics
    update_portal_metrics("home_products", True, total_time, source, user_agent,
                         request.model_number, request.brand)
    
    # Flatten enriched_data to get product_identity fields for validation
    flattened_data = {}
    if isinstance(enriched_data, dict):
        if 'product_identity' in enriched_data:
            flattened_data.update(enriched_data['product_identity'])
    
    # Validate data against 2-source verification requirements
    validation_result = validate_product_data(
        flattened_data,
        portal='home_products',
        strict_mode=True
    )
    
    # Return original structure with verification metadata
    return {
        "success": True,
        "data": enriched_data,
        "metadata": {
            "ai_provider": provider_used,
            "response_time": round(total_time, 2),
            "ai_processing_time": round(ai_response_time, 2),
            "completeness": round(enriched_data.get("confidence_score", 0), 2),
            "verification_rate": round(validation_result['verification']['verification_rate'], 2),
            "verified_fields": f"{validation_result['verification']['verified_fields']}/{validation_result['verification']['total_critical_fields']}",
            "model_number": request.model_number,
            "brand": request.brand,
            "description": request.description
        }
    }

@app.get("/home-products-ai-metrics")
async def get_home_products_ai_metrics(x_api_key: Optional[str] = Header(None)):
    """Get AI performance metrics for home products enrichment"""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    metrics_summary = {}
    for provider, data in home_products_metrics.items():
        avg_completeness = (
            sum(data["completeness_scores"]) / len(data["completeness_scores"])
            if data["completeness_scores"] else 0
        )
        avg_response_time = (
            data["total_time"] / data["requests"]
            if data["requests"] > 0 else 0
        )
        
        metrics_summary[provider] = {
            "total_requests": data["requests"],
            "successful": data["successful"],
            "failed": data["failed"],
            "success_rate": f"{(data['successful'] / data['requests'] * 100) if data['requests'] > 0 else 0:.2f}%",
            "avg_response_time": f"{avg_response_time:.3f}s",
            "avg_completeness": f"{avg_completeness:.2f}%"
        }
    
    return {
        "metrics": metrics_summary,
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================================
# FERGUSON HOME APIs (Unwrangle Integration)
# ============================================================================

class FergusonSearchRequest(BaseModel):
    """Request model for Ferguson Home product search"""
    search: str = Field(..., description="Search query (e.g., 'Pedestal Bathroom Sinks', 'Kohler faucet')")
    page: int = Field(1, description="Page number (default: 1)", ge=1)

class FergusonProductRequest(BaseModel):
    """Request model for Ferguson Home product detail lookup"""
    url: str = Field(..., description="Full Ferguson Home product URL (must be URL-encoded)")

@app.post("/search-ferguson")
async def search_ferguson_products(
    request: FergusonSearchRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Search Ferguson Home products using Unwrangle API.
    
    Returns up to 24 products per page with complete merchandising details including:
    - Product name, brand, model number
    - Pricing (min/max/current) and currency
    - Variant information (colors, sizes, availability)
    - Stock status and inventory quantities
    - Product images and thumbnails
    - Ratings and review counts
    - Features and specifications
    - Collection information
    - Shipping details
    
    Cost: 10 credits per search request
    
    Example searches:
    - "Pedestal Bathroom Sinks"
    - "Kohler Kitchen Faucet"
    - "K-2362-8"
    """
    # Validate API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    start_time = time.time()
    
    try:
        # Get Unwrangle API key
        unwrangle_api_key = os.getenv("UNWRANGLE_API_KEY")
        if not unwrangle_api_key:
            raise HTTPException(
                status_code=500,
                detail="Unwrangle API key not configured"
            )
        
        # Build API request URL
        import urllib.parse
        base_url = "https://data.unwrangle.com/api/getter/"
        params = {
            "platform": "fergusonhome_search",
            "search": request.search,
            "page": request.page,
            "api_key": unwrangle_api_key
        }
        
        # Make request to Unwrangle API
        import requests
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Ferguson search returned unsuccessful response"
            )
        
        response_time = time.time() - start_time
        
        # Enhance products with smart variant matching for Salesforce compatibility
        products = data.get("results", [])
        search_model_original = request.search.strip()  # Keep original case
        search_model = request.search.upper().strip()
        
        # Track best match across ALL products to reorder results
        exact_match_products = []
        fuzzy_match_products = []
        other_products = []
        
        for product in products:
            # Add best_match_url field for easy Salesforce integration
            best_url = None
            best_model = None
            match_type = None
            
            # Get product's base model and URL
            product_model = product.get("model_no", "").upper().strip()
            product_url = product.get("url")
            
            # Check variants for matches
            variants = product.get("variants", [])
            if variants:
                # PRIORITY 1: Try exact case-insensitive match first
                for variant in variants:
                    variant_model_original = variant.get("model_no", "").strip()
                    variant_model = variant_model_original.upper()
                    
                    # Exact match (case-insensitive)
                    if variant_model == search_model:
                        best_url = variant.get("url")
                        best_model = variant_model_original  # Keep original case from Ferguson
                        match_type = "exact_variant"
                        break
                    
                    # Also try exact case-sensitive match
                    if variant_model_original == search_model_original:
                        best_url = variant.get("url")
                        best_model = variant_model_original
                        match_type = "exact_variant_case_sensitive"
                        break
                
                # Try fuzzy match if no exact match
                if not best_url:
                    for variant in variants:
                        variant_model = variant.get("model_no", "").upper().strip()
                        # Remove common separators for comparison
                        clean_search = search_model.replace("-", "").replace("_", "")
                        clean_variant = variant_model.replace("-", "").replace("_", "")
                        if clean_search == clean_variant:
                            best_url = variant.get("url")
                            best_model = variant.get("model_no")
                            match_type = "fuzzy_variant"
                            break
                
                # Use first variant as fallback
                if not best_url and variants:
                    best_url = variants[0].get("url")
                    best_model = variants[0].get("model_no")
                    match_type = "first_variant"
            
            # Check base product match
            if not best_url:
                clean_search = search_model.replace("-", "").replace("_", "")
                clean_product = product_model.replace("-", "").replace("_", "")
                if clean_search == clean_product or product_model == search_model:
                    best_url = product_url
                    best_model = product.get("model_no")
                    match_type = "base_product"
            
            # Final fallback: use product URL if available
            if not best_url and product_url:
                best_url = product_url
                best_model = product.get("model_no")
                match_type = "product_fallback"
            
            # Add the matched URL to product for easy Salesforce access
            product["best_match_url"] = best_url
            product["best_match_model"] = best_model
            product["match_type"] = match_type
            
            # Categorize products by match quality for reordering
            if match_type in ["exact_variant", "exact_variant_case_sensitive"]:
                exact_match_products.append(product)
            elif match_type in ["fuzzy_variant", "base_product"]:
                fuzzy_match_products.append(product)
            else:
                other_products.append(product)
        
        # Reorder products: exact matches first, then fuzzy, then others
        # This ensures Salesforce sees the exact match as the first product
        reordered_products = exact_match_products + fuzzy_match_products + other_products
        
        return {
            "success": True,
            "platform": "fergusonhome_search",
            "search_query": request.search,
            "page": request.page,
            "total_results": data.get("total_results", 0),
            "total_pages": data.get("no_of_pages", 0),
            "result_count": data.get("result_count", 0),
            "products": reordered_products,
            "meta_data": data.get("meta_data", {}),
            "credits_used": data.get("credits_used", 10),
            "metadata": {
                "response_time": f"{response_time:.2f}s",
                "timestamp": datetime.utcnow().isoformat(),
                "api_version": "fergusonhome_search_v2",
                "enhancement": "smart_variant_matching"
            }
        }
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unwrangle API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ferguson search failed: {str(e)}"
        )

@app.post("/product-detail-ferguson")
async def get_ferguson_product_detail(
    request: FergusonProductRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Get complete Ferguson Home product detail data using Unwrangle API.
    
    Returns comprehensive product information including:
    - Basic info: ID, name, brand, model number, URLs
    - Categories and breadcrumbs
    - Pricing: current, range (min/max), currency
    - Images (high-resolution) and videos
    - Complete variant details with:
      * Variant-specific pricing, images, colors
      * Inventory quantities and stock status
      * Shipping information and lead times
      * Availability status
    - Full specifications and features (grouped)
    - Product description and warranty information
    - Resources (installation guides, spec sheets)
    - Reviews and ratings
    - Related categories and recommended options
    - Collection information
    - Certifications and country of origin
    - Dimensions and measurements
    
    Cost: 10 credits per product detail request
    
    Note: URL must be fully qualified and URL-encoded
    Example: https://www.fergusonhome.com/kohler-k-2362-8/s560423?uid=165232
    """
    # Validate API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    start_time = time.time()
    
    try:
        # Get Unwrangle API key
        unwrangle_api_key = os.getenv("UNWRANGLE_API_KEY")
        if not unwrangle_api_key:
            raise HTTPException(
                status_code=500,
                detail="Unwrangle API key not configured"
            )
        
        # Build API request URL
        import urllib.parse
        base_url = "https://data.unwrangle.com/api/getter/"
        
        # URL encode the product URL
        encoded_url = urllib.parse.quote(request.url, safe='')
        
        params = {
            "platform": "fergusonhome_detail",
            "url": encoded_url,
            "page": 1,
            "api_key": unwrangle_api_key
        }
        
        # Make request to Unwrangle API
        import requests
        response = requests.get(base_url, params=params, timeout=45)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Ferguson product detail request returned unsuccessful response"
            )
        
        response_time = time.time() - start_time
        
        # Truncate warranty field to prevent Salesforce STRING_TOO_LONG error
        # Salesforce field limit is typically 255-1000 chars, truncate at 950 to be safe
        detail_data = data.get("detail", {})
        if detail_data.get("warranty"):
            warranty = detail_data["warranty"]
            if len(warranty) > 950:
                # Truncate and add ellipsis
                detail_data["warranty"] = warranty[:947] + "..."
        
        return {
            "success": True,
            "platform": "fergusonhome_detail",
            "url": request.url,
            "result_count": data.get("result_count", 0),
            "detail": detail_data,
            "credits_used": data.get("credits_used", 10),
            "metadata": {
                "response_time": f"{response_time:.2f}s",
                "timestamp": datetime.utcnow().isoformat(),
                "api_version": "fergusonhome_detail_v1"
            }
        }
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unwrangle API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ferguson product detail lookup failed: {str(e)}"
        )

# ============================================================================
# FERGUSON COMPLETE LOOKUP (Smart Matching + Data Merging)
# ============================================================================

class FergusonCompleteLookupRequest(BaseModel):
    """Request model for complete Ferguson product lookup"""
    model_number: str = Field(..., description="Manufacturer model number")

def generate_model_variations(model_number: str) -> list:
    """
    Generate common model number format variations for smart matching.
    Returns list of possible variations to try.
    """
    model = model_number.strip()
    variations = [model]  # Original
    
    # Common brand prefixes
    prefixes = ["K-", "G-", "M-", "A-"]
    for prefix in prefixes:
        if not model.upper().startswith(prefix.upper()):
            variations.append(f"{prefix}{model}")
    
    # Add/remove hyphens
    if "-" in model:
        variations.append(model.replace("-", ""))  # Remove all hyphens
    else:
        # Try adding hyphens in common positions
        if len(model) > 4:
            # Format: G9104BNI -> G-9104-BNI
            if model[0].isalpha() and model[1:5].isdigit():
                variations.append(f"{model[0]}-{model[1:5]}-{model[5:]}")
            # Format: 97621SHP -> 97621-SHP or UC15IP -> UC15-IP or UC-15IP
            for i in range(2, len(model)-1):
                if model[i].isalpha() and model[i-1].isdigit():
                    variations.append(f"{model[:i]}-{model[i:]}")  # UC15IP -> UC15-IP
                if model[i].isdigit() and model[i-1].isalpha() and i > 1:
                    variations.append(f"{model[:i]}-{model[i:]}")  # UC15IP -> UC-15IP
    
    # Remove duplicates while preserving order
    seen = set()
    unique_variations = []
    for v in variations:
        v_upper = v.upper()
        if v_upper not in seen:
            seen.add(v_upper)
            unique_variations.append(v)
    
    return unique_variations

def find_matching_variant(search_results: dict, model_number: str, fuzzy: bool = False) -> tuple:
    """
    Find the variant that matches the requested model number.
    Returns tuple: (variant_url, matched_model, match_type)
    
    Match types: 'exact', 'variation', 'partial', None
    """
    model_upper = model_number.upper().strip()
    variations = generate_model_variations(model_number) if fuzzy else [model_number]
    
    # Try exact matches first
    for variation in variations:
        variation_upper = variation.upper().strip()
        for product in search_results.get("products", []):
            for variant in product.get("variants", []):
                variant_model = variant.get("model_no", "").upper().strip()
                
                # Exact match
                if variant_model == variation_upper:
                    match_type = 'exact' if variation == model_number else 'variation'
                    return (variant.get("url"), variant.get("model_no"), match_type)
    
    # Try partial matches (variant contains search term)
    if fuzzy:
        for product in search_results.get("products", []):
            for variant in product.get("variants", []):
                variant_model = variant.get("model_no", "").upper().strip()
                
                # Partial match - variant contains model number
                if model_upper in variant_model or variant_model in model_upper:
                    return (variant.get("url"), variant.get("model_no"), 'partial')
    
    return (None, None, None)

@app.post("/lookup-ferguson-complete")
async def lookup_ferguson_complete(
    request: FergusonCompleteLookupRequest,
    x_api_key: Optional[str] = Header(None)
):
    """
    Complete Ferguson product lookup - executes all 3 steps automatically.
    
    This is the RECOMMENDED endpoint to use for product enrichment.
    It handles:
    1. Searching for the product
    2. Finding matching variant (with smart format variations)
    3. Fetching complete product attributes
    4. Merging data from both search and detail endpoints
    
    Returns: Complete product data ready for enrichment
    Cost: 20 credits (10 for search + 10 for detail)
    """
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    unwrangle_api_key = os.getenv("UNWRANGLE_API_KEY")
    if not unwrangle_api_key:
        raise HTTPException(status_code=500, detail="Unwrangle API key not configured")
    
    model_number = request.model_number
    overall_start = time.time()
    
    try:
        import requests
        import urllib.parse
        
        # STEP 1: Search for product
        print(f"Step 1: Searching for model {model_number}...")
        step1_start = time.time()
        search_params = {
            "api_key": unwrangle_api_key,
            "platform": "fergusonhome_search",
            "search": model_number,
            "page": 1
        }
        search_response = requests.get("https://data.unwrangle.com/api/getter/", params=search_params, timeout=45)
        search_response.raise_for_status()
        search_data = search_response.json()
        step1_time = time.time() - step1_start
        
        if not search_data.get("success"):
            raise HTTPException(status_code=404, detail="Product not found in Ferguson")
        
        if not search_data.get("results"):
            raise HTTPException(
                status_code=404,
                detail=f"No products found for model {model_number}"
            )
        
        print(f"Step 1: ✓ Found {len(search_data.get('results', []))} products ({step1_time:.2f}s)")
        
        # STEP 2: Find matching variant with smart format-aware matching
        print(f"Step 2: Finding variant match for {model_number} (with format variations)...")
        step2_start = time.time()
        
        # Store search result data before matching
        search_product_data = None
        for product in search_data.get("results", []):
            for variant in product.get("variants", []):
                if variant.get("model_no", "").upper().strip() == model_number.upper().strip():
                    search_product_data = product  # Store the parent product data
                    break
            if search_product_data:
                break
        
        # Use smart matching with fuzzy=True
        match_result = find_matching_variant(
            {"products": search_data.get("results", [])},
            model_number,
            fuzzy=True
        )
        step2_time = time.time() - step2_start
        
        if not match_result or not match_result[0]:
            # Return available variants for debugging
            available_variants = []
            for product in search_data.get("results", []):
                for variant in product.get("variants", []):
                    available_variants.append(variant.get("model_no"))
            
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "Variant not found",
                    "requested_model": model_number,
                    "available_models": available_variants,
                    "hint": "No match found even with format variations (K- prefix, hyphens, etc.)",
                    "total_products_found": len(search_data.get("results", [])),
                    "total_variants_found": len(available_variants)
                }
            )
        
        # Unpack the result tuple
        variant_url, matched_model, match_type = match_result
        print(f"Step 2: ✓ Matched '{model_number}' → '{matched_model}' ({match_type} match, {step2_time:.2f}s)")
        
        # STEP 3: Get complete product details
        print(f"Step 3: Fetching complete product attributes...")
        step3_start = time.time()
        
        # Ensure variant_url is a string before encoding
        if not isinstance(variant_url, str):
            raise HTTPException(
                status_code=500,
                detail=f"Invalid variant URL type: {type(variant_url)}"
            )
        
        encoded_url = urllib.parse.quote(variant_url, safe='')
        
        detail_params = {
            "api_key": unwrangle_api_key,
            "platform": "fergusonhome_detail",
            "url": encoded_url,
            "page": 1
        }
        detail_response = requests.get("https://data.unwrangle.com/api/getter/", params=detail_params, timeout=45)
        detail_response.raise_for_status()
        detail_data = detail_response.json()
        step3_time = time.time() - step3_start
        
        if not detail_data.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch product details"
            )
        
        print(f"Step 3: ✓ Retrieved complete product data ({step3_time:.2f}s)")
        
        # Return COMPLETE product information - MERGE data from BOTH search and detail endpoints
        product_detail = detail_data.get("detail", {})
        overall_time = time.time() - overall_start
        
        return {
            "success": True,
            "model_number": model_number,
            "matched_model": matched_model,
            "match_type": match_type,
            "variant_url": variant_url,
            "product": {
                # ========== BASIC INFORMATION (merged from both endpoints) ==========
                "id": product_detail.get("id") or (search_product_data.get("id") if search_product_data else None),
                "family_id": search_product_data.get("family_id") if search_product_data else None,
                "name": product_detail.get("name") or (search_product_data.get("name") if search_product_data else None),
                "brand": product_detail.get("brand") or (search_product_data.get("brand") if search_product_data else None),
                "brand_url": product_detail.get("brand_url"),
                "brand_logo": product_detail.get("brand_logo"),
                "model_number": product_detail.get("model_number"),
                "url": product_detail.get("url"),
                "product_type": product_detail.get("product_type"),
                "application": product_detail.get("application"),
                
                # ========== PRICING & INVENTORY (merged from both endpoints) ==========
                "price": product_detail.get("price") or (search_product_data.get("price") if search_product_data else None),
                "price_min": search_product_data.get("price_min") if search_product_data else None,
                "price_max": search_product_data.get("price_max") if search_product_data else None,
                "unit_price": search_product_data.get("unit_price") if search_product_data else None,
                "price_type": search_product_data.get("price_type") if search_product_data else None,
                "price_range": product_detail.get("price_range", {}),
                "currency": product_detail.get("currency") or (search_product_data.get("currency") if search_product_data else None),
                "base_type": product_detail.get("base_type"),
                "shipping_fee": product_detail.get("shipping_fee"),
                "has_free_installation": product_detail.get("has_free_installation"),
                
                # ========== INVENTORY & VARIANTS (merged from both endpoints) ==========
                "variants": product_detail.get("variants", []) or (search_product_data.get("variants", []) if search_product_data else []),
                "variant_count": product_detail.get("variant_count") or (search_product_data.get("variant_count") if search_product_data else None),
                "has_variant_groups": product_detail.get("has_variant_groups"),
                "has_in_stock_variants": product_detail.get("has_in_stock_variants") or (search_product_data.get("has_in_stock_variants") if search_product_data else None),
                "all_variants_in_stock": product_detail.get("all_variants_in_stock") or (search_product_data.get("all_variants_in_stock") if search_product_data else None),
                "all_variants_restricted": search_product_data.get("all_variants_restricted") if search_product_data else None,
                "total_inventory_quantity": product_detail.get("total_inventory_quantity") or (search_product_data.get("total_inventory_quantity") if search_product_data else None),
                "in_stock_variant_count": product_detail.get("in_stock_variant_count") or (search_product_data.get("in_stock_variant_count") if search_product_data else None),
                "is_configurable": product_detail.get("is_configurable") or (search_product_data.get("is_configurable") if search_product_data else None),
                "is_square_footage_based": search_product_data.get("is_square_footage_based") if search_product_data else None,
                "configuration_type": product_detail.get("configuration_type"),
                
                # ========== IMAGES & VIDEOS (merged from both endpoints) ==========
                "images": product_detail.get("images", []) or (search_product_data.get("images", []) if search_product_data else []),
                "thumbnail": product_detail.get("thumbnail") or (search_product_data.get("thumbnail") if search_product_data else None),
                "videos": product_detail.get("videos", []),
                
                # ========== PRODUCT DETAILS ==========
                "description": product_detail.get("description"),
                "is_discontinued": product_detail.get("is_discontinued"),
                
                # ========== SPECIFICATIONS (CRITICAL!) ==========
                "specifications": product_detail.get("specifications", {}),
                "feature_groups": product_detail.get("feature_groups", []),
                "dimensions": product_detail.get("dimensions", {}),
                "attribute_ids": product_detail.get("attribute_ids", []),
                
                # ========== IDENTIFIERS ==========
                "upc": product_detail.get("upc"),
                "barcode": product_detail.get("barcode"),
                
                # ========== CERTIFICATIONS & COMPLIANCE ==========
                "certifications": product_detail.get("certifications", []),
                "country_of_origin": product_detail.get("country_of_origin"),
                
                # ========== WARRANTY ==========
                "warranty": product_detail.get("warranty"),
                "manufacturer_warranty": product_detail.get("manufacturer_warranty"),
                
                # ========== RESOURCES & DOCUMENTATION ==========
                "resources": product_detail.get("resources", []),
                
                # ========== CATEGORIES ==========
                "categories": product_detail.get("categories", []),
                "base_category": product_detail.get("base_category"),
                "business_category": product_detail.get("business_category"),
                "related_categories": product_detail.get("related_categories", []),
                
                # ========== REVIEWS & RATINGS (merged from both endpoints) ==========
                "rating": product_detail.get("rating") or (search_product_data.get("rating") if search_product_data else None),
                "total_ratings": search_product_data.get("total_ratings") if search_product_data else None,
                "review_count": product_detail.get("review_count"),
                "total_reviews": product_detail.get("total_reviews") or (search_product_data.get("total_ratings") if search_product_data else None),
                "questions_count": product_detail.get("questions_count"),
                
                # ========== COLLECTION (merged from both endpoints) ==========
                "collection": product_detail.get("collection") or (search_product_data.get("collection") if search_product_data else None),
                
                # ========== SHIPPING INFO (from search) ==========
                "is_quick_ship": search_product_data.get("is_quick_ship") if search_product_data else None,
                "shipping_info": search_product_data.get("shipping_info") if search_product_data else None,
                
                # ========== SPECIAL FLAGS (from search) ==========
                "is_appointment_only_brand": search_product_data.get("is_appointment_only_brand") if search_product_data else None,
                
                # ========== RELATED PRODUCTS & OPTIONS ==========
                "has_recommended_options": product_detail.get("has_recommended_options"),
                "recommended_options": product_detail.get("recommended_options", []),
                "has_accessories": product_detail.get("has_accessories"),
                "has_replacement_parts": product_detail.get("has_replacement_parts"),
                "replacement_parts_url": product_detail.get("replacement_parts_url"),
                
                # ========== SPECIAL FLAGS ==========
                "is_by_appointment_only": product_detail.get("is_by_appointment_only")
            },
            "credits_used": 20,
            "steps_completed": {
                "1_search": "✓",
                "2_variant_match": "✓",
                "3_detail_fetch": "✓"
            },
            "performance": {
                "step1_search_time": f"{step1_time:.2f}s",
                "step2_match_time": f"{step2_time:.2f}s",
                "step3_detail_time": f"{step3_time:.2f}s",
                "total_time": f"{overall_time:.2f}s"
            },
            "search_meta_data": search_data.get("meta_data", {}),
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "api_version": "ferguson_complete_v1",
                "data_sources": "merged_search_and_detail"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Complete lookup failed: {str(e)}"
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": f"Internal server error: {str(exc)}"
        }
    )

# ===================================================================
# API CALL LOGGING ENDPOINTS
# ===================================================================

@app.get("/api-logs/recent")
async def get_recent_api_logs(
    limit: int = 100,
    endpoint: Optional[str] = None,
    x_api_key: str = Header(None)
):
    """Get recent API call logs"""
    if not verify_api_key(x_api_key):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    logs = api_logger.get_recent_calls(limit=limit, endpoint=endpoint)
    return {
        "success": True,
        "count": len(logs),
        "logs": logs
    }

@app.get("/api-logs/stats")
async def get_api_stats(
    hours: int = 24,
    x_api_key: str = Header(None)
):
    """Get API call statistics"""
    if not verify_api_key(x_api_key):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    stats = api_logger.get_stats(hours=hours)
    return {
        "success": True,
        **stats
    }

@app.get("/api-logs/search")
async def search_api_logs(
    model_number: Optional[str] = None,
    endpoint: Optional[str] = None,
    success: Optional[bool] = None,
    limit: int = 50,
    x_api_key: str = Header(None)
):
    """Search API call logs"""
    if not verify_api_key(x_api_key):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    logs = api_logger.search_calls(
        model_number=model_number,
        endpoint=endpoint,
        success=success,
        limit=limit
    )
    return {
        "success": True,
        "count": len(logs),
        "logs": logs
    }

# Run the app (for local development)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
