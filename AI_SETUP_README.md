# 🤖 AI API Connections Setup Guide

This package provides ready-to-use connections to OpenAI and Grok (xAI) APIs.

## 📦 Files to Copy to Your New Repo

Copy these files to your new repository:

1. **`ai_connections.py`** - Main API connection module
2. **`.env.template`** - Environment variables template
3. **`requirements_ai.txt`** - Python dependencies

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
pip install -r requirements_ai.txt
```

### 2. Configure API Keys

Copy `.env.template` to `.env`:

```bash
cp .env.template .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
XAI_API_KEY=xai-your-actual-grok-key-here
```

### 3. Test Connection

Run the connection module directly to verify setup:

```bash
python ai_connections.py
```

You should see:

```
🤖 AI Connections Status

==================================================
✅ OPENAI
   Model: gpt-4o-mini
   Name: OpenAI gpt-4o-mini
   Status: Enabled

✅ XAI
   Model: grok-beta
   Name: xAI Grok
   Status: Enabled

✨ Available providers: openai, xai
🎯 Default provider: openai
```

## 💡 Usage Examples

### Basic OpenAI Usage

```python
from ai_connections import openai_client

response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! What can you do?"}
    ]
)

print(response.choices[0].message.content)
```

### Basic Grok Usage

```python
from ai_connections import xai_client

response = xai_client.chat.completions.create(
    model="grok-beta",
    messages=[
        {"role": "user", "content": "Tell me a joke!"}
    ]
)

print(response.choices[0].message.content)
```

### Provider Selection Pattern

```python
from ai_connections import AI_PROVIDERS

# Choose your provider
provider = "openai"  # or "xai"

# Get client and model
client = AI_PROVIDERS[provider]["client"]
model = AI_PROVIDERS[provider]["model"]

# Make API call
response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

### Check Available Providers

```python
from ai_connections import get_available_providers, get_default_provider

# See which providers are configured
available = get_available_providers()
print(f"Available: {available}")

# Get default provider
default = get_default_provider()
print(f"Default: {default}")
```

### Fallback Pattern (Try OpenAI, Fall Back to Grok)

```python
from ai_connections import AI_PROVIDERS

def call_ai(prompt, preferred_provider="openai"):
    """Call AI with automatic fallback"""
    providers = [preferred_provider]
    
    # Add fallback provider
    if preferred_provider == "openai":
        providers.append("xai")
    else:
        providers.append("openai")
    
    for provider in providers:
        if not AI_PROVIDERS[provider]["enabled"]:
            continue
            
        try:
            client = AI_PROVIDERS[provider]["client"]
            model = AI_PROVIDERS[provider]["model"]
            
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error with {provider}: {e}")
            continue
    
    raise Exception("All AI providers failed")

# Usage
answer = call_ai("What is the capital of France?")
print(answer)
```

## 🔑 Getting API Keys

### OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. Add to `.env` file

### xAI/Grok API Key

1. Go to [https://console.x.ai/](https://console.x.ai/)
2. Sign in or create an account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key (starts with `xai-...`)
6. Add to `.env` file

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.*.local
   ```

2. **Use environment variables** in production instead of `.env` files

3. **Rotate keys regularly** - Generate new keys periodically

4. **Limit key permissions** - Use API keys with minimal required permissions

## 📊 Supported Models

### OpenAI
- `gpt-4o-mini` (default, fast and cost-effective)
- `gpt-4o` (more capable, higher cost)
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### xAI/Grok
- `grok-beta` (default)

To change models, edit the `AI_PROVIDERS` configuration in `ai_connections.py`.

## 🛠️ Troubleshooting

### "No module named 'openai'"
```bash
pip install -r requirements_ai.txt
```

### "No AI providers are configured"
- Check that `.env` file exists
- Verify API keys are set correctly
- Run `python ai_connections.py` to check status

### "Authentication failed"
- Verify API key is correct
- Check for extra spaces in `.env` file
- Ensure API key has proper permissions

### "Rate limit exceeded"
- You've hit API usage limits
- Wait or upgrade your API plan
- Implement rate limiting in your code

## 📝 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [xAI API Documentation](https://docs.x.ai/)
- [OpenAI Python SDK GitHub](https://github.com/openai/openai-python)

## 🎯 Next Steps

Now that your AI connections are set up, you can:

1. Build chat applications
2. Create AI-powered tools
3. Implement content generation
4. Add AI analysis features
5. Create intelligent automation

Just import from `ai_connections` and start building! 🚀
