#!/bin/bash
# Comprehensive cleanup script for Ai-Catlog-Bot

cd /root/Ai-Catlog-Bot 2>/dev/null || cd /workspaces/Ai-Catlog-Bot

echo "🧹 Starting cleanup..."
echo ""

# 1. Remove Python cache files
echo "1️⃣ Removing Python cache files..."
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
echo "   ✅ Python cache cleaned"

# 2. Remove log files (except in tests for reference)
echo "2️⃣ Removing log files..."
find . -type f -name "*.log" ! -path "./tests/*" -delete
echo "   ✅ Log files cleaned"

# 3. Remove temporary files
echo "3️⃣ Removing temporary files..."
find . -type f -name "*~" -delete
find . -type f -name "*.tmp" -delete
find . -type f -name ".DS_Store" -delete
echo "   ✅ Temporary files cleaned"

# 4. Clean old backups (keep last 3)
echo "4️⃣ Managing backups..."
if [ -d "backups" ]; then
    BACKUP_COUNT=$(ls -d backups/backup_*/ 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 3 ]; then
        ls -dt backups/backup_*/ | tail -n +4 | xargs rm -rf
        echo "   ✅ Kept 3 most recent backups, removed $(($BACKUP_COUNT - 3)) old backups"
    else
        echo "   ✅ Only $BACKUP_COUNT backups, keeping all"
    fi
fi

# 5. Remove duplicate env files (keep .env and .env.example only)
echo "5️⃣ Cleaning environment files..."
if [ -f ".env.template" ] && [ -f ".env.example" ]; then
    rm -f .env.template
    echo "   ✅ Removed duplicate .env.template"
fi

# 6. Git cleanup
echo "6️⃣ Git cleanup..."
git gc --quiet 2>/dev/null
echo "   ✅ Git garbage collection complete"

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📊 Current disk usage:"
du -sh . 2>/dev/null
