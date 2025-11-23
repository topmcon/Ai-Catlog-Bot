# Catalog-BOT Frontend Portal

Beautiful, user-facing web interface for the Catalog-BOT AI Product Enrichment Engine.

## 🎨 Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Enrichment**: Submit brand/model and see results in 10-15 seconds
- **Comprehensive Display**: Shows all 7 sections of product data
- **Example Products**: Quick-load buttons for testing
- **Error Handling**: Clear error messages and loading states
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Backend must be running on http://localhost:8000
# In another terminal:
cd ..
python main.py
```

Visit: http://localhost:3000

### Build for Production

```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## 🌐 Deploy to Vercel

### Option 1: GitHub Integration (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Set environment variables:
   - `VITE_API_URL`: Your backend URL (e.g., https://catalog-bot.onrender.com)
   - `VITE_API_KEY`: Your API key
6. Deploy!

### Option 2: Vercel CLI

```bash
npm i -g vercel
cd /workspaces/Ai-Catlog-Bot
vercel
```

Follow the prompts and add environment variables when asked.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation
│   │   ├── Footer.jsx          # Footer with links
│   │   ├── ProductForm.jsx     # Search form
│   │   └── ProductDisplay.jsx  # Results display
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind styles
├── index.html                 # HTML template
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json              # Dependencies
```

## 🎯 Component Overview

### ProductForm
- Brand input (required)
- Model number input (optional)
- Example product buttons
- Loading states
- Clear button

### ProductDisplay
Displays 7 sections:
1. **Verified Information** - Title, dimensions, weight, capacity
2. **Features** - Bullet list of product features
3. **Description** - Full product description
4. **Classification** - Department, category, family, style
5. **Box Dimensions** - Shipping box specs
6. **Attributes** - Boolean flags (built-in, luxury, portable, etc.)
7. **Certifications** - Energy Star, ADA, CEE tier

## 🔧 Configuration

### Environment Variables

Create `frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:8000
VITE_API_KEY=test123
```

For production (Vercel):
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_API_KEY=your-production-key
```

### Proxy Configuration

Development uses Vite proxy to avoid CORS issues:
- `/api/*` → proxied to `http://localhost:8000`

Production uses direct API URL from environment variable.

## 🎨 Customization

### Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',  // Change this!
        // ...
      }
    }
  }
}
```

### Branding

Edit `src/components/Header.jsx` to change logo/title.

### Example Products

Edit `src/components/ProductForm.jsx` to add/remove examples:
```javascript
const examples = [
  { brand: 'Your Brand', model: 'MODEL123', name: 'Product Type' },
  // Add more...
]
```

## 🧪 Testing

### Manual Testing
1. Start backend: `python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Visit http://localhost:3000
4. Try example products

### Test Products
- Fisher & Paykel OS24NDB1 (Dishwasher)
- Miele H6880BP (Built-In Oven)
- Bosch SHPM88Z75N (Dishwasher)
- Sub-Zero BI-36UFD/S (Refrigerator)

## 🐛 Troubleshooting

### "Failed to fetch" error
- Ensure backend is running on http://localhost:8000
- Check CORS is enabled in `main.py`
- Verify API key is correct

### Styles not loading
```bash
cd frontend
rm -rf node_modules
npm install
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "@vitejs/plugin-react": "^4.2.1"
  }
}
```

## 🌟 Features Roadmap

- [ ] Export to PDF
- [ ] Save to local storage
- [ ] Product comparison
- [ ] Batch upload (CSV)
- [ ] Image generation (DALL·E)
- [ ] Product history
- [ ] User authentication
- [ ] Dark mode

## 📝 Notes

- Backend must be running for frontend to work
- Model number is optional - AI can search by brand only
- Results typically take 10-15 seconds
- All data is AI-generated and verified by OpenAI

## 🔗 Related

- [Main README](../README.md) - Full project documentation
- [Backend API](../main.py) - FastAPI backend
- [Salesforce Integration](../salesforce/) - Apex classes

---

**Built with React + Vite + Tailwind CSS** | [GitHub](https://github.com/topmcon/Ai-Catlog-Bot)
