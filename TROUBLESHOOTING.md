# Troubleshooting Guide

## Issue: Parts Portal Showing Same Details for Different Parts

### Problem
Browser was caching API responses, causing different part lookups to show the same results.

### Root Cause
- Browser's default HTTP caching behavior for POST requests
- Vercel's CDN caching responses
- No cache-control headers on fetch requests

### Solution Applied
Added cache-busting headers to all portal API requests:

```javascript
const response = await fetch(`${API_URL}/enrich-part`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  },
  body: JSON.stringify({ /* request data */ }),
  cache: 'no-store'
})
```

### Files Modified
- `frontend/src/PartsApp.jsx` - Parts portal
- `frontend/src/App.jsx` - Catalog portal
- `frontend/src/HomeProductsApp.jsx` - Home products portal

### Testing
After deployment, test by:
1. Looking up part: `ktf1060ss` (Miele)
2. Looking up part: `WD26X10013` (GE)
3. Verify results are different
4. Do a hard refresh (Ctrl+Shift+R) if still seeing cached data

### If Issue Persists
1. **Hard refresh** - Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear browser cache** - Settings > Clear browsing data
3. **Incognito mode** - Test in private/incognito window
4. **Check Vercel deployment** - Ensure latest commit is deployed

## Issue: Data Disappearing from Admin Portal

### Problem
Metrics and product data resetting to zero after backend restarts.

### Root Cause
Render's ephemeral filesystem - files written are lost on restart/redeploy.

### Solution Applied
Added persistent disk storage to Render configuration:

```yaml
disk:
  name: catalog-bot-data
  mountPath: /opt/render/project/src/data
  sizeGB: 1
```

### Files Modified
- `render.yaml` - Added disk configuration
- `main.py` - Updated metrics file path to use persistent disk

### Verification
Run `test_portals.sh` to verify metrics are persisting across requests.
