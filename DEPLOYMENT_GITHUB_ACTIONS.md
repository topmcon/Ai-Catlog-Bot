# GitHub Actions Self-Hosted Deployment Guide

## Overview
This repository is configured to automatically deploy to your self-hosted server using GitHub Actions when you push to the `main` branch.

## Setup Steps

### 1. Server Prerequisites

Your server needs:
- Docker & Docker Compose installed
- SSH access enabled
- Domain DNS configured:
  - `yourdomain.com` → Your server IP
  - `api.yourdomain.com` → Your server IP

### 2. Generate SSH Key for GitHub Actions

On your local machine:
```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions@yourdomain.com" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@yourdomain.com

# Test connection
ssh -i ~/.ssh/github_deploy user@yourdomain.com "echo 'SSH works!'"
```

### 3. Configure GitHub Secrets

Go to: `https://github.com/topmcon/Ai-Catlog-Bot/settings/secrets/actions`

Add these secrets:
```
SERVER_SSH_KEY       = (contents of ~/.ssh/github_deploy private key)
SERVER_USER          = your_server_username
DB_PASSWORD          = secure_database_password
OPENAI_API_KEY       = your_openai_key
XAI_API_KEY          = your_xai_key
```

### 4. Initial Server Setup

SSH into your server:
```bash
ssh user@yourdomain.com

# Create deployment directory
sudo mkdir -p /var/www/catalogbot
sudo chown $USER:$USER /var/www/catalogbot
cd /var/www/catalogbot

# Clone repository
git clone https://github.com/topmcon/Ai-Catlog-Bot.git .

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_key_here
XAI_API_KEY=your_key_here
API_KEY=catbot123
DB_PASSWORD=your_secure_password
DATABASE_URL=postgresql://catalogbot:your_secure_password@postgres:5432/catalogbot
REDIS_URL=redis://redis:6379/0
EOF

# Create data and backups directories
mkdir -p data backups

# Update nginx.conf with your actual domain
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx.conf
```

### 5. Install SSL Certificates (Let's Encrypt)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate (make sure DNS is pointed first!)
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Certificates will be in: /etc/letsencrypt/live/yourdomain.com/
```

### 6. First Manual Deployment

```bash
cd /var/www/catalogbot

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend

# Test endpoints
curl http://localhost:8000/health
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

## GitHub Actions Workflow

### Automatic Deployment

Every push to `main` branch triggers:
1. ✅ **Test** - Runs pytest on backend
2. 🚀 **Deploy Backend** - Pulls code, rebuilds Docker, runs migrations
3. 🎨 **Deploy Frontend** - Builds React app, uploads to server
4. 🏥 **Health Checks** - Verifies both services are running

### Manual Deployment

Trigger deployment manually:
```bash
# From GitHub UI: Actions → Deploy to Self-Hosted Server → Run workflow
# Or via GitHub CLI:
gh workflow run deploy-self-hosted.yml
```

## Deployment Flow

```mermaid
graph LR
    A[Push to main] --> B[GitHub Actions]
    B --> C[Run Tests]
    C --> D{Tests Pass?}
    D -->|Yes| E[SSH to Server]
    D -->|No| F[Stop & Notify]
    E --> G[Pull Latest Code]
    G --> H[Docker Compose Up]
    H --> I[Run Migrations]
    I --> J[Build Frontend]
    J --> K[Deploy to Nginx]
    K --> L[Health Check]
    L --> M{Healthy?}
    M -->|Yes| N[✅ Success]
    M -->|No| O[❌ Rollback]
```

## Your Workflow

### Daily Development:
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# GitHub Actions automatically deploys to your domain!
# Check status at: https://github.com/topmcon/Ai-Catlog-Bot/actions
```

### Monitoring:
```bash
# SSH to server
ssh user@yourdomain.com

# Check logs
cd /var/www/catalogbot
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Check metrics
curl https://api.yourdomain.com/portal-metrics
```

### Database Backups:
```bash
# Automatic backup (add to crontab)
0 2 * * * docker exec catalogbot-db pg_dump -U catalogbot catalogbot > /var/www/catalogbot/backups/backup_$(date +\%Y\%m\%d).sql

# Manual backup
docker exec catalogbot-db pg_dump -U catalogbot catalogbot > backup.sql

# Restore backup
docker exec -i catalogbot-db psql -U catalogbot catalogbot < backup.sql
```

## Troubleshooting

### Deployment Failed?
```bash
# Check GitHub Actions logs
# Go to: https://github.com/topmcon/Ai-Catlog-Bot/actions

# SSH to server and check
docker-compose ps
docker-compose logs backend
```

### SSL Issues?
```bash
# Renew certificate
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

### Database Issues?
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Access database
docker exec -it catalogbot-db psql -U catalogbot
```

## Architecture

```
GitHub Repository
    ↓ (git push)
GitHub Actions Runner
    ↓ (SSH deploy)
Your Server (yourdomain.com)
    ├── Nginx (Port 80/443) → Frontend + SSL
    ├── FastAPI Backend (Port 8000)
    ├── PostgreSQL (Internal)
    └── Redis Cache (Internal)
```

## Cost Estimate

- VPS (DigitalOcean/Linode): $10-20/month
- Domain: $10-15/year
- SSL Certificate: Free (Let's Encrypt)
- GitHub Actions: Free (2000 minutes/month)

**Total: ~$15/month for full control**

## Benefits Over Current Setup

✅ **Full Control** - Your infrastructure, your rules
✅ **No Vendor Lock-in** - Can move anytime
✅ **Better Performance** - Dedicated resources
✅ **Custom Domain** - Professional branding
✅ **GitHub Integration** - Push to deploy
✅ **Zero Downtime** - Docker Compose handles restarts
✅ **Database Included** - PostgreSQL + Redis ready

## Next Steps

1. Get a VPS (DigitalOcean, Linode, Hetzner)
2. Point your domain DNS to server IP
3. Run setup commands above
4. Push to GitHub and watch it deploy! 🚀
