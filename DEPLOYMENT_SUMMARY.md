# Deployment Summary - CXC AI Catalog Bot

## 🚀 Production Environment

**Live URLs:**
- Website: https://cxc-ai.com
- API: https://api.cxc-ai.com
- Server IP: 198.211.105.43

**Infrastructure:**
- Provider: DigitalOcean VPS
- OS: Ubuntu 24.04 LTS
- Resources: 4GB RAM, 2 CPU, 80GB SSD
- Location: /var/www/catalogbot

## 📦 Stack

**Frontend:**
- React (Vite)
- Deployed via Nginx
- Location: /usr/share/nginx/html

**Backend:**
- FastAPI (Python 3.11)
- Uvicorn ASGI server
- Port: 8000

**Database:**
- PostgreSQL 16-alpine
- Volume: catalogbot_postgres_data
- User: catalogbot

**Cache:**
- Redis 7-alpine
- Volume: catalogbot_redis_data

**Web Server:**
- Nginx alpine
- SSL: Let's Encrypt (auto-renewing)
- Ports: 80 (HTTP), 443 (HTTPS)

## 🔄 Development Workflow

**Active Branch:** `production`

```bash
# Make changes
git checkout production
# ... edit files ...

# Deploy
git add .
git commit -m "Your message"
git push origin production

# GitHub Actions automatically deploys to cxc-ai.com
```

## 🔑 Environment Variables

Located at: `/var/www/catalogbot/.env`

```env
OPENAI_API_KEY=sk-proj-...
XAI_API_KEY=xai-...
API_KEY=catbot123
DB_PASSWORD=SecurePassword123!
DATABASE_URL=postgresql://catalogbot:SecurePassword123!@postgres:5432/catalogbot
REDIS_URL=redis://redis:6379/0
```

## 🔐 GitHub Secrets (Required for Auto-Deploy)

Add these at: https://github.com/topmcon/Ai-Catlog-Bot/settings/secrets/actions

- `SERVER_SSH_KEY` - Private SSH key for deployment
- `SERVER_USER` - `root`
- `DB_PASSWORD` - `SecurePassword123!`
- `OPENAI_API_KEY` - OpenAI API key
- `XAI_API_KEY` - xAI API key

## 📋 Useful Commands

**SSH to Server:**
```bash
ssh root@198.211.105.43
```

**Manual Deployment:**
```bash
cd /var/www/catalogbot
git pull origin production
docker-compose down
docker-compose up -d --build
```

**View Logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f nginx
```

**Database Backup:**
```bash
docker exec catalogbot-db pg_dump -U catalogbot catalogbot > backup_$(date +%Y%m%d).sql
```

**Check Status:**
```bash
docker-compose ps
docker-compose logs --tail=50
```

**Restart Services:**
```bash
docker-compose restart backend
docker-compose restart nginx
```

## 🗑️ Old Deployments (To Delete)

- **Render:** https://dashboard.render.com/ - Delete service
- **Vercel:** https://vercel.com/dashboard - Delete project

These are no longer needed with self-hosted setup.

## 📊 Monitoring

**Health Endpoints:**
- https://cxc-ai.com
- https://api.cxc-ai.com/health

**Server Monitoring:**
```bash
# Disk usage
df -h

# Docker resources
docker stats

# Database size
docker exec catalogbot-db psql -U catalogbot -c "SELECT pg_size_pretty(pg_database_size('catalogbot'));"
```

## 🆘 Troubleshooting

**Site not loading:**
```bash
docker-compose ps  # Check if containers running
docker-compose logs nginx  # Check nginx logs
```

**API errors:**
```bash
docker-compose logs backend  # Check backend logs
```

**SSL certificate issues:**
```bash
certbot renew --dry-run  # Test renewal
ls -la /etc/letsencrypt/live/cxc-ai.com/  # Check certs exist
```

**Database connection issues:**
```bash
docker exec -it catalogbot-db psql -U catalogbot  # Connect to DB
```

## 📝 Next Steps

1. ✅ Delete old Render/Vercel deployments
2. ⏳ Add GitHub Secrets for auto-deployment
3. ⏳ Set up automated database backups
4. ⏳ Configure monitoring/alerting
5. ⏳ Add backup/restore procedures

---

**Deployed:** November 24, 2025
**Last Updated:** November 24, 2025
