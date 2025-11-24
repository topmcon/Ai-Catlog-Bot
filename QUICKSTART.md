# 🚀 Quick Start Guide - Catalog-BOT

Get your AI Product Enrichment Engine running in under 5 minutes!

---

## Prerequisites
- ✅ Python 3.9+
- ✅ OpenAI API Key ([Get one](https://platform.openai.com/api-keys))
- ✅ Git

---

## 📦 Installation (3 steps)

### 1. Clone & Setup
```bash
git clone https://github.com/topmcon/Ai-Catlog-Bot.git
cd Ai-Catlog-Bot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env  # or use any text editor
```

Add your keys to `.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
API_KEY=your-secure-api-key-here
```

### 3. Run Server
```bash
python main.py
```

✅ Server running at: http://localhost:8000

---

## 🧪 Test It (One Command)

```bash
curl -X POST http://localhost:8000/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: test123" \
  -d '{
    "brand": "Fisher & Paykel",
    "model_number": "OS24NDB1"
  }'
```

You'll get a complete product record in JSON format with:
- ✅ Product title, dimensions, weight
- ✅ 10+ verified features
- ✅ Product description
- ✅ Classification & certifications
- ✅ Box dimensions

**Response time**: ~13 seconds
**Cost**: ~$0.001 per request

---

## 🌐 Deploy to Production

### VPS with GitHub Actions (Production)
1. Push code to `production` branch
2. GitHub Actions automatically builds and deploys
3. Docker containers restart with new code
4. Live in ~40 seconds

**Production URLs**:
- Frontend: https://cxc-ai.com
- API: https://api.cxc-ai.com
- Admin: https://cxc-ai.com/admin.html

### Other Options
```bash
npm i -g @railway/cli
railway login
railway init
railway variables set OPENAI_API_KEY=xxx API_KEY=xxx
railway up
```

### Option C: Docker
```bash
docker build -t catalog-bot .
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=xxx \
  -e API_KEY=xxx \
  catalog-bot
```

---

## 🔗 Integrate with Salesforce

1. Copy `/salesforce/CatalogBotService.cls` to Salesforce
2. Add Remote Site: `https://api.cxc-ai.com`
3. Create a Flow:
   - Trigger: Product2 created/updated
   - Action: Call `enrichProduct` Apex method
   - Map: Brand → Model → Product ID
4. Activate!

Now products auto-enrich when created in Salesforce! 🎉

---

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/enrich` | POST | Enrich product (requires `X-API-KEY`) |

---

## 🎯 Common Use Cases

### 1. Enrich Single Product
```bash
curl -X POST http://localhost:8000/enrich \
  -H "X-API-KEY: your-key" \
  -H "Content-Type: application/json" \
  -d '{"brand": "Miele", "model_number": "H6880BP"}'
```

### 2. Python Integration
```python
import requests

response = requests.post(
    "http://localhost:8000/enrich",
    headers={"X-API-KEY": "your-key", "Content-Type": "application/json"},
    json={"brand": "Bosch", "model_number": "SHPM88Z75N"}
)
product = response.json()
print(product["data"]["verified_information"]["product_title"])
```

### 3. JavaScript/Node.js
```javascript
fetch("http://localhost:8000/enrich", {
  method: "POST",
  headers: {
    "X-API-KEY": "your-key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand: "Sub-Zero",
    model_number: "BI-36UFD/S"
  })
})
.then(res => res.json())
.then(data => console.log(data.data.product_description));
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `Invalid API key` | Check `X-API-KEY` header matches `.env` |
| `OpenAI error` | Verify OpenAI key has credits |
| `Port in use` | Change `PORT=8001` in `.env` |
| `Timeout` | Increase timeout (default 30s) |

---

## 💰 Pricing

- **OpenAI**: ~$0.001 per product
- **Hosting**: Free (Render/Railway starter)
- **Total**: ~$10/month for 10,000 products

---

## 📖 Documentation

- Full API docs: [README.md](README.md)
- Test results: [TEST_RESULTS.md](TEST_RESULTS.md)
- Salesforce guide: [salesforce/README.md](salesforce/README.md)

---

## 🆘 Need Help?

1. Check logs: `tail -f server.log`
2. Test health: `curl http://localhost:8000/health`
3. Review [README.md](README.md) troubleshooting section
4. Open GitHub issue

---

## 🎉 You're Ready!

Your Catalog-BOT is now running and enriching products with AI! 

**Next Steps**:
1. ✅ Test with your products
2. ✅ Deploy to production
3. ✅ Integrate with Salesforce
4. ✅ Build frontend portal (optional)

**Questions?** See full documentation in [README.md](README.md)

---

**Built with FastAPI + OpenAI** | [GitHub](https://github.com/topmcon/Ai-Catlog-Bot)
