# Ferguson Portal - AI Question & Answer Feature

## Overview

The Ferguson portal now includes an **AI-powered Question & Answer feature** that allows users to ask questions about products they've looked up. This feature uses OpenAI GPT-4o-mini and xAI Grok to provide intelligent, context-aware answers.

## Features

### Intelligent Answer Strategy
1. **Product Data First**: The AI searches the retrieved Ferguson product data for answers
2. **Knowledge Fallback**: If not found in product data, AI uses its knowledge base to research and provide accurate information
3. **Dual-AI Support**: Automatically tries OpenAI first, then falls back to Grok if needed

### User Experience
- ✅ Only appears after successfully loading a product
- ✅ Real-time AI responses
- ✅ Clear indication of which AI provider answered
- ✅ Persistent answers until cleared
- ✅ Error handling with helpful messages

## How It Works

### 1. User Flow
```
1. User enters Ferguson model number → Product loads
2. AI Question field appears below product header
3. User asks question (e.g., "What are the dimensions?")
4. AI analyzes product data and responds
5. Answer displayed with source attribution
```

### 2. Backend Process
```
┌─────────────────┐
│   User Question │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Extract Product Context │
│ - Title, Brand, Model   │
│ - Specifications        │
│ - Features              │
│ - Variants              │
│ - Pricing               │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────┐      ┌──────────────┐
│   Try OpenAI First  │─────►│ Success? Yes │─┐
└─────────┬───────────┘      └──────────────┘ │
          │ Fail                                │
          ▼                                     │
┌─────────────────────┐      ┌──────────────┐ │
│  Fallback to Grok   │─────►│ Success? Yes │─┤
└─────────┬───────────┘      └──────────────┘ │
          │ Fail                                │
          ▼                                     │
┌─────────────────────┐                        │
│   Return Error      │                        │
└─────────────────────┘                        │
                                                │
         ┌──────────────────────────────────────┘
         ▼
┌─────────────────────┐
│  Return AI Answer   │
│  + Metadata         │
└─────────────────────┘
```

## API Endpoint

### `POST /ask-question-ferguson`

Ask a question about a Ferguson product using AI.

**Headers:**
```
Content-Type: application/json
X-API-KEY: your_api_key
```

**Request Body:**
```json
{
  "question": "What are the dimensions of this sink?",
  "product_data": {
    // Complete product data from /lookup-ferguson
    "title": "Product Name",
    "brand": "Brand Name",
    "model_number": "K-2362-8",
    "specifications": {...},
    "features": [...],
    "variants": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What are the dimensions of this sink?",
    "answer": "Based on the product specifications, this sink measures...",
    "product_title": "Product Name",
    "product_brand": "Brand Name",
    "product_model": "K-2362-8"
  },
  "metadata": {
    "ai_provider": "OpenAI gpt-4o-mini",
    "response_time": "1.23s",
    "timestamp": "2025-12-02T10:30:00.000Z",
    "source": "ferguson_product_qa"
  }
}
```

## Example Questions

Users can ask various types of questions:

### Product Specifications
- "What are the dimensions?"
- "What material is this made of?"
- "What's the weight capacity?"

### Compatibility
- "Is this compatible with standard fittings?"
- "Will this work with a wall-mount installation?"
- "What size drain does this require?"

### Installation
- "How do I install this?"
- "Do I need professional installation?"
- "What tools are required?"

### Features & Benefits
- "What makes this different from other models?"
- "Does it have any water-saving features?"
- "Is this ADA compliant?"

### Variants & Options
- "What colors are available?"
- "What's the difference between the variants?"
- "Which finish is most durable?"

## AI Prompt Strategy

The system uses a carefully crafted prompt that:

1. **Provides Complete Context**: Sends all relevant product data
2. **Instructs Source Priority**: 
   - Check product data first
   - Use general knowledge if needed
   - Clearly indicate source
3. **Ensures Quality**: 
   - Be specific and helpful
   - Admit uncertainty when unsure
   - Provide detailed, accurate answers

## Configuration

### Environment Variables

```bash
# Primary AI Provider (Required)
OPENAI_API_KEY=sk-...

# Backup AI Provider (Optional but Recommended)
XAI_API_KEY=xai-...

# API Authentication
API_KEY=your_secure_api_key
```

### AI Provider Setup

**OpenAI (Primary)**
- Model: `gpt-4o-mini`
- Cost: ~$0.001-0.003 per question
- Sign up: https://platform.openai.com/

**xAI Grok (Backup)**
- Model: `grok-2-latest`
- Cost: ~$0.01-0.03 per question
- Sign up: https://console.x.ai/

## UI Components

### Question Input Field
```jsx
<input
  type="text"
  placeholder="e.g., What are the dimensions? Is this compatible with...?"
  className="input w-full"
/>
```

### Answer Display
- ✅ Green checkmark icon
- AI-generated answer with proper formatting
- Question reference
- AI provider badge

### Loading State
- Animated spinner
- "AI Thinking..." text
- Disabled input during processing

## Metrics & Monitoring

The system tracks:
- Total questions asked
- Success/failure rates per AI provider
- Average response times
- Token usage per provider
- Error types and frequencies

Access metrics via: `GET /metrics`

## Security

- **API Key Required**: All requests must include valid `X-API-KEY`
- **Rate Limiting**: Consider implementing rate limits for production
- **Input Validation**: Questions and product data are validated
- **Error Sanitization**: Detailed errors only in development mode

## Error Handling

### Common Errors

**No Product Loaded**
```
"Please lookup a product first before asking questions"
```

**AI Provider Failure**
```
"All AI providers failed. Errors: openai: timeout; xai: rate limit"
```

**Invalid Question**
```
"Question is required"
```

## Best Practices

### For Users
1. **Load Product First**: Always search for a product before asking questions
2. **Be Specific**: Ask clear, focused questions for best results
3. **Check Product Data**: Many answers are in the specifications/features
4. **Multiple Questions**: Ask follow-up questions for more detail

### For Developers
1. **Monitor Costs**: Track AI API usage and costs
2. **Implement Caching**: Consider caching common questions/answers
3. **Add Rate Limits**: Protect against abuse
4. **Log Questions**: Track popular questions for insights
5. **Test Both Providers**: Ensure failover works correctly

## Testing

### Manual Testing
1. Start the backend: `python main.py`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to Ferguson portal
4. Lookup a product (e.g., "K-2362-8")
5. Ask a question
6. Verify answer quality and source attribution

### API Testing
```bash
# Test endpoint directly
curl -X POST http://localhost:8000/ask-question-ferguson \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: your_key" \
  -d '{
    "question": "What are the dimensions?",
    "product_data": {
      "title": "Test Product",
      "specifications": {"dimensions": "20x15x8 inches"}
    }
  }'
```

## Future Enhancements

Potential improvements:
- 💾 **Question History**: Save and display previous questions
- 🔍 **Related Questions**: Suggest common questions
- 📊 **Analytics**: Popular questions dashboard
- 🌐 **Multi-language**: Support multiple languages
- 💬 **Chat Interface**: Multi-turn conversations
- 🎯 **Smart Suggestions**: Auto-suggest based on product type
- 📝 **Answer Feedback**: Rate answer quality

## Troubleshooting

### AI Not Responding
1. Check API keys in `.env`
2. Verify both OpenAI and xAI are configured
3. Check backend logs for errors
4. Ensure product data is loaded

### Slow Responses
1. Normal: AI responses take 1-3 seconds
2. Check network connectivity
3. Monitor AI provider status pages
4. Consider response timeout adjustments

### Poor Answer Quality
1. Ensure product data is complete
2. Rephrase question more specifically
3. Check which AI provider is responding
4. Report issues for prompt tuning

## Support

For issues or questions:
- Backend API: Check `main.py` line 1690+
- Frontend UI: Check `frontend/src/FergusonApp.jsx` line 50+
- Documentation: `/docs/FERGUSON_AI_QA.md`
- Environment: `.env.example`

---

**Last Updated**: December 2, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
