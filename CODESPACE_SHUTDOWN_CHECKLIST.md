# Codespace Shutdown Checklist

## ⚠️ CRITICAL: Run This Before Closing Codespace

**Everything not committed and pushed to GitHub will be LOST when the codespace closes!**

---

## Step-by-Step Shutdown Process

### 1. Check What's Changed
```bash
cd /workspaces/Ai-Catlog-Bot
git status
```

### 2. Review Changes (Optional)
```bash
git diff                    # See what changed in tracked files
git diff --staged           # See what's staged for commit
```

### 3. Add All Changes
```bash
git add .
```

**Or be selective:**
```bash
git add main.py requirements.txt    # Add specific files
```

### 4. Commit Changes
```bash
git commit -m "Describe what you changed today"
```

**Good commit messages:**
- ✅ "Fixed space variation logic for OB30SCEPX3N"
- ✅ "Added Salesforce integration endpoint"
- ✅ "Updated Pydantic to v2"
- ❌ "changes" (too vague)

### 5. Push to GitHub (CRITICAL!)
```bash
git push origin main
```

**If on production branch:**
```bash
git push origin production
```

### 6. Verify Push Succeeded
```bash
git status
# Should say: "Your branch is up to date with 'origin/main'"
```

---

## Quick One-Liner (Use With Caution)

```bash
git add . && git commit -m "Session work - $(date +%Y-%m-%d)" && git push origin main
```

⚠️ **Only use if you're sure about all changes!**

---

## What to Exclude from Git

These files are in `.gitignore` and shouldn't be committed:
- `logs/*.db` - Database files (too large, changes constantly)
- `__pycache__/` - Python cache
- `*.pyc` - Compiled Python
- `node_modules/` - Node packages
- `.env` - Environment secrets
- `*.tar.gz` - Backup archives (too large)

---

## Production Server Changes

If you made changes to the production server (`cxc-ai.com`), those are **separate** and need their own backup:

```bash
# Create server backup
ssh root@cxc-ai.com "cd /root && tar -czf Ai-Catlog-Bot-backup-\$(date +%Y%m%d_%H%M%S).tar.gz Ai-Catlog-Bot"

# List backups
ssh root@cxc-ai.com "ls -lh /root/*.tar.gz"
```

---

## Emergency Recovery

### If you forgot to commit/push:
- Codespace might stay alive for a few hours
- Quickly reopen and run the checklist
- GitHub keeps stopped codespaces for ~30 days (varies by settings)

### If codespace is deleted:
- Only code in GitHub repository will be available
- Everything else is **permanently lost**
- Check production server backups if available

---

## Pre-Shutdown Checklist

- [ ] Run `git status` - check for uncommitted changes
- [ ] Run `git add .` - stage all changes
- [ ] Run `git commit -m "message"` - commit locally
- [ ] Run `git push origin main` - push to GitHub
- [ ] Run `git status` - verify "up to date"
- [ ] Optional: Create server backup if deployed changes

---

## Remember:

**LOCAL COMMITS ARE NOT ENOUGH!**

You must `git push` to save work to GitHub. Without push, commits only exist in the codespace and will be lost.

---

## Need Help?

If unsure what changed:
```bash
git status              # Shows modified/untracked files
git log -1              # Shows last commit
git remote -v           # Shows GitHub repository
```
