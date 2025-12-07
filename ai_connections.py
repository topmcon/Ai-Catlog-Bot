"""
AI API Connections Setup
Configure OpenAI and Grok (xAI) API clients for your application.

Usage:
    from ai_connections import openai_client, xai_client, AI_PROVIDERS
    
    # Use OpenAI
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    
    # Use Grok
    response = xai_client.chat.completions.create(
        model="grok-beta",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    
    # Use with provider selection
    provider = "openai"  # or "xai"
    client = AI_PROVIDERS[provider]["client"]
    model = AI_PROVIDERS[provider]["model"]
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Hello!"}]
    )
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ===== INITIALIZE AI CLIENTS =====

# OpenAI Client (Primary)
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# xAI/Grok Client (Alternative/Backup)
xai_client = OpenAI(
    api_key=os.getenv("XAI_API_KEY"),
    base_url="https://api.x.ai/v1"
)

# ===== AI PROVIDERS CONFIGURATION =====

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

# ===== HELPER FUNCTIONS =====

def get_available_providers():
    """
    Returns a list of enabled AI providers.
    
    Returns:
        list: Names of enabled providers
    """
    return [name for name, config in AI_PROVIDERS.items() if config["enabled"]]


def get_default_provider():
    """
    Returns the first available AI provider.
    
    Returns:
        str: Provider name or None if no providers are enabled
    """
    available = get_available_providers()
    return available[0] if available else None


def check_provider_status():
    """
    Check and display the status of all AI providers.
    
    Returns:
        dict: Status of each provider
    """
    status = {}
    for name, config in AI_PROVIDERS.items():
        status[name] = {
            "enabled": config["enabled"],
            "model": config["model"],
            "name": config["name"]
        }
    return status


# ===== USAGE VALIDATION =====

if __name__ == "__main__":
    print("🤖 AI Connections Status\n")
    print("=" * 50)
    
    status = check_provider_status()
    for provider, info in status.items():
        emoji = "✅" if info["enabled"] else "❌"
        print(f"{emoji} {provider.upper()}")
        print(f"   Model: {info['model']}")
        print(f"   Name: {info['name']}")
        print(f"   Status: {'Enabled' if info['enabled'] else 'Disabled (API key missing)'}")
        print()
    
    available = get_available_providers()
    if available:
        print(f"✨ Available providers: {', '.join(available)}")
        print(f"🎯 Default provider: {get_default_provider()}")
    else:
        print("⚠️  No AI providers are configured. Please add API keys to your .env file.")
