# Catalog-BOT | AI Product Enrichment System

**Production Status:** ✅ Live at [cxc-ai.com](http://cxc-ai.com)

An AI-powered product enrichment system that generates comprehensive product descriptions, specifications, and metadata using OpenAI GPT-4 and xAI Grok.

## 🚀 Quick Links

- **Main Portal:** http://cxc-ai.com/
- **Admin Panel:** http://cxc-ai.com/admin.html
- **Parts Portal:** http://cxc-ai.com/parts.html
- **Ferguson Portal:** http://cxc-ai.com/ferguson.html
- **Home Products:** http://cxc-ai.com/home-products.html

## 📋 Features

- **AI Product Enrichment** - Generate detailed product descriptions using GPT-4 or Grok
- **Ferguson API Integration** - Look up and enrich Ferguson/Build.com products
- **Parts & Home Products** - Specialized enrichment portals
- **Admin Dashboard** - Monitor system health and manage settings
- **RESTful API** - Key-based authentication for integrations
- **Auto-Deployment** - GitHub Actions for zero-downtime updates

## 🏗️ Tech Stack

**Backend:** Python 3.12, FastAPI, Uvicorn, OpenAI API, xAI Grok  
**Frontend:** React 18, Vite, Tailwind CSS  
**Infrastructure:** DigitalOcean, Ubuntu 24.04, Nginx, Systemd  
**CI/CD:** GitHub Actions

## ⚙️ Quick Setup

```bash
curl -O https://raw.githubusercontent.com/topmcon/Ai-Catlog-Bot/main/quick-setup.sh
chmod +x quick-setup.sh
./quick-setup.sh
```

## 🎮 Server Management

```bash
cd /var/www/Ai-Catlog-Bot
./server-control.sh
```

Interactive menu for:
- System status
- Service restarts
- Log viewing
- Testing endpoints
- Auto-updates

## 📡 API Examples

**Health Check:**
```bash
GET /health
```

**Enrich Product:**
```bash
POST /enrich
X-API-KEY: your_key
{
  "product_name": "Product Name",
  "category": "Category"
}
```

**Ferguson Lookup:**
```bash
POST /lookup-ferguson
X-API-KEY: your_key
{
  "model_number": "K-2362-8"
}
```

## 📚 Documentation

- [Deployment Guide](docs/guides/DEPLOYMENT_GUIDE.md)
- [API Documentation](docs/api/)
- [System Overview](docs/SYSTEM_OVERVIEW.md)
- [Quick Start](docs/guides/QUICKSTART.md)

## 📊 Status

**Version:** 2.0 Production  
**Server:** CXC-AI (198.211.105.43)  
**Status:** ✅ Operational  
**Last Updated:** December 2, 2025

---

Built for intelligent product enrichment
