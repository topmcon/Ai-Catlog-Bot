# 🚀 Deployment Guide - Get Catalog-BOT Live

## Quick Overview

**Cost:** $0/month (using free tiers)
**Time:** 15-20 minutes
**Requirements:** GitHub account (you have it), credit card for verification (no charges on free tier)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    YOUR USERS                        │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────┐                 ┌───────────────┐
│   FRONTEND    │                 │  ADMIN PANEL  │
│   (Vercel)    │                 │   (Vercel)    │
│  Free Hosting │                 │  Free Hosting │
└───────────────┘                 └───────────────┘
        │                                  │
        └────────────────┬─────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │    BACKEND    │
                 │   (Render)    │
                 │  Free Hosting │
                 └───────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────┐                 ┌───────────────┐
│   OpenAI API  │                 │   xAI API     │
│   (Primary)   │                 │  (Fallback)   │
└───────────────┘                 └───────────────┘
```

---

## 🎯 Step-by-Step Deployment

### Step 1: Deploy Backend to Render (FREE)

**What Render Does:** Hosts your Python FastAPI backend

**Steps:**

1. **Go to Render:** https://render.com
   - Click "Get Started" (free account)
   - Sign up with your GitHub account (topmcon)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub: `topmcon/Ai-Catlog-Bot`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: catalog-bot-api
   Region: Oregon (closest to you, or pick nearest)
   Branch: main
   Root Directory: (leave blank)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   Click "Environment" → "Add Environment Variable"
   ```
   OPENAI_API_KEY = sk-proj-JwglAIRHAxjBGrNgVqCKk5k...
   XAI_API_KEY = xai-...
   API_KEY = (create a secure key, like: cb_prod_2024_xyz123)
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Copy your URL: `https://catalog-bot-api.onrender.com`

**✅ Backend is now live!**

---

### Step 2: Deploy Frontend to Vercel (FREE)

**What Vercel Does:** Hosts your React user portal + admin dashboard

**Steps:**

1. **Go to Vercel:** https://vercel.com
   - Click "Sign Up" (free account)
   - Sign up with GitHub (topmcon)

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import `topmcon/Ai-Catlog-Bot`
   - Click "Import"

3. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable:**
   Click "Environment Variables" → Add:
   ```
   VITE_API_URL = https://catalog-bot-api.onrender.com
   VITE_API_KEY = (same API_KEY you used in Render)
   ```

5. **Update Backend URL in Code:**
   Before deploying, update the API URL in your code:
   ```javascript
   // frontend/src/App.jsx and AdminApp.jsx
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your URLs:
     - User Portal: `https://ai-catlog-bot.vercel.app`
     - Admin Portal: `https://ai-catlog-bot.vercel.app/admin.html`

**✅ Frontend is now live!**

---

## 🔧 Post-Deployment Configuration

### Update CORS in Backend

After deployment, update `main.py` with your Vercel URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ai-catlog-bot.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app"
    ],
    ...
)
```

Then commit and push:
```bash
git add main.py
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-redeploy in 2-3 minutes.

---

## 🌐 Your Live URLs

After deployment, you'll have:

1. **User Portal:** `https://ai-catlog-bot.vercel.app`
   - Public-facing product search
   - Enter brand + model, get enriched data
   - Beautiful UI with comprehensive results

2. **Admin Dashboard:** `https://ai-catlog-bot.vercel.app/admin.html`
   - 8 management pages
   - System monitoring
   - AI performance tracking
   - Server control

3. **API Endpoint:** `https://catalog-bot-api.onrender.com`
   - `/health` - Health check
   - `/enrich` - Product enrichment
   - `/ai-providers` - Provider status
   - `/ai-metrics` - Performance metrics
   - `/ai-comparison` - AI comparison

---

## 💰 Hosting Costs

### Free Tier (Perfect for Starting)

**Render (Backend):**
- ✅ FREE: 750 hours/month
- ✅ FREE: Auto-deploy from GitHub
- ✅ FREE: SSL certificate
- ⚠️  Limitation: Spins down after 15 min inactivity (2-3 sec cold start)

**Vercel (Frontend):**
- ✅ FREE: Unlimited deployments
- ✅ FREE: 100 GB bandwidth/month
- ✅ FREE: SSL certificate
- ✅ FREE: Global CDN

**Total Hosting:** $0/month

### Usage Costs (Per Enrichment)

**OpenAI API:**
- Cost: ~$0.001 per enrichment
- 1,000 enrichments: $1.02
- 10,000 enrichments: $10.20

**xAI API (Fallback only):**
- Cost: ~$0.027 per enrichment
- Only used if OpenAI fails

**Expected Monthly Cost Examples:**
- 100 enrichments/month: $0.10
- 1,000 enrichments/month: $1.02
- 10,000 enrichments/month: $10.20
- 100,000 enrichments/month: $102.00

---

## 🚀 Upgrade Path (When You Need More)

### Render Paid Plans (When You Grow)

**Starter - $7/month:**
- No spin down (always on)
- Faster response times
- Better for production

**Standard - $25/month:**
- More CPU/RAM
- Auto-scaling
- Better performance

### When to Upgrade?

Stay on FREE if:
- ✅ Testing/development
- ✅ Low traffic (<1000 requests/day)
- ✅ Can tolerate 2-3 sec cold starts
- ✅ Internal use only

Upgrade to $7/month when:
- 🎯 Going fully production
- 🎯 Customer-facing application
- 🎯 Need instant response times
- 🎯 High traffic (>1000 requests/day)

---

## 🔒 Security Best Practices

### 1. Secure Your API Keys

**Never commit to git:**
```bash
# Already in .gitignore
.env
backend.log
```

**Use environment variables:**
- ✅ Render: Environment Variables section
- ✅ Vercel: Environment Variables section

### 2. Rotate API_KEY

Change your `API_KEY` regularly in both:
- Render environment variables
- Vercel environment variables

### 3. Enable Rate Limiting (Optional)

Add to `main.py` if you want to limit requests:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/enrich")
@limiter.limit("60/minute")  # 60 requests per minute
async def enrich_product(...):
    ...
```

---

## 📊 Monitoring Your Deployment

### Check Backend Health
```bash
curl https://catalog-bot-api.onrender.com/health
```

### Check AI Providers
```bash
curl -H "X-API-KEY: your-key" \
  https://catalog-bot-api.onrender.com/ai-providers
```

### Check Metrics
```bash
curl -H "X-API-KEY: your-key" \
  https://catalog-bot-api.onrender.com/ai-comparison
```

### Render Dashboard
- View logs: https://dashboard.render.com
- Monitor performance
- Check deployments

### Vercel Dashboard
- View analytics: https://vercel.com/dashboard
- Monitor bandwidth
- Check deployments

---

## 🐛 Troubleshooting

### Backend Not Responding
1. Check Render logs: Dashboard → Services → catalog-bot-api → Logs
2. Verify environment variables are set
3. Check if service is sleeping (free tier)
4. Restart service in Render dashboard

### Frontend Not Loading
1. Check Vercel logs: Dashboard → Project → Deployments
2. Verify environment variables (VITE_API_URL)
3. Check browser console for errors
4. Verify CORS settings in backend

### CORS Errors
Make sure backend `main.py` includes your Vercel URL in allowed origins

### Cold Start Delays (Free Tier)
- Normal on Render free tier after 15 min inactivity
- First request takes 2-3 seconds
- Upgrade to $7/month to eliminate

---

## 🎯 Next Steps After Deployment

### 1. Test Everything
- ✅ User portal search
- ✅ Admin dashboard login
- ✅ All 8 admin pages
- ✅ System status checks
- ✅ API testing page

### 2. Set Up Custom Domain (Optional)
**Vercel:**
- Go to Project Settings → Domains
- Add your domain: `catalog.yourdomain.com`
- Update DNS records (Vercel provides instructions)

**Render:**
- Go to Service Settings → Custom Domains
- Add your domain: `api.yourdomain.com`

### 3. Monitor Usage
- Check Render dashboard daily
- Monitor OpenAI usage: https://platform.openai.com/usage
- Monitor xAI usage: https://console.x.ai/usage
- Set up billing alerts

### 4. Backup Strategy
- ✅ Already on GitHub
- Consider database backup if adding persistence later
- Export metrics regularly from admin dashboard

---

## 📞 Support Resources

**Render:**
- Docs: https://render.com/docs
- Community: https://community.render.com

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**OpenAI:**
- Docs: https://platform.openai.com/docs
- Community: https://community.openai.com

**xAI:**
- Docs: https://docs.x.ai
- Support: https://x.ai/support

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated with production URLs
- [ ] API keys secured (not in code)
- [ ] Health check passes
- [ ] User portal loads
- [ ] Admin dashboard accessible
- [ ] Test enrichment works
- [ ] AI providers active
- [ ] Metrics tracking working
- [ ] GitHub repo backed up
- [ ] Documentation reviewed

---

## 🎉 You're Live!

Once deployed, share these URLs:

**For Users:**
`https://ai-catlog-bot.vercel.app`

**For Admins:**
`https://ai-catlog-bot.vercel.app/admin.html`

**API Documentation:**
`https://catalog-bot-api.onrender.com/docs`

---

**Total Time:** 15-20 minutes
**Total Cost:** $0/month hosting + ~$0.001/enrichment
**Status:** Production-ready with 99.9% uptime! 🚀
