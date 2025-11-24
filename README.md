# Catalog-BOT: AI Product Enrichment Engine 🤖

**An intelligent API that transforms basic product information (brand + model) into comprehensive, structured product records using OpenAI.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991.svg)](https://openai.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)

---

## 📋 Overview

**Catalog-BOT** is a production-ready API that leverages OpenAI's GPT-4o-mini to automatically research and generate verified product details for appliances and consumer products. Simply provide a brand and model number, and receive a complete product record with specifications, features, classifications, and certifications.

### Key Features
- ✅ **AI-Powered Research**: Uses OpenAI to generate comprehensive product data
- ✅ **User Portal**: Beautiful React interface for product enrichment
- ✅ **Admin Dashboard**: Complete management interface with 7 admin pages
- ✅ **Structured Output**: Returns standardized JSON matching your catalog template
- ✅ **Cost Efficient**: ~$0.001 per enrichment using gpt-4o-mini
- ✅ **Secure**: API key authentication with optional IP whitelisting
- ✅ **Production Ready**: Single-file design, easy deployment to Render/Railway
- ✅ **Salesforce Integration**: Ready for Flow/Apex integration (examples included)

### Tech Stack
- **Backend**: Python + FastAPI + OpenAI
- **Frontend**: React + Vite + Tailwind CSS
- **Admin**: React Router + Recharts + date-fns
- **AI**: OpenAI API (gpt-4o-mini)
- **Deployment**: Render, Railway, Vercel
- **Integration**: Salesforce, Webhooks, REST APIs

### Interfaces
- **Backend API**: `http://localhost:8000` - FastAPI backend with OpenAI integration
- **User Portal**: `http://localhost:3000` - Product enrichment interface
- **Admin Dashboard**: `http://localhost:3000/admin.html` - Management & monitoring

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/topmcon/Ai-Catlog-Bot.git
cd Ai-Catlog-Bot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and API_KEY
```

### 3. Configuration

Edit `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-key-here
API_KEY=your-secure-api-key-here
PORT=8000
HOST=0.0.0.0
```

### 4. Run Locally

```bash
# Start the server
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at `http://localhost:8000`

---

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:8000`
- **Production**: `https://api.cxc-ai.com`

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "openai_configured": true
}
```

#### 2. Enrich Product
```http
POST /enrich
Content-Type: application/json
X-API-KEY: your-api-key-here
```

**Request Body:**
```json
{
  "brand": "Fisher & Paykel",
  "model_number": "OS24NDB1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified_information": {
      "brand": "Fisher & Paykel",
      "model_number": "OS24NDB1",
      "product_title": "Fisher & Paykel 24\" Integrated Column Refrigerator",
      "weight": "180 lbs",
      "length": "24 in",
      "width": "24 in",
      "height": "84 in",
      "capacity": "8.7 cu. ft.",
      "upc_gtin": "825225911234",
      "color_finish": "Panel Ready",
      "verified_by": "OpenAI gpt-4o-mini"
    },
    "features": [
      "ActiveSmart technology maintains ideal temperature",
      "Panel ready for custom integration",
      "Variable temperature zones",
      "LED lighting",
      "Adjustable glass shelves"
    ],
    "product_description": "The Fisher & Paykel OS24NDB1 is a premium 24-inch integrated column refrigerator featuring ActiveSmart technology for optimal food preservation. With 8.7 cubic feet of capacity and panel-ready design, it seamlessly integrates into luxury kitchen installations.",
    "product_classification": {
      "department": "Appliances",
      "category": "Refrigeration",
      "product_family": "Column Refrigerators",
      "product_style": "Built-In"
    },
    "manufacturer_box_dimensions": {
      "box_depth": "28 in",
      "box_width": "28 in",
      "box_height": "88 in",
      "box_weight": "210 lbs"
    },
    "product_attributes": {
      "built_in_appliance": true,
      "luxury_premium_appliance": true,
      "portable": false,
      "panel_ready": true,
      "counter_depth": true
    },
    "certifications": {
      "ada_compliant": false,
      "cee_tier_rating": null,
      "energy_star_qualified": true
    }
  }
}
```

---

## 🧪 Testing

### Using curl

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test product enrichment
curl -X POST http://localhost:8000/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "brand": "Fisher & Paykel",
    "model_number": "OS24NDB1"
  }'
```

### Using Python

```python
import requests

url = "http://localhost:8000/enrich"
headers = {
    "Content-Type": "application/json",
    "X-API-KEY": "test123"
}
data = {
    "brand": "Fisher & Paykel",
    "model_number": "OS24NDB1"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### Test Products
Try these models to test the API:
- Fisher & Paykel OS24NDB1 (Column Refrigerator)
- Miele H6880BP (Built-In Oven)
- Bosch SHPM88Z75N (Dishwasher)
- Sub-Zero BI-36UFD/S (Refrigerator)
- Wolf SO30PM/S (Wall Oven)

---

## 🌐 Deployment

### Self-Hosted VPS (Production)

**Current Setup:**
- Frontend: https://cxc-ai.com
- API: https://api.cxc-ai.com
- Server: 198.211.105.43 (DigitalOcean VPS)
- Auto-deployment: GitHub Actions

**Deployment Process:**
1. Push code to `production` branch
2. GitHub Actions automatically deploys to VPS
3. Frontend builds and deploys to `/var/www/html`
4. Backend restarts via Docker

See [DEPLOYMENT_GITHUB_ACTIONS.md](DEPLOYMENT_GITHUB_ACTIONS.md) for details.

---

## 🔗 Salesforce Integration

### Option 1: Apex HTTP Callout

Create a new Apex class in Salesforce:

```apex
public class CatalogBotService {
    
    private static final String API_URL = 'https://api.cxc-ai.com/enrich';
    private static final String API_KEY = 'your-api-key-here';
    
    @future(callout=true)
    public static void enrichProduct(Id productId, String brand, String modelNumber) {
        try {
            // Call the API
            HttpRequest req = new HttpRequest();
            req.setEndpoint(API_URL);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-API-KEY', API_KEY);
            
            Map<String, String> requestBody = new Map<String, String>{
                'brand' => brand,
                'model_number' => modelNumber
            };
            req.setBody(JSON.serialize(requestBody));
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                // Parse response
                Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                Map<String, Object> data = (Map<String, Object>) response.get('data');
                
                // Update product record
                updateProductRecord(productId, data);
            } else {
                System.debug('Error: ' + res.getBody());
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
        }
    }
    
    private static void updateProductRecord(Id productId, Map<String, Object> data) {
        Map<String, Object> verifiedInfo = (Map<String, Object>) data.get('verified_information');
        
        // Update your Product2 or custom object
        Product2 product = new Product2(Id = productId);
        product.Name = (String) verifiedInfo.get('product_title');
        product.Description = (String) data.get('product_description');
        // Map other fields as needed
        
        update product;
    }
}
```

### Option 2: Flow Integration

1. Create a **Record-Triggered Flow** on Product2 (on create/update)
2. Add **Action**: "Apex Action" → Call `CatalogBotService.enrichProduct`
3. Pass Product Id, Brand, and Model Number
4. Save and activate

### Option 3: Webhook (Real-time)

Configure Salesforce Outbound Message or Platform Event to call:
```
POST https://api.cxc-ai.com/enrich
X-API-KEY: your-key
```

---

## 💰 Cost Analysis

### OpenAI Costs (gpt-4o-mini)
- **Input**: $0.150 per 1M tokens
- **Output**: $0.600 per 1M tokens
- **Average per enrichment**: ~1,000 tokens total = **$0.001**
- **1,000 enrichments**: ~$1.00

### Scaling Costs
- **10,000 products/month**: ~$10/month (OpenAI)
- **100,000 products/month**: ~$100/month (OpenAI)
- **Hosting**: Free on Render (starter plan)

---

## 🔒 Security Best Practices

### 1. API Key Management
- Use strong, random API keys (min 32 characters)
- Rotate keys regularly
- Store in environment variables (never in code)

### 2. IP Whitelisting (Production)
Add to `main.py`:
```python
ALLOWED_IPS = ["52.1.2.3", "54.1.2.3"]  # Salesforce IPs

@app.middleware("http")
async def validate_ip(request: Request, call_next):
    client_ip = request.client.host
    if client_ip not in ALLOWED_IPS:
        return JSONResponse(status_code=403, content={"error": "Forbidden"})
    return await call_next(request)
```

### 3. Rate Limiting
Install: `pip install slowapi`
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/enrich")
@limiter.limit("10/minute")
async def enrich_product(...):
    ...
```

### 4. HTTPS Only
- Always use HTTPS in production (Render provides free SSL)
- Reject HTTP requests

---

## 🛠️ Troubleshooting

### Issue: "Invalid API key"
- Verify `X-API-KEY` header matches `.env` `API_KEY` value
- Check for trailing spaces or quotes

### Issue: "OpenAI API error"
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI account has credits
- Test with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

### Issue: Port already in use
- Change port in `.env`: `PORT=8001`
- Or kill existing process: `lsof -ti:8000 | xargs kill -9`

### Issue: Timeout errors
- Increase timeout in Salesforce (default 10s → 30s)
- Optimize OpenAI prompt for faster responses

---

## 🎛️ Admin Dashboard

Access the **Admin Dashboard** at `http://localhost:3000/admin.html` for comprehensive system management.

### 7 Admin Pages

1. **Dashboard** (`/`) - Real-time monitoring, stats, health metrics
2. **Server Control** (`/server`) - Start/stop/restart backend, activity logs
3. **API Testing** (`/api-testing`) - Test endpoints, cURL generator, response viewer
4. **Usage Monitoring** (`/usage`) - Analytics charts, cost tracking, request logs
5. **Configuration** (`/config`) - API keys, CORS, OpenAI settings, .env manager
6. **Product Manager** (`/products`) - Product database, CSV upload, bulk operations
7. **System Logs** (`/logs`) - Real-time log streaming, filtering, export

### Key Features
- ✅ Real-time backend health monitoring (5-second polling)
- ✅ Interactive charts with Recharts (usage, costs, performance)
- ✅ Server control (start/stop/restart backend)
- ✅ API endpoint testing with cURL command generation
- ✅ Configuration management (API keys, CORS, OpenAI settings)
- ✅ Product history and bulk operations
- ✅ Live log streaming with filtering and export
- ✅ Cost tracking and analytics
- ✅ CSV import/export functionality
- ✅ Responsive design with Tailwind CSS

**📖 Full Documentation:** See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for complete admin dashboard documentation.

---

## 🚧 Roadmap & Next Steps

### Phase 1: Core API ✅ (Complete)
- [x] FastAPI backend with OpenAI integration
- [x] Structured JSON output
- [x] API key authentication
- [x] Deployment configuration

### Phase 2: Frontend Portal ✅ (Complete)
- [x] React + Tailwind UI
- [x] Manual product entry form
- [x] Formatted product display
- [x] Example products
- [x] Deploy to Vercel

### Phase 3: Admin Dashboard ✅ (Complete)
- [x] 7 admin pages (Dashboard, Server Control, API Testing, Usage, Config, Products, Logs)
- [x] Real-time monitoring
- [x] Interactive analytics charts
- [x] Configuration management
- [x] Product management
- [x] System logging

### Phase 4: Advanced Features (Future)
- [ ] Backend admin API endpoints
- [ ] User authentication system
- [ ] Web search tool for real-time data
- [ ] Image generation (DALL·E)
- [ ] Batch processing endpoint
- [ ] Redis caching for repeated queries
- [ ] Product comparison tool

### Phase 5: Production Enhancements (Future)
- [ ] Persistent storage (database)
- [ ] User management & multi-tenancy
- [ ] Email notifications
- [ ] Webhook callbacks
- [ ] WebSocket for real-time updates
- [ ] Advanced security (RBAC)

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Salesforce Apex HTTP Callouts](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_restful_http.htm)
- [Docker Documentation](https://docs.docker.com/)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/topmcon/Ai-Catlog-Bot/issues)
- **Website**: https://cxc-ai.com
- **API Docs**: https://api.cxc-ai.com/docs
- **Documentation**: See README and docs/ folder

---

**Built with ❤️ using FastAPI & OpenAI** | [View on GitHub](https://github.com/topmcon/Ai-Catlog-Bot)