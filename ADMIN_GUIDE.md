# Admin Dashboard Documentation

## Overview

The Catalog-BOT Admin Dashboard provides a comprehensive web-based interface for managing and monitoring your AI product enrichment system. Access advanced features like server control, API testing, usage analytics, configuration management, and real-time logging.

## Access

### User Portal
**URL:** `http://localhost:3000/`  
**Purpose:** Public-facing product enrichment interface for end users

### Admin Dashboard
**URL:** `http://localhost:3000/admin.html`  
**Purpose:** Administrative interface for system management and monitoring

## Dashboard Pages

### 1. Dashboard (Home)
**Route:** `/`

**Features:**
- **Real-time Backend Status** - Live health monitoring with 5-second polling
- **Usage Statistics** - Today's requests, avg response time, total costs
- **System Health Metrics** - CPU, memory, and disk usage bars
- **Recent Activity Feed** - Latest system events and operations
- **Quick Action Buttons** - Fast navigation to key admin functions

**Key Metrics:**
- Backend Status (Running/Stopped)
- Request Count
- Average Response Time
- Total Cost ($)
- CPU Usage (%)
- Memory Usage (%)
- Disk Usage (%)

---

### 2. Server Control
**Route:** `/server`

**Features:**
- **Backend Server Management**
  - Start/Stop/Restart backend API
  - Real-time process status (PID, port, uptime)
  - Health check endpoint testing
  
- **Frontend Server Info**
  - Current status display
  - Port and URL information
  
- **Activity Logs**
  - Real-time server action logs
  - Log history with timestamps
  - Clear logs functionality
  
- **Quick Actions**
  - Test Connection
  - View Metrics
  - View Logs
  - Settings

**Use Cases:**
- Restart backend after configuration changes
- Troubleshoot server connectivity issues
- Monitor server uptime and status

---

### 3. API Testing
**Route:** `/api-testing`

**Features:**
- **Endpoint Testing**
  - Test all API endpoints (/, /health, /enrich)
  - Configurable request parameters
  - API key authentication
  - JSON request body editor
  
- **Response Viewer**
  - Status code and response time
  - Formatted JSON output
  - Response headers display
  
- **cURL Command Generator**
  - Auto-generated cURL commands
  - Copy to clipboard functionality
  - Ready for terminal execution
  
- **Quick Test Buttons**
  - One-click health check
  - Root endpoint test
  - Sample product enrichment

**Available Endpoints:**
```
GET  /          - Welcome endpoint
GET  /health    - Health check
POST /enrich    - Product enrichment (requires API key)
```

**Example Request:**
```json
{
  "brand": "Fisher & Paykel",
  "model": "OS24NDB1"
}
```

---

### 4. Usage Monitoring
**Route:** `/usage`

**Features:**
- **Statistics Overview**
  - Total requests
  - Total cost ($)
  - Average response time
  - Success rate (%)
  
- **Interactive Charts** (Recharts)
  - Request volume over time (Line chart)
  - Daily cost breakdown (Bar chart)
  - Status distribution (Pie chart)
  
- **Cost Breakdown**
  - API calls (95%)
  - Storage (3%)
  - Other (2%)
  
- **Performance Metrics**
  - Min/Max/Avg response times
  - P95 response time
  
- **Request Logs Table**
  - Timestamp, brand, model, status
  - Response time and cost per request
  - 20 most recent requests displayed
  
- **Export Options**
  - Export to CSV
  - Filterable by date range (24h, 7d, 30d)

**Analytics:**
- Time-series data visualization
- Cost tracking and projections
- Performance trend analysis

---

### 5. Configuration Manager
**Route:** `/config`

**Features:**
- **API Keys Management**
  - OpenAI API Key (masked input)
  - Catalog Bot API Key (client authentication)
  - Test connection buttons
  
- **CORS Configuration**
  - Add/remove allowed origins
  - Wildcard support (*.cxc-ai.com)
  - Default localhost entries
  
- **OpenAI Settings**
  - Model selection (gpt-4o-mini, gpt-4o, gpt-4-turbo, gpt-3.5-turbo)
  - Max tokens slider (1000-8000)
  - Temperature control (0-1)
  - Rate limiting (requests/hour)
  
- **Environment Variables**
  - Live preview of .env file
  - Download .env file
  - Masked sensitive values
  
- **Cost Estimation**
  - Per-model pricing comparison
  - Estimated cost per request
  - Input/Output token pricing

**Configuration Sections:**
1. API Keys (🔒 Encrypted & Secure)
2. CORS Origins (Domain whitelist)
3. OpenAI Configuration (Model settings)
4. Environment Preview (.env file)
5. Cost Estimation (Pricing calculator)

**Defaults:**
- Model: `gpt-4o-mini`
- Max Tokens: `4000`
- Temperature: `0.7`
- Rate Limit: `100 requests/hour`
- CORS: `localhost:3000, localhost:5173, *.cxc-ai.com`

---

### 6. Product Manager
**Route:** `/products`

**Features:**
- **Product Database**
  - View all enriched products
  - Search by brand or model
  - Filter by status (success/failed/pending)
  
- **Bulk Operations**
  - Select multiple products
  - Re-enrich selected products
  - Delete selected products
  - Export to JSON/CSV
  
- **CSV Upload**
  - Batch product upload
  - CSV template download
  - Automatic parsing
  
- **Product Details**
  - ID, brand, model
  - Enrichment timestamp
  - Status badge
  - Cost and response time
  
- **Actions Per Product**
  - 👁️ View details
  - 🔄 Re-enrich
  - 🗑️ Delete

**Statistics:**
- Total Products
- Successful Enrichments
- Failed Enrichments
- Pending Enrichments

**CSV Format:**
```csv
Brand,Model
Fisher & Paykel,OS24NDB1
Miele,H6880BP
```

**Export Formats:**
- **JSON** - Full structured data with all fields
- **CSV** - Tabular format for Excel/spreadsheets

---

### 7. System Logs
**Route:** `/logs`

**Features:**
- **Real-time Log Viewer**
  - Live log streaming (3-second updates)
  - Auto-scroll functionality
  - Pause/Resume controls
  - Terminal-style display
  
- **Log Filtering**
  - Filter by level (ERROR, WARNING, SUCCESS, INFO, DEBUG)
  - Search by keyword
  - Real-time filtering
  
- **Log Levels Statistics**
  - ❌ Errors count
  - ⚠️ Warnings count
  - ✅ Success count
  - ℹ️ Info count
  - 🔍 Debug count
  
- **Detailed Log Table**
  - Timestamp (yyyy-MM-dd HH:mm:ss)
  - Level badge (color-coded)
  - Source (component/module)
  - Full message
  
- **Export & Management**
  - Download logs (.log file)
  - Clear all logs
  - Show last 100 logs

**Log Format:**
```
[HH:mm:ss] LEVEL    source          message
[14:32:15] INFO     main.py         Processing enrichment request
[14:32:28] SUCCESS  main.py         Product data enriched successfully
[14:32:30] WARNING  monitor         High response time detected (15.3s)
```

**Log Levels:**
- **ERROR** (Red) - Critical failures
- **WARNING** (Yellow) - Important notices
- **SUCCESS** (Green) - Successful operations
- **INFO** (Blue) - General information
- **DEBUG** (Purple) - Detailed debugging info

---

## Navigation

### Sidebar Menu
- 🏠 Dashboard
- 🖥️ Server Control
- 🧪 API Testing
- 📊 Usage Monitoring
- ⚙️ Configuration
- 📦 Product Manager
- 📋 System Logs

### Top Bar
- **System Status Indicator** - Real-time backend status
- **Current Time** - Live clock
- **Sidebar Toggle** - Collapse/expand menu

### Sidebar States
- **Expanded:** 256px width (full labels)
- **Collapsed:** 64px width (icons only)

---

## Features Overview

### Real-time Monitoring
- ✅ Backend health checks every 5 seconds
- ✅ Live log streaming
- ✅ Real-time system metrics
- ✅ Auto-updating statistics

### Data Management
- ✅ Product history tracking
- ✅ Request log storage
- ✅ LocalStorage persistence
- ✅ CSV import/export

### Security
- ✅ API key authentication
- ✅ CORS origin control
- ✅ Masked sensitive values
- ✅ Encrypted configuration

### Analytics
- ✅ Cost tracking
- ✅ Performance metrics
- ✅ Usage statistics
- ✅ Success rate monitoring

---

## Quick Start Guide

### 1. Access Admin Dashboard
```bash
# Navigate to admin dashboard
http://localhost:3000/admin.html
```

### 2. Check Backend Status
- Dashboard page shows real-time backend status
- Green badge = Running
- Red badge = Stopped

### 3. Test API Connection
1. Go to **API Testing** page
2. Click "Health Check" quick test
3. Verify status 200 response

### 4. Configure Settings
1. Go to **Configuration** page
2. Enter OpenAI API key
3. Set Catalog Bot API key
4. Adjust model settings
5. Click "Save Changes"

### 5. Monitor Usage
1. Go to **Usage Monitoring** page
2. View request charts
3. Check cost breakdown
4. Export logs if needed

### 6. Manage Products
1. Go to **Product Manager** page
2. Upload CSV for batch processing
3. Search/filter products
4. Export results

### 7. View Logs
1. Go to **System Logs** page
2. Monitor real-time activity
3. Filter by log level
4. Download logs for analysis

---

## Common Tasks

### Restart Backend Server
1. Navigate to **Server Control**
2. Click "🔄 Restart" button
3. Wait for status to show "Running"
4. Check activity logs for confirmation

### Add New CORS Origin
1. Go to **Configuration** → CORS Origins
2. Enter domain (e.g., `https://cxc-ai.com`)
3. Click "➕ Add"
4. Click "💾 Save Changes"

### Export Product Data
1. Go to **Product Manager**
2. (Optional) Select specific products
3. Click "💾 Export JSON" or "📊 Export CSV"
4. File downloads automatically

### Test Enrichment API
1. Go to **API Testing**
2. Select "/enrich" endpoint
3. Click "Load Example"
4. Enter your API key
5. Click "🚀 Send Request"
6. View formatted response

### Monitor Costs
1. Go to **Usage Monitoring**
2. Select time range (24h/7d/30d)
3. View cost chart
4. Check breakdown section
5. Export CSV for accounting

---

## Data Persistence

### LocalStorage Keys
```javascript
catalogbot_stats      // Dashboard statistics
catalogbot_config     // Configuration settings
catalogbot_products   // Product history
```

### Backend Endpoints (Future)
```
POST /admin/server/control  - Server management
GET  /admin/stats           - Usage statistics
POST /admin/config          - Configuration updates
GET  /admin/logs            - System logs
```

---

## Troubleshooting

### Backend Shows "Stopped"
1. Check if backend is running: `ps aux | grep uvicorn`
2. Start backend: `cd /workspaces/Ai-Catlog-Bot && nohup uvicorn main:app --host 0.0.0.0 --port 8000 &`
3. Refresh admin dashboard

### API Test Fails
1. Verify backend is running (Server Control page)
2. Check API key is correct
3. Test health endpoint first
4. Check browser console for errors

### Logs Not Updating
1. Click "▶️ Resume" if paused
2. Check auto-scroll is enabled
3. Refresh page if frozen
4. Check backend is running

### Cannot Save Configuration
1. Check browser console for errors
2. Verify all required fields filled
3. Check LocalStorage is enabled
4. Try clearing cache and retry

### Charts Not Loading
1. Check if recharts library installed
2. Verify data exists in LocalStorage
3. Try changing time range filter
4. Refresh page

---

## Technical Details

### Built With
- **React 18.2.0** - UI framework
- **React Router DOM** - Page routing
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **Vite 5.0.8** - Build tool

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Lazy loading for charts
- Debounced search inputs
- Virtual scrolling for logs
- Optimized re-renders

### Security Considerations
- API keys masked in UI
- HTTPS recommended for production
- CORS properly configured
- No sensitive data in localStorage (use encryption in production)

---

## Production Deployment

### Backend Admin API
In production, implement these endpoints in `main.py`:

```python
@app.post("/admin/server/control")
async def control_server(action: str, api_key: str = Header(...)):
    # Verify admin API key
    # Execute server action (start/stop/restart)
    pass

@app.get("/admin/stats")
async def get_stats(api_key: str = Header(...)):
    # Return usage statistics
    pass

@app.post("/admin/config")
async def update_config(config: dict, api_key: str = Header(...)):
    # Update .env file
    pass

@app.get("/admin/logs")
async def get_logs(api_key: str = Header(...)):
    # Return system logs
    pass
```

### Environment Variables
```bash
# Admin authentication
ADMIN_API_KEY=your-secure-admin-key

# Enable production mode
NODE_ENV=production
```

### Build for Production
```bash
cd frontend
npm run build
# Outputs to frontend/dist/ with both index.html and admin.html
```

### Deploy
```bash
# Deploy dist folder to hosting service
# Access user portal: https://cxc-ai.com/
# Access admin dashboard: https://cxc-ai.com/admin.html
```

---

## Support

### Getting Help
1. Check troubleshooting section above
2. Review backend logs in System Logs page
3. Test API endpoints in API Testing page
4. Check configuration in Configuration page

### Useful Commands
```bash
# Check backend status
ps aux | grep uvicorn

# Start backend
cd /workspaces/Ai-Catlog-Bot && uvicorn main:app --host 0.0.0.0 --port 8000

# Check backend health
curl http://localhost:8000/health

# View backend logs
tail -f nohup.out
```

---

## Updates & Roadmap

### Current Version: v1.0.0

**Features:**
✅ All 7 admin pages implemented  
✅ Real-time monitoring  
✅ API testing tools  
✅ Usage analytics  
✅ Configuration management  
✅ Product management  
✅ System logging  

**Future Enhancements:**
- WebSocket for real-time logs
- Admin user authentication
- Role-based access control
- Email notifications for errors
- Automated backup system
- Advanced analytics dashboards
- Multi-language support
- Dark mode theme

---

## License

MIT License - See LICENSE file for details

---

**Catalog-BOT Admin Dashboard v1.0.0**  
Built with ❤️ for efficient product data management
